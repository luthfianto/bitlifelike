/*
 * Death and the legacy screen.
 *
 * Mortality is checked once per year: zero health is fatal outright, and an
 * age/health curve plus condition load decides the rest.
 */
const Death = Object.freeze({
  /* Annual probability of dying, before the roll. */
  naturalChance(game) {
    if (game.stats.health <= 0) return 1;

    const a = game.age;
    let p;
    if (a < 30) p = 0.0008;
    else if (a < 50) p = 0.003;
    else if (a < 65) p = 0.01;
    else if (a < 75) p = 0.03;
    else if (a < 85) p = 0.08;
    else if (a < 95) p = 0.18;
    else if (a < 105) p = 0.34;
    else p = 0.55;

    // Health swings the odds hard: -40 health is roughly a 4x multiplier.
    const healthFactor = 1 + (50 - game.stats.health) / 25;
    p *= Math.max(0.15, healthFactor);

    p += Health.conditionMortality(game);
    p += game.jailed ? 0.004 : 0;

    return Math.min(0.95, p);
  },

  /* Plausible wording for whatever finally did it. */
  causeFor(game) {
    if (game.stats.health <= 0) return 'organ failure';
    if (game.conditions.includes('c_cancer')) return 'cancer';
    if (game.conditions.includes('c_heart')) return 'heart failure';
    if (game.stats.addiction > 70) return 'an overdose';
    if (game.age >= 85) return 'old age';
    if (game.age >= 65) return 'old age, quietly';
    return game.rng.pick(['a heart attack', 'a stroke', 'an infection', 'complications from illness']);
  },

  /* Called once per year from Year.tick. Returns true if the player died. */
  check(game) {
    if (!game.alive || game.jailed) return false;
    const chance = Death.naturalChance(game);
    if (chance >= 1 || game.rng.chance(chance)) {
      Death.kill(game, Death.causeFor(game));
      return true;
    }
    return false;
  },

  /* End the life and freeze the legacy record. */
  kill(game, cause = 'unknown') {
    if (!game.alive) return game.deathInfo;

    game.alive = false;
    game.jailYears = 0;
    game.job = null;
    game.maritalStatus = 'single';

    game.legacy.peakNetWorth = Math.max(game.legacy.peakNetWorth, game.netWorth());

    game.deathInfo = {
      age: game.age,
      year: game.year,
      cause,
      netWorth: game.netWorth(),
      peakNetWorth: game.legacy.peakNetWorth,
      fame: game.stats.fame,
      happiness: game.stats.happiness,
      children: game.legacy.childrenBorn,
      marriages: game.legacy.marriages,
      divorces: game.legacy.divorces,
      crimes: game.legacy.crimesCommitted,
      arrests: game.legacy.arrests,
      jailYears: game.legacy.jailYears,
      escapes: game.legacy.escapes,
      promotions: game.legacy.promotions,
      firings: game.legacy.firings,
      totalEarned: game.legacy.totalEarned,
      jobsHeld: game.legacy.jobsHeld.slice(),
      petsOwned: game.legacy.petsOwned,
      longestRelationship: { ...game.legacy.longestRelationship },
      epitaph: ''
    };
    game.deathInfo.epitaph = Death.epitaph(game, game.deathInfo);

    game.log(`You died at ${game.age} of ${cause}.`, 'death');
    return game.deathInfo;
  },

  epitaph(game, d) {
    if (d.jailYears > 10) return 'Spent more years inside than some people work.';
    if (d.crimes >= 10) return 'Everyone in the county knew the name.';
    if (d.peakNetWorth > 5000000) return 'Left more behind than anyone expected.';
    if (d.fame > 80) return 'A face everybody recognized, gone.';
    if (d.children >= 4) return 'Never short of hands to hold.';
    if (d.longestRelationship.years > 30) return `Loved ${d.longestRelationship.name} for ${d.longestRelationship.years} years.`;
    if (game.stats.happiness > 80) return 'Died happy, which is harder than it sounds.';
    if (game.education.level === 'grad') return 'Studied past the point of sense and never regretted it.';
    return 'A life, and then nothing much.';
  }
});