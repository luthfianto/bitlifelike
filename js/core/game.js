/*
 * The live life. Owns every piece of mutable game state and the single RNG
 * stream that makes a run reproducible from its seed.
 *
 * Subsystems (Career, Prison, Health, ...) are plain function namespaces that
 * take this object as their first argument, so there is no lazy wiring and no
 * circular construction between them and GameState.
 */
class GameState {
  static SAVE_VERSION = 1;
  static HISTORY_CAP = 400;

  /* The five bars on the home screen. */
  static CORE_STATS = Object.freeze(['happiness', 'health', 'smarts', 'looks', 'fitness']);

  static STAT_META = Object.freeze({
    happiness: { label: 'Happiness', emoji: '😊', core: true },
    health: { label: 'Health', emoji: '❤️', core: true },
    smarts: { label: 'Smarts', emoji: '🧠', core: true },
    looks: { label: 'Looks', emoji: '✨', core: true },
    fitness: { label: 'Fitness', emoji: '💪', core: true },
    fame: { label: 'Fame', emoji: '📸', core: true },
    addiction: { label: 'Addiction', emoji: '💊', core: false },
    prisonFitness: { label: 'Prison Fitness', emoji: '🏋️', core: false }
  });

  static MARITAL = Object.freeze({
    single: { label: 'Single', emoji: '💍' },
    dating: { label: 'Dating', emoji: '❤️' },
    engaged: { label: 'Engaged', emoji: '💐' },
    married: { label: 'Married', emoji: '💍' },
    divorced: { label: 'Divorced', emoji: '💔' },
    widowed: { label: 'Widowed', emoji: '🕯️' }
  });

  #rng;

  constructor(opts = {}) {
    const seed =
      opts.seed ??
      Rng.seedFrom(`${opts.firstName ?? ''}${opts.gender ?? ''}${Math.random()}`);

    // Bootstrap rolls (names, birthplace) run on a throwaway stream so the
    // real stream starts clean and identical for a given seed.
    const boot = new Rng(seed);
    this.gender = opts.gender ?? boot.pick(['male', 'female']);
    this.firstName = opts.firstName?.trim() || Names.firstName(boot, this.gender);
    this.lastName = opts.lastName?.trim() || Names.lastName(boot);
    const city = opts.city ? Cities.byName(opts.city) : Cities.pick(boot);

    this.#rng = new Rng(seed);
    const r = this.#rng;

    this.seed = seed;
    this.nextId = 1;
    this.createdAt = Date.now();

    this.age = 0;
    this.year = opts.birthYear ?? new Date().getFullYear() - r.int(0, 3);
    this.birthCity = city.name;
    this.birthCountry = city.country;

    this.money = 0;
    this.maritalStatus = 'single';
    this.alive = true;
    this.deathInfo = null;

    this.stats = {
      happiness: r.int(50, 75),
      health: r.int(70, 95),
      smarts: r.int(20, 65),
      looks: r.int(20, 85),
      fitness: r.int(25, 70),
      fame: 0,
      addiction: 0,
      prisonFitness: r.int(10, 30)
    };

    this.criminalRecord = 0;
    this.jailYears = 0;
    this.jailReason = '';
    this.crimesCommitted = 0;
    this.escapeAttempts = 0;

    this.education = { level: 'none', degree: null, gpa: 0, yearsLeft: 0, schoolName: '' };

    /* Ongoing chronic conditions, as Health condition ids. */
    this.conditions = [];
    /* Original sentence lengths, so parole can be judged after years tick down. */
    this.sentences = [];
    /* Cached job offers, so they stay stable until refreshed. */
    this.offers = null;

    this.job = null;
    this.people = [];
    this.assets = [];
    this.flags = {};
    this.history = [];

    this.legacy = {
      jobsHeld: [],
      promotions: 0,
      firings: 0,
      totalEarned: 0,
      yearsWorked: 0,
      peakSalary: 0,
      crimesCommitted: 0,
      arrests: 0,
      jailYears: 0,
      escapes: 0,
      marriages: 0,
      divorces: 0,
      childrenBorn: 0,
      petsOwned: 0,
      longestRelationship: { years: 0, name: '' },
      peakNetWorth: 0
    };

    this.#seedFamily();
  }

  /* Parents and a couple of siblings, so the opening screen is not empty. */
  #seedFamily() {
    const r = this.#rng;
    const last = this.lastName;

    for (const role of ['mother', 'father']) {
      this.addPerson({
        firstName: Names.firstName(r, role === 'mother' ? 'female' : 'male'),
        lastName: last,
        gender: role === 'mother' ? 'female' : 'male',
        type: 'parent',
        age: r.int(22, 38),
        relationship: r.int(55, 90),
        happiness: r.int(45, 80),
        job: r.pick(['Teacher', 'Nurse', 'Driver', 'Farmer', 'Clerk', 'Engineer', 'Waitress', 'Mechanic']),
        isMarried: true,
        spouseName: last,
        netWorth: r.int(2000, 40000)
      });
    }

    for (let i = 0, n = r.int(0, 3); i < n; i++) {
      const gender = r.pick(['male', 'female']);
      this.addPerson({
        firstName: Names.firstName(r, gender),
        lastName: last,
        gender,
        type: 'sibling',
        age: r.int(1, 12),
        relationship: r.int(40, 90),
        netWorth: r.int(0, 15000)
      });
    }
  }

  /* --------------------------------------------------------------- basics */

  get rng() { return this.#rng; }
  get rngState() { return this.#rng.state; }
  set rngState(v) { this.#rng.state = v; }
  get fullName() { return `${this.firstName} ${this.lastName}`; }
  get jailed() { return this.jailYears > 0; }
  get isStudent() { return this.education.yearsLeft > 0; }

  get maritalInfo() { return GameState.MARITAL[this.maritalStatus] ?? GameState.MARITAL.single; }

  get stage() {
    const a = this.age;
    if (a < 5) return 'infant';
    if (a < 13) return 'child';
    if (a < 18) return 'teen';
    if (a < 30) return 'young';
    if (a < 55) return 'adult';
    if (a < 65) return 'middle';
    if (a < 80) return 'senior';
    return 'elder';
  }

  /* ------------------------------------------------------------ mutations */

  log(text, kind = 'life') {
    if (!text) return;
    this.history.push({ year: this.year, age: this.age, text: String(text), kind });
    if (this.history.length > GameState.HISTORY_CAP) {
      this.history.splice(0, this.history.length - GameState.HISTORY_CAP);
    }
  }

  stat(key, delta) {
    if (!(key in this.stats)) return 0;
    const before = this.stats[key];
    this.stats[key] = Format.clamp(before + Format.num(delta, 0), 0, 100);
    return this.stats[key] - before;
  }

  setStat(key, value) {
    if (key in this.stats) this.stats[key] = Format.clamp(value, 0, 100);
  }

  addMoney(delta) {
    const d = Format.num(delta, 0);
    this.money = Math.round(this.money + d);
    if (d > 0) this.legacy.totalEarned += Math.round(d);
    return this.money;
  }

  canAfford(amount) {
    return this.money >= Format.num(amount, 0);
  }

  /* Deduct only if affordable; returns whether the spend went through. */
  spend(amount) {
    const a = Format.num(amount, 0);
    if (!this.canAfford(a)) return false;
    this.money = Math.round(this.money - a);
    return true;
  }

  /* ------------------------------------------------------------- people */

  addPerson(partial = {}) {
    const person = new Person({ metYear: this.year, lastInteractionYear: this.year, ...partial });
    person.id = this.nextId++;
    this.people.push(person);
    return person;
  }

  person(id) {
    return this.people.find((p) => p.id === id) ?? null;
  }

  peopleOf(type) {
    const living = this.people.filter((p) => !p.isDead);
    return type ? living.filter((p) => p.type === type) : living;
  }

  partner() {
    if (this.maritalStatus === 'married') return this.peopleOf('spouse')[0] ?? null;
    if (this.maritalStatus === 'dating' || this.maritalStatus === 'engaged') {
      return this.peopleOf('partner')[0] ?? null;
    }
    return null;
  }

  children() { return this.peopleOf('child'); }
  parents() { return this.people.filter((p) => p.type === 'parent'); }
  siblings() { return this.peopleOf('sibling'); }
  friends() { return this.peopleOf('friend'); }

  rel(person, delta) {
    if (!person || person.isDead) return 0;
    person.relationship = Format.clamp(person.relationship + Format.num(delta, 0), 0, 100);
    person.lastInteractionYear = this.year;
    return person.relationship;
  }

  /* ------------------------------------------------------------- assets */

  buy(def, opts = {}) {
    const asset = Asset.buy(def, { boughtYear: this.year, ...opts });
    asset.uid = this.nextId++;
    this.assets.push(asset);
    return asset;
  }

  assetsOf(type) {
    return type ? this.assets.filter((a) => a.type === type && !a.isDead) : this.assets.filter((a) => !a.isDead);
  }

  pets() { return this.assetsOf('p'); }
  hasHouse() { return this.assetsOf('h').length > 0; }

  netWorth() {
    return this.assets.reduce((sum, a) => sum + a.equity, this.money);
  }

  /* ------------------------------------------------------------- actions */

  ageUp() {
    return Year.tick(this);
  }

  die(cause = 'unknown') {
    return Death.kill(this, cause);
  }

  /* ------------------------------------------------------------ save/load */

  toJSON() {
    return {
      version: GameState.SAVE_VERSION,
      seed: this.seed,
      rngState: this.rngState,
      nextId: this.nextId,
      createdAt: this.createdAt,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      birthCity: this.birthCity,
      birthCountry: this.birthCountry,
      age: this.age,
      year: this.year,
      money: this.money,
      maritalStatus: this.maritalStatus,
      alive: this.alive,
      deathInfo: this.deathInfo,
      stats: { ...this.stats },
      criminalRecord: this.criminalRecord,
      jailYears: this.jailYears,
      jailReason: this.jailReason,
      crimesCommitted: this.crimesCommitted,
      escapeAttempts: this.escapeAttempts,
      education: { ...this.education },
      conditions: this.conditions.slice(),
      sentences: this.sentences.slice(),
      offers: this.offers,
      job: this.job ? { ...this.job } : null,
      people: this.people.map((p) => p.toJSON()),
      assets: this.assets.map((a) => a.toJSON()),
      flags: { ...this.flags },
      history: this.history.slice(-GameState.HISTORY_CAP),
      legacy: { ...this.legacy, longestRelationship: { ...this.legacy.longestRelationship } }
    };
  }

  static fromJSON(data) {
    const game = new GameState({ seed: data.seed });
    game.rngState = data.rngState ?? data.seed;
    game.nextId = data.nextId ?? 1;
    game.createdAt = data.createdAt ?? Date.now();
    game.firstName = data.firstName;
    game.lastName = data.lastName;
    game.gender = data.gender;
    game.birthCity = data.birthCity;
    game.birthCountry = data.birthCountry;
    game.age = Format.num(data.age, 0);
    game.year = Format.num(data.year, new Date().getFullYear());
    game.money = Format.num(data.money, 0);
    game.maritalStatus = data.maritalStatus ?? 'single';
    game.alive = data.alive !== false;
    game.deathInfo = data.deathInfo ?? null;
    game.stats = { ...game.stats, ...data.stats };
    game.criminalRecord = Format.num(data.criminalRecord, 0);
    game.jailYears = Format.num(data.jailYears, 0);
    game.jailReason = data.jailReason ?? '';
    game.crimesCommitted = Format.num(data.crimesCommitted, 0);
    game.escapeAttempts = Format.num(data.escapeAttempts, 0);
    game.education = { ...game.education, ...data.education };
    game.conditions = Array.isArray(data.conditions) ? data.conditions.slice() : [];
    game.sentences = Array.isArray(data.sentences) ? data.sentences.slice() : [];
    game.offers = data.offers ?? null;
    game.job = data.job ? { ...data.job } : null;
    game.people = (data.people ?? []).map((p) => Person.fromJSON(p));
    game.assets = (data.assets ?? []).map((a) => new Asset(a));
    game.flags = { ...data.flags };
    game.history = Array.isArray(data.history) ? data.history.slice() : [];
    game.legacy = {
      ...game.legacy,
      ...data.legacy,
      longestRelationship: { ...game.legacy.longestRelationship, ...data.legacy?.longestRelationship }
    };

    // Ids must stay above anything already in use, even from an old save.
    const highest = game.people.reduce((m, p) => Math.max(m, p.id), game.nextId - 1);
    game.nextId = highest + 1;
    return game;
  }
}