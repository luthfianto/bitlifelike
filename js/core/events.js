/*
 * Event engine.
 *
 * Events are plain data:
 *   { id, category, weight, minAge, maxAge, once,
 *     text: string|fn, require?: fn, choices: [{ label, require?, result, effect? }] }
 *
 * A choice `require` returns true (available), false (locked), or a string
 * (locked, with that string shown as the reason).
 *
 * `EventEngine` is a class because it owns a mutable registry: content files
 * call `EventEngine.register([...])` at load, and the engine tracks which
 * events already fired this life via game.flags.
 */
class EventEngine {
  static #registry = [];
  static #byId = new Map();

  static register(list) {
    for (const ev of list ?? []) {
      if (!ev || !ev.id || !Array.isArray(ev.choices) || ev.choices.length === 0) {
        console.warn('[BitLife] ignoring malformed event:', ev?.id);
        continue;
      }
      if (EventEngine.#byId.has(ev.id)) {
        console.warn('[BitLife] duplicate event id ignored:', ev.id);
        continue;
      }
      const entry = {
        weight: 1,
        once: true,
        category: 'life',
        ...ev
      };
      EventEngine.#registry.push(entry);
      EventEngine.#byId.set(entry.id, entry);
    }
  }

  static all() {
    return EventEngine.#registry;
  }

  static get(id) {
    return EventEngine.#byId.get(id) ?? null;
  }

  /* Only prison events fire while incarcerated. */
  static prisonPool() {
    return EventEngine.#registry.filter((ev) => ev.category === 'prison');
  }

  /* Requirement checks run on their own seeded stream so an event's
     availability never depends on how many rolls happened before it. */
  static #checkRequire(req, game, ev) {
    if (!req) return { ok: true };
    try {
      const v = req(game);
      if (v === true) return { ok: true };
      if (typeof v === 'string') return { ok: false, note: v };
      return { ok: false };
    } catch (e) {
      console.warn(`[BitLife] require() threw in "${ev.id}":`, e.message);
      return { ok: false };
    }
  }

  static #ageFits(ev, age) {
    if (ev.minAge != null && age < ev.minAge) return false;
    if (ev.maxAge != null && age > ev.maxAge) return false;
    return true;
  }

  static #hasPlayableChoice(ev, game) {
    let locked = false;
    for (const c of ev.choices) {
      if (!c.require) return true;
      if (EventEngine.#checkRequire(c.require, game, ev).ok) return true;
      locked = true;
    }
    return !locked;
  }

  static eligible(game, pool) {
    return (pool ?? EventEngine.#registry).filter((ev) => {
      if (!EventEngine.#ageFits(ev, game.age)) return false;
      if (ev.once && game.flags[ev.id]) return false;
      if (ev.where && !EventEngine.#guard(ev.where, game)) return false;
      if (!EventEngine.#checkRequire(ev.require, game, ev).ok) return false;
      return EventEngine.#hasPlayableChoice(ev, game);
    });
  }

  static #guard(fn, game) {
    try {
      return !!fn(game);
    } catch (e) {
      console.warn('[BitLife] where() threw:', e.message);
      return false;
    }
  }

  /*
   * Roll for an encounter. Returns an Encounter, or null when nothing was
   * eligible (the caller then falls back to a quiet-year line).
   */
  static roll(game, pool) {
    const candidates = EventEngine.eligible(game, pool);
    if (candidates.length === 0) return null;
    const ev = game.rng.weighted(candidates, (e) => e.weight);
    if (ev.once) game.flags[ev.id] = true;
    return new Encounter(game, ev);
  }

  /* Fallback copy so pressing Age never yields an empty screen. */
  static quiet(game) {
    const a = game.age;
    let lines;
    if (a < 5) lines = ['You babbled at a stuffed animal and laughed at nothing.', 'You took your first steps and immediately fell over.'];
    else if (a < 13) lines = ['You played outside until it got dark.', 'Nothing much happened. You grew a little taller.'];
    else if (a < 18) lines = ['School droned on. You passed the year quietly.', 'You and your friends stayed out too late.'];
    else if (a < 30) lines = ['The year passed without incident.', 'You worked hard and minded your own business.', 'Another year, unremarkable but fine.'];
    else if (a < 55) lines = ['Another year went by without much to report.', 'You kept a routine and stayed out of trouble.'];
    else if (a < 80) lines = ['You took it easier this year.', 'A calm year, health permitting.', 'You spent more time with family.'];
    else lines = ['You moved through the year more slowly now.', 'You told stories about the old days.'];
    return game.rng.pick(lines);
  }

  /* Reset between lives (used by tests and "New Life"). */
  static reset() {
    EventEngine.#registry = [];
    EventEngine.#byId = new Map();
  }
}

/*
 * A single pending event plus its choices. Created when the event rolls, then
 * the player picks a choice index and the outcome is produced.
 */
class Encounter {
  #game;
  #event;

  constructor(game, event) {
    this.#game = game;
    this.#event = event;

    this.text = this.#render(event.text);
    this.category = event.category;

    this.choices = event.choices.map((c, index) => {
      const allowed = !c.require || this.#choiceAllowed(c);
      return {
        index,
        label: c.label,
        enabled: allowed,
        note: allowed ? '' : this.#choiceNote(c)
      };
    });
  }

  #choiceAllowed(choice) {
    // Reuse the engine's require() semantics without the private accessor by
    // evaluating through a tiny stand-in object.
    const fakeEvent = { id: this.#event.id };
    return Encounter.#allow(choice.require, this.#game, fakeEvent);
  }

  #choiceNote(choice) {
    try {
      const v = choice.require(this.#game);
      return typeof v === 'string' ? v : 'Not available right now.';
    } catch {
      return 'Not available right now.';
    }
  }

  static #allow(req, game, ev) {
    if (!req) return true;
    try {
      const v = req(game);
      return v === true || v === '';
    } catch {
      return false;
    }
  }

  #render(field) {
    if (typeof field !== 'function') return field;
    try {
      return field(this.#game);
    } catch (e) {
      console.warn(`[BitLife] text() threw in "${this.#event.id}":`, e.message);
      return 'Something happened.';
    }
  }

  get eventId() {
    return this.#event.id;
  }

  /* Apply the player's choice and return the outcome sentence. */
  resolve(index) {
    const choice = this.#event.choices[index];
    if (!choice) return '';
    if (choice.require && !Encounter.#allow(choice.require, this.#game, this.#event)) return '';

    if (typeof choice.effect === 'function') {
      try {
        choice.effect(this.#game);
      } catch (e) {
        console.warn(`[BitLife] effect() threw in "${this.#event.id}":`, e.message);
      }
    }

    if (typeof choice.result === 'function') {
      try {
        return choice.result(this.#game) || '';
      } catch (e) {
        console.warn(`[BitLife] result() threw in "${this.#event.id}":`, e.message);
        return 'It did not go the way you expected.';
      }
    }
    return choice.result ?? '';
  }
}