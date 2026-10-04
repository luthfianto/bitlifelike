/*
 * Fuzz test: thousands of complete lives played by a bot.
 *
 * Each iteration simulates a full life, picking a random choice whenever an
 * event appears, and asserts the game's invariants after every single year.
 * This is what shakes out crashes, NaN money, stats escaping 0-100, and dead
 * ends that only show up on the hundredth run.
 */
const test = require('node:test');
const assert = require('node:assert');
const { loadEvents } = require('./load.js');

loadEvents();

const LIVES = Number(process.env.FUZZ_LIVES ?? 2000);
const MAX_YEARS = 110;

function invariants(game, where) {
  for (const [key, value] of Object.entries(game.stats)) {
    assert.ok(Number.isFinite(value), `${where}: stat ${key} is ${value}`);
    assert.ok(value >= 0 && value <= 100, `${where}: stat ${key} out of range: ${value}`);
  }

  assert.ok(Number.isFinite(game.money), `${where}: money is ${game.money}`);
  assert.ok(Number.isFinite(game.netWorth()), `${where}: netWorth is ${game.netWorth()}`);

  assert.ok(game.age >= 0 && game.age < 200, `${where}: age is ${game.age}`);
  assert.ok(game.jailYears >= 0, `${where}: jailYears is ${game.jailYears}`);
  assert.ok(game.criminalRecord >= 0 && game.criminalRecord <= 100, `${where}: record ${game.criminalRecord}`);

  const ids = game.people.map((p) => p.id);
  assert.strictEqual(new Set(ids).size, ids.length, `${where}: duplicate person ids`);

  for (const p of game.people) {
    assert.ok(p.age >= 0, `${where}: negative age on ${p.firstName}`);
    assert.ok(p.relationship >= 0 && p.relationship <= 100, `${where}: relationship out of range`);
  }
  for (const a of game.assets) {
    assert.ok(Number.isFinite(a.value), `${where}: asset value is ${a.value}`);
    assert.ok(a.debt >= 0, `${where}: negative debt`);
  }
}

function playLife(seed) {
  const game = new GameState({ seed, birthYear: 2025 - (seed % 60) });
  const rng = new Rng(seed ^ 0x9e3779b9);

  for (let year = 0; year < MAX_YEARS && game.alive; year++) {
    const encounter = game.ageUp();
    invariants(game, `seed ${seed} year ${year}`);

    if (!game.alive) break;

    if (encounter) {
      const open = encounter.choices.filter((c) => c.enabled);
      assert.ok(open.length > 0, `seed ${seed} year ${year}: event "${encounter.eventId}" had no usable choice`);
      const pick = rng.pick(open);
      const outcome = encounter.resolve(pick.index);
      assert.strictEqual(typeof outcome, 'string', `seed ${seed}: resolve() did not return text`);
      assert.ok(outcome.length > 0, `seed ${seed}: event "${encounter.eventId}" choice "${pick.label}" produced no copy`);
      invariants(game, `seed ${seed} year ${year} (after choice)`);
    }
  }

  return game;
}

test(`fuzz: ${LIVES} full lives never break an invariant`, () => {
  const ages = [];
  let reachedPrison = 0;
  let reachedJob = 0;
  let livedPast80 = 0;
  let diedInChildhood = 0;

  for (let seed = 1; seed <= LIVES; seed++) {
    const game = playLife(seed);
    ages.push(game.age);
    if (game.legacy.arrests > 0) reachedPrison++;
    if (game.legacy.yearsWorked > 0) reachedJob++;
    if (game.age >= 80) livedPast80++;
    if (game.age < 13) diedInChildhood++;
  }

  const median = ages.toSorted((a, b) => a - b)[Math.floor(LIVES / 2)];
  console.log(
    `  lives=${LIVES} median age=${median} max=${Math.max(...ages)} ` +
      `worked=${reachedJob} prison=${reachedPrison} past 80=${livedPast80}`
  );

  // Balance guards. The bot picks choices at random, including deliberately
  // terrible ones, so the bar is wide -- but a badly tuned health or mortality
  // curve would push these out of range immediately.
  assert.ok(median >= 55, `median lifespan too short: ${median}`);
  assert.ok(median <= 95, `median lifespan implausibly long: ${median}`);
  assert.ok(Math.max(...ages) >= 90, 'some lives should reach extreme old age');
  assert.ok(livedPast80 > LIVES * 0.02, `too few lives reached 80: ${livedPast80}/${LIVES}`);
  assert.ok(diedInChildhood < LIVES * 0.1, `too many childhood deaths: ${diedInChildhood}/${LIVES}`);
});

test('fuzz: saves round-trip at arbitrary points mid-life', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const game = new GameState({ seed, birthYear: 1980 });
    for (let i = 0; i < (seed % 70); i++) {
      const enc = game.ageUp();
      if (enc) {
        const open = enc.choices.filter((c) => c.enabled);
        if (open.length) enc.resolve(open[seed % open.length].index);
      }
      if (!game.alive) break;
    }

    const revived = GameState.fromJSON(JSON.parse(JSON.stringify(game.toJSON())));
    invariants(revived, `round-trip seed ${seed}`);

    // And the revived life must keep going without trouble.
    if (revived.alive) {
      const enc = revived.ageUp();
      if (enc) {
        const open = enc.choices.filter((c) => c.enabled);
        if (open.length) enc.resolve(open[0].index);
      }
      invariants(revived, `post-round-trip seed ${seed}`);
    }
  }
});

test('fuzz: extreme inputs cannot corrupt state', () => {
  for (const seed of [0, 1, 4294967295, 123456789]) {
    const game = new GameState({ seed, birthYear: 2020 });

    // Try every crime, buy everything, spend down to nothing.
    for (const crime of Crimes.ALL) {
      if (game.jailed) break;
      Crime.commit(game, crime.id);
      invariants(game, `seed ${seed} after ${crime.id}`);
    }

    game.addMoney(50_000_000);
    for (const def of Catalog.HOUSES) Portfolio.buyHouse(game, def, { mortgage: 0.9 });
    for (const def of Catalog.CARS) Portfolio.buyCar(game, def);
    for (const def of Catalog.PETS) Portfolio.adoptPet(game, def);
    invariants(game, `seed ${seed} after buying everything`);

    game.money = 0;
    game.ageUp();
    invariants(game, `seed ${seed} broke age-up`);
  }
});