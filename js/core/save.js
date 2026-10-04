/*
 * Save/load.
 *
 * One slot in localStorage, autosaved after every action. Guards against a
 * missing localStorage (some browsers under file://, and Node under test) and
 * against saves written by an older version of the game.
 */

/* localStorage access throws outright when storage is disabled. */
function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const Save = Object.freeze({
  KEY: 'bitlife.save.v1',

  available() {
    return storage() !== null;
  },

  save(game) {
    const store = storage();
    if (!store) return false;
    try {
      store.setItem(Save.KEY, JSON.stringify(game.toJSON()));
      return true;
    } catch (e) {
      console.warn('[BitLife] could not write save:', e.message);
      return false;
    }
  },

  /* Returns a GameState, or null when there is nothing usable stored. */
  load() {
    const store = storage();
    if (!store) return null;

    let raw;
    try {
      raw = store.getItem(Save.KEY);
    } catch {
      return null;
    }
    if (!raw) return null;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.warn('[BitLife] save was corrupt and has been discarded');
      Save.clear();
      return null;
    }

    if (!data || data.version !== GameState.SAVE_VERSION) {
      console.warn('[BitLife] save version mismatch, starting a new life');
      Save.clear();
      return null;
    }

    try {
      return GameState.fromJSON(data);
    } catch (e) {
      console.warn('[BitLife] save could not be restored:', e.message);
      Save.clear();
      return null;
    }
  },

  clear() {
    const store = storage();
    if (!store) return;
    try {
      store.removeItem(Save.KEY);
    } catch {
      /* nothing useful to do */
    }
  }
});