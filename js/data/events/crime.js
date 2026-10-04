/*
 * Crime events â€” the offers, the jobs, the informants and the rivals. Ages 10+.
 *
 * Every event here is gated with Can.notJailed, because Crime.commit can
 * sentence the player on the spot and the prison pool owns everything that
 * happens afterwards. The "go ahead" choices call Crime.commit and return its
 * own text as the result, which keeps the payout / bust / death reporting in
 * one place. After that call game.jailed may be true, so no choice may assume
 * the player is still free.
 */
EventEngine.register([
  {
    id: 'crime_candy_bar',
    category: 'crime',
    weight: 3,
    minAge: 10,
    maxAge: 15,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'You went into the corner shop with no money and came out with chocolate that was not yours.',
    choices: [
      {
        label: 'Walk out with it',
        result: (game) => Crime.commit(game, 'c_shoplift').text,
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Pay for it',
        result: 'You paid, and the chocolate cost more than it should have.',
        effect: (game) => game.addMoney(-Math.min(game.money, 3))
      },
      {
        label: 'Put it back and leave',
        result: 'You left the shop empty-handed and slightly annoyed at yourself.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'crime_school_tax',
    category: 'crime',
    weight: 2,
    minAge: 12,
    maxAge: 18,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'A boy two years older than you decided your lunch money was a community resource.',
    choices: [
      {
        label: 'Hand it over',
        result: 'You paid him every day for a month. He never said thank you and never was going to.',
        effect: (game) => { game.addMoney(-cash(game, 5, 25)); game.stat('happiness', -4); }
      },
      {
        label: 'Push back',
        result: 'You said no in front of everyone. It made you less popular and marginally harder to pick on.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Get a friend to report him',
        require: (game) => game.peopleOf('friend').length > 0 ? true : Needs.FRIEND,
        result: 'It reached a teacher by lunch. He got detention and stopped speaking to you entirely.',
        effect: (game) => { game.rel(someone(game), -22); }
      }
    ]
  },

  {
    id: 'crime_graffiti_tag',
    category: 'crime',
    weight: 2,
    minAge: 12,
    maxAge: 30,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'You had a can of paint and a wall with nobody standing near it.',
    choices: [
      {
        label: 'Sign it',
        result: 'It looked worse in daylight. The council photographed it for a report that nobody reads.',
        effect: (game) => {
          game.criminalRecord = Format.clamp(game.criminalRecord + 4, 0, 100);
          game.crimesCommitted++;
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Paint something with taste',
        require: (game) => game.stats.smarts > 45 ? true : Needs.SMARTS,
        result: 'A small crowd gathered. Two of them offered money for another one.',
        effect: (game) => { game.stat('fame', 5); game.addMoney(cash(game, 20, 250)); }
      },
      {
        label: 'Put the can back',
        result: 'You walked away clean and slightly disappointed in yourself.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'crime_crowd_pocket',
    category: 'crime',
    weight: 3,
    minAge: 12,
    maxAge: 65,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'The platform was packed. A wallet was hanging out of a stranger bag and nobody was looking at it.',
    choices: [
      {
        label: 'Take it',
        result: (game) => Crime.commit(game, 'c_pickpocket').text
      },
      {
        label: 'Say nothing',
        result: 'You watched it vanish into a coat instead. Not your business, and you kept it that way.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Warn the owner',
        result: 'They looked at you like you were the problem, then checked the bag. The wallet was already gone.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'crime_fence_stall',
    category: 'crime',
    weight: 3,
    minAge: 14,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'A man at a market stall offered you cash for a television and did not ask where it came from.',
    choices: [
      {
        label: 'Take the money',
        result: 'You left with cash and a new habit of not asking questions either.',
        effect: (game) => {
          game.addMoney(cash(game, 200, 1600));
          game.crimesCommitted++;
          game.criminalRecord = Format.clamp(game.criminalRecord + 5, 0, 100);
        }
      },
      {
        label: 'Ask where he gets his stock',
        result: 'He told you, in some detail. You wish he had not.',
        effect: (game) => { game.addMoney(cash(game, 200, 1600)); game.stat('smarts', 2); }
      },
      {
        label: 'Walk away',
        result: 'You left the set where it stood. He found another seller before you got home.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'crime_empty_house',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'The family on your street went away for a fortnight and left the side window unlatched.',
    choices: [
      {
        label: 'Go in after dark',
        result: (game) => Crime.commit(game, 'c_burglary').text
      },
      {
        label: 'Tell a neighbour instead',
        result: 'The neighbour called the police. You were thanked anonymously and never learned the family name.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Mind your own business',
        result: 'Nothing happened, which was the outcome you were aiming for.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'crime_hot_wire',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 65,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'A car sat outside a bar all night with the owner three drinks deep inside.',
    choices: [
      {
        label: 'Drive it away',
        result: (game) => Crime.commit(game, 'c_cartheft').text
      },
      {
        label: 'Wait until morning',
        result: 'In the morning there was a police car parked behind it. You never found out why.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Cover for the driver',
        result: 'You walked him home instead. It cost you the night and bought a certain amount of goodwill.',
        effect: (game) => {
          const p = game.addPerson({ type: 'friend', age: game.age + game.rng.int(1, 6), relationship: 55 });
          game.rel(p, 12);
        }
      }
    ]
  },

  {
    id: 'crime_lean_on_someone',
    category: 'crime',
    weight: 2,
    minAge: 14,
    maxAge: 55,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'Someone was walking home alone at night and you have been short this month.',
    choices: [
      {
        label: 'Strong arm them',
        result: (game) => Crime.commit(game, 'c_mugging').text
      },
      {
        label: 'Ask for a loan',
        result: 'They gave you twenty dollars and asked for it back next week, which is somehow worse.',
        effect: (game) => { game.addMoney(cash(game, 10, 40)); game.stat('happiness', -2); }
      },
      {
        label: 'Leave them alone',
        result: 'You kept walking. It cost you nothing but also gained you nothing.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'crime_back_room_deal',
    category: 'crime',
    weight: 2,
    minAge: 15,
    maxAge: 65,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'A man you half know said he could use somebody to move product around town.',
    choices: [
      {
        label: 'Say yes',
        result: (game) => Crime.commit(game, 'c_drugs').text
      },
      {
        label: 'Ask what it pays first',
        result: 'He told you a number that was good enough to be true and low enough to be believable.',
        effect: (game) => game.stat('smarts', 2)
      },
      {
        label: 'Decline politely',
        result: 'You said no. He said that was fine, which you did not believe.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'crime_forged_papers',
    category: 'crime',
    weight: 2,
    minAge: 18,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'Somebody offered you a folder of documents that all looked exactly official.',
    choices: [
      {
        label: 'Use them',
        result: (game) => Crime.commit(game, 'c_fraud').text
      },
      {
        label: 'Check them properly first',
        require: (game) => game.stats.smarts > 55 ? true : Needs.SMARTS,
        result: 'One date was wrong by nine years. You fixed it, charged a fee, and never went near a court.',
        effect: (game) => { game.addMoney(cash(game, 500, 4000)); game.stat('smarts', 3); }
      },
      {
        label: 'Report the folder',
        result: 'The police took it and wrote your name down. They were pleasant, which is somehow the worrying part.',
        effect: (game) => game.stat('happiness', 2)
      }
    ]
  },

  {
    id: 'crime_open_port',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 65,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'A machine across town had a port left open. You noticed. That is the whole problem.',
    choices: [
      {
        label: 'Go through it',
        result: (game) => Crime.commit(game, 'c_hacking').text
      },
      {
        label: 'Patch it and tell nobody',
        result: 'You closed the hole. Nobody noticed, nobody thanked you, nothing happened.',
        effect: (game) => { game.stat('smarts', 4); game.stat('happiness', 2); }
      },
      {
        label: 'Test it on your own account first',
        require: (game) => game.stats.smarts > 60 ? true : Needs.SMARTS,
        result: 'You proved it worked, took nothing, and wrote down exactly how in case you changed your mind.',
        effect: (game) => { game.stat('smarts', 6); game.setStat('happiness', game.stats.happiness - 2); }
      }
    ]
  },

  {
    id: 'crime_till_empty',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 65,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'You were in the queue with something in your jacket that made people move faster than usual.',
    choices: [
      {
        label: 'Use it',
        result: (game) => Crime.commit(game, 'c_armed').text
      },
      {
        label: 'Take it back out again',
        result: 'You left the shop empty-handed. The queue moved normally for the rest of the day.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Give the weapon to a friend',
        require: (game) => game.peopleOf('friend').length > 0 ? true : Needs.FRIEND,
        result: 'It went straight into a drawer in somebody else house, which is where it was always going to end up.',
        effect: (game) => { game.rel(someone(game), -12); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'crime_warehouse_fire',
    category: 'crime',
    weight: 1,
    minAge: 18,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'An empty warehouse was the answer to a problem that had been building for months.',
    choices: [
      {
        label: 'Light it',
        result: (game) => Crime.commit(game, 'c_arson').text,
        effect: (game) => game.log('You set the fire. There was a shift supervisor still inside.', 'crime')
      },
      {
        label: 'Find another way to settle it',
        result: 'You found another way. It took longer and cost you more, and nobody was hurt.',
        effect: (game) => { game.addMoney(-cash(game, 500, 5000)); game.stat('happiness', -1); }
      },
      {
        label: 'Talk to whoever it is instead',
        require: (game) => game.peopleOf('friend').length > 0 ? true : Needs.FRIEND,
        result: 'It turned out the problem was a misunderstanding about a phone bill. An expensive one.',
        effect: (game) => { game.rel(someone(game), 10); game.stat('happiness', 3); }
      }
    ]
  },

  {
    id: 'crime_protection_money',
    category: 'crime',
    weight: 2,
    minAge: 18,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord >= 20 ? true : 'Nobody on that street takes you seriously yet.'),
    text: 'A shop on your route was being broken into every few weeks until somebody started walking past at the right time.',
    choices: [
      {
        label: 'Start charging for it',
        result: (game) => Crime.commit(game, 'c_extort').text
      },
      {
        label: 'Do it for nothing, once',
        result: 'You stood there for free. The owner thanked you and paid you in pies, which is not the same thing.',
        effect: (game) => { game.stat('happiness', 2); game.stat('fame', 3); }
      },
      {
        label: 'Leave that street alone',
        result: 'You took a different route. The shop got robbed twice more and started closing early.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'crime_night_call',
    category: 'crime',
    weight: 1,
    minAge: 18,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord >= 15 ? true : 'You are not known well enough for that kind of work.'),
    text: 'A number you did not recognise rang at two in the morning and the person on it knew your name.',
    choices: [
      {
        label: 'Take the job',
        result: (game) => Crime.commit(game, 'c_hitman').text
      },
      {
        label: 'Refuse and hang up',
        result: 'You put the phone down. It rang again later, from a number that did not exist.',
        effect: (game) => game.stat('happiness', -3)
      },
      {
        label: 'Pass the name to the police',
        result: 'An officer wrote it down and told you to keep the phone. Nobody arrested you that night.',
        effect: (game) => { game.criminalRecord = Format.clamp(game.criminalRecord - 6, 0, 100); game.stat('happiness', 3); }
      }
    ]
  },

  {
    id: 'crime_whole_show',
    category: 'crime',
    weight: 1,
    minAge: 21,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord >= 30 ? true : 'You do not have the standing for this yet.'),
    text: 'Everyone below you was arguing about who ran what. Somebody put your name forward.',
    choices: [
      {
        label: 'Take the job',
        result: (game) => Crime.commit(game, 'c_organize').text
      },
      {
        label: 'Let somebody else have it',
        result: 'You said no and went home. The organisation you were part of was dismantled within a year anyway.',
        effect: (game) => { game.stat('happiness', 2); game.criminalRecord = Format.clamp(game.criminalRecord - 5, 0, 100); }
      },
      {
        label: 'Take the job and hire a lawyer',
        require: (game) => game.canAfford(25000) ? true : Needs.MONEY(25000),
        result: 'You paid a lawyer a great deal of money to plan for the worst, then took the job anyway.',
        effect: (game) => game.spend(25000)
      }
    ]
  },

  {
    id: 'crime_no_way_back',
    category: 'crime',
    weight: 1,
    minAge: 14,
    maxAge: 80,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'There was a person in the way, and then there was a plan for that person, and you were part of it.',
    choices: [
      {
        label: 'Do it',
        result: (game) => {
          const res = Crime.commit(game, 'c_murder');
          if (res.killed) game.die('Shot while committing a murder');
          return res.text;
        },
        effect: (game) => game.stat('happiness', -5)
      },
      {
        label: 'Pull out',
        result: 'You backed out at the last minute. The reason you gave was not believed, but it was allowed.',
        effect: (game) => { game.stat('happiness', 2); game.criminalRecord = Format.clamp(game.criminalRecord - 3, 0, 100); }
      },
      {
        label: 'Warn the person',
        result: 'They left town on a Thursday. You were not asked why, which was the closest thing to thanks you got.',
        effect: (game) => { game.stat('happiness', -2); game.stat('fame', 4); }
      }
    ]
  },

  {
    id: 'crime_wrong_man',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game) && (game.crimesCommitted > 0 ? true : 'You are not the sort of person this happens to.'),
    text: 'A job went exactly as planned until somebody mentioned a surname, and the surname opened a door you did not know existed.',
    choices: [
      {
        label: 'Give back what you took',
        result: 'You returned it in cash with an apology attached to no names. Nobody replied.',
        effect: (game) => {
          const back = Math.min(game.money, cash(game, 2000, 40000));
          game.addMoney(-back);
          game.stat('happiness', -1);
        }
      },
      {
        label: 'Disappear for a while',
        result: 'You used a different city for eight months. It worked, and it cost you everyone you knew.',
        effect: (game) => {
          for (const p of game.people) if (!p.isDead) game.rel(p, -6);
          game.stat('happiness', -3);
        }
      },
      {
        label: 'Stand behind it',
        result: 'You did nothing and nobody did anything either. The fear kept working in your favour for years.',
        effect: (game) => game.criminalRecord = Format.clamp(game.criminalRecord + 8, 0, 100)
      }
    ]
  },

  {
    id: 'crime_informant_offer',
    category: 'crime',
    weight: 2,
    minAge: 14,
    maxAge: 75,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord > 0 ? true : 'You are not on anybody list yet.'),
    text: 'Someone sat down across from you and said they knew things, and they know things about you.',
    choices: [
      {
        label: 'Sell what you know',
        result: 'You talked for an hour and left with an envelope. Your name came up in a briefing the same evening.',
        effect: (game) => {
          game.addMoney(cash(game, 2000, 30000));
          game.criminalRecord = Format.clamp(game.criminalRecord + 15, 0, 100);
        }
      },
      {
        label: 'Report them instead',
        result: 'You gave the police the description instead of the information. They arrested the wrong person by Friday.',
        effect: (game) => { game.criminalRecord = Format.clamp(game.criminalRecord - 10, 0, 100); game.stat('happiness', 2); }
      },
      {
        label: 'Say nothing at all',
        result: 'You told them nothing. They thanked you for your time and left, which was not reassuring.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'crime_witness_saw_you',
    category: 'crime',
    weight: 2,
    minAge: 14,
    maxAge: 75,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord > 0 ? true : 'Nobody has anything on you.'),
    text: 'A witness gave a description to a detective, and the description is wearing your face.',
    choices: [
      {
        label: 'Find the witness',
        result: 'You found where they worked and made an offer. They took it and moved to a town you cannot spell.',
        effect: (game) => { game.spend(Math.min(game.money, cash(game, 3000, 30000))); game.stat('happiness', 2); }
      },
      {
        label: 'Get a lawyer',
        require: (game) => game.canAfford(6000) ? true : Needs.MONEY(6000),
        result: 'The lawyer was slow, expensive and effective. The charge quietly disappeared in March.',
        effect: (game) => { game.spend(6000); game.criminalRecord = Format.clamp(game.criminalRecord - 8, 0, 100); }
      },
      {
        label: 'Wait it out',
        result: 'The case moved slowly and then it stopped. You spent a year not knowing which day it was.',
        effect: (game) => game.stat('happiness', -3)
      }
    ]
  },

  {
    id: 'crime_rival_crew',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 75,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord > 0 ? true : 'Nobody knows enough about you to have an opinion.'),
    text: 'A group that does not like you has been counting how often you cross their street.',
    choices: [
      {
        label: 'Meet them',
        result: 'You sat at a table for an hour. You came out with the street and something that felt like a warning.',
        effect: (game) => { game.stat('health', -6); game.stat('happiness', -3); game.criminalRecord = Format.clamp(game.criminalRecord + 3, 0, 100); }
      },
      {
        label: 'Back off the street',
        result: 'You stayed away for a year. It cost you income and saved you a hospital.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Bring in somebody from your side',
        require: (game) => game.peopleOf('friend').length > 0 ? true : Needs.FRIEND,
        result: 'You brought someone along, and the meeting ended early for both sides. The arrangement held for now.',
        effect: (game) => { game.rel(someone(game), -10); game.stat('happiness', 1); }
      }
    ]
  },

  {
    id: 'crime_older_mentor',
    category: 'crime',
    weight: 2,
    minAge: 12,
    maxAge: 32,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'An older man watched you handle something competently and decided to invest the rest of your life in you.',
    choices: [
      {
        label: 'Let him teach you',
        result: 'He taught you things that are still useful. Some of them are not the sort that appear in a job description.',
        effect: (game) => {
          game.addMoney(cash(game, 300, 3000));
          game.criminalRecord = Format.clamp(game.criminalRecord + 6, 0, 100);
          const p = game.addPerson({ type: 'coworker', age: game.age + game.rng.int(10, 22), relationship: 60, job: 'Fixer' });
          game.rel(p, 15);
        }
      },
      {
        label: 'Keep it friendly but vague',
        result: 'You stayed friendly and committed to nothing. He noticed, and kept being friendly anyway.',
        effect: (game) => {
          const p = game.addPerson({ type: 'friend', age: game.age + game.rng.int(8, 20), relationship: 50, job: 'Fixer' });
          game.rel(p, 5);
        }
      },
      {
        label: 'Refuse him outright',
        result: 'You said no. He laughed, said everyone says no once, and became somebody you had to be careful around.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'crime_stash_house',
    category: 'crime',
    weight: 2,
    minAge: 18,
    maxAge: 70,
    once: true,
    require: (game) => Can.notJailed(game),
    text: 'Friends of yours asked to use a room at yours for a few days. They did not say what was in the room.',
    choices: [
      {
        label: 'Say yes',
        result: 'You said yes and were paid for it. The room was empty again in nine days and nobody visited you.',
        effect: (game) => { game.addMoney(cash(game, 1000, 20000)); game.criminalRecord = Format.clamp(game.criminalRecord + 9, 0, 100); }
      },
      {
        label: 'Say no',
        result: 'You said no. They found somewhere else and were fine, which was mildly insulting.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Say yes and search the room',
        require: (game) => game.stats.smarts > 50 ? true : Needs.SMARTS,
        result: 'There was a bag in the wardrobe that was not clothes. You photographed it and then sat on the information for a month.',
        effect: (game) => { game.addMoney(cash(game, 1000, 20000)); game.stat('smarts', 3); }
      }
    ]
  },

  {
    id: 'crime_go_straight',
    category: 'crime',
    weight: 2,
    minAge: 16,
    maxAge: 75,
    once: true,
    require: (game) => Can.notJailed(game) && (game.criminalRecord >= 20 ? true : 'You are not in a habit of needing to go straight.'),
    text: 'Something you did is catching up with you, and there was a window this year where it could have stopped there.',
    choices: [
      {
        label: 'Quit for good',
        result: 'You stopped, found honest work, and let a lawyer chip away at the record. It took years and it worked.',
        effect: (game) => {
          game.criminalRecord = Format.clamp(game.criminalRecord - 30, 0, 100);
          game.stat('happiness', 8);
          game.stat('fame', 2);
        }
      },
      {
        label: 'Move somewhere nobody knows you',
        result: 'You started over in a town with a different climate and the same problems.',
        effect: (game) => { game.criminalRecord = Format.clamp(game.criminalRecord - 12, 0, 100); game.stat('happiness', 3); }
      },
      {
        label: 'Carry on',
        result: 'You carried on. The window closed while you were deciding, as windows do.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  }
]);
