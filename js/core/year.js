/*
 * The age-up pipeline.
 *
 * One press of "Age" runs every subsystem in a fixed order and returns an
 * Encounter (a pending event with choices) or null when nothing was eligible,
 * in which case a quiet-year line is used so the game can never dead-end.
 *
 * Order matters and is fixed:
 *   1. advance the clock and everyone in it
 *   2. money: work, then upkeep
 *   3. health
 *   4. education
 *   5. assets
 *   6. relationships
 *   7. crime cooling
 *   8. prison (replaces 2-6 entirely while jailed)
 *   9. roll an event
 *  10. mortality
 */
const Year = Object.freeze({
  tick(game) {
    if (!game.alive) return null;

    game.age++;
    game.year++;

    // Jailed players skip the ordinary life entirely.
    if (game.jailed) return Year.tickPrisonYear(game);

    const notes = [];

    // 1. Everyone ages. NPCs can die and news is surfaced.
    notes.push(...Year.push(Relationships.tickYear(game)));

    // 2. Money in, then money out.
    if (game.job) {
      const workNotes = Career.workYear(game);
      if (workNotes) notes.push(...workNotes);
    }
    notes.push(...Year.push(Portfolio.tickYear(game)));

    // 3. Health.
    const condition = Health.tickYear(game);
    if (condition) notes.push(`You were diagnosed with ${condition.name.toLowerCase()}.`);

    // 4. Education.
    if (game.education.yearsLeft > 0) {
      const grad = Education.advanceYear(game);
      if (grad) notes.push(grad.text);
    }

    // 5. Personal stat drift.
    Year.driftStats(game);

    // 6. Crime cools off.
    Crime.tickYear(game);

    // 7. Mortality.
    if (Death.check(game)) return null;

    // 8. An event, or a quiet year.
    const encounter = EventEngine.roll(game, Year.poolFor(game));
    Activities.clearFlags(game);
    if (encounter) return encounter;

    game.log(Year.quiet(game), 'life');
    return null;
  },

  /* Only prison-specific events run while incarcerated. */
  tickPrisonYear(game) {
    game.age++;
    game.year++;

    const notes = Year.push(Prison.serveYear(game));

    for (const person of game.people) {
      if (!person.isDead && person.relationship > 5) {
        person.relationship = Math.max(0, person.relationship - game.rng.int(1, 4));
      }
      person.age++;
    }

    if (Death.check(game)) return null;

    const encounter = EventEngine.roll(game, EventEngine.prisonPool());
    Activities.clearFlags(game);
    if (encounter) return encounter;

    game.log(Year.prisonQuiet(game), 'life');
    return null;
  },

  /* Collect whatever a subsystem returned without the caller doing it. */
  push(result) {
    if (!result) return [];
    return Array.isArray(result) ? result.filter(Boolean) : [result.text ?? String(result)];
  },

  /*
   * Age/seasonal movement of the non-health stats.
   */
  driftStats(game) {
    const a = game.age;

    // Smarts climb through the twenties then soften in old age.
    if (a < 25) game.stat('smarts', game.rng.int(0, 2));
    else if (a < 40) game.stat('smarts', game.rng.int(-1, 1));
    else if (a > 70) game.stat('smarts', -game.rng.int(0, 1));

    // Looks peak around 25 and decline after.
    if (a < 25) game.stat('looks', game.rng.int(0, 1));
    else if (a > 30) game.stat('looks', a > 60 ? -game.rng.int(1, 3) : -game.rng.int(0, 1));

    // Fitness fades unless it is being maintained.
    if (game.flags['activity:a_gym']) game.stat('fitness', game.rng.int(1, 3));
    else game.stat('fitness', -game.rng.int(0, 2));

    // Happiness drifts back toward a baseline.
    const baseline = 45 + (game.job ? 8 : -5) + (game.maritalStatus === 'married' ? 7 : 0);
    const pull = (baseline - game.stats.happiness) * 0.08;
    game.stat('happiness', pull);

    // Fame decays without anything sustaining it.
    if (game.stats.fame > 0 && a > 35) game.stat('fame', -game.rng.int(0, 1));
  },

  /* Prison-specific events, used while the player is incarcerated. */
  poolFor(game) {
    return EventEngine.all();
  },

  quiet(game) {
    if (game.job) {
      return game.rng.pick([
        `Another year at ${game.job.company}. You kept your head down and got through it.`,
        'Work was the same as always. You turned up, did the hours, went home.',
        'A quiet year. The job paid, and that was most of the appeal.'
      ]);
    }
    if (game.education.yearsLeft > 0) {
      return 'Another year of school. You showed up and mostly listened.';
    }
    return EventEngine.quiet(game);
  },

  prisonQuiet(game) {
    return game.rng.pick([
      'Another year inside. You kept your head down.',
      'The days blurred into each other.',
      'You spent the year counting days that did not feel like they were moving.',
      'Nothing happened, which in prison counts as a good year.'
    ]);
  }
});