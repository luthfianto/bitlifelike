/*
 * Prison events — everything that happens while you are inside.
 *
 * Every event in this file is gated on game.jailed, so none of it can leak
 * into ordinary life even if the pool routing changes. Year.tickPrisonYear
 * skips career, education and health entirely, which is why the only stat that
 * reliably improves in here is prisonFitness.
 *
 * Prison.serveYear owns the yearly tick (parole, decay, release) and is called
 * by the pipeline, so nothing in this file calls it.
 */
EventEngine.register([
  {
    id: 'prison_cellmate',
    category: 'prison',
    weight: 4,
    minAge: 10,
    maxAge: 100,
    once: true,
    require: (game) => game.jailed,
    text: 'They put a stranger in the other bunk and told you both to work it out.',
    choices: [
      {
        label: 'Try to get along',
        result: 'He turned out to be tolerable, and then helpful, which in here counts as a personality.',
        effect: (game) => {
          const p = game.addPerson({ type: 'coworker', age: game.age + game.rng.int(-4, 6), relationship: 45, isJailed: true, jailYears: game.jailYears });
          game.rel(p, 15);
        }
      },
      {
        label: 'Say nothing and sleep facing the wall',
        result: 'The arrangement held for years without a single conversation.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Make it clear who has been here longer',
        result: 'You said one sentence about the building and the conversation stopped for a week.',
        effect: (game) => { game.stat('prisonFitness', 2); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'prison_gang_recruit',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: true,
    require: (game) => game.jailed,
    text: 'A group that runs the wing asked whether you were in with them, which was not really a question.',
    choices: [
      {
        label: 'Join them',
        result: 'You joined. For a while that meant protection, and later it meant owing money you had not borrowed.',
        effect: (game) => { game.stat('happiness', 2); game.criminalRecord = Format.clamp(game.criminalRecord + 4, 0, 100); }
      },
      {
        label: 'Refuse',
        result: 'You said no in front of enough people that it stuck. It also cost you a year of easy evenings.',
        effect: (game) => game.stat('happiness', -4)
      },
      {
        label: 'Join for now, quit later',
        result: 'You said yes and started keeping a note of everything, which is what everybody does and nobody admits.',
        effect: (game) => { game.stat('smarts', 3); game.setStat('happiness', game.stats.happiness - 2); }
      }
    ]
  },

  {
    id: 'prison_rival_crew',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: true,
    require: (game) => game.jailed,
    text: 'The group you did not join wants to know what you think of the other group, loudly.',
    choices: [
      {
        label: 'Say nothing',
        result: 'You kept your face empty. That answer is read as weakness, which is at least predictable.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Back the wrong one',
        result: 'You backed the group that lost. You were reminded of the choice several times that month.',
        effect: (game) => { game.stat('health', -7); game.stat('happiness', -4); }
      },
      {
        label: 'Tell them you are nobody',
        result: 'You made yourself small and uninteresting, which took work and mostly worked.',
        effect: (game) => { game.stat('happiness', -1); game.setStat('prisonFitness', game.stats.prisonFitness + 2); }
      }
    ]
  },

  {
    id: 'prison_escape_plan',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'There was talk about the fence line, the laundry truck and the eleven minutes when the lights go down.',
    choices: [
      {
        label: 'Go over the fence',
        result: (game) => Prison.tryEscape(game).text
      },
      {
        label: 'Work out the plan more carefully first',
        result: 'You drew it up on the back of a shopping list and then thought better of it.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', -1); }
      },
      {
        label: 'Keep your head down and serve the time',
        result: 'You kept your head down. The years went by at the rate years always go by.',
        effect: (game) => game.stat('prisonFitness', 2)
      }
    ]
  },

  {
    id: 'prison_parole_hearing',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: (game) =>
      Prison.paroleEligible(game)
        ? 'The parole board sat down and read your file out loud, including a part you had hoped was lost.'
        : 'You put in a request for parole. It came back marked not eligible, with a date attached.',
    choices: [
      {
        label: 'Put your case forward',
        require: (game) => Prison.paroleEligible(game) ? true : 'You are not eligible for parole yet.',
        result: (game) => {
          if (game.rng.chance(18 + game.stats.prisonFitness * 0.2)) {
            Prison.release(game, true);
            return 'The board let you out, on a licence you will have to keep for the rest of your life.';
          }
          game.jailYears = Math.max(1, game.jailYears);
          return 'The board thanked you for your time and set another date. The date is the whole punishment.';
        }
      },
      {
        label: 'Say as little as possible',
        result: 'You answered with one-word answers. It was a short hearing.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Get a letter from somebody outside',
        require: (game) => game.people.length > 0 ? true : Needs.FRIEND,
        result: 'A letter arrived with somebody name on it. It was read aloud to the board, which is not private, but it counted.',
        effect: (game) => {
          const p = someone(game);
          game.rel(p, 5);
          game.stat('happiness', 4);
        }
      }
    ]
  },

  {
    id: 'prison_guard_shakedown',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'An officer stopped by your bunk and mentioned, without asking, that a phone is not a thing you are supposed to have.',
    choices: [
      {
        label: 'Hand over the money you have',
        result: (game) => {
          const paid = Math.min(game.money, cash(game, 20, 400));
          game.addMoney(-paid);
          return paid > 0
            ? `You paid what you had, ${Format.money(paid)}, and the conversation ended there.`
            : 'You had nothing to pay with, which he had clearly expected.';
        },
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Say you know nothing',
        result: 'He wrote a report. Reports do not cost anything, which is what makes them dangerous.',
        effect: (game) => { game.jailYears = Math.max(1, game.jailYears + 1); game.stat('happiness', -4); }
      },
      {
        label: 'Tell him about the cellmate who sells tobacco',
        result: 'You gave him a name that was not entirely made up. He wrote that down instead, and looked pleased.',
        effect: (game) => game.stat('happiness', 3)
      }
    ]
  },

  {
    id: 'prison_kitchen_job',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'The kitchen needs two more hands and pays almost nothing, which is still more than nothing.',
    choices: [
      {
        label: 'Take the shift',
        result: 'You worked the early shift. The pay was insulting and the food was hot.',
        effect: (game) => { game.addMoney(cash(game, 15, 90)); game.stat('prisonFitness', 2); }
      },
      {
        label: 'Take the shift and pocket the extras',
        result: 'You worked the shift and pocketed what came out the back. Somebody eventually counted.',
        effect: (game) => { game.addMoney(cash(game, 80, 600)); game.setStat('happiness', game.stats.happiness - 3); }
      },
      {
        label: 'Stay in your cell',
        result: 'You lay in your cell listening to the extractor fan. It was not restful but it was quiet.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'prison_workshop_job',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'The workshop builds furniture badly and pays slightly better than the kitchen.',
    choices: [
      {
        label: 'Sign up for it',
        result: 'You learned to cut a straight line, which is the single most useful thing you did all year.',
        effect: (game) => { game.addMoney(cash(game, 25, 140)); game.stat('prisonFitness', 2); game.stat('happiness', 2); }
      },
      {
        label: 'Learn the machine properly',
        result: 'You spent a year learning a machine you will never legally use again. You are good at it.',
        effect: (game) => { game.stat('smarts', 5); game.stat('prisonFitness', 1); }
      },
      {
        label: 'Decline',
        result: 'You declined. The workshop roster filled up without you.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'prison_visiting_day',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: true,
    require: (game) => game.jailed,
    text: 'The visiting list came through and there was one name on it that you did not expect.',
    choices: [
      {
        label: 'Go to the visit',
        result: 'You had forty minutes, a plastic table and a person on the other side who had made the effort.',
        effect: (game) => {
          const p = game.partner() ?? game.peopleOf('parent')[0] ?? someone(game);
          if (p) game.rel(p, 12);
          game.stat('happiness', 8);
        }
      },
      {
        label: 'Send a message back instead',
        result: 'You sent three lines back. The reply took two months to arrive.',
        effect: (game) => { game.stat('happiness', -2); }
      },
      {
        label: 'Stay in your cell',
        result: 'You stayed where you were. Whatever they had come to say went unsaid.',
        effect: (game) => game.stat('happiness', -4)
      }
    ]
  },

  {
    id: 'prison_no_visit',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: true,
    require: (game) => game.jailed,
    text: 'The visiting day came and went. Nobody was on the list.',
    choices: [
      {
        label: 'Send a letter first',
        result: 'You wrote anyway, and something came back, months late and short.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Tell yourself they are busy',
        result: 'You told yourself they are busy. You have told yourself that a number of times now.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Let it go',
        result: 'You let it go, and the year closed over it without comment.',
        effect: (game) => { game.stat('happiness', -5); game.stat('prisonFitness', 1); }
      }
    ]
  },

  {
    id: 'prison_yard_fight',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'Somebody said something about you in the yard and a small crowd formed around the space.',
    choices: [
      {
        label: 'Hit first',
        result: 'You hit first and finished it, which is the only part of that you will enjoy remembering.',
        effect: (game) => { game.stat('health', -8); game.stat('prisonFitness', 3); game.stat('happiness', -1); }
      },
      {
        label: 'Take the beating',
        result: 'You took it. Two officers watched most of it and wrote it up as a mutual disturbance.',
        effect: (game) => { game.stat('health', -11); game.stat('happiness', -5); }
      },
      {
        label: 'Walk away while you still can',
        result: 'You walked away at a normal pace, which is the hardest version of that to do.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'prison_gym_time',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'The yard has a concrete slab, a bar and three men using it. That is the whole gym.',
    choices: [
      {
        label: 'Work out every single day',
        result: 'You lifted until something hurt and then lifted anyway. It is the one thing here that still belongs to you.',
        effect: (game) => { game.stat('prisonFitness', 4); game.stat('health', -1); }
      },
      {
        label: 'Train hard enough to matter',
        result: 'You trained properly for two hours a day. The other men noticed and left you alone.',
        effect: (game) => { game.stat('prisonFitness', 3); game.setStat('happiness', game.stats.happiness + 3); }
      },
      {
        label: 'Skip the gym',
        result: 'You spent the hour sitting on a bench. It turns out a year is a long time on a bench.',
        effect: (game) => game.stat('prisonFitness', -1)
      }
    ]
  },

  {
    id: 'prison_infirmary',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'Something in the wing was going around and it had reached you.',
    choices: [
      {
        label: 'Go to the infirmary',
        result: 'You were seen by a nurse who worked faster than anyone would treat you outside.',
        effect: (game) => { game.stat('health', 6); game.stat('happiness', 2); }
      },
      {
        label: 'Ride it out',
        result: 'You rode it out. It took nine days and you lost weight you could not spare.',
        effect: (game) => { game.stat('health', -12); game.stat('prisonFitness', 2); }
      },
      {
        label: 'Ask someone to get you something',
        require: (game) => game.peopleOf('coworker').length > 0 ? true : Needs.FRIEND,
        result: 'Somebody in your wing got you what you needed from outside, for a price that was fair by the standards in here.',
        effect: (game) => { game.stat('health', 8); game.addMoney(-cash(game, 20, 250)); }
      }
    ]
  },

  {
    id: 'prison_letter_home',
    category: 'prison',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'You had paper, a pen that worked, and a family that does not know what to say to you.',
    choices: [
      {
        label: 'Write the truth',
        result: 'You wrote all of it. The reply came back in four pages, which was more than you expected.',
        effect: (game) => { game.stat('happiness', 7); const p = someone(game); if (p) game.rel(p, 8); }
      },
      {
        label: 'Write that everything is fine',
        result: 'You wrote that everything was fine. Everyone in the letter wrote back that everything was fine.',
        effect: (game) => { game.stat('happiness', -1); const p = someone(game); if (p) game.rel(p, 3); }
      },
      {
        label: 'Do not write at all',
        result: 'You kept the paper. It is still folded in four in the back of a book.',
        effect: (game) => game.stat('happiness', -3)
      }
    ]
  },

  {
    id: 'prison_protection_rent',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'The group on the wing has a weekly arrangement with everyone who is not in it.',
    choices: [
      {
        label: 'Pay it',
        result: 'You paid what you had and what you had was almost nothing. The arrangement continued regardless.',
        effect: (game) => { game.addMoney(-Math.min(game.money, cash(game, 5, 80))); game.setStat('happiness', game.stats.happiness - 2); }
      },
      {
        label: 'Refuse to pay',
        result: 'You refused. The first week was loud and the second week they found somebody else to ask.',
        effect: (game) => { game.stat('health', -6); game.setStat('happiness', game.stats.happiness - 3); }
      },
      {
        label: 'Organise everyone who refuses',
        result: 'You got six other people to say no at the same time. It worked for a month, which was a month.',
        effect: (game) => { game.stat('happiness', 4); game.setStat('health', game.stats.health - 4); game.stat('prisonFitness', 2); }
      }
    ]
  },

  {
    id: 'prison_smuggled_phone',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'A phone turned up under your mattress and it was not yours, which is somehow still your problem.',
    choices: [
      {
        label: 'Take the blame',
        result: 'You said it was yours. Two years went on the sentence and everybody in the wing now knows you can be relied on.',
        effect: (game) => { game.jailYears = Math.max(1, game.jailYears + 2); game.stat('happiness', -3); }
      },
      {
        label: 'Point at somebody else',
        result: 'You pointed at someone. It worked for a month and then everybody worked out the shape of the lie.',
        effect: (game) => { game.stat('happiness', -1); const p = game.peopleOf('coworker')[0]; if (p) game.rel(p, -40); }
      },
      {
        label: 'Say nothing and wait',
        result: 'You said nothing. Nothing happened for a long time, which is not the same as nothing happening.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'prison_counsellor',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: true,
    require: (game) => game.jailed,
    text: 'A counsellor asked to see you and started with the sentence everyone starts with.',
    choices: [
      {
        label: 'Talk about it honestly',
        result: 'You talked for an hour about the thing you had not said out loud. It did not help, but it moved.',
        effect: (game) => { game.stat('happiness', 6); game.stat('health', 2); }
      },
      {
        label: 'Give them the routine answer',
        result: 'You gave the answer they expected. It was written down and never looked at again.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Refuse the session',
        result: 'You refused. They made a note of the refusal, which is all you got out of it.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'prison_education_class',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'A classroom in a Portakabin was offering a qualification nobody outside would ask about.',
    choices: [
      {
        label: 'Sign up',
        result: 'You sat the exam and passed it. It is the only certificate you have earned in the last decade.',
        effect: (game) => { game.stat('smarts', 7); game.stat('happiness', 3); }
      },
      {
        label: 'Drop in without signing up',
        result: 'You sat in the back for a few weeks. Nobody made you explain why you were there.',
        effect: (game) => game.stat('smarts', 4)
      },
      {
        label: 'Skip it',
        result: 'You skipped it. The years inside do not come with anything added to them afterwards.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'prison_solitary',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'You were put in a cell with the door on the other side of the wall, for reasons nobody wrote down.',
    choices: [
      {
        label: 'Serve it without a word',
        result: 'You did your time in the box. You came out of it quieter than you went in.',
        effect: (game) => { game.stat('happiness', -8); game.setStat('prisonFitness', game.stats.prisonFitness - 2); }
      },
      {
        label: 'Argue it every day',
        result: 'You appealed it in writing, once a week, for the entire length of it.',
        effect: (game) => { game.stat('happiness', -5); game.stat('smarts', 4); game.setStat('prisonFitness', game.stats.prisonFitness - 1); }
      },
      {
        label: 'Use it to train',
        result: 'With no book, no bench and no visitors, you had more empty hours than at any point in your life.',
        effect: (game) => { game.stat('prisonFitness', 5); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'prison_release_rumour',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'Somebody said the list is being rewritten this month and a name was read out in the wing.',
    choices: [
      {
        label: 'Start packing your things',
        result: 'You packed, and the list was rewritten without you. There was nothing to unpack but your dignity.',
        effect: (game) => game.stat('happiness', -7)
      },
      {
        label: 'Ignore the rumour',
        result: 'You ignored it. The rumour turned out to be true, for somebody two cells down.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Write to the board anyway',
        result: 'You wrote to the board anyway. The reply was procedural, polite and completely empty.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'prison_stash_search',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'The wing was searched from one end and they were a bunk away from yours.',
    choices: [
      {
        label: 'Get rid of anything before they get there',
        result: 'You had ninety seconds and a hole in the grounds. It worked and you think about it every search.',
        effect: (game) => { game.setStat('happiness', game.stats.happiness - 2); game.setStat('prisonFitness', game.stats.prisonFitness - 1); }
      },
      {
        label: 'Have nothing to hide',
        result: 'You had nothing. They went through your bunk anyway and left everything exactly where it was.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Point them at somebody else',
        result: 'You redirected them two cells down. The wing was quiet for a week and you made an enemy for a year.',
        effect: (game) => { const p = game.peopleOf('coworker')[0]; if (p) game.rel(p, -30); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'prison_inmate_debt',
    category: 'prison',
    weight: 2,
    minAge: 10,
    maxAge: 100,
    once: false,
    require: (game) => game.jailed,
    text: 'A man on the wing says you owe him from before. You have no idea what it is for, and neither does he.',
    choices: [
      {
        label: 'Pay what he asks',
        result: 'You paid a number that was invented, and the debt was settled at a cost you will still notice.',
        effect: (game) => { game.addMoney(-Math.min(game.money, cash(game, 30, 400))); game.stat('happiness', -2); }
      },
      {
        label: 'Argue it out',
        result: 'You argued it in front of everybody. It lasted an hour and the debt came back in a week.',
        effect: (game) => { game.stat('happiness', -4); game.setStat('prisonFitness', game.stats.prisonFitness + 1); }
      },
      {
        label: 'Take it to the one people listen to',
        result: 'You took it to the person everybody listens to. It was settled, permanently, for a reason nobody gave.',
        effect: (game) => game.stat('happiness', 2)
      }
    ]
  }
]);
