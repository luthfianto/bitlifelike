/* Core engine tests: RNG, state invariants, the age-up loop, save round-trip. */
const test = require('node:test');
const assert = require('node:assert');
const { loadCore } = require('./load.js');

loadCore();

test('Rng is deterministic for a given seed', () => {
  const a = new Rng(12345);
  const b = new Rng(12345);
  const seqA = Array.from({ length: 20 }, () => a.next());
  const seqB = Array.from({ length: 20 }, () => b.next());
  assert.deepStrictEqual(seqA, seqB);
});

test('Rng.int stays inside its inclusive bounds', () => {
  const r = new Rng(7);
  for (let i = 0; i < 500; i++) {
    const n = r.int(3, 9);
    assert.ok(n >= 3 && n <= 9, `int(3,9) produced ${n}`);
    assert.ok(Number.isInteger(n));
  }
});

test('Rng.weighted honours weights and never returns from an empty list', () => {
  const r = new Rng(99);
  const items = [{ w: 1 }, { w: 0 }];
  for (let i = 0; i < 200; i++) {
    assert.deepStrictEqual(r.weighted(items, (x) => x.w), items[0]);
  }
  assert.strictEqual(r.weighted([], () => 1), undefined);
});

test('GameState builds a family and clamps stats to 0-100', () => {
  const game = new GameState({ seed: 42, gender: 'female', birthYear: 2000 });
  assert.strictEqual(game.people.length >= 2, true, 'expected at least two parents');
  assert.strictEqual(game.gender, 'female');
  assert.strictEqual(game.year, 2000);
  assert.strictEqual(game.age, 0);

  game.setStat('happiness', 999);
  assert.strictEqual(game.stats.happiness, 100);
  game.setStat('happiness', -50);
  assert.strictEqual(game.stats.happiness, 0);
});

test('stat() deltas clamp and return the applied amount', () => {
  const game = new GameState({ seed: 1 });
  game.setStat('smarts', 95);
  assert.strictEqual(game.stat('smarts', 20), 5);
  assert.strictEqual(game.stats.smarts, 100);
});

test('spend only succeeds when affordable', () => {
  const game = new GameState({ seed: 2 });
  game.addMoney(500);
  assert.strictEqual(game.spend(300), true);
  assert.strictEqual(game.money, 200);
  assert.strictEqual(game.spend(9999), false);
  assert.strictEqual(game.money, 200, 'failed spend must not change balance');
});

test('ageUp runs the full pipeline without registered events', () => {
  const game = new GameState({ seed: 3, birthYear: 2000 });
  for (let i = 0; i < 20; i++) game.ageUp();

  // Either the life survived all 20 years or it ended with a full death record.
  if (game.alive) {
    assert.strictEqual(game.age, 20);
    assert.strictEqual(game.year, 2020);
  } else {
    assert.ok(game.age > 0 && game.age <= 20);
    assert.ok(game.deathInfo, 'a dead life must carry a death record');
    assert.strictEqual(typeof game.deathInfo.epitaph, 'string');
  }
  assert.ok(game.history.length > 0, 'ageUp should log something each year');
  assert.ok(game.people.some((p) => p.age > 0), 'everyone should have aged');
});

test('ageUp with strong health reaches the expected age every year', () => {
  const game = new GameState({ seed: 8, birthYear: 2000 });
  for (let i = 0; i < 20; i++) {
    game.setStat('health', 100);
    game.ageUp();
  }
  assert.strictEqual(game.alive, true, 'a healthy childhood should be survivable');
  assert.strictEqual(game.age, 20);
  assert.strictEqual(game.year, 2020);
  assert.ok(game.history.length > 0, 'the life should have been narrated');
  assert.ok(Number.isFinite(game.money), 'money should stay finite');
});

test('netWorth counts assets minus debt', () => {
  const game = new GameState({ seed: 4 });
  game.addMoney(1000);
  game.buy(Catalog.HOUSES[0], { value: 100000, debt: 80000 });
  assert.strictEqual(game.netWorth(), 21000);
});

test('save round-trip preserves the life exactly', () => {
  const game = new GameState({ seed: 5, birthYear: 1990 });
  for (let i = 0; i < 12; i++) game.ageUp();
  game.addMoney(123456);
  game.setStat('fame', 77);
  game.addPerson({ type: 'friend', firstName: 'Zed', lastName: 'Kane', age: 30 });

  const revived = GameState.fromJSON(JSON.parse(JSON.stringify(game.toJSON())));

  assert.strictEqual(revived.age, game.age);
  assert.strictEqual(revived.money, game.money);
  assert.strictEqual(revived.stats.fame, 77);
  assert.strictEqual(revived.rngState, game.rngState, 'rng cursor must survive the round trip');
  assert.strictEqual(revived.people.length, game.people.length);
  assert.ok(revived.people.some((p) => p.firstName === 'Zed'));
  assert.ok(revived.nextId > game.people.at(-1).id, 'id counter must stay ahead of used ids');
});

test('a revived life continues to produce the same rolls', () => {
  const game = new GameState({ seed: 11, birthYear: 1995 });
  for (let i = 0; i < 5; i++) game.ageUp();

  const copy = GameState.fromJSON(JSON.parse(JSON.stringify(game.toJSON())));
  const before = copy.rngState;

  game.ageUp();
  copy.ageUp();

  assert.strictEqual(copy.rngState, game.rngState, 'same seed + same cursor => same future');
  assert.notStrictEqual(before, copy.rngState, 'the rng cursor should actually advance');
});