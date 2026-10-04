/*
 * A person the player knows: family, partners, friends, bosses, rivals.
 *
 * The constructor is pure — id assignment belongs to GameState.addPerson so
 * that ids stay unique and monotonic regardless of who creates whom.
 */
class Person {
  constructor(partial = {}) {
    this.id = partial.id ?? 0;
    this.firstName = partial.firstName ?? 'Someone';
    this.lastName = partial.lastName ?? 'Unknown';
    this.gender = partial.gender ?? 'male';
    this.age = Format.num(partial.age, 0);
    this.type = partial.type ?? 'friend';
    this.relationship = Format.clamp(Format.num(partial.relationship, 50), 0, 100);
    this.happiness = Format.clamp(Format.num(partial.happiness, 60), 0, 100);
    this.isDead = !!partial.isDead;
    this.deathYear = partial.deathYear ?? null;
    this.deathCause = partial.deathCause ?? null;
    this.isJailed = !!partial.isJailed;
    this.jailYears = Format.num(partial.jailYears, 0);
    this.jailReason = partial.jailReason ?? '';
    this.job = partial.job ?? null;
    this.netWorth = Format.num(partial.netWorth, 0);
    this.isMarried = !!partial.isMarried;
    this.spouseName = partial.spouseName ?? '';
    this.children = Array.isArray(partial.children) ? partial.children.slice() : [];
    this.metYear = Format.num(partial.metYear, 0);
    this.lastInteractionYear = Format.num(partial.lastInteractionYear, 0);
    this.timesMet = Format.num(partial.timesMet, 0);
    this.yearsInPrison = Format.num(partial.yearsInPrison, 0);
  }

  get fullName() {
    return this.type === 'pet' ? this.firstName : `${this.firstName} ${this.lastName}`;
  }

  get isLiving() {
    return !this.isDead;
  }

  /* Display name for UI: people you are close to are called by first name. */
  get displayName() {
    return this.type === 'pet' ? this.firstName : this.firstName;
  }

  get ageBand() {
    if (this.age < 13) return 'child';
    if (this.age < 20) return 'teen';
    if (this.age < 65) return 'adult';
    return 'senior';
  }

  get occupation() {
    if (this.isJailed) return 'In Prison';
    if (this.type === 'child') return this.ageBand === 'child' ? 'Child' : 'Student';
    return this.job ?? 'Unemployed';
  }

  /* Every NPC gains a year; children move up an age band. */
  ageYear(rng) {
    this.age += 1;
    if (this.isJailed && this.jailYears > 0) {
      this.jailYears -= 1;
      if (this.jailYears <= 0) {
        this.isJailed = false;
        this.jailReason = '';
      }
    }
    // Relationships cool slightly when neglected, floor at 5 so nobody
    // silently hits zero and becomes a stranger forever.
    if (this.relationship > 5) this.relationship = Math.max(5, this.relationship - 1);
    return this;
  }

  /* Natural death odds rise steeply with age and low happiness. */
  deathChanceThisYear(rng) {
    if (this.isDead) return 0;
    const a = this.age;
    let p;
    if (a < 40) p = 0.002;
    else if (a < 55) p = 0.006;
    else if (a < 70) p = 0.018;
    else if (a < 80) p = 0.045;
    else if (a < 90) p = 0.11;
    else if (a < 100) p = 0.24;
    else p = 0.42;
    p *= 0.7 + (100 - this.happiness) / 220;
    return rng.chance(p) ? p : 0;
  }

  kill(game, cause) {
    if (this.isDead) return this;

    // Resolve the player's attachment first: partner() only searches living
    // people, so checking after setting isDead would always come up empty and
    // leave the player married to a corpse.
    if (game.partner()?.id === this.id) {
      game.maritalStatus = game.maritalStatus === 'married' ? 'widowed' : 'single';
      game.setStat('happiness', game.stats.happiness - 20);
    }

    this.isDead = true;
    this.deathYear = game.year;
    this.deathCause = cause ?? 'unknown';
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      age: this.age,
      type: this.type,
      relationship: this.relationship,
      happiness: this.happiness,
      isDead: this.isDead,
      deathYear: this.deathYear,
      deathCause: this.deathCause,
      isJailed: this.isJailed,
      jailYears: this.jailYears,
      jailReason: this.jailReason,
      job: this.job,
      netWorth: this.netWorth,
      isMarried: this.isMarried,
      spouseName: this.spouseName,
      children: this.children.slice(),
      metYear: this.metYear,
      lastInteractionYear: this.lastInteractionYear,
      timesMet: this.timesMet,
      yearsInPrison: this.yearsInPrison
    };
  }

  static fromJSON(data) {
    return new Person(data);
  }
}