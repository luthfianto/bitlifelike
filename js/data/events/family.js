/*
 * Family, roughly ages 10-80.
 *
 * Parents, siblings, children and the relations you did not choose. Gated on
 * having the relevant people: game.parents() still returns the dead, so events
 * that need someone alive filter on isDead first. game.siblings() and
 * game.children() only ever return the living.
 */
EventEngine.register([
  {
    id: 'family_parent_argument',
    category: 'family',
    weight: 3,
    minAge: 10,
    maxAge: 19,
    once: true,
    text: 'You had an argument with a parent that lasted eleven minutes and felt like a year.',
    choices: [
      {
        label: 'Say sorry first even though you were right',
        result: 'You said sorry first. You were still right, and quieter about it.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Stand your ground',
        result: 'You held your position. It was a good position, which did not help.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 2); }
      },
      {
        label: 'Go to your room until it cools down',
        result: 'You waited it out. Waiting out arguments is a skill you have now.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'family_new_sibling',
    category: 'family',
    weight: 2,
    minAge: 8,
    maxAge: 22,
    once: true,
    text: 'You have a new sibling. The arrangement took some explaining at school and a certain amount at home.',
    choices: [
      {
        label: 'Adore them immediately',
        result: 'You adored them on sight. You have not stopped.',
        effect: (game) => game.stat('happiness', 5)
      },
      {
        label: 'Treat them like a suspicious stranger',
        result: 'You kept your distance. They have lived up to the reputation.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Teach them everything you know',
        result: 'You explained the rules of the house. Roughly half of them were wrong.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'family_sibling_rivalry',
    category: 'family',
    weight: 3,
    minAge: 8,
    maxAge: 32,
    once: true,
    text: 'A sibling has been comparing your life to theirs in detail, in public, for some time now.',
    choices: [
      {
        label: 'Correct the record, loudly',
        result: 'You corrected the record. Several bystanders now have opinions.',
        effect: (game) => { game.stat('happiness', -1); game.stat('smarts', 2); }
      },
      {
        label: 'Laugh it off',
        result: 'You laughed it off. It is easier than winning, and cheaper.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Start keeping a private scoreboard',
        result: 'You started a private scoreboard. You have been keeping it for years.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 3); }
      }
    ]
  },

  {
    id: 'family_parents_divorce',
    category: 'family',
    weight: 2,
    minAge: 10,
    maxAge: 30,
    once: true,
    text: 'Your parents decided to end it. The word was said in a kitchen and heard through a thin floor.',
    choices: [
      {
        label: 'Take one side completely',
        result: 'You picked a side. Everyone noticed the side.',
        effect: (game) => { game.stat('happiness', -8); game.stat('smarts', 2); }
      },
      {
        label: 'Refuse to pick',
        result: 'You refused to pick a side. The refusal was hard work for everyone.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', 3); }
      },
      {
        label: 'Ask what you did to cause it',
        result: 'You asked what you had done to cause it. Nobody had an answer.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 4); }
      }
    ]
  },

  {
    id: 'family_stepparent',
    category: 'family',
    weight: 1,
    minAge: 8,
    maxAge: 26,
    once: true,
    text: 'A new adult moved into the house. They were careful with you, in the unnerving deliberate way of people being paid to be nice.',
    choices: [
      {
        label: 'Give them a fair chance',
        result: 'You gave them a fair chance. They passed it, eventually.',
        effect: (game) => game.stat('happiness', 4)
      },
      {
        label: 'Refuse to acknowledge them',
        result: 'You refused to acknowledge them. The refusal took a lot of daily effort.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 2); }
      },
      {
        label: 'Befriend them against everyone else',
        result: 'You got along with them better than anyone else in the house did.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'family_grandparents_history',
    category: 'family',
    weight: 2,
    minAge: 10,
    maxAge: 32,
    once: true,
    text: 'You asked an older relative where the family actually came from. You were not ready for the answer.',
    choices: [
      {
        label: 'Write the whole thing down',
        result: 'You wrote it all down. Three pages, and one part you have not shown anyone.',
        effect: (game) => { game.stat('smarts', 5); game.stat('happiness', -1); }
      },
      {
        label: 'Ask one more question, then stop',
        result: 'You asked one more question. That was enough for one afternoon.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', 1); }
      },
      {
        label: 'Regret the question immediately',
        result: 'You regretted it in the car on the way home and have thought about it since.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'family_parent_pride',
    category: 'family',
    weight: 2,
    minAge: 14,
    maxAge: 42,
    once: true,
    text: (game) => `${game.parents().find((p) => !p.isDead)?.firstName ?? 'A parent'} told a full room of strangers that you were doing well. It was mostly true.`,
    choices: [
      {
        label: 'Pretend you did not hear',
        result: 'You pretended not to hear, which fooled nobody in the room.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Be grateful out loud',
        result: 'You said thank you properly. It landed harder than you expected.',
        effect: (game) => {
          game.stat('happiness', 5);
          for (const p of game.parents()) game.rel(p, 8);
        }
      },
      {
        label: 'Ask them, gently, to stop',
        result: 'You asked them to stop. They agreed, and did it again within a month.',
        effect: (game) => {
          game.stat('happiness', 1);
          for (const p of game.parents()) game.rel(p, -6);
        }
      }
    ]
  },

  {
    id: 'family_move_out',
    category: 'family',
    weight: 2,
    minAge: 17,
    maxAge: 28,
    once: true,
    text: 'You moved out. It took one bag and considerably more confidence than you had.',
    choices: [
      {
        label: 'Get a room with strangers',
        result: 'You got a room with strangers. The thin walls taught you a lot about noise.',
        effect: (game) => {
          game.spend(cash(game, 300, 1200));
          game.stat('happiness', 4);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Stay home and admit why',
        result: 'You stayed home and said so out loud. The rent you did not pay is roughly a small car.',
        effect: (game) => {
          game.addMoney(cash(game, 3000, 9000));
          game.stat('happiness', -3);
        }
      },
      {
        label: 'Move in with a friend and call it temporary',
        result: 'You moved in with a friend. It has been temporary for four years now.',
        effect: (game) => {
          const p = game.peopleOf('friend')[0] ?? Relationships.meetFriend(game);
          game.rel(p, 8);
          game.stat('happiness', 2);
        }
      }
    ]
  },

  {
    id: 'family_sibling_trouble',
    category: 'family',
    weight: 2,
    minAge: 15,
    maxAge: 50,
    once: true,
    require: (game) => game.siblings().length > 0 ? true : 'You do not have any siblings.',
    text: (game) => `Your sibling ${game.siblings().at(0)?.firstName ?? 'next door'} is in a mess of their own making, and has asked you for money you do not have.`,
    choices: [
      {
        label: 'Give them what you can spare',
        require: (game) => game.canAfford(1500) ? true : Needs.MONEY(1500),
        result: 'You gave them the money. It disappeared in eleven days, as predicted.',
        effect: (game) => {
          game.spend(cash(game, 800, 2500));
          game.rel(game.siblings().at(0), 22);
          game.stat('happiness', 1);
        }
      },
      {
        label: 'Offer a roof and nothing else',
        result: 'You offered a sofa and no cash. It was the most either of you could do.',
        effect: (game) => { game.rel(game.siblings().at(0), 10); game.stat('happiness', -1); }
      },
      {
        label: 'Say no and change the subject',
        result: 'You said no. The subject has come up at every family occasion since.',
        effect: (game) => { game.rel(game.siblings().at(0), -26); game.stat('happiness', -2); }
      },
      {
        label: 'Help them sort it out instead of paying for it',
        result: 'You sat with them for a weekend and made a plan. The plan was their own.',
        effect: (game) => { game.rel(game.siblings().at(0), 10); game.stat('smarts', 3); game.stat('happiness', 1); }
      }
    ]
  },

  {
    id: 'family_sibling_wedding',
    category: 'family',
    weight: 2,
    minAge: 16,
    maxAge: 55,
    once: true,
    require: (game) => game.siblings().length > 0 ? true : 'You do not have any siblings.',
    text: (game) => `Your sibling ${game.siblings().at(0)?.firstName ?? 'next door'} is getting married, and you have been asked to give a speech.`,
    choices: [
      {
        label: 'Give a short, decent speech',
        result: 'You kept it short and decent. Everyone applauded, including your sibling.',
        effect: (game) => { game.rel(game.siblings().at(0), 14); game.stat('happiness', 3); }
      },
      {
        label: 'Tell the embarrassing true story',
        result: 'You told the story. There was applause and a short period where nobody made eye contact.',
        effect: (game) => { game.rel(game.siblings().at(0), -10); game.stat('happiness', 5); game.stat('fame', 2); }
      },
      {
        label: 'Fake an illness',
        result: 'You faked an illness. The speech was given by somebody less interesting.',
        effect: (game) => { game.rel(game.siblings().at(0), -12); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'family_cut_offs',
    category: 'family',
    weight: 2,
    minAge: 18,
    maxAge: 58,
    once: true,
    text: 'A long-running argument finally finished the way those things do. Nobody spoke for a year, then two.',
    choices: [
      {
        label: 'Let it stay finished',
        result: 'You let it stay finished. It was cleaner than the alternative.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 3); }
      },
      {
        label: 'Send one short message',
        result: 'You sent one short message. It was received without enthusiasm.',
        effect: (game) => { game.stat('happiness', 1); game.stat('smarts', 1); }
      },
      {
        label: 'Turn up unannounced',
        result: 'You turned up unannounced. It went badly and it was still a relief.',
        effect: (game) => game.rng.chance(45)
          ? game.stat('happiness', 5)
          : game.stat('happiness', -5)
      }
    ]
  },

  {
    id: 'family_parent_illness',
    category: 'family',
    weight: 3,
    minAge: 28,
    maxAge: 75,
    once: true,
    require: (game) => game.parents().some((p) => !p.isDead) ? true : 'Both of your parents are gone.',
    text: 'A parent is unwell. The word serious is being used carefully and you do not like the care being taken over it.',
    choices: [
      {
        label: 'Pay for the best care you can find',
        require: (game) => game.canAfford(8000) ? true : Needs.MONEY(8000),
        result: 'You paid for the best care available. It helped, and it was ruinous.',
        effect: (game) => {
          game.spend(cash(game, 8000, 22000));
          for (const p of game.parents()) if (!p.isDead) game.rel(p, 22);
          game.stat('happiness', -3);
        }
      },
      {
        label: 'Take on the appointments and the paperwork',
        result: 'You did the appointments, the forms and all the phone calls. You have not slept properly since.',
        effect: (game) => {
          game.stat('smarts', 4);
          game.stat('health', -3);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Assume it will pass, as it usually does',
        result: (game) => game.flags.family_parent_faded
          ? 'It passed, more or less. The word serious had been doing a lot of work.'
          : 'It did not pass. You had left the appointments to somebody else.',
        effect: (game) => {
          game.flags.family_parent_faded = game.rng.chance(50);
          if (game.flags.family_parent_faded) game.stat('happiness', 1);
          else {
            game.stat('happiness', -10);
            game.stat('health', -3);
          }
        }
      }
    ]
  },

  {
    id: 'family_support_parents',
    category: 'family',
    weight: 2,
    minAge: 24,
    maxAge: 75,
    once: false,
    require: (game) => game.parents().some((p) => !p.isDead) ? true : 'Both of your parents are gone.',
    text: 'Money does not stretch as far as it used to. Somebody in your family has quietly run out of it.',
    choices: [
      {
        label: 'Send what you can every month',
        result: 'You sent what you could every month. It never felt like enough and it was.',
        effect: (game) => {
          game.spend(cash(game, 400, 2500));
          for (const p of game.parents()) if (!p.isDead) game.rel(p, 18);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Take them to the food bank with you',
        result: 'You drove them to the food bank. The queue was long and neither of you said much.',
        effect: (game) => {
          for (const p of game.parents()) if (!p.isDead) game.rel(p, 10);
          game.stat('happiness', -2);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Keep your own money this time',
        result: 'You kept your own money. You have told yourself that was the practical choice.',
        effect: (game) => {
          for (const p of game.parents()) if (!p.isDead) game.rel(p, -20);
          game.stat('happiness', -5);
        }
      }
    ]
  },

  {
    id: 'family_parent_retirement',
    category: 'family',
    weight: 2,
    minAge: 45,
    maxAge: 80,
    once: true,
    require: (game) => game.parents().some((p) => !p.isDead && p.age >= 58) ? true : 'No parent is old enough to retire.',
    text: 'A parent has stopped working. It seems to have arrived without anyone planning it.',
    choices: [
      {
        label: 'Throw a party with more food than necessary',
        result: 'You threw a party with an unreasonable amount of food. Everybody came.',
        effect: (game) => {
          game.spend(cash(game, 300, 1500));
          for (const p of game.parents()) if (!p.isDead) game.rel(p, 18);
          game.stat('happiness', 6);
        }
      },
      {
        label: 'Tell them to keep working for their own good',
        result: 'You told them retirement was a trap. They have worked four more days out of spite.',
        effect: (game) => {
          for (const p of game.parents()) if (!p.isDead) game.rel(p, -12);
          game.stat('happiness', 1);
        }
      },
      {
        label: 'Let them sit in the chair they earned',
        result: 'You left them alone with it. They have mentioned it roughly once a week since.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'family_inheritance',
    category: 'family',
    weight: 2,
    minAge: 20,
    maxAge: 75,
    once: true,
    require: (game) => game.parents().some((p) => !p.isDead && p.age >= 65) ? true : 'Nobody is old enough to leave you anything.',
    text: 'A parent mentioned, as a hypothetical, what would happen to everything they own.',
    choices: [
      {
        label: 'Say you want none of it',
        result: 'You said you wanted none of it, which was generous and slightly untested.',
        effect: (game) => {
          for (const p of game.parents()) if (!p.isDead) game.rel(p, 16);
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Ask for it outright',
        result: 'You asked for it outright. They adjusted the paperwork the same week.',
        effect: (game) => {
          game.addMoney(cash(game, 5000, 60000));
          for (const p of game.parents()) if (!p.isDead) game.rel(p, -22);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Split it between the siblings',
        result: 'You suggested splitting it evenly. Nobody argued with you, which was suspicious.',
        effect: (game) => {
          game.addMoney(cash(game, 1000, 15000));
          for (const p of game.parents()) if (!p.isDead) game.rel(p, 14);
          if (game.siblings().length) game.rel(game.siblings().at(0), 12);
          game.stat('happiness', 4);
        }
      }
    ]
  },

  {
    id: 'family_in_laws',
    category: 'family',
    weight: 2,
    minAge: 22,
    maxAge: 65,
    once: true,
    require: (game) => Can.married(game) ? true : Needs.MARRIED,
    text: 'Your spouse family gathered for a holiday. The conversation turned to you, and stayed there.',
    choices: [
      {
        label: 'Be charming and patient for two days',
        result: 'You were charming for two days. They have not entirely stopped asking when you will get a real job.',
        effect: (game) => { game.rel(game.partner(), 8); game.stat('happiness', 3); game.stat('smarts', 2); }
      },
      {
        label: 'Let your spouse handle their own family',
        result: 'You let them handle it. From the kitchen, which is where the good food was.',
        effect: (game) => { game.rel(game.partner(), 4); game.stat('happiness', 1); }
      },
      {
        label: 'Say something that gets remembered',
        result: 'You said something that will be repeated at every gathering until one of you dies.',
        effect: (game) => { game.rel(game.partner(), -14); game.stat('fame', 3); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'family_first_child_years',
    category: 'family',
    weight: 3,
    minAge: 18,
    maxAge: 50,
    once: true,
    require: (game) => Can.parent(game) ? true : 'You do not have any children.',
    text: 'Your oldest has started talking without stopping, about everything, in the voice of a small person giving a report.',
    choices: [
      {
        label: 'Listen to all of it',
        result: 'You listened to all of it. You know more about the preschool politics than any adult should.',
        effect: (game) => { game.rel(game.children().at(0), 20); game.stat('happiness', 4); }
      },
      {
        label: 'Answer with better questions than they asked',
        result: 'You answered with better questions. They have been trying to work them out ever since.',
        effect: (game) => { game.rel(game.children().at(0), 14); game.stat('smarts', 3); }
      },
      {
        label: 'Let the other parent do this one',
        result: 'You let the other parent do this one. It was a considered delegation.',
        effect: (game) => { game.rel(game.children().at(0), -8); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'family_child_grades',
    category: 'family',
    weight: 3,
    minAge: 26,
    maxAge: 65,
    once: false,
    require: (game) => Can.parent(game) ? true : 'You do not have any children.',
    text: 'A report card arrived. The grades were, generously, mid-range.',
    choices: [
      {
        label: 'Sit down and work through it together',
        result: 'You worked through it together. They got less out of it than you did.',
        effect: (game) => { game.rel(game.children().at(0), 16); game.stat('smarts', 2); game.stat('happiness', 1); }
      },
      {
        label: 'Concentrate on the teacher being wrong',
        result: 'You explained at length why the teacher was the problem. They nodded politely.',
        effect: (game) => { game.rel(game.children().at(0), -16); game.stat('happiness', -2); }
      },
      {
        label: 'Announce to everyone that grades are not everything',
        result: 'You announced that grades are not everything, in front of several other parents.',
        effect: (game) => { game.rel(game.children().at(0), 8); game.stat('happiness', 3); game.stat('fame', -2); }
      }
    ]
  },

  {
    id: 'family_child_disaster',
    category: 'family',
    weight: 2,
    minAge: 24,
    maxAge: 60,
    once: true,
    require: (game) => Can.parent(game) ? true : 'You do not have any children.',
    text: 'Your child has done something serious enough that other people are involved now, and they have not told you which people.',
    choices: [
      {
        label: 'Get a lawyer before you say anything',
        require: (game) => game.canAfford(6000) ? true : Needs.MONEY(6000),
        result: 'You got a lawyer before you said a word. It was the single most useful thing you did that year.',
        effect: (game) => {
          game.spend(cash(game, 4000, 9000));
          game.rel(game.children().at(0), 14);
          game.stat('smarts', 4);
          game.stat('happiness', -4);
        }
      },
      {
        label: 'Shout until the whole story comes out',
        result: 'You shouted until the whole story came out. You learned most of it the hard way.',
        effect: (game) => { game.rel(game.children().at(0), -12); game.stat('happiness', -6); }
      },
      {
        label: 'Take the blame in front of everyone',
        result: 'You took it in front of everyone. It cost you and it was noted.',
        effect: (game) => { game.rel(game.children().at(0), 26); game.stat('fame', 3); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'family_child_moving_out',
    category: 'family',
    weight: 2,
    minAge: 32,
    maxAge: 75,
    once: true,
    require: (game) => game.children().some((c) => c.age >= 18) ? true : 'None of your children are grown yet.',
    text: (game) => `Your child ${game.children().find((c) => c.age >= 18)?.firstName ?? 'moved'} moved out, and the house went quiet in a way you were not ready for.`,
    choices: [
      {
        label: 'Help them set it up properly',
        result: 'You helped them set it up. You inspected the kitchen without saying why.',
        effect: (game) => {
          const kid = game.children().find((c) => c.age >= 18) ?? game.children().at(-1);
          game.spend(cash(game, 500, 4000));
          game.rel(kid, 20);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Let them figure it out completely alone',
        result: 'You let them figure it out alone. They did, mostly, eventually.',
        effect: (game) => { game.rel(game.children().at(-1), -10); game.stat('happiness', -3); game.stat('smarts', 2); }
      },
      {
        label: 'Call every week until they ask you to stop',
        result: 'You called every week until they asked you to stop. You have never been told it was too much.',
        effect: (game) => {
          const kid = game.children().find((c) => c.age >= 18) ?? game.children().at(-1);
          game.rel(kid, -6);
          game.stat('happiness', -2);
        }
      }
    ]
  },

  {
    id: 'family_child_wedding',
    category: 'family',
    weight: 2,
    minAge: 40,
    maxAge: 80,
    once: true,
    require: (game) => game.children().some((c) => c.age >= 18) ? true : 'None of your children are grown yet.',
    text: (game) => `Your child ${game.children().find((c) => c.age >= 18)?.firstName ?? 'is'} is getting married, and you have been put in charge of something.`,
    choices: [
      {
        label: 'Pay for the whole thing and say nothing',
        require: (game) => game.canAfford(20000) ? true : Needs.MONEY(20000),
        result: 'You paid for the whole thing and said nothing about it, which they found out anyway.',
        effect: (game) => {
          const kid = game.children().find((c) => c.age >= 18) ?? game.children().at(-1);
          game.spend(cash(game, 12000, 30000));
          game.rel(kid, 24);
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Help within reason and complain about it',
        result: 'You helped within reason and mentioned the invoice four separate times.',
        effect: (game) => {
          const kid = game.children().find((c) => c.age >= 18) ?? game.children().at(-1);
          game.spend(cash(game, 800, 4000));
          game.rel(kid, 8);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Give advice they did not ask for',
        result: 'You gave advice they had not asked for, at length, in front of guests.',
        effect: (game) => {
          const kid = game.children().find((c) => c.age >= 18) ?? game.children().at(-1);
          game.rel(kid, -14);
          game.stat('happiness', -2);
        }
      }
    ]
  },

  {
    id: 'family_grandchildren',
    category: 'family',
    weight: 2,
    minAge: 42,
    maxAge: 80,
    once: true,
    require: (game) => game.children().some((c) => c.age >= 18) ? true : 'None of your children are grown yet.',
    text: 'You have a grandchild. You are older than you expected to be, and more nervous about it than you were about your own.',
    choices: [
      {
        label: 'Be there every week without fail',
        result: 'You were there every week. The child has no idea you are nearly always late.',
        effect: (game) => {
          const kid = game.children().find((c) => c.age >= 18) ?? game.children().at(-1);
          game.stat('happiness', 9);
          game.stat('health', -2);
          game.rel(kid, 14);
        }
      },
      {
        label: 'Buy more than the child can use',
        result: 'You bought more than a small person can use. The small person uses all of it.',
        effect: (game) => {
          game.spend(cash(game, 300, 2500));
          game.stat('happiness', 6);
          game.stat('fame', 1);
        }
      },
      {
        label: 'Keep a respectful distance',
        result: 'You kept a respectful distance. It has been respected by everybody.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'family_reunion',
    category: 'family',
    weight: 2,
    minAge: 20,
    maxAge: 78,
    once: false,
    text: 'The whole family gathered in one room. Everyone had been expecting this and nobody had prepared for it.',
    choices: [
      {
        label: 'Cook for everyone',
        result: 'You cooked for everyone. Two arguments were settled entirely by the food.',
        effect: (game) => {
          game.spend(cash(game, 100, 800));
          game.stat('happiness', 5);
          game.stat('health', -1);
        }
      },
      {
        label: 'Ask the questions everyone is avoiding',
        result: 'You asked the questions everyone had been avoiding. It cleared the air and started two more arguments.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 3); }
      },
      {
        label: 'Stay in the kitchen the entire time',
        result: 'You stayed in the kitchen the entire time. Somebody always does.',
        effect: (game) => { game.stat('happiness', 1); game.stat('health', -1); }
      }
    ]
  },

  {
    id: 'family_holiday_alone',
    category: 'family',
    weight: 2,
    minAge: 30,
    maxAge: 80,
    once: false,
    text: 'Everybody else had plans. You had a free day and nobody to spend it with.',
    choices: [
      {
        label: 'Invite people round anyway',
        result: 'You invited people round at short notice. Four of them came and brought things.',
        effect: (game) => { game.stat('happiness', 5); game.stat('smarts', 1); }
      },
      {
        label: 'Book something expensive and go alone',
        require: (game) => game.canAfford(3000) ? true : Needs.MONEY(3000),
        result: 'You went alone, deliberately, and it was better than it had any right to be.',
        effect: (game) => { game.spend(cash(game, 600, 2500)); game.stat('happiness', 6); }
      },
      {
        label: 'Stay in and let everybody know',
        result: 'You stayed in and made sure everybody knew about it.',
        effect: (game) => game.stat('happiness', -4)
      }
    ]
  }
]);