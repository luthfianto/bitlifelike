/*
 * Prison.
 *
 * While jailed the player skips career and normal events entirely; Year.tick
 * routes to Prison.serveYear instead. Relations decay faster, assets get
 * repossessed, and the gym builds a stat that matters only in here.
 */
const Prison = Object.freeze({
  /* Everything of value gets taken while you are inside. */
  confiscate(game) {
    const lost = game.assets.filter((a) => a.type !== 'p');
    if (!lost.length) return null;

    let total = 0;
    for (const asset of lost) total += asset.equity;
    game.assets = game.assets.filter((a) => a.type === 'p');
    game.money = Math.max(0, Math.round(game.money * 0.4));
    return { kind: 'confiscated', text: `While you were inside, your property was seized. ${Format.money(total)} gone.` };
  },

  send(game, reason, years) {
    game.jailYears = Math.max(1, years);
    game.jailReason = reason;
    game.job = null;
    game.sentences.push(game.jailYears);

    const lost = Prison.confiscate(game);
    game.setStat('happiness', -20);
    game.log(`You were sentenced to ${game.jailYears} years for ${reason.toLowerCase()}.`, 'crime');
    if (lost) game.log(lost.text, 'crime');

    return lost;
  },

  /* Parole opens up once half of the original sentence has been served. */
  paroleEligible(game) {
    const sentence = game.sentences.at(-1) ?? game.jailYears;
    return game.jailYears > 0 && game.jailYears <= Math.ceil(sentence / 2);
  },

  serveYear(game) {
    const notes = [];
    const original = game.sentences.at(-1) ?? game.jailYears;

    // The gym is the only thing that goes your way in here.
    if (game.rng.chance(35)) game.stat('prisonFitness', game.rng.int(1, 3));
    game.stat('happiness', game.rng.int(-4, -1));

    for (const person of game.people) {
      if (!person.isDead && person.relationship > 5) {
        person.relationship = Math.max(0, person.relationship - game.rng.int(2, 6));
      }
    }

    for (const pet of game.pets()) {
      game.addMoney(-pet.upkeep);
      const note = pet.tickYear(game.rng);
      if (note) notes.push(note.text);
    }

    // A clean record inside earns a slightly better shot at parole.
    if (Prison.paroleEligible(game)) {
      const goodBehavior = 20 + game.stats.prisonFitness * 0.2;
      if (game.rng.chance(goodBehavior)) {
        Prison.release(game, true);
        notes.push('The parole board let you out early.');
        return notes;
      }
    }

    game.jailYears--;
    game.legacy.jailYears++;

    if (game.jailYears <= 0) {
      Prison.release(game, false, original);
      notes.push('You walked out of prison a free man.');
    }

    return notes;
  },

  /* Escapes are rare, usually punished, and permanently on your record. */
  tryEscape(game) {
    if (!game.jailed) return { ok: false, text: 'You are not in prison.' };

    game.escapeAttempts++;
    game.legacy.escapes++;
    game.criminalRecord = Format.clamp(game.criminalRecord + 10, 0, 100);
    game.setStat('happiness', -5);

    const odds = 3 + game.stats.prisonFitness * 0.08;
    if (game.rng.chance(odds)) {
      Prison.release(game, true);
      return { ok: true, text: 'You climbed the fence in the dark and kept going. Nobody caught you.' };
    }

    const extra = game.rng.int(1, 3);
    game.jailYears += extra;
    game.setStat('happiness', -8);
    return { ok: false, text: `You were caught trying to escape. ${extra} more ${extra === 1 ? 'year' : 'years'} were added.` };
  },

  release(game, early, originalSentence) {
    const served = game.jailYears;
    game.jailYears = 0;
    game.jailReason = '';
    game.sentences = [];
    game.setStat('happiness', early ? 12 : 18);
    game.log(
      early
        ? `Released on parole after ${served} years.`
        : `You served your full sentence of ${originalSentence ?? served} years.`,
      'crime'
    );
  }
});