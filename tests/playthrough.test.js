/*
 * A realistic playthrough: the path an actual player takes through the UI.
 *
 * The fuzz bot only ever ages up and picks a choice; it never enrolls, applies
 * for a job, buys anything or retires. This test walks that path so the systems
 * have to work together rather than just in isolation.
 */
const test = require('node:test');
const assert = require('node:assert');
const { loadEvents } = require('./load.js');

loadEvents();

/* Age a year, always taking the first available choice. */
function playYear(game) {
  const encounter = game.ageUp();
  if (!encounter) return null;
  const open = encounter.choices.filter((c) => c.enabled);
  if (!open.length) throw new Error('soft lock: nothing was selectable');
  encounter.resolve(open[0].index);
  return encounter;
}

function playYears(game, count) {
  const seen = [];
  for (let i = 0; i < count && game.alive; i++) {
    const encounter = playYear(game);
    if (encounter) seen.push(encounter.eventId);
  }
  return seen;
}

test('a full life: school, career, property, retirement, death', () => {
  const game = new GameState({ seed: 20260709, birthYear: 2000 });
  const events = new Set();

  /* --- childhood ------------------------------------------------------- */
  playYears(game, 18);
  assert.strictEqual(game.alive, true, `died at ${game.age}`);
  assert.strictEqual(game.age, 18);
  assert.ok(events.size >= 0);
  assert.ok(game.peopleOf('parent').length > 0, 'should still have living parents at 18');

  /* --- university ------------------------------------------------------ */
  game.education.level = 'high_school';
  game.addMoney(60000);
  assert.ok(Education.tuition(game) > 0, 'university should cost something');

  const enroll = Education.enroll(game, 'university', 'computer');
  assert.strictEqual(enroll.ok, true, enroll.text);
  assert.ok(game.spend(Education.tuition(game)), 'should be able to afford tuition');

  const schooled = playYears(game, 4);
  for (const id of schooled) events.add(id);
  assert.strictEqual(game.education.yearsLeft, 0, 'should have finished the degree');
  assert.strictEqual(game.education.level, 'university', 'finishing leaves you a university graduate');
  assert.strictEqual(game.education.degree, 'computer', 'the field of study should stick');
  assert.ok(game.education.gpa >= 0 && game.education.gpa <= 4.3, `gpa out of range: ${game.education.gpa}`);

  /* --- career ---------------------------------------------------------- */
  const offers = Career.generateOffers(game);
  assert.ok(offers.length > 0, 'a computer science grad should have offers');
  assert.ok(offers.every((o) => Career.eligible(game, o.job) === null), 'every offer should be one they can take');

  // A player would take the best offer on the table, not the first one.
  const best = offers.toSorted((a, b) => b.job.tier - a.job.tier || b.salary - a.salary)[0];
  const accepted = Career.accept(game, best);
  assert.strictEqual(accepted.ok, true, accepted.text);
  assert.ok(game.job, 'should have a job');
  const entrySalary = game.job.salary;
  assert.ok(entrySalary > 0);

  /* --- work ------------------------------------------------------------ */
  let promotions = 0;
  for (let year = 0; year < 30 && game.alive; year++) {
    // Play well: turn up, and push for the next step up.
    game.setStat('performance', 80);
    game.setStat('fitness', 65);
    const encounter = playYear(game);
    if (encounter) events.add(encounter.eventId);

    if (game.job) {
      game.job.performance = 82;
      game.job.yearsInRole += 1;
      if (game.job.yearsInRole >= 2 && game.job.tier < 5) {
        if (Career.attemptPromotion(game).ok) promotions++;
      }
    } else {
      // Laid off or fired: go back to the jobs screen like a player would.
      const more = Career.generateOffers(game);
      const open = more.filter((o) => Career.eligible(game, o.job) === null);
      if (open.length) Career.accept(game, game.rng.pick(open));
    }
  }

  assert.ok(promotions >= 1, `30 years of good work should earn a promotion, got ${promotions}`);
  assert.ok(game.legacy.peakSalary >= entrySalary, 'peak pay should not be below the entry pay');
  assert.ok(game.legacy.yearsWorked >= 20, `should have worked most of those years, got ${game.legacy.yearsWorked}`);
  assert.strictEqual(game.alive, true, `should still be alive at ${game.age}`);

  /* --- property -------------------------------------------------------- */
  const affordable = Catalog.HOUSES.filter((h) => game.money >= h.price * 0.2);
  assert.ok(affordable.length > 0, 'should be able to afford a house by now');

  const bought = Portfolio.buyHouse(game, game.rng.pick(affordable), { mortgage: 0.2 });
  assert.strictEqual(bought.ok, true, bought.text);
  assert.strictEqual(game.assetsOf('h').length, 1);

  const netWorthAfterHouse = game.netWorth();
  assert.ok(netWorthAfterHouse > 0, 'net worth should be positive mid-life');

  /* --- family ---------------------------------------------------------- */
  const partner = game.addPerson({
    type: 'partner', firstName: 'Robin', lastName: 'Alvarez', age: game.age - 2, relationship: 75
  });
  assert.strictEqual(game.partner(), null, 'a new acquaintance is not yet a partner');

  const asked = Relationships.becomePartner(game, partner);
  assert.strictEqual(asked.ok, true, asked.text);
  assert.strictEqual(game.maritalStatus, 'dating');
  assert.strictEqual(game.partner()?.id, partner.id, 'dating should make them the partner');

  const proposed = Relationships.propose(game, partner);
  assert.strictEqual(proposed.ok, true, proposed.text);
  assert.strictEqual(game.maritalStatus, 'engaged');

  const married = Relationships.marry(game, partner);
  assert.strictEqual(married.ok, true, married.text);
  assert.strictEqual(game.maritalStatus, 'married');
  assert.strictEqual(partner.type, 'spouse', 'marriage should promote them to spouse');

  /* --- retirement ------------------------------------------------------ */
  const finalSalary = game.job.salary;
  const retired = Career.retire(game);
  assert.strictEqual(retired.ok, true, retired.text);
  assert.strictEqual(game.job.id, 'retired', 'retirement should leave a pension on the books');
  assert.strictEqual(game.job.salary, Math.round(finalSalary * 0.4), 'the pension should be 40% of the salary');
  assert.strictEqual(game.job.title, 'Retired');

  /* --- old age and death ------------------------------------------------ */
  let guard = 0;
  while (game.alive && guard++ < 80) playYear(game);

  assert.strictEqual(game.alive, false, `should have died by now, age ${game.age}`);
  assert.ok(game.age >= 60, `should have reached old age, died at ${game.age}`);
  assert.ok(game.deathInfo.cause, 'death should record a cause');
  assert.ok(game.deathInfo.epitaph, 'death should record an epitaph');
  assert.ok(game.history.length > 0, 'a played life should be narrated');

  console.log(
    `  lived to ${game.age} (${game.deathInfo.cause}) - ${promotions} promotions, ` +
      `${events.size} distinct events seen, net worth ${Format.moneyShort(game.netWorth())}`
  );
});

test('a bad life still ends coherently', () => {
  const game = new GameState({ seed: 7, birthYear: 2000 });

  // Say yes to everything criminal, available and affordable.
  for (let i = 0; i < 60 && game.alive; i++) {
    const encounter = game.ageUp();
    if (!encounter) continue;
    const open = encounter.choices.filter((c) => c.enabled);
    const worst = open.at(-1);
    if (worst) encounter.resolve(worst.index);
  }

  assert.ok(game.history.length > 0);
  assert.ok(Number.isFinite(game.money), 'money should stay finite');
  for (const [key, value] of Object.entries(game.stats)) {
    assert.ok(value >= 0 && value <= 100, `${key} = ${value}`);
  }
  assert.ok(game.alive || game.deathInfo.cause, 'the life ended for a reason');
});

test('the events a played life encounters all exist in the registry', () => {
  const game = new GameState({ seed: 31337, birthYear: 2000 });
  const known = new Set(EventEngine.all().map((e) => e.id));
  const fired = new Set();

  for (let i = 0; i < 40 && game.alive; i++) {
    const encounter = game.ageUp();
    if (encounter) fired.add(encounter.eventId);
  }

  assert.ok(fired.size > 0, 'a life should encounter events');
  for (const id of fired) assert.ok(known.has(id), `encountered an unregistered event: ${id}`);
});