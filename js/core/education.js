/*
 * Education progression.
 *
 * Each level is a fixed run of years. Smarts drive the GPA, the GPA drives
 * graduation, and the degree you finish with gates which careers you can enter.
 */
const Education = Object.freeze({
  /* How many years each level takes. */
  YEARS: Object.freeze({
    'elementary': 6,
    'middle': 3,
    'high_school': 4,
    'university': 4,
    'grad': 2
  }),

  schoolName(game, level) {
    const city = game.birthCity;
    switch (level) {
      case 'elementary': return `${city} Elementary School`;
      case 'middle': return `${city} Middle School`;
      case 'high_school': return `${city} High School`;
      case 'university': return `${city} State University`;
      case 'grad': return `${city} State University — Graduate Division`;
      default: return 'Nowhere';
    }
  },

  startingAge: Object.freeze({
    'elementary': 6,
    'middle': 12,
    'high_school': 15,
    'university': 18,
    'grad': 22
  }),

  nextLevel(level) {
    const order = ['none', 'elementary', 'middle', 'high_school', 'university', 'grad'];
    return order[order.indexOf(level) + 1] ?? null;
  },

  canEnroll(game, level) {
    const minAge = Education.startingAge[level];
    if (minAge == null) return 'That is not a real school.';
    if (game.age < minAge) return `You have to be ${minAge} to start ${Careers.EDU_LABEL[level].toLowerCase()}.`;
    const prev = { elementary: 'none', middle: 'elementary', high_school: 'middle', university: 'high_school', grad: 'university' }[level];
    if ((Careers.EDU_ORDER[game.education.level] ?? 0) < Careers.EDU_ORDER[prev]) {
      return 'You have to finish the level before this one first.';
    }
    return null;
  },

  enroll(game, level, degree = null) {
    const block = Education.canEnroll(game, level);
    if (block) return { ok: false, text: block };

    const years = Education.YEARS[level];
    game.education.level = level;
    game.education.degree = degree;
    game.education.yearsLeft = years;
    game.education.schoolName = Education.schoolName(game, level);
    game.education.gpa = 0;

    const name = game.education.schoolName;
    game.log(`You enrolled at ${name}.`, 'school');
    return { ok: true, text: `You enrolled at ${name}. ${years} years to go.` };
  },

  /* Tuition is charged up front, scaled by how expensive the school is. */
  tuition(game) {
    const level = game.education.level;
    const base = { elementary: 0, middle: 0, high_school: 600, university: 14000, grad: 22000 }[level] ?? 0;
    return Math.round(base * Cities.costMultiplier(game.birthCity) * (1 + (100 - game.stats.smarts) / 200));
  },

  /* One year of school. Returns a note when something notable happened. */
  advanceYear(game) {
    if (game.education.yearsLeft <= 0) return null;

    // GPA creeps toward what the student's smarts can sustain.
    const ceiling = 2.4 + (game.stats.smarts / 100) * 1.4;
    game.education.gpa = Format.clamp(game.education.gpa * 0.7 + ceiling * 0.3, 0, 4);

    game.education.yearsLeft--;
    if (game.education.gpa >= 3) game.stat('smarts', 2);

    if (game.education.yearsLeft > 0) return null;

    const level = game.education.level;
    const gpa = game.education.gpa;
    game.education.yearsLeft = 0;
    game.education.schoolName = '';

    const label = Careers.EDU_LABEL[level];
    game.log(`You graduated from ${label} with a ${gpa.toFixed(2)} GPA.`, 'school');

    if (level === 'high_school' && gpa < 1.5) {
      game.setStat('happiness', game.rng.int(-14, -4));
      return { kind: 'graduation', text: `You graduated high school with a ${gpa.toFixed(2)} GPA. Nobody wrote you a note.` };
    }

    if (gpa >= 3.5) game.stat('happiness', 8);
    else if (gpa < 2) game.stat('happiness', -4);

    const degreeNote = level === 'university' && game.education.degree
      ? ` You graduated with a degree in ${Careers.degreeName(game.education.degree)}.`
      : '';

    return { kind: 'graduation', text: `You graduated ${label.toLowerCase()} with a ${gpa.toFixed(2)} GPA.${degreeNote}` };
  }
});