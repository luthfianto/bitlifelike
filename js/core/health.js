/*
 * Health: age-related decay, chronic conditions, treatment, and addiction.
 *
 * Health is the stat that decides whether you get to keep playing, so it is
 * also the one most events can move.
 */
const Health = Object.freeze({
  /* Ongoing conditions. damage is health lost per untreated year. */
  CONDITIONS: Object.freeze([
    { id: 'c_back', name: 'Back Problems', emoji: '🦴', damage: 2, cost: 900, mortality: 0 },
    { id: 'c_diabetes', name: 'Diabetes', emoji: '🍬', damage: 3, cost: 1600, mortality: 0.01 },
    { id: 'c_asthma', name: 'Asthma', emoji: '🫁', damage: 2, cost: 1100, mortality: 0.005 },
    { id: 'c_heart', name: 'Heart Disease', emoji: '🫀', damage: 5, cost: 6000, mortality: 0.03 },
    { id: 'c_cancer', name: 'Cancer', emoji: '🎗️', damage: 9, cost: 22000, mortality: 0.09 },
    { id: 'c_alcohol', name: 'Alcoholism', emoji: '🍺', damage: 3, cost: 4200, mortality: 0.01 },
    { id: 'c_drugs', name: 'Drug Addiction', emoji: '💉', damage: 4, cost: 9000, mortality: 0.02 }
  ]),

  byId(id) {
    return Health.CONDITIONS.find((c) => c.id === id) ?? null;
  },

  has(game, id) {
    return game.conditions.includes(id);
  },

  add(game, id) {
    if (!Health.has(game, id)) {
      game.conditions.push(id);
      game.log(`You were diagnosed with ${Health.byId(id).name.toLowerCase()}.`, 'health');
    }
  },

  /* Paying for treatment removes the condition and repairs some damage. */
  treat(game, id) {
    const condition = Health.byId(id);
    if (!condition) return { ok: false, text: 'Nothing to treat.' };
    if (!Health.has(game, id)) return { ok: false, text: `You do not have ${condition.name.toLowerCase()}.` };
    if (!game.spend(condition.cost)) return { ok: false, text: `Treatment costs ${Format.money(condition.cost)}.` };

    game.conditions = game.conditions.filter((c) => c !== id);
    game.stat('health', game.rng.int(4, 12));
    game.log(`You paid ${Format.money(condition.cost)} to treat ${condition.name.toLowerCase()}.`, 'health');
    return { ok: true, text: `Treatment worked. Your ${condition.name.toLowerCase()} is in remission.` };
  },

  /* Time in rehab is slower but sticks better. */
  rehab(game) {
    if (game.stats.addiction < 20) return { ok: false, text: 'You are not struggling with anything right now.' };
    if (!game.spend(12000)) return { ok: false, text: 'Rehab costs $12,000.' };

    game.setStat('addiction', -game.rng.int(30, 55));
    game.setStat('health', game.rng.int(0, 8));
    game.log('You completed a rehab program.', 'health');
    return { ok: true, text: 'You came out the other side of rehab.' };
  },

  /*
   * The health a body of this age can hold onto if nothing is wrong with it.
   * Health drifts toward (ceiling - condition load) rather than falling
   * forever, so a healthy person recovers in youth and only starts losing
   * ground in earnest once the ceiling starts dropping.
   */
  ageCeiling(age) {
    if (age < 30) return 100;
    if (age < 40) return 94;
    if (age < 50) return 88;
    if (age < 60) return 80;
    if (age < 70) return 68;
    if (age < 80) return 54;
    if (age < 90) return 38;
    return 20;
  },

  /*
   * One year of health change. Returns the gap to the target that year.
   */
  drift(game) {
    const conditionDamage = game.conditions.reduce(
      (sum, id) => sum + (Health.byId(id)?.damage ?? 0),
      0
    );

    let target = Health.ageCeiling(game.age) - conditionDamage;
    if (game.stats.addiction > 40) target -= 10;

    // Looking after yourself raises the ceiling for the year.
    if (game.stats.fitness > 60) target += 3;
    if (game.flags['activity:a_gym']) target += 4;
    if (game.flags['activity:a_therapist']) target += 3;
    if (game.flags['activity:a_checkup']) target += 2;
    target = Format.clamp(target, 0, 100);

    const gap = target - game.stats.health;
    // Bodies mend faster than they fail, but neither is quick about it.
    const rate = gap > 0 ? 2.5 : 3;
    game.stat('health', Math.max(-rate, Math.min(rate, gap)));
    return gap;
  },

  /* Chance of picking up a new chronic condition this year. */
  rollCondition(game) {
    const a = game.age;
    let p;
    if (a < 30) p = 0.012;
    else if (a < 50) p = 0.03;
    else if (a < 70) p = 0.06;
    else p = 0.1;

    p *= game.stats.fitness > 60 ? 0.7 : 1.3;
    p *= game.job ? 0.9 : 1.1;

    if (!game.rng.chance(p)) return null;

    const open = Health.CONDITIONS.filter((c) => !Health.has(game, c.id));
    if (!open.length) return null;
    const chosen = game.rng.pick(open);
    Health.add(game, chosen.id);
    return chosen;
  },

  /* Annual mortality risk from conditions, used by the death check. */
  conditionMortality(game) {
    return game.conditions.reduce((sum, id) => sum + (Health.byId(id)?.mortality ?? 0), 0);
  },

  tickYear(game) {
    Health.drift(game);

    const addictionStep = game.stats.addiction > 60 ? game.rng.int(1, 3) : game.rng.int(-1, 0);
    game.stat('addiction', addictionStep);

    return Health.rollCondition(game);
  }
});