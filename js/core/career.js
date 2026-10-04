/*
 * Career system.
 *
 * A plain frozen namespace of functions taking `game` — no instance state,
 * so nothing needs lazy wiring and there is no circular construction between
 * this and GameState.
 *
 * The player's `job` is a plain object:
 *   { id, title, emoji, field, tier, salary, company, yearsInRole, performance }
 * `field` is the promotion spine: moving up means the tier+1 rung in the same field.
 */
const Career = Object.freeze({
  /* Salary band from the catalog, scaled by where the player lives. */
  rollSalary(game, job) {
    const [lo, hi] = job.pay;
    return Math.round(game.rng.int(lo, hi) * Cities.costMultiplier(game.birthCity));
  },

  randomCompany(game) {
    const suffixes = ['Inc', 'LLC', 'Group', 'Partners', 'Corp', 'Holdings', 'Co'];
    const stems = ['Benson', 'Ardent', 'Northwind', 'Halcyon', 'Rivet', 'Cobalt', 'Pine', 'Vantage', 'Orchid', 'Quarry', 'Sterling', 'Kestrel'];
    return `${game.rng.pick(stems)} ${game.rng.pick(suffixes)}`;
  },

  /* Criminal record expectations tighten with seniority. */
  eligible(game, job) {
    const rank = Careers.EDU_ORDER[game.education.level] ?? 0;
    if (rank < Careers.EDU_ORDER[job.edu]) return 'You need more education for this.';
    if (job.degree && game.education.degree !== job.degree) {
      return `This needs a ${Careers.degreeName(job.degree)} degree.`;
    }
    if (game.criminalRecord > Careers.recordCeilingFor(job)) {
      return 'Your criminal record is too long for this job.';
    }
    if (game.jailed) return 'You are in prison.';
    return null;
  },

  canApply(game, job) {
    return Career.eligible(game, job) === null;
  },

  /* Entry-level jobs this player's education actually qualifies for. */
  openJobs(game) {
    return Careers.entryJobs(game.education).filter((j) => Career.canApply(game, j));
  },

  generateOffers(game) {
    const pool = Career.openJobs(game);
    if (!pool.length) return [];
    return game.rng.sample(pool, Math.min(3, pool.length)).map((job) => ({
      job,
      salary: Career.rollSalary(game, job),
      company: Career.randomCompany(game)
    }));
  },

  accept(game, offer) {
    const { job, salary, company } = offer;
    if (Career.eligible(game, job)) return { ok: false, text: 'You no longer qualify for that job.' };

    game.job = {
      id: job.id,
      title: job.title,
      emoji: job.emoji,
      field: job.field,
      tier: job.tier,
      salary,
      company,
      yearsInRole: 0,
      performance: game.rng.int(45, 70)
    };
    game.legacy.jobsHeld.push({ title: job.title, company });
    game.log(`You were hired as a ${job.title} at ${company}, earning ${Format.money(salary)} a year.`, 'career');
    return { ok: true, text: `You started work as a ${job.title} at ${company}.` };
  },

  quit(game, reason = 'You quit your job.') {
    if (!game.job) return false;
    game.log(`${reason} You left ${game.job.company} as a ${game.job.title}.`, 'career');
    game.job = null;
    return true;
  },

  /* Next rung up the ladder in this field, if the player clears the gates. */
  nextRung(game) {
    if (!game.job) return null;
    const current = Careers.byId(game.job.id);
    if (!current || current.tier >= 5) return null;
    return Careers.inField(game.job.field).find((j) => j.tier === current.tier + 1) ?? null;
  },

  attemptPromotion(game) {
    const next = Career.nextRung(game);
    if (!next) return { ok: false, text: 'There is nowhere higher to go in this field.' };

    if (game.job.yearsInRole < 2) return { ok: false, text: 'You have not held this role long enough.' };
    if (game.job.performance < 60) return { ok: false, text: 'Your performance reviews are not good enough.' };

    const block = Career.eligible(game, next);
    if (block) return { ok: false, text: block };

    const raised = Math.round(Career.rollSalary(game, next) * 1.1);
    const title = next.title;
    game.job = {
      ...game.job,
      id: next.id,
      title,
      emoji: next.emoji,
      tier: next.tier,
      salary: raised,
      yearsInRole: 0,
      performance: game.rng.int(55, 75)
    };
    game.legacy.promotions++;
    game.legacy.peakSalary = Math.max(game.legacy.peakSalary, raised);
    game.log(`You were promoted to ${title}, now earning ${Format.money(raised)}.`, 'career');
    return { ok: true, text: `You were promoted to ${title} at ${Format.money(raised)} a year.` };
  },

  /* One year of pay, performance drift, and the occasional raise or exit. */
  workYear(game) {
    if (!game.job) return null;

    game.job.yearsInRole++;
    game.legacy.yearsWorked++;

    let pay = Math.round(game.job.salary * (1 + game.job.performance / 500));
    // Addiction costs you a slice of every paycheck.
    if (game.stats.addiction > 40) pay = Math.round(pay * 0.9);
    game.addMoney(pay);

    const notes = [];

    // Performance drifts toward whatever the worker is like.
    const pull = game.stats.happiness * 0.35 + game.stats.health * 0.35 + game.rng.range(-14, 14);
    game.job.performance = Format.clamp(
      game.job.performance * 0.6 + pull * 0.4,
      0,
      100
    );

    if (game.job.performance > 75 && game.job.yearsInRole >= 2 && game.rng.chance(0.25)) {
      const raise = Math.round(game.job.salary * game.rng.range(0.04, 0.11));
      game.job.salary += raise;
      game.legacy.peakSalary = Math.max(game.legacy.peakSalary, game.job.salary);
      notes.push(`You got a ${Math.round((raise / (game.job.salary - raise)) * 100)}% raise.`);
    }

    if (game.job.performance < 25 && game.rng.chance(0.35)) {
      Career.fire(game, 'You were fired for poor performance.');
      return notes;
    }

    // Note the peak before any exit: fire() clears game.job.
    game.legacy.peakSalary = Math.max(game.legacy.peakSalary, game.job.salary);

    if (game.rng.chance(0.03)) {
      Career.fire(game, 'Your position was eliminated in a layoff.');
    }

    return notes;
  },

  fire(game, reason = 'You were fired.') {
    if (!game.job) return;
    game.log(`${reason} You are now unemployed.`, 'career');
    game.legacy.firings++;
    game.job = null;
    game.setStat('happiness', game.rng.int(-12, -3));
  },

  /* Pension income after the working years are done. */
  retire(game) {
    if (!game.job) return { ok: false, text: 'You do not have a job to retire from.' };
    const pension = Math.round(game.job.salary * 0.4);
    game.job = {
      ...game.job,
      id: 'retired',
      title: 'Retired',
      emoji: '🛌',
      salary: pension,
      yearsInRole: 0,
      performance: 100
    };
    game.log(`You retired with a pension of ${Format.money(pension)} a year.`, 'career');
    return { ok: true, text: `You retired. Your pension pays ${Format.money(pension)} a year.` };
  }
});