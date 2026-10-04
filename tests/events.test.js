/*
 * Validates every registered event, and checks the content pool as a whole.
 *
 * This is the test that catches authoring mistakes: duplicate ids, missing
 * copy, soft-locks, prison events that can fire in ordinary life, and content
 * that would blow up mid-playthrough.
 */
const test = require('node:test');
const assert = require('node:assert');
const { loadEvents } = require('./load.js');

loadEvents();

const all = EventEngine.all();

test('the game has a substantial event pool', () => {
  assert.ok(all.length >= 200, `expected 200+ events, found ${all.length}`);
});

test('event ids are unique', () => {
  const seen = new Set();
  const dupes = [];
  for (const ev of all) {
    if (seen.has(ev.id)) dupes.push(ev.id);
    seen.add(ev.id);
  }
  assert.deepStrictEqual(dupes, [], `duplicate ids: ${dupes.join(', ')}`);
});

test('every event is well formed', () => {
  const problems = [];
  for (const ev of all) {
    if (typeof ev.id !== 'string' || !ev.id) problems.push(`${ev.id}: bad id`);
    if (typeof ev.text !== 'string' && typeof ev.text !== 'function') {
      problems.push(`${ev.id}: missing text`);
    }
    if (!Array.isArray(ev.choices) || ev.choices.length < 2) {
      problems.push(`${ev.id}: needs at least 2 choices`);
      continue;
    }
    for (const [i, c] of ev.choices.entries()) {
      if (typeof c.label !== 'string' || !c.label.trim()) problems.push(`${ev.id}[${i}]: missing label`);
      if (typeof c.result !== 'string' && typeof c.result !== 'function') {
        problems.push(`${ev.id}[${i}]: missing result`);
      }
      // effect and require are callables when present; text/result may be copy.
      for (const field of ['effect', 'require']) {
        const v = c[field];
        if (v !== undefined && typeof v !== 'function') problems.push(`${ev.id}[${i}]: ${field} is not a function`);
      }
    }
  }
  assert.deepStrictEqual(problems, [], problems.slice(0, 20).join('\n'));
});

test('text and result render without throwing when the event is actually eligible', () => {
  const failures = [];
  for (const ev of all) {
    for (const age of [5, 18, 40, 70]) {
      const game = new GameState({ seed: age * 7919, birthYear: 2020 - age });
      game.age = age;

      // Follow the real runtime path: an event only ever renders if its own
      // require() passes, and a choice only renders if its require() passes.
      if (ev.where && !safeCall(() => ev.where(game))) continue;
      const gate = ev.require ? safeCall(() => ev.require(game)) : true;
      if (gate !== true) continue;

      if (ev.text) {
        const out = typeof ev.text === 'function' ? safeCall(() => ev.text(game)) : ev.text;
        if (out === undefined || String(out).trim() === '') failures.push(`${ev.id} @${age}: empty text`);
      }
      for (const c of ev.choices) {
        const choiceGate = c.require ? safeCall(() => c.require(game)) : true;
        if (choiceGate !== true) continue;
        const out = typeof c.result === 'function' ? safeCall(() => c.result(game)) : c.result;
        if (out === undefined || String(out).trim() === '') failures.push(`${ev.id} @${age}: empty result`);
      }
    }
  }
  assert.deepStrictEqual(failures, [], failures.slice(0, 20).join('\n'));
});

test('no event can soft-lock: one choice is always available', () => {
  const locked = [];
  for (const ev of all) {
    const unguarded = ev.choices.some((c) => !c.require);
    if (!unguarded) {
      // All choices are guarded — only acceptable if every require passes for a
      // plausible default character.
      const game = new GameState({ seed: 5, birthYear: 2000 });
      const anyOpen = ev.choices.some((c) => safeCall(() => c.require(game)) === true);
      if (!anyOpen) locked.push(ev.id);
    }
  }
  assert.deepStrictEqual(locked, [], `soft-locked events: ${locked.join(', ')}`);
});

test('prison events are gated to jailed characters only', () => {
  const strays = EventEngine.prisonPool()
    .filter((ev) => {
      const game = new GameState({ seed: 1, birthYear: 1990 });
      game.age = 40;
      return safeCall(() => ev.require?.(game)) !== false;
    })
    .map((ev) => ev.id);

  // A prison event must actively refuse to fire when the player is free.
  const offenders = [];
  for (const ev of EventEngine.prisonPool()) {
    const game = new GameState({ seed: 1, birthYear: 1990 });
    game.age = 40;
    const check = safeCall(() => ev.require?.(game));
    if (check === true || check === undefined) offenders.push(ev.id);
  }
  assert.deepStrictEqual(offenders, [], `prison events fire outside prison: ${offenders.join(', ')}`);
});

test('age bounds are sane', () => {
  const bad = all
    .filter((ev) => ev.minAge != null && ev.maxAge != null && ev.minAge > ev.maxAge)
    .map((ev) => ev.id);
  assert.deepStrictEqual(bad, [], `inverted age ranges: ${bad.join(', ')}`);
});

test('every category has events', () => {
  // The content files are organised by life stage, but they tag events by the
  // kind of event, which is what the UI colours and the log filter on.
  const expected = ['child', 'school', 'family', 'social', 'career', 'money', 'assets', 'health', 'life', 'crime', 'prison', 'random'];
  const cats = new Set(all.map((e) => e.category));
  for (const c of expected) assert.ok(cats.has(c), `no events in category "${c}"`);
  assert.deepStrictEqual(
    [...cats].filter((c) => !expected.includes(c)),
    [],
    'an event used a category nothing else knows about'
  );
});

function safeCall(fn) {
  try {
    return fn();
  } catch (e) {
    throw new Error(`callback threw: ${e.message}`);
  }
}