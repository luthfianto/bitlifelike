/*
 * Relationships: meeting people, drifting, romance, marriage and children.
 *
 * Relationship score is 0-100 and drifts downward each year the player does
 * not interact with someone, so neglect is a real cost.
 */
const Relationships = Object.freeze({
  JOBS: Object.freeze([
    'Teacher', 'Nurse', 'Driver', 'Farmer', 'Clerk', 'Engineer', 'Waitress',
    'Mechanic', 'Accountant', 'Paramedic', 'Chef', 'Designer', 'Plumber',
    'Electrician', 'Cashier', 'Photographer', 'Carpenter', 'Pharmacist'
  ]),

  /* Someone the player's age, to fill the friend graph. */
  meetFriend(game, type = 'friend') {
    const gender = game.rng.pick(['male', 'female']);
    const ageGap = game.age < 12 ? game.rng.int(-3, 3) : game.rng.int(-4, 4);
    const p = game.addPerson({
      firstName: Names.firstName(game.rng, gender),
      lastName: game.rng.chance(0.55) ? game.lastName : Names.lastName(game.rng),
      gender,
      type,
      age: Math.max(1, game.age + ageGap),
      relationship: game.rng.int(30, 55),
      happiness: game.rng.int(40, 80),
      job: game.age >= 18 ? game.rng.pick(Relationships.JOBS) : null,
      netWorth: game.age >= 18 ? game.rng.int(0, 30000) : 0
    });
    game.log(`You met ${p.firstName} ${p.lastName}.`, 'social');
    return p;
  },

  /* Age everyone, bury the dead, and move children's type up when they grow. */
  ageYear(game) {
    const news = [];

    for (const p of game.people) {
      p.ageYear(game.rng);

      if (p.isDead) continue;

      if (p.type === 'child' && p.age >= 18 && !p.job) {
        p.job = game.rng.pick(Relationships.JOBS);
      }

      // Adults accrue wealth and their own drama.
      if (p.age >= 22 && !p.isJailed && game.rng.chance(0.3)) {
        p.netWorth = Math.max(0, Math.round(p.netWorth * game.rng.range(1.0, 1.25)));
      }

      // Neglected relationships fade.
      if (game.year - p.lastInteractionYear >= 2 && p.relationship > 8) {
        p.relationship = Math.max(8, p.relationship - game.rng.int(1, 5));
      }

      if (p.deathChanceThisYear(game.rng)) {
        const cause = p.age >= 60 ? 'old age' : game.rng.pick(['illness', 'an accident', 'a car crash', 'sudden heart failure']);
        p.kill(game, cause);
        news.push({ kind: 'npc_died', text: `Your ${p.type === 'parent' ? 'parent' : p.type === 'spouse' ? 'spouse' : p.type === 'child' ? 'child' : 'friend'} ${p.firstName} died at ${p.age}.`, person: p });
      }
    }

    // Keep the legacy record of the longest relationship. metYear is reset when
    // a relationship begins, so the span is simply calendar years elapsed.
    const partner = game.partner();
    if (partner) {
      const span = game.year - partner.metYear;
      if (span > game.legacy.longestRelationship.years) {
        game.legacy.longestRelationship = { years: span, name: partner.fullName };
      }
    }

    return news;
  },

  /* Deliberate time spent with someone. */
  interact(game, person) {
    if (!person || person.isDead) return { ok: false, text: 'They are gone.' };

    person.timesMet++;
    const gain = game.rng.int(4, 12);
    game.rel(person, gain);
    playerHappy(game, game.rng.int(1, 5));

    const lines = [
      `You spent the day with ${person.firstName}.`,
      `You and ${person.firstName} caught up properly.`,
      `You called ${person.firstName} and talked for hours.`
    ];
    return { ok: true, text: `${game.rng.pick(lines)} Your relationship is now ${Math.round(person.relationship)}.` };
  },

  date(game, person) {
    game.rel(person, game.rng.int(6, 16));
    playerHappy(game, game.rng.int(2, 7));
    return `You took ${person.firstName} out. Things are ${person.relationship > 60 ? 'going well' : 'still awkward'}.`;
  },

  /* Start dating: converts a friend into a partner. */
  becomePartner(game, person) {
    if (person.relationship < 35) return { ok: false, text: `${person.firstName} does not see you that way.` };
    person.type = 'partner';
    person.metYear = game.year;
    game.maritalStatus = 'dating';
    game.setStat('happiness', 8);
    game.log(`You and ${person.firstName} started dating.`, 'social');
    return { ok: true, text: `You and ${person.firstName} are now dating.` };
  },

  propose(game, person) {
    if (person.relationship < 55) return { ok: false, text: `${person.firstName} is not ready for that.` };
    if (!game.canAfford(12000)) return { ok: false, text: 'An engagement ring costs $12,000.' };

    game.spend(12000);
    person.type = 'partner';
    person.relationship = Format.clamp(person.relationship + 10, 0, 100);
    game.maritalStatus = 'engaged';
    playerHappy(game, 10);
    game.log(`You proposed to ${person.firstName}.`, 'social');
    return { ok: true, text: `${person.firstName} said yes.` };
  },

  marry(game, person) {
    if (!game.spend(25000)) return { ok: false, text: 'A wedding costs $25,000.' };

    person.type = 'spouse';
    person.isMarried = true;
    person.spouseName = game.fullName;
    person.happiness = Format.clamp(person.happiness + 15, 0, 100);
    person.relationship = Format.clamp(person.relationship + 15, 0, 100);
    person.metYear = game.year;

    game.maritalStatus = 'married';
    game.legacy.marriages++;
    playerHappy(game, 15);
    game.stat('fame', 2);
    game.log(`You married ${person.fullName}.`, 'social');
    return { ok: true, text: `You married ${person.firstName}. Congratulations.` };
  },

  breakUp(game, reason = 'You broke up.') {
    const p = game.partner();
    if (!p) return { ok: false, text: 'You are not with anyone.' };
    p.type = 'ex';
    game.maritalStatus = 'single';
    game.setStat('happiness', game.rng.int(-18, -6));
    game.log(`${reason}`, 'social');
    return { ok: true, text: reason };
  },

  divorce(game) {
    const p = game.partner();
    if (!p) return { ok: false, text: 'You are not married.' };
    if (!game.spend(20000)) return { ok: false, text: 'Divorce costs $20,000 in legal fees.' };

    // Split the assets roughly down the middle.
    const spouseWealth = p.netWorth * game.rng.range(0.2, 0.5);
    p.type = 'ex';
    p.isMarried = false;
    game.maritalStatus = 'divorced';
    game.legacy.divorces++;
    game.setStat('happiness', game.rng.int(-25, -10));
    game.log(`You divorced ${p.firstName}.`, 'social');
    return { ok: true, text: `The divorce is final. You walked away with ${Format.money(spouseWealth)}.` };
  },

  tryForChild(game) {
    const partner = game.partner();
    if (!partner) return { ok: false, text: 'You need a partner.' };
    if (game.maritalStatus !== 'married') return { ok: false, text: 'You need to be married first.' };
    if (game.age < 18) return { ok: false, text: 'You are too young.' };

    const cost = 20000;
    if (!game.canAfford(cost)) return { ok: false, text: `Raising a child properly costs ${Format.money(cost)} a year.` };

    const chance = 35 + (game.stats.health / 3) - Math.max(0, game.age - 35);
    if (!game.rng.chance(Math.min(85, Math.max(5, chance)))) {
      game.spend(Math.round(cost * 0.4));
      return { ok: false, text: 'It did not work this time.' };
    }

    game.spend(cost);
    const gender = game.rng.pick(['male', 'female']);
    const child = game.addPerson({
      firstName: Names.firstName(game.rng, gender),
      lastName: game.lastName,
      gender,
      type: 'child',
      age: 0,
      relationship: 90,
      happiness: game.rng.int(60, 95)
    });
    partner.children.push(child.id);
    game.legacy.childrenBorn++;
    playerHappy(game, 12);
    game.log(`You had a baby, ${child.firstName}.`, 'social');
    return { ok: true, text: `You had a baby! ${child.firstName} is here.` };
  },

  /* Called every year by Year.tick. */
  tickYear(game) {
    return Relationships.ageYear(game);
  }
});

/* Shared helper so partner happiness moves with the player's own. */
function playerHappy(game, delta) {
  game.stat('happiness', delta);
}