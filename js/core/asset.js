/*
 * Something the player owns: a house, a car, or a pet.
 *
 * The constructor takes a plain spec object and every field is stored on the
 * instance, so hydration from a save file is just `new Asset(savedObject)` —
 * no prototype surgery, no catalog lookup that could drift.
 *
 * Houses ride a random walk upward and carry a mortgage; cars decay hard;
 * pets age toward a species lifespan and can die.
 */
class Asset {
  constructor(spec = {}) {
    this.uid = spec.uid ?? 0;
    this.assetId = spec.assetId ?? '';
    this.type = spec.type ?? spec.assetId.charAt(0); // 'h' house, 'c' car, 'p' pet
    this.name = spec.name ?? 'Thing';
    this.emoji = spec.emoji ?? '📦';
    this.price = Format.num(spec.price, 0);
    this.value = Format.num(spec.value, this.price);
    this.upkeep = Format.num(spec.upkeep, 0);
    this.lifespan = spec.lifespan ?? null; // pets only
    this.petName = spec.petName ?? null; // set when a pet is named
    this.age = Format.num(spec.age, 0);
    this.boughtYear = Format.num(spec.boughtYear, 0);
    this.debt = Format.num(spec.debt, 0);
    this.isDead = !!spec.isDead;
  }

  /* Build from a Catalog entry when the player buys something new. */
  static buy(def, { boughtYear = 0, value, debt = 0 } = {}) {
    return new Asset({
      assetId: def.id,
      type: def.id.charAt(0),
      name: def.name,
      emoji: def.emoji,
      price: def.price,
      value: value ?? def.price,
      upkeep: def.upkeep,
      lifespan: def.lives ?? null,
      boughtYear,
      debt
    });
  }

  get isPet() { return this.type === 'p'; }
  get isCar() { return this.type === 'c'; }
  get isHouse() { return this.type === 'h'; }

  get equity() { return Math.round(this.value - this.debt); }
  get mortgageRate() { return this.isHouse && this.debt > 0 ? 0.045 : 0; }

  get label() {
    return this.petName ? `${this.name} named ${this.petName}` : this.name;
  }

  /*
   * Advance one year. Returns a short note when something worth telling the
   * player happened (market crash, pet death).
   */
  tickYear(rng) {
    if (this.isDead) return null;
    this.age += 1;

    if (this.isPet) {
      if (this.lifespan && this.age >= this.lifespan) {
        if (this.age < this.lifespan * 0.6 || rng.chance(0.25 + this.age * 0.02)) {
          this.isDead = true;
          return { kind: 'pet_died', text: `Your ${this.name} died at ${this.age}.` };
        }
      }
      return null;
    }

    let note = null;

    if (this.isHouse) {
      // Gentle upward bias plus market shocks; gains taper as you hold longer.
      const drift = rng.range(-0.04, 0.11);
      const crash = rng.chance(0.04) ? rng.range(-0.25, -0.08) : 0;
      const held = Math.min(this.age, 20) / 20;
      const before = this.value;
      this.value = Math.max(0, Math.round(this.value * (1 + drift * (0.4 + 0.6 * held) + crash)));
      if (crash) {
        note = {
          kind: 'market',
          text: `The housing market fell — your ${this.name} dropped ${Format.abbrev(before - this.value)} in value.`
        };
      }
    } else {
      const before = this.value;
      this.value = Math.max(Math.round(this.price * 0.12), Math.round(this.value * (1 - rng.range(0.12, 0.26))));
      note = {
        kind: 'car_decay',
        text: `Your ${this.name} lost ${Format.abbrev(before - this.value)} in value.`
      };
    }

    if (this.debt > 0) this.debt = Math.round(this.debt + this.debt * this.mortgageRate);

    return note;
  }

  /* Player pays principal against the mortgage; returns amount actually paid. */
  payMortgage(amount) {
    const pay = Math.min(Math.max(0, amount), this.debt);
    this.debt -= pay;
    return pay;
  }

  toJSON() {
    return { ...this };
  }
}