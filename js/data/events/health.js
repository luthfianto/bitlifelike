/*
 * Health events, roughly ages 5-95: illness, injury, mental health,
 * addiction, and the business of getting treated.
 *
 * Same contract as childhood.js — plain data handed to the engine, every roll
 * through game.rng, and at least one choice that is never locked.
 *
 * Two things are worth knowing before editing this file:
 *   - Health.add / Health.treat / Health.rehab return copy worth showing, but a
 *     choice effect runs BEFORE its result. Anything whose wording depends on
 *     how that went is stashed on game.flags and read back in the result.
 *   - Diagnoses use the real ids from Health.CONDITIONS (c_back, c_diabetes,
 *     c_asthma, c_heart, c_cancer, c_alcohol, c_drugs) so the yearly damage
 *     and the treatment price stay honest. Costs: $900 / $1,600 / $1,100 /
 *     $6,000 / $22,000 / $4,200 / $9,000. Rehab is a flat $12,000.
 */
EventEngine.register([
  {
    id: 'health_asthma_attack',
    category: 'health',
    weight: 2,
    minAge: 5,
    maxAge: 14,
    once: true,
    text: 'You began wheezing after the running race and could not get a full breath. The school nurse rang your parents.',
    choices: [
      {
        label: 'Finish the race anyway',
        result: 'You came last, then sat on the grass for twenty minutes. Your parents were proud and worried in equal measure.',
        effect: (game) => { game.stat('fitness', 3); game.stat('health', -2); }
      },
      {
        label: 'Get it looked at properly',
        result: (game) => (Health.has(game, 'c_asthma')
          ? 'It is asthma. You carry an inhaler now, which is mostly a non-event.'
          : 'It had passed by the time anyone could get you to a doctor.'),
        effect: (game) => { Health.add(game, 'c_asthma'); game.stat('health', -1); }
      },
      {
        label: 'Hand in your kit and stop',
        result: 'You gave up the sport on Monday. Nobody argued, which was somehow worse.',
        effect: (game) => { game.stat('fitness', -3); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'health_bike_crash',
    category: 'health',
    weight: 3,
    minAge: 6,
    maxAge: 20,
    once: false,
    text: 'You went down on your bike on the way home. The road was wet and you were showing off to somebody.',
    choices: [
      {
        label: 'Go to hospital',
        result: 'A long evening for a small tear. You told the story for years and always ended it at the funniest part.',
        effect: (game) => { game.stat('health', -6); game.stat('smarts', 1); }
      },
      {
        label: 'Rinse it off with a hose',
        result: 'The grit came out. Some of it did not, and you were reminded of that by a man at work for a year.',
        effect: (game) => { game.stat('health', -3); game.stat('looks', -2); }
      },
      {
        label: 'Get back on and ride it off',
        result: 'You cycled the rest of the way home. Your hands shook the entire time.',
        effect: (game) => { game.stat('health', -1); game.stat('fitness', 2); }
      }
    ]
  },

  {
    id: 'health_sports_tear',
    category: 'health',
    weight: 2,
    minAge: 14,
    maxAge: 40,
    once: true,
    text: 'You tore something important playing your sport. The season ended in the same week.',
    choices: [
      {
        label: 'Have the operation and do the rehab properly',
        require: (game) => (game.canAfford(5000) ? true : Needs.MONEY(5000)),
        result: 'You paid for the operation and then for eighteen weeks of very slow mornings. It worked.',
        effect: (game) => { game.spend(5000); game.stat('health', -3); game.stat('fitness', 8); }
      },
      {
        label: 'Skip the surgery and rest at home',
        result: 'You watched a season from a sofa. It healed, eventually, in the shape it felt like healing.',
        effect: (game) => { game.stat('health', -2); game.stat('fitness', -5); game.stat('happiness', -2); }
      },
      {
        label: 'Play the rest of the season through it',
        result: 'You won a game and your back has held the opinion ever since.',
        effect: (game) => { game.stat('health', -9); game.stat('fitness', 2); Health.add(game, 'c_back'); }
      }
    ]
  },

  {
    id: 'health_flu_season',
    category: 'health',
    weight: 3,
    minAge: 5,
    maxAge: 95,
    once: false,
    text: 'Flu is going round the place. You have been looking at people in meetings and doing sums.',
    choices: [
      {
        label: 'Ride it out in bed',
        result: 'A week of fever and television. You came out of it owing nothing and owing nothing in particular.',
        effect: (game) => { game.stat('health', -6); game.stat('happiness', -1); }
      },
      {
        label: 'Get the jab first',
        result: 'You were the only one in the queue. It took four minutes and the bug took two days.',
        effect: (game) => { game.stat('health', -3); game.stat('smarts', 2); }
      },
      {
        label: 'Work straight through it',
        result: 'You went in anyway and infected a room. Two weeks lost and nobody was impressed.',
        effect: (game) => { game.stat('health', -12); game.stat('fitness', -2); }
      }
    ]
  },

  {
    id: 'health_smoking_offer',
    category: 'health',
    weight: 3,
    minAge: 14,
    maxAge: 45,
    once: true,
    text: 'Somebody outside the gate offered you a cigarette. In twenty years you will have a very clear opinion of this moment.',
    choices: [
      {
        label: 'Take it',
        result: 'You coughed, and then did not. It became a habit before it became a choice.',
        effect: (game) => { game.stat('addiction', 10); game.stat('health', -3); }
      },
      {
        label: 'Say no',
        result: 'You said no and went home. It cost you nothing, which is not something you can say about most decisions at that age.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', 1); }
      },
      {
        label: 'Take it off them and bin it',
        result: 'You threw it in the bin in front of them. It made an enemy and a small amount of peace.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'health_back_pain',
    category: 'health',
    weight: 3,
    minAge: 28,
    maxAge: 66,
    once: true,
    require: (game) => (!Health.has(game, 'c_back') ? true : 'You already have a back like that.'),
    text: 'Your back went while you were doing something undignified. It has not been right since, and it is now a topic.',
    choices: [
      {
        label: 'See a specialist and do the physio',
        require: (game) => (game.canAfford(900) ? true : Needs.MONEY(900)),
        result: (game) => (Health.has(game, 'c_back')
          ? `You paid ${Format.money(900)} and were given a folder of exercises. The folder is still in a drawer.`
          : 'You paid up, did the exercises for four months, and it went away entirely.'),
        effect: (game) => { game.spend(900); game.stat('health', 3); game.stat('happiness', 2); }
      },
      {
        label: 'Ignore it until it is worse',
        result: 'You ignored it for three years. It did get worse, and then it settled into being permanent.',
        effect: (game) => { Health.add(game, 'c_back'); game.stat('health', -2); }
      },
      {
        label: 'Buy a brace online at two in the morning',
        require: (game) => (game.canAfford(80) ? true : Needs.MONEY(80)),
        result: 'It arrived in four days, and it works about as well as four days of buying things online usually does.',
        effect: (game) => { game.spend(80); game.stat('health', -1); game.stat('happiness', 1); }
      }
    ]
  },

  {
    id: 'health_panic_attack',
    category: 'health',
    weight: 2,
    minAge: 16,
    maxAge: 45,
    once: false,
    text: 'You had a panic attack in a place with no exits. It lasted twenty minutes and everyone else carried on with their day.',
    choices: [
      {
        label: 'Pay for a therapist',
        require: (game) => (game.canAfford(2000) ? true : Needs.MONEY(2000)),
        result: 'An hour a week for a year, and most of the first year spent explaining why you were there.',
        effect: (game) => { game.spend(2000); game.stat('happiness', 7); game.stat('smarts', 2); }
      },
      {
        label: 'Tell somebody close to you',
        require: (game) => (someone(game) ? true : Needs.FRIEND),
        result: 'You told them badly, at speed, in a car park. It was the right decision and it felt like the worst one you had ever.',
        effect: (game) => { const p = someone(game); if (p) game.rel(p, 12); game.stat('happiness', 5); }
      },
      {
        label: 'Say nothing to anybody',
        result: 'You sat in the car until it passed and then drove home. You have got very good at that.',
        effect: (game) => { game.stat('happiness', -5); game.stat('health', -1); }
      }
    ]
  },

  {
    id: 'health_burnout',
    category: 'health',
    weight: 3,
    minAge: 22,
    maxAge: 52,
    once: false,
    require: (game) => (game.job || game.stats.happiness < 50 ? true : 'Your life is currently uncomplicated.'),
    text: 'You have been tired for months. Not the kind of tired that a weekend fixes, and you have stopped mentioning it.',
    choices: [
      {
        label: 'Book something expensive and take a week off',
        require: (game) => (game.canAfford(3000) ? true : Needs.MONEY(3000)),
        result: 'You went somewhere with a view and did nothing for seven days. It was not a cure but it bought a month.',
        effect: (game) => { game.spend(3000); game.stat('happiness', 11); game.stat('health', 5); }
      },
      {
        label: 'Push through another year',
        result: 'You were praised for your capacity to need very little. It cost you more than the praise was worth.',
        effect: (game) => { game.stat('happiness', -8); game.stat('health', -6); game.stat('smarts', 1); }
      },
      {
        label: 'Have an honest conversation with your manager',
        require: (game) => (Can.job(game) ? true : Needs.JOB),
        result: 'They listened carefully and then gave you more to do, in a nicer way. You now have two problems.',
        effect: (game) => { game.stat('happiness', 3); game.stat('health', -3); }
      }
    ]
  },

  {
    id: 'health_therapy',
    category: 'health',
    weight: 2,
    minAge: 18,
    maxAge: 72,
    once: true,
    text: 'You have started describing yourself as fine in a way that is more of a delivery method than an answer.',
    choices: [
      {
        label: 'Book an appointment',
        require: (game) => (game.canAfford(1500) ? true : Needs.MONEY(1500)),
        result: 'You talked for fifty minutes about a parking space. It turned out to be about a parking space.',
        effect: (game) => { game.spend(1500); game.stat('happiness', 9); game.stat('smarts', 3); }
      },
      {
        label: 'Tell a friend the actual version',
        require: (game) => (someone(game) ? true : Needs.FRIEND),
        result: 'You told them the actual version. They did not make a face, which is the most useful thing anyone could have done.',
        effect: (game) => { const p = someone(game); if (p) game.rel(p, 14); game.stat('happiness', 6); }
      },
      {
        label: 'Cancel it and go for a walk instead',
        result: 'You cancelled it and walked. The cancellation cost a fee, which is a neat way of paying for a walk.',
        effect: (game) => { game.stat('happiness', 2); game.stat('fitness', 3); }
      }
    ]
  },

  {
    id: 'health_drinking_habit',
    category: 'health',
    weight: 3,
    minAge: 20,
    maxAge: 70,
    once: false,
    text: 'You have started drinking in the evenings. It began as a way of finishing the day and became the way of finishing the day.',
    choices: [
      {
        label: 'Keep going',
        result: 'You kept going. The thing about the evening is that it is now the best part of it.',
        effect: (game) => {
          game.stat('addiction', 12);
          game.stat('health', -5);
          if (game.rng.chance(40)) Health.add(game, 'c_alcohol');
        }
      },
      {
        label: 'Cut back for a month',
        result: 'A month of evenings that were less fun and more legible. You hated it and then you did not.',
        effect: (game) => { game.stat('addiction', -12); game.stat('health', 3); game.stat('happiness', -3); }
      },
      {
        label: 'Let somebody arrange help',
        require: (game) => (game.canAfford(12000) ? true : Needs.MONEY(12000)),
        result: (game) => (game.flags['health:rehabText'] ?? 'Nothing came of it.'),
        effect: (game) => { game.flags['health:rehabText'] = Health.rehab(game).text; }
      }
    ]
  },

  {
    id: 'health_pill_bottle',
    category: 'health',
    weight: 2,
    minAge: 17,
    maxAge: 58,
    once: false,
    text: 'You have been taking something a doctor gave you for rather longer than you were given it for.',
    choices: [
      {
        label: 'Keep taking them',
        result: 'The original prescription was for two weeks. The pharmacy stopped asking questions a long time ago.',
        effect: (game) => {
          game.stat('addiction', 14);
          game.stat('health', -3);
          if (game.rng.chance(35)) Health.add(game, 'c_drugs');
        }
      },
      {
        label: 'Stop cold',
        result: 'You stopped on a Tuesday. The first three days were a cough, a headache and an opinion about yourself.',
        effect: (game) => { game.stat('addiction', -6); game.stat('health', -5); game.stat('happiness', -2); }
      },
      {
        label: 'Ask the doctor for a proper plan',
        require: (game) => (game.canAfford(500) ? true : Needs.MONEY(500)),
        result: 'You asked for a plan instead of more pills. The plan was less satisfying and considerably cheaper after month two.',
        effect: (game) => { game.spend(500); game.stat('addiction', -8); game.stat('health', 2); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'health_rehab_offer',
    category: 'health',
    weight: 2,
    minAge: 20,
    maxAge: 68,
    once: false,
    require: (game) => (game.stats.addiction >= 35 ? true : 'You are not struggling with anything right now.'),
    text: 'Somebody close to you sat you down and asked, quite calmly, how much you were actually using.',
    choices: [
      {
        label: 'Take the place they found',
        require: (game) => (game.canAfford(12000) ? true : Needs.MONEY(12000)),
        result: (game) => (game.flags['health:rehabText'] ?? 'Nothing came of it.'),
        effect: (game) => { game.flags['health:rehabText'] = Health.rehab(game).text; }
      },
      {
        label: 'Pay for private treatment instead',
        require: (game) => (game.canAfford(18000) ? true : Needs.MONEY(18000)),
        result: 'Eighteen thousand dollars and a room with a view of a car park. It worked, which annoyed you.',
        effect: (game) => { game.spend(18000); game.setStat('addiction', game.stats.addiction - 45); game.stat('health', 5); game.stat('smarts', 2); }
      },
      {
        label: 'Refuse and go home',
        result: 'You said it was under control and went home. They were right to ask twice.',
        effect: (game) => { game.stat('addiction', 4); game.stat('happiness', -4); }
      }
    ]
  },

  {
    id: 'health_treatment_plan',
    category: 'health',
    weight: 3,
    minAge: 35,
    maxAge: 95,
    once: false,
    require: (game) => (game.conditions.length > 0 ? true : 'You are, remarkably, in good health.'),
    text: (game) => {
      const worst = game.conditions.map((id) => Health.byId(id)).sort((a, b) => b.cost - a.cost)[0];
      return `Your doctor went through your chart and put a number on the table: ${Format.money(worst.cost)} for the ${worst.name.toLowerCase()}, treated properly rather than hopefully.`;
    },
    choices: [
      {
        label: 'Pay for the whole course',
        require: (game) => {
          const worst = game.conditions.map((id) => Health.byId(id)).sort((a, b) => b.cost - a.cost)[0];
          return (worst && game.canAfford(worst.cost) ? true : Needs.MONEY(worst ? worst.cost : 0));
        },
        result: (game) => (game.flags['health:treatText'] ?? 'Nothing came of it.'),
        effect: (game) => {
          const worst = game.conditions.map((id) => Health.byId(id)).sort((a, b) => b.cost - a.cost)[0];
          if (worst) game.flags['health:treatText'] = Health.treat(game, worst.id).text;
        }
      },
      {
        label: 'Pay a token amount and feel virtuous',
        require: (game) => (game.canAfford(250) ? true : Needs.MONEY(250)),
        result: 'You paid a quarter of what it should have been, felt briefly excellent, and still have the same problem.',
        effect: (game) => { game.spend(250); game.stat('happiness', 2); game.stat('health', -1); }
      },
      {
        label: 'Decline the lot',
        result: 'You said you would think about it. The condition is still there and it is still doing the maths on you.',
        effect: (game) => { game.stat('happiness', -2); game.stat('health', -3); }
      }
    ]
  },

  {
    id: 'health_heart_attack',
    category: 'health',
    weight: 2,
    minAge: 45,
    maxAge: 88,
    once: true,
    require: (game) => (!Health.has(game, 'c_heart') ? true : 'You have already had the big one.'),
    text: 'You felt something tighten in your chest while carrying shopping up a hill. It is the classic version, down to the hill.',
    choices: [
      {
        label: 'Call an ambulance and sit down',
        result: 'Three hours in a corridor and a long list of things to do differently for the rest of your life.',
        effect: (game) => { Health.add(game, 'c_heart'); game.stat('health', -18); }
      },
      {
        label: 'Drive yourself, badly',
        result: 'You got there on your own. You were told, more than once, that this was not a good idea.',
        effect: (game) => { Health.add(game, 'c_heart'); game.stat('health', -14); game.stat('smarts', 1); }
      },
      {
        label: 'Sit down and wait for it to pass',
        result: (game) => (Health.has(game, 'c_heart')
          ? 'It did not pass. Neighbours found you on the path and the rest of the afternoon is a gap.'
          : 'It eased after an hour. You sat on the wall for a while and then carried the shopping up.'),
        effect: (game) => {
          if (game.rng.chance(55)) { Health.add(game, 'c_heart'); game.stat('health', -25); }
          else { game.stat('health', -8); game.stat('happiness', -6); }
        }
      }
    ]
  },

  {
    id: 'health_cancer_diagnosis',
    category: 'health',
    weight: 1,
    minAge: 40,
    maxAge: 90,
    once: true,
    require: (game) => (!Health.has(game, 'c_cancer') ? true : 'You have been through this once already.'),
    text: 'A routine test came back with a note that somebody had clearly had to write carefully.',
    choices: [
      {
        label: 'Pay for the full treatment and deal with it now',
        require: (game) => (game.canAfford(22000) ? true : Needs.MONEY(22000)),
        result: (game) => (game.flags['health:cancerText'] ?? 'Nothing came of it.'),
        effect: (game) => {
          Health.add(game, 'c_cancer');
          game.flags['health:cancerText'] = Health.treat(game, 'c_cancer').text;
        }
      },
      {
        label: 'Get a second opinion first',
        require: (game) => (game.canAfford(1500) ? true : Needs.MONEY(1500)),
        result: (game) => (Health.has(game, 'c_cancer')
          ? 'The second opinion agreed with the first. The bill for asking was $1,500.'
          : 'The second opinion found nothing at all. You walked out of that building considerably lighter.'),
        effect: (game) => {
          game.spend(1500);
          game.stat('smarts', 2);
          if (game.rng.chance(35)) Health.add(game, 'c_cancer');
          else { game.stat('happiness', 10); game.stat('health', 4); }
        }
      },
      {
        label: 'Take it one step at a time',
        result: 'You put the letter in a drawer and carried on. The drawer is where most of this happens.',
        effect: (game) => { Health.add(game, 'c_cancer'); game.stat('happiness', -12); game.stat('health', -10); }
      }
    ]
  },

  {
    id: 'health_diabetes',
    category: 'health',
    weight: 2,
    minAge: 35,
    maxAge: 82,
    once: true,
    require: (game) => (!Health.has(game, 'c_diabetes') ? true : 'You already know about the diabetes.'),
    text: 'You were diagnosed at a check-up you had nearly cancelled. The number was not a near miss.',
    choices: [
      {
        label: 'Manage it properly and pay for the course',
        require: (game) => (game.canAfford(1600) ? true : Needs.MONEY(1600)),
        result: (game) => (game.flags['health:diabetesText'] ?? 'Nothing came of it.'),
        effect: (game) => {
          Health.add(game, 'c_diabetes');
          game.flags['health:diabetesText'] = Health.treat(game, 'c_diabetes').text;
        }
      },
      {
        label: 'Change everything you eat',
        result: 'You cut out most of what you enjoyed. The readings came down and so did your mood about the whole arrangement.',
        effect: (game) => { Health.add(game, 'c_diabetes'); game.stat('fitness', 4); game.stat('health', -1); game.stat('happiness', -3); }
      },
      {
        label: 'Close the letter and go and make a snack',
        result: 'You did not read the second page. It has been in a drawer ever since, doing its own damage.',
        effect: (game) => { Health.add(game, 'c_diabetes'); game.stat('health', -3); game.stat('happiness', 1); }
      }
    ]
  },

  {
    id: 'health_surgery',
    category: 'health',
    weight: 2,
    minAge: 25,
    maxAge: 88,
    once: false,
    text: 'You are going under the knife for something that does not deserve a dramatic entrance.',
    choices: [
      {
        label: 'Have it done properly',
        require: (game) => (game.canAfford(8000) ? true : Needs.MONEY(8000)),
        result: 'You came out of it the same person, minus a small internal feature and a good deal of money.',
        effect: (game) => { game.spend(8000); game.stat('health', 4); game.stat('happiness', -2); }
      },
      {
        label: 'Ask what it costs before agreeing',
        result: 'You asked for the price and were given a number that did not include the specialist. Useful to know now.',
        effect: (game) => { game.stat('smarts', 3); }
      },
      {
        label: 'Put it off for another year',
        result: 'You put it off. It will be there next year, and it will cost slightly more next year.',
        effect: (game) => { game.stat('health', -3); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'health_car_crash',
    category: 'health',
    weight: 2,
    minAge: 16,
    maxAge: 88,
    once: true,
    require: (game) => (Can.hasCar(game) ? true : Needs.CAR),
    text: 'You were involved in a collision. Everyone got out of the vehicles. Not everyone was fine.',
    choices: [
      {
        label: 'Go to hospital and be thorough',
        result: 'A long afternoon for a small fracture and a great deal of paperwork afterwards.',
        effect: (game) => { game.stat('health', -8); game.stat('smarts', 3); }
      },
      {
        label: 'Check on the other driver first',
        result: 'The other driver was shaken and grateful. Nobody has mentioned the insurance since, which is a kind of gift.',
        effect: (game) => { game.stat('happiness', 6); game.stat('fame', 3); game.stat('health', -2); }
      },
      {
        label: 'Walk away and claim nothing',
        result: 'You walked away and lost sleep over it for a month. Your premium went up regardless.',
        effect: (game) => { game.stat('health', -5); game.stat('happiness', -4); }
      }
    ]
  },

  {
    id: 'health_work_accident',
    category: 'health',
    weight: 2,
    minAge: 18,
    maxAge: 66,
    once: false,
    require: (game) => (Can.job(game) ? true : Needs.JOB),
    text: 'There was an accident at work. Everyone was fine, mostly, which is the version people repeat afterwards.',
    choices: [
      {
        label: 'Claim for everything you are owed',
        result: 'The forms took four months and paid out more than expected. You wrote your own name twice.',
        effect: (game) => { game.addMoney(cash(game, 1500, 9000)); game.stat('health', -4); game.stat('smarts', 2); }
      },
      {
        label: 'Report what actually caused it',
        result: 'The report went up a chain of people who did not want it. It was read, and nothing happened, and you were right.',
        effect: (game) => { game.stat('smarts', 3); game.stat('fame', 2); game.stat('health', -3); }
      },
      {
        label: 'Say you are fine and go back in',
        result: 'You went back in on the Thursday. The shoulder has not been right since and nobody has asked about it.',
        effect: (game) => { game.stat('health', -8); game.stat('fitness', -3); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'health_fall',
    category: 'health',
    weight: 3,
    minAge: 70,
    maxAge: 96,
    once: false,
    text: 'You fell at home, in the way people fall at home, which is on a level floor with no steps involved.',
    choices: [
      {
        label: 'Get checked over in hospital',
        require: (game) => (game.canAfford(3000) ? true : Needs.MONEY(3000)),
        result: 'Nothing broken, which was the best available news. The $3,000 was for the best available news.',
        effect: (game) => { game.spend(3000); game.stat('health', -5); game.stat('smarts', 1); }
      },
      {
        label: 'Ask somebody to come and stay a while',
        require: (game) => (someone(game) ? true : Needs.FRIEND),
        result: 'They came for a fortnight and stayed for three. The house is louder and safer in equal measure.',
        effect: (game) => { const p = someone(game); if (p) game.rel(p, 14); game.stat('happiness', 7); game.stat('health', -3); }
      },
      {
        label: 'Get up slowly and carry on',
        result: 'You got up slowly and carried on, and thought about it every time you used that room for the rest of the year.',
        effect: (game) => { game.stat('health', -8); game.stat('fitness', -4); }
      }
    ]
  },

  {
    id: 'health_hearing',
    category: 'health',
    weight: 2,
    minAge: 65,
    maxAge: 95,
    once: true,
    text: 'You have started saying what more often, and the room has started doing it back.',
    choices: [
      {
        label: 'Get hearing aids',
        require: (game) => (game.canAfford(4000) ? true : Needs.MONEY(4000)),
        result: 'Four thousand dollars and the first sound of the world in six years: your own kettle.',
        effect: (game) => { game.spend(4000); game.stat('happiness', 5); game.stat('smarts', 2); }
      },
      {
        label: 'Insist that everyone speaks up',
        result: 'Everyone spoke up. It did not help, and you were difficult about it for about a year.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', -1); }
      },
      {
        label: 'Tell a joke and watch nobody laugh',
        result: 'You told a joke to a full table and got the silence of a hospital waiting room.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', -1); }
      }
    ]
  },

  {
    id: 'health_midlife',
    category: 'health',
    weight: 2,
    minAge: 38,
    maxAge: 58,
    once: false,
    text: (game) => `You are ${game.age}. It has been mentioned recently, by two people, that you are at an age now.`,
    choices: [
      {
        label: 'Buy the ridiculous car',
        require: (game) => (game.canAfford(40000) ? true : Needs.MONEY(40000)),
        result: 'It is enormous, it is stupid, and it is entirely justifiable to you. You have driven it twice.',
        effect: (game) => { game.spend(40000); game.stat('happiness', 10); game.stat('looks', 2); }
      },
      {
        label: 'Have the affair nobody expected',
        require: (game) => (game.partner() ? true : Needs.PARTNER),
        result: 'It lasted four months, cost one friendship, and confirmed everything you already suspected about yourself.',
        effect: (game) => { const p = game.partner(); if (p) game.rel(p, -16); game.stat('happiness', 6); }
      },
      {
        label: 'Get fitter instead',
        result: 'You joined the place with the mirrors. You have been three times and can do something on a treadmill now.',
        effect: (game) => { game.stat('fitness', 8); game.stat('health', 3); game.stat('happiness', 2); }
      },
      {
        label: 'Have a serious talk with yourself',
        result: 'You went for a long walk and took stock. The conclusion was not dramatic and it was correct.',
        effect: (game) => { game.stat('smarts', 5); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'health_resolution',
    category: 'health',
    weight: 3,
    minAge: 20,
    maxAge: 78,
    once: false,
    text: (game) => `It is the start of another year and you have written a list. The list is at least honest about being a list.`,
    choices: [
      {
        label: 'Actually go, and pay for it',
        require: (game) => (game.canAfford(600) ? true : Needs.MONEY(600)),
        result: 'You paid, you went, and in March the thing stopped feeling like punishment.',
        effect: (game) => { game.spend(600); game.stat('fitness', 10); game.stat('health', 3); }
      },
      {
        label: 'Stop eating like it is a personality',
        result: 'You cut out most of the week. The first three days were embarrassing and the fourth was fine.',
        effect: (game) => { game.stat('fitness', 5); game.stat('health', 3); game.stat('looks', 2); }
      },
      {
        label: 'Announce that the list is a joke',
        result: 'You announced that the list was a joke, and the list was not, and you all went out for a drink.',
        effect: (game) => { game.stat('happiness', 2); game.stat('fitness', -1); }
      }
    ]
  },

  {
    id: 'health_teeth',
    category: 'health',
    weight: 2,
    minAge: 10,
    maxAge: 92,
    once: false,
    text: 'A tooth has been asking for attention for months and you have been talking over it.',
    choices: [
      {
        label: 'Book the dentist properly',
        require: (game) => (game.canAfford(1200) ? true : Needs.MONEY(1200)),
        result: 'It was one tooth, two appointments and an invoice that outlasted the pain.',
        effect: (game) => { game.spend(1200); game.stat('health', 2); game.stat('happiness', 2); }
      },
      {
        label: 'Deal with it yourself',
        result: 'You dealt with it yourself, with something from a hardware shop, and said nothing to anyone about it.',
        effect: (game) => { game.stat('health', -5); game.stat('smarts', -2); }
      },
      {
        label: 'Put it off until next year',
        result: 'You promised yourself next year, in the same words you use every year.',
        effect: (game) => { game.stat('health', -3); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'health_collapse',
    category: 'health',
    weight: 2,
    minAge: 18,
    maxAge: 85,
    once: false,
    text: 'Somebody collapsed in front of you in public and the street carried straight on.',
    choices: [
      {
        label: 'Call an ambulance and stay with them',
        result: 'You stayed until they were loaded in. Their family found your number and thanked you in a way that stuck.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', 5); game.stat('fame', 2); }
      },
      {
        label: 'Drive them to hospital yourself',
        result: 'You got there four minutes before the ambulance did. They were treated, which was the main thing.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', 3); game.stat('health', -2); }
      },
      {
        label: 'Keep walking',
        result: 'You kept walking. You thought about it at about half past three in the morning, several times, for years.',
        effect: (game) => { game.stat('happiness', -8); game.stat('smarts', -2); }
      }
    ]
  },

  {
    id: 'health_sleep',
    category: 'health',
    weight: 2,
    minAge: 25,
    maxAge: 82,
    once: false,
    text: 'You have not been sleeping well. The reasons are a long list of things you have no intention of changing.',
    choices: [
      {
        label: 'Ask for something to help',
        require: (game) => (game.canAfford(300) ? true : Needs.MONEY(300)),
        result: 'It worked, and then you needed it every night, which is the usual arrangement.',
        effect: (game) => { game.spend(300); game.stat('health', 3); game.stat('addiction', 5); }
      },
      {
        label: 'Stop drinking in the early evening',
        result: 'The evenings got slightly worse and the mornings got substantially better.',
        effect: (game) => { game.stat('health', 3); game.stat('addiction', -6); game.stat('happiness', -1); }
      },
      {
        label: 'Accept it as the deal now',
        result: 'You accepted it. You have become a person who is tired at eight and asleep at ten.',
        effect: (game) => { game.stat('health', -4); game.stat('happiness', -2); }
      }
    ]
  }
]);
