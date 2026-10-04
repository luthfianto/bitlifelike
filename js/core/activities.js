/*
 * Activities: one-off purchases from the Activities screen.
 *
 * Effects apply immediately. Anything ongoing also sets a flag under
 * "activity:<id>" which Year.tick clears when the year rolls over, so a gym
 * membership buys you twelve months and not a permanent stat.
 */
const Activities = Object.freeze({
  clearFlags(game) {
    for (const key of Object.keys(game.flags)) {
      if (key.startsWith('activity:')) delete game.flags[key];
    }
  },

  run(game, id) {
    const act = Catalog.activityById(id);
    if (!act) return { ok: false, text: 'Unknown activity.' };
    if (!game.spend(act.cost)) {
      return { ok: false, text: `${act.name} costs ${Format.money(act.cost)}.` };
    }

    const r = game.rng;
    const mark = () => game.flags[`activity:${id}`] = true;

    switch (id) {
      case 'a_gym':
        game.stat('fitness', r.int(6, 14));
        game.stat('health', r.int(1, 5));
        mark();
        game.log('You signed up at a gym and actually went.', 'health');
        return { ok: true, text: `You joined a gym. Fitness is now ${Math.round(game.stats.fitness)}.` };

      case 'a_library':
        game.stat('smarts', r.int(5, 12));
        game.stat('happiness', 2);
        mark();
        return { ok: true, text: `You spent a year in the library. Smarts are now ${Math.round(game.stats.smarts)}.` };

      case 'a_meditate':
        game.stat('happiness', r.int(8, 16));
        game.setStat('addiction', game.stats.addiction - r.int(5, 15));
        mark();
        return { ok: true, text: 'Two weeks of silence did more than two years of complaining.' };

      case 'a_course':
        game.stat('smarts', r.int(6, 14));
        if (game.job) game.job.performance = Format.clamp(game.job.performance + r.int(3, 10), 0, 100);
        return { ok: true, text: 'You took a night course and it showed at work.' };

      case 'a_therapist': {
        const before = game.stats.addiction;
        game.stat('addiction', -r.int(8, 20));
        game.stat('happiness', r.int(5, 12));
        game.setStat('health', game.stats.health + r.int(0, 4));
        mark();
        return {
          ok: true,
          text: before > 0
            ? `Therapy is working. Addiction is down to ${Math.round(game.stats.addiction)}.`
            : 'A year of therapy. You feel steadier than you have in years.'
        };
      }

      case 'a_dentist':
        game.stat('health', r.int(2, 6));
        return { ok: true, text: 'Your teeth stopped being a problem.' };

      case 'a_checkup': {
        if (game.conditions.length) {
          const found = r.pick(game.conditions);
          game.flags[`diagnosed:${found}`] = true;
          return { ok: true, text: `The doctor confirmed what you already suspected: ${found.replace('c_', '')}.` };
        }
        const cond = Health.rollCondition(game);
        return {
          ok: true,
          text: cond
            ? `Early diagnosis: ${cond.name.toLowerCase()}. That is worth knowing now.`
            : 'A clean bill of health.'
        };
      }

      case 'a_casino': {
        const stake = Math.min(game.money, act.cost * 4);
        const won = r.chance(38);
        const haul = won ? Math.round(stake * r.range(1.5, 6)) : -stake;
        game.addMoney(haul);
        game.setStat('addiction', game.stats.addiction + r.int(4, 14));
        game.stat('happiness', won ? 8 : -8);
        return {
          ok: true,
          text: won
            ? `You walked out up ${Format.money(haul)}. The pit kept taking notes.`
            : `You lost ${Format.money(stake)} before the sun came up.`
        };
      }

      case 'a_race': {
        const car = game.assetsOf('c')[0];
        if (!car) return { ok: false, text: 'You do not own a car to race.' };
        const won = r.chance(30);
        const purse = Math.round(act.cost * r.range(1.5, 5));
        game.addMoney(won ? purse : -Math.round(act.cost / 2));
        game.stat('fitness', -r.int(1, 4));
        game.stat('happiness', won ? 10 : -6);
        game.stat('fame', won ? r.int(2, 8) : 0);
        return {
          ok: true,
          text: won
            ? `You won the race and ${Format.money(purse)}. Word gets around.`
            : 'You lost the race and a bit of the car.'
        };
      }

      case 'a_lottery': {
        const roll = r.float();
        if (roll > 0.999) {
          game.addMoney(5000000);
          game.stat('happiness', 30);
          game.stat('fame', 5);
          return { ok: true, text: 'You won. You actually won. It is not a typo.' };
        }
        if (roll > 0.99) {
          game.addMoney(50000);
          game.stat('happiness', 15);
          return { ok: true, text: 'A five-figure scratcher.' };
        }
        if (roll > 0.9) {
          game.addMoney(500);
          return { ok: true, text: 'Enough for dinner and the parking.' };
        }
        game.stat('happiness', -3);
        return { ok: true, text: 'Blank. The whole stack of them.' };
      }

      case 'a_crypto': {
        const multiplier = r.chance(20) ? r.range(2, 12) : r.range(0.05, 0.95);
        const result = Math.round(act.cost * multiplier);
        game.addMoney(result - act.cost);
        game.setStat('addiction', game.stats.addiction + r.int(2, 10));
        game.stat('happiness', result > act.cost ? 12 : -10);
        return {
          ok: true,
          text: multiplier >= 1
            ? `You rode it up. ${Format.money(result - act.cost)} profit.`
            : `It went to zero fast. ${Format.money(act.cost - result)} gone.`
        };
      }

      case 'a_stocks': {
        const multiplier = r.chance(45) ? r.range(1.05, 1.6) : r.range(0.65, 0.98);
        const result = Math.round(act.cost * multiplier);
        game.addMoney(result - act.cost);
        game.stat('happiness', multiplier >= 1 ? 6 : -5);
        return {
          ok: true,
          text: multiplier >= 1
            ? `A decent year in the market. Up ${Format.money(result - act.cost)}.`
            : `A flat year, minus fees. Down ${Format.money(act.cost - result)}.`
        };
      }

      case 'a_give': {
        const family = game.parents().filter((p) => !p.isDead);
        if (!family.length) return { ok: false, text: 'You have no family left to help.' };
        const target = r.pick(family);
        game.rel(target, r.int(15, 30));
        game.stat('happiness', r.int(6, 14));
        return { ok: true, text: `You covered ${target.firstName}'s bills. They will not forget it.` };
      }

      case 'a_charity':
        game.stat('fame', r.int(4, 12));
        game.stat('happiness', r.int(3, 8));
        game.addMoney(r.int(500, 3000) - act.cost / 2);
        return { ok: true, text: 'Your name is on a wall somewhere, at a size you can live with.' };

      case 'a_vacation':
        game.stat('happiness', r.int(8, 16));
        game.stat('health', r.int(1, 4));
        return { ok: true, text: 'Two weeks of doing absolutely nothing.' };

      case 'a_spa':
        game.stat('looks', r.int(4, 10));
        game.stat('happiness', r.int(2, 6));
        return { ok: true, text: 'You feel several years younger and look slightly less ridiculous.' };

      case 'a_bar': {
        const bender = r.chance(55);
        game.stat('happiness', bender ? r.int(3, 10) : -r.int(2, 8));
        game.stat('health', -r.int(0, 4));
        game.setStat('addiction', game.stats.addiction + r.int(3, 12));
        return {
          ok: true,
          text: bender ? 'A good night out.' : 'A long night you will not be telling anyone about.'
        };
      }

      default:
        game.stat('happiness', 3);
        return { ok: true, text: 'You did the thing.' };
    }
  }
});