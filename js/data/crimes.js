/*
 * Crime catalog.
 *
 *   risk         percent chance each attempt is noticed
 *   record       criminal-record points added on a successful job
 *   jailMin/Max  sentence range if caught
 *   payout       take before any risk applies
 *   minAge       youngest age you can attempt it
 *   kills        true for offences that end a life
 */
class Crimes {
  static ALL = Object.freeze([
    {
      id: 'c_shoplift', name: 'Shoplift', emoji: '🛍️', risk: 35, record: 6,
      jailMin: 1, jailMax: 2, payout: [40, 300], minAge: 10,
      blurb: 'Walk out with something you did not pay for.'
    },
    {
      id: 'c_pickpocket', name: 'Pickpocket', emoji: '👝', risk: 45, record: 9,
      jailMin: 1, jailMax: 3, payout: [60, 500], minAge: 12,
      blurb: 'A crowded train and a loose wallet.'
    },
    {
      id: 'c_burglary', name: 'Burgle a House', emoji: '🏚️', risk: 48, record: 14,
      jailMin: 2, jailMax: 5, payout: [400, 9000], minAge: 16,
      blurb: 'Break in while the family is away.'
    },
    {
      id: 'c_cartheft', name: 'Steal a Car', emoji: '🚗', risk: 52, record: 17,
      jailMin: 2, jailMax: 6, payout: [800, 14000], minAge: 16,
      blurb: 'Hotwire something worth more than your rent.'
    },
    {
      id: 'c_mugging', name: 'Mug Someone', emoji: '🥊', risk: 42, record: 20,
      jailMin: 2, jailMax: 7, payout: [50, 1200], minAge: 14,
      blurb: 'Strong arm on a stranger.'
    },
    {
      id: 'c_drugs', name: 'Deal Drugs', emoji: '💊', risk: 38, record: 22,
      jailMin: 3, jailMax: 8, payout: [800, 16000], minAge: 15,
      blurb: 'Move product for a local crew.'
    },
    {
      id: 'c_fraud', name: 'Commit Fraud', emoji: '📄', risk: 30, record: 24,
      jailMin: 3, jailMax: 10, payout: [5000, 90000], minAge: 18,
      blurb: 'Forged documents and a fake identity.'
    },
    {
      id: 'c_hacking', name: 'Hack a Bank', emoji: '💻', risk: 40, record: 28,
      jailMin: 4, jailMax: 12, payout: [15000, 300000], minAge: 16,
      blurb: 'Somebody left a port open.'
    },
    {
      id: 'c_armed', name: 'Armed Robbery', emoji: '🔫', risk: 55, record: 38,
      jailMin: 5, jailMax: 15, payout: [1200, 45000], minAge: 16,
      blurb: 'A gun makes people behave.'
    },
    {
      id: 'c_arson', name: 'Commit Arson', emoji: '🔥', risk: 46, record: 45,
      jailMin: 6, jailMax: 20, payout: [0, 3000], minAge: 18,
      blurb: 'Property damage, and people inside.'
    },
    {
      id: 'c_extort', name: 'Extort a Business', emoji: '📞', risk: 42, record: 44,
      jailMin: 5, jailMax: 18, payout: [4000, 70000], minAge: 18,
      blurb: 'Make protection worth paying for.'
    },
    {
      id: 'c_hitman', name: 'Work as a Hitman', emoji: '🎯', risk: 50, record: 62,
      jailMin: 10, jailMax: 30, payout: [8000, 120000], minAge: 18,
      blurb: 'Someone has to do it. Might as well be you.'
    },
    {
      id: 'c_organize', name: 'Organized Crime', emoji: '🕴️', risk: 44, record: 72,
      jailMin: 12, jailMax: 35, payout: [40000, 600000], minAge: 21,
      blurb: 'Run the whole operation.'
    },
    {
      id: 'c_murder', name: 'Commit Murder', emoji: '🩸', risk: 50, record: 100,
      jailMin: 18, jailMax: 45, payout: [0, 0], minAge: 14, kills: true,
      blurb: 'The last step. There is no coming back.'
    }
  ]);

  static #index = null;

  static byId(id) {
    Crimes.#index ??= new Map(Crimes.ALL.map((c) => [c.id, c]));
    return Crimes.#index.get(id) ?? null;
  }

  /* Crimes the player could plausibly attempt at their age right now. */
  static availableFor(game) {
    return Crimes.ALL.filter(
      (c) =>
        game.age >= c.minAge &&
        !game.jailed &&
        (c.id !== 'c_organize' || game.criminalRecord >= 30) &&
        (c.id !== 'c_hitman' || game.criminalRecord >= 15)
    );
  }
}