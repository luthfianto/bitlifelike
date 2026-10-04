/*
 * Crime.
 *
 * Every attempt pays out first, then rolls against the risk of being noticed.
 * A bust is decided here; the sentence itself is handed to Prison.
 */
const Crime = Object.freeze({
  /*
   * Attempt a crime. Returns:
   *   { ok, caught, text, money, jailYears, killed }
   */
  commit(game, crimeId) {
    const crime = Crimes.byId(crimeId);
    if (!crime) return { ok: false, caught: false, text: 'That is not a crime.' };
    if (game.age < crime.minAge) return { ok: false, caught: false, text: `You are too young for that.` };
    if (game.jailed) return { ok: false, caught: false, text: 'You are already in prison.' };

    const notes = [];

    // The take happens regardless of whether anyone notices.
    if (!crime.kills) {
      const take = game.rng.int(crime.payout[0], crime.payout[1]);
      if (take > 0) {
        game.addMoney(take);
        notes.push(`You made off with ${Format.money(take)}.`);
      }
    }

    game.crimesCommitted++;
    game.legacy.crimesCommitted++;
    game.setStat('happiness', game.rng.int(-3, 3));

    // Higher risk when you are already known to the police.
    const heat = 1 + game.criminalRecord / 60;
    const effectiveRisk = Math.min(95, crime.risk * heat);

    if (!game.rng.chance(effectiveRisk)) {
      game.criminalRecord = Format.clamp(game.criminalRecord + Math.round(crime.record * 0.4), 0, 100);
      game.log(`You got away with ${crime.name.toLowerCase()}. Nobody noticed.`, 'crime');
      return { ok: true, caught: false, text: `${notes.join(' ')} You got away with it.`, money: 0 };
    }

    // Caught.
    game.criminalRecord = Format.clamp(game.criminalRecord + crime.record, 0, 100);
    game.legacy.arrests++;
    game.log(`You were arrested for ${crime.name.toLowerCase()}.`, 'crime');

    // Violent crimes done in the open can end at the scene.
    if (crime.kills && game.rng.chance(12)) {
      return { ok: true, caught: true, killed: true, text: `${notes.join(' ')} The witnesses described you. By the time the police arrived, you were bleeding out.` };
    }

    const years = game.rng.int(crime.jailMin, crime.jailMax);
    Prison.send(game, crime.name, years);

    return {
      ok: true,
      caught: true,
      jailYears: years,
      text: `${notes.join(' ')} You were caught. The sentence is ${years} ${years === 1 ? 'year' : 'years'}.`
    };
  },

  /* Being a model citizen slowly rubs the record down, but never to zero. */
  coolRecord(game) {
    if (game.criminalRecord <= 0 || game.jailed) return;

    // Time served counts for a lot.
    let drop = game.rng.int(0, 2);
    if (game.job && game.job.yearsInRole >= 3) drop += 2;
    if (game.age >= 60) drop += 1;
    if (game.stats.addiction > 60) drop -= 1;

    game.criminalRecord = Format.clamp(game.criminalRecord - drop, 0, 100);
  },

  tickYear(game) {
    Crime.coolRecord(game);
  }
});