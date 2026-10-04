/*
 * Reusable predicates and copy fragments for event content.
 *
 * Event files are plain data, so these small helpers keep the requirement
 * checks readable and consistent instead of being re-typed 250 times.
 */

/* Choice-level gates, written as strings so the UI can show the reason. */
const Needs = Object.freeze({
  JOB: 'You need a job for that.',
  NO_JOB: 'You are already employed.',
  SCHOOL: 'You need to be in school for that.',
  NOT_SCHOOL: 'You are not in school.',
  DEGREE: 'You need a degree for that.',
  MONEY: (n) => `That costs ${Format.money(n)}.`,
  FRIEND: 'You do not have anyone to do that with.',
  PARTNER: 'You are not with anyone.',
  MARRIED: 'You need to be married first.',
  NOT_MARRIED: 'You are not married.',
  SINGLE: 'You are already with someone.',
  ADULT: 'You are too young for that.',
  HOUSE: 'You do not own a home.',
  CAR: 'You do not own a car.',
  PET: 'You do not have any pets.',
  HEALTH: 'You are not healthy enough for that.',
  FIT: 'You need to be fitter for that.',
  SMARTS: 'You are not smart enough for that.',
  NOT_JAILED: 'You are in prison.'
});

/* Common requirement predicates. */
const Can = Object.freeze({
  job: (game) => !!game.job,
  noJob: (game) => !game.job,
  student: (game) => game.education.yearsLeft > 0,
  notStudent: (game) => game.education.yearsLeft === 0,
  employed: (game) => game.job && game.job.yearsInRole >= 1,
  single: (game) => game.maritalStatus === 'single',
  partnered: (game) => game.maritalStatus === 'dating' || game.maritalStatus === 'engaged',
  married: (game) => game.maritalStatus === 'married',
  parent: (game) => game.children().length > 0,
  hasHouse: (game) => game.hasHouse(),
  hasCar: (game) => game.assetsOf('c').length > 0,
  hasPet: (game) => game.pets().length > 0,
  clean: (game) => game.criminalRecord < 20,
  notJailed: (game) => !game.jailed
});

/* Picks the player's partner or first friend, for events that need "someone". */
function someone(game, type = 'friend') {
  return game.partner() ?? game.peopleOf(type)[0] ?? null;
}

/* Random money in a range, rounded to something a person would say. */
function cash(game, lo, hi) {
  return Math.round(game.rng.int(lo, hi) / 50) * 50;
}