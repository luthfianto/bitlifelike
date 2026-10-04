/*
 * Generic events — weather, strangers, luck, small misadventures.
 *
 * These are the events that can land in any year of any life, so most of them
 * have no requirement beyond an age range. The three files that care about
 * particular states (crime.js, prison.js) gate hard; nothing here does, except
 * where a choice needs a job or a friend in order to make sense.
 */
EventEngine.register([
  {
    id: 'rnd_find_money',
    category: 'random',
    weight: 5,
    minAge: 6,
    maxAge: 100,
    once: false,
    text: 'You found money on the ground and nobody was watching, which is a rarer combination than it sounds.',
    choices: [
      {
        label: 'Keep it',
        result: 'You kept it. It was not much and you checked the same pocket four times anyway.',
        effect: (game) => game.addMoney(cash(game, 5, 250))
      },
      {
        label: 'Hand it in somewhere',
        result: 'You handed it in and were told there was a process. The process did not produce the money.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 1); }
      },
      {
        label: 'Look for whoever dropped it',
        result: 'You handed it to a very surprised man outside a shop. He insisted on shaking your hand for a full minute.',
        effect: (game) => { game.stat('happiness', 5); game.stat('fame', 1); }
      }
    ]
  },

  {
    id: 'rnd_lost_wallet',
    category: 'random',
    weight: 4,
    minAge: 8,
    maxAge: 95,
    once: false,
    text: 'Someone nearby had lost a wallet and was asking everybody, loudly, with a photograph that was hard to see.',
    choices: [
      {
        label: 'Check your pockets',
        result: 'It was in your coat. You handed it back and pretended you had just found it.',
        effect: (game) => game.stat('happiness', 4)
      },
      {
        label: 'Say you have not seen it',
        result: 'You said you had not seen it. You had, and you have thought about it on and off since.',
        effect: (game) => game.stat('happiness', -3)
      },
      {
        label: 'Help them look',
        result: 'You helped for ten minutes. It turned up in a bin, which means somebody else lied as well.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'rnd_heatwave',
    category: 'random',
    weight: 4,
    minAge: 5,
    maxAge: 100,
    once: false,
    text: 'It was the kind of hot that made every plan you had look like a mistake.',
    choices: [
      {
        label: 'Stay in and do nothing',
        result: 'You stayed in and did nothing at length. It was a surprisingly good use of a day.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Go out anyway',
        result: 'You went out. It was fine until about four in the afternoon.',
        effect: (game) => { game.stat('health', -5); game.stat('fitness', 2); game.setStat('happiness', game.stats.happiness + 2); }
      },
      {
        label: 'Check on somebody who is not coping',
        require: (game) => game.people.length > 0 ? true : Needs.FRIEND,
        result: 'You checked on an older relative for two afternoons. The conversation was mostly about the weather and it helped anyway.',
        effect: (game) => { game.rel(someone(game), 12); game.stat('happiness', 3); }
      }
    ]
  },

  {
    id: 'rnd_flat_tire',
    category: 'random',
    weight: 3,
    minAge: 16,
    maxAge: 95,
    once: false,
    text: 'A tyre went flat at the worst possible moment, which is the only kind of tyre problem there is.',
    choices: [
      {
        label: 'Change it yourself',
        result: 'You changed it on a verge in the rain and taught yourself four things about wheels.',
        effect: (game) => { game.stat('fitness', 3); game.stat('smarts', 2); game.setStat('happiness', game.stats.happiness - 1); }
      },
      {
        label: 'Call for help',
        require: (game) => game.canAfford(180) ? true : Needs.MONEY(180),
        result: 'It was fixed in forty minutes for an amount that felt personally aimed at you.',
        effect: (game) => game.spend(180)
      },
      {
        label: 'Walk the rest of the way',
        result: 'You walked. It was longer than the map suggested and you arrived very sure of yourself.',
        effect: (game) => { game.stat('fitness', 5); game.setStat('happiness', game.stats.happiness - 1); }
      }
    ]
  },

  {
    id: 'rnd_stranger_help',
    category: 'random',
    weight: 3,
    minAge: 8,
    maxAge: 100,
    once: false,
    text: 'A stranger did something unexpectedly decent for you and would not take anything for it.',
    choices: [
      {
        label: 'Say thank you properly',
        result: 'You said thank you properly, which is a thing people rarely bother to do.',
        effect: (game) => { game.stat('happiness', 5); game.stat('fame', 1); }
      },
      {
        label: 'Pay them anyway',
        result: 'You insisted on paying. They took a smaller amount than it was worth and looked pleased about it.',
        effect: (game) => game.addMoney(-cash(game, 5, 60))
      },
      {
        label: 'Pass the favour on',
        result: 'You did something decent for a stranger that week. Neither of you will ever meet again.',
        effect: (game) => game.stat('happiness', 4)
      }
    ]
  },

  {
    id: 'rnd_stranger_scam',
    category: 'random',
    weight: 3,
    minAge: 12,
    maxAge: 100,
    once: false,
    text: 'A stranger on the phone knew your name, your street and the name of your employer, and wanted a favour.',
    choices: [
      {
        label: 'Believe him',
        result: 'You believed him, and then the requests got larger, and then the phone number stopped working.',
        effect: (game) => { game.addMoney(-Math.min(game.money, cash(game, 100, 3000))); game.stat('happiness', -6); }
      },
      {
        label: 'Hang up and call the police',
        result: 'You hung up and called the number from your card. The officer took it more seriously than you expected.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 2); }
      },
      {
        label: 'Keep him on the line for fun',
        result: 'You kept him talking for nineteen minutes. He was surprisingly good company and you have no idea what he wanted.',
        effect: (game) => { game.stat('happiness', 4); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'rnd_free_food',
    category: 'random',
    weight: 3,
    minAge: 5,
    maxAge: 70,
    once: false,
    text: 'Somebody handed you food and would not explain why.',
    choices: [
      {
        label: 'Eat it',
        result: 'You ate all of it immediately and regretted nothing until later.',
        effect: (game) => { game.stat('happiness', 4); game.stat('health', 2); }
      },
      {
        label: 'Ask what it is',
        result: 'It was ordinary food, given away for ordinary reasons. You have thought about it more than is reasonable.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 1); }
      },
      {
        label: 'Give it away yourself',
        result: 'You passed it on before it went cold, which is the whole reason somebody gave it to you.',
        effect: (game) => { game.stat('happiness', 5); game.stat('fame', 1); }
      }
    ]
  },

  {
    id: 'rnd_lottery_ticket',
    category: 'random',
    weight: 2,
    minAge: 18,
    maxAge: 100,
    once: false,
    text: 'You bought a ticket for no particular reason, the way people do.',
    choices: [
      {
        label: 'Check the numbers',
        result: (game) => {
          const prize = game.rng.chance(2) ? cash(game, 5000, 250000) : cash(game, 5, 200);
          game.addMoney(prize);
          return prize >= 5000
            ? `You matched four numbers. It was ${Format.money(prize)}, which is not the same as winning.`
            : `Nothing. The ticket cost you the price of the ticket.`;
        }
      },
      {
        label: 'Do not check',
        result: 'You put it in a drawer and forgot about it, which is the correct strategy for almost everyone.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Buy a whole stack of them',
        require: (game) => game.canAfford(40) ? true : Needs.MONEY(40),
        result: 'You bought a stack and scratched them all on the kitchen table over two evenings.',
        effect: (game) => {
          game.spend(40);
          if (game.rng.chance(6)) {
            const win = cash(game, 200, 40000);
            game.addMoney(win);
            game.log(`You won ${Format.money(win)} on a scratch card.`, 'assets');
            game.stat('happiness', 10);
          } else {
            game.setStat('happiness', game.stats.happiness - 2);
          }
        }
      }
    ]
  },

  {
    id: 'rnd_power_cut',
    category: 'random',
    weight: 2,
    minAge: 5,
    maxAge: 100,
    once: false,
    text: 'The power went out for the night, along with everything that depends on it.',
    choices: [
      {
        label: 'Go to bed early',
        result: 'You went to bed at nine and slept better than you have in months.',
        effect: (game) => { game.stat('happiness', 3); game.stat('health', 2); }
      },
      {
        label: 'Go out and find somewhere with a plug',
        require: (game) => game.peopleOf('friend').length > 0 ? true : Needs.FRIEND,
        result: 'You turned up at a friend house with a bag of ice. It became a longer evening than planned.',
        effect: (game) => { game.rel(someone(game), 8); game.stat('happiness', 4); game.addMoney(-cash(game, 10, 60)); }
      },
      {
        label: 'Sit in the dark and do nothing',
        result: 'You sat in the dark for four hours. It was the quietest evening you can remember.',
        effect: (game) => { game.stat('happiness', 2); game.setStat('prisonFitness', game.stats.prisonFitness + 1); }
      }
    ]
  },

  {
    id: 'rnd_stray_animal',
    category: 'random',
    weight: 2,
    minAge: 6,
    maxAge: 85,
    once: false,
    text: 'Something followed you home and has not been persuaded to leave.',
    choices: [
      {
        label: 'Feed it and keep it',
        result: 'It stayed. It has opinions about the furniture and it is fed twice a day.',
        effect: (game) => { game.stat('happiness', 7); game.addMoney(-cash(game, 20, 200)); }
      },
      {
        label: 'Take it to the shelter',
        result: 'You drove it to the shelter and drove home with the windows down. Somebody else will have it now.',
        effect: (game) => { game.stat('happiness', 1); game.stat('smarts', 1); }
      },
      {
        label: 'Leave food out and close the door',
        result: 'You left food out for a fortnight. It kept coming back, entirely unbothered by the arrangement.',
        effect: (game) => game.stat('happiness', 3)
      }
    ]
  },

  {
    id: 'rnd_neighbour_noise',
    category: 'random',
    weight: 3,
    minAge: 14,
    maxAge: 100,
    once: false,
    text: 'The neighbours started making noise at an hour that felt personally designed to annoy you.',
    choices: [
      {
        label: 'Knock on the door',
        result: 'You knocked. They were apologetic, embarrassed and quiet for nine days.',
        effect: (game) => { game.stat('happiness', 2); game.setStat('health', game.stats.health - 1); }
      },
      {
        label: 'Start making noise back',
        result: 'You started at eleven. It escalated, and eleven has now replaced their hour as the problem.',
        effect: (game) => { game.setStat('happiness', game.stats.happiness - 3); game.stat('health', -1); }
      },
      {
        label: 'Buy earplugs',
        require: (game) => game.canAfford(20) ? true : Needs.MONEY(20),
        result: 'The earplugs solved it. Nothing about the situation changed except your sleep.',
        effect: (game) => { game.spend(20); game.stat('happiness', 3); game.stat('health', 2); }
      }
    ]
  },

  {
    id: 'rnd_awkward_run_in',
    category: 'random',
    weight: 2,
    minAge: 12,
    maxAge: 90,
    once: false,
    text: 'You ran into somebody from a long time ago in the exact place you had hoped nobody would see you.',
    choices: [
      {
        label: 'Say hello',
        result: 'It was fine for a minute and then it was not, and you both got off somehow.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Keep walking',
        result: 'You kept walking. They saw you, which meant the pretending had achieved nothing at all.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Invite them for a coffee',
        result: 'You bought the coffee. Two hours later you had caught up with a decade in forty minutes.',
        effect: (game) => { game.addMoney(-cash(game, 5, 40)); game.stat('happiness', 4); }
      }
    ]
  },

  {
    id: 'rnd_dentist',
    category: 'random',
    weight: 2,
    minAge: 8,
    maxAge: 100,
    once: false,
    text: 'A tooth had been making a point for a fortnight and the point had started to hurt.',
    choices: [
      {
        label: 'Book the appointment',
        require: (game) => game.canAfford(220) ? true : Needs.MONEY(220),
        result: 'It took forty minutes and cost what you expected. The relief was immediate and enormous.',
        effect: (game) => { game.spend(220); game.stat('health', 6); game.stat('happiness', 3); }
      },
      {
        label: 'Wait for it to pass',
        result: 'It passed. It took another month and you have a note in your head about that.',
        effect: (game) => { game.stat('health', -5); game.setStat('happiness', game.stats.happiness - 2); }
      },
      {
        label: 'Deal with it yourself',
        result: 'You dealt with it yourself, with pliers, in a bathroom, and it was a genuinely stupid decision.',
        effect: (game) => { game.stat('health', -9); game.stat('smarts', -2); }
      }
    ]
  },

  {
    id: 'rnd_horoscope',
    category: 'random',
    weight: 2,
    minAge: 14,
    maxAge: 85,
    once: false,
    text: 'A horoscope in a queue said something about your week that was a little too specific.',
    choices: [
      {
        label: 'Act on it',
        result: 'You acted on it. Nothing happened, which you found slightly insulting.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Read it for the good part only',
        result: 'You read the good part and skipped the rest, which is the entire skill.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Throw it away',
        result: 'You threw it away and then bought a paper on the way home, for reasons you could not defend.',
        effect: (game) => game.stat('smarts', 1)
      }
    ]
  },

  {
    id: 'rnd_flat_sale',
    category: 'random',
    weight: 2,
    minAge: 18,
    maxAge: 95,
    once: false,
    text: 'A shop was clearing stock at prices that made no sense for anything except urgency.',
    choices: [
      {
        label: 'Buy the thing you did not need',
        require: (game) => game.canAfford(120) ? true : Needs.MONEY(120),
        result: 'It was genuinely a good price on something you had no plan for. It is now in a cupboard.',
        effect: (game) => { game.spend(120); game.stat('happiness', 3); }
      },
      {
        label: 'Buy nothing and feel smug',
        result: 'You bought nothing and told everybody about it for a week.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Resell the discount online',
        require: (game) => game.canAfford(500) ? true : Needs.MONEY(500),
        result: 'You bought a crate of them and listed them the same night. The margin was thinner than the queue suggested.',
        effect: (game) => {
          game.spend(500);
          const out = game.rng.chance(55) ? cash(game, 300, 1600) : -cash(game, 50, 500);
          game.addMoney(out);
          game.log(`Your side project made you ${Format.money(out)}.`, 'assets');
        }
      }
    ]
  },

  {
    id: 'rnd_lost_keys',
    category: 'random',
    weight: 3,
    minAge: 16,
    maxAge: 95,
    once: false,
    text: 'You could not find your keys, and you were due back somewhere in forty minutes.',
    choices: [
      {
        label: 'Retrace every step',
        result: 'They were in a coat pocket from Tuesday. The last forty minutes were spent on relief.',
        effect: (game) => { game.stat('happiness', 1); game.setStat('smarts', game.stats.smarts + 1); }
      },
      {
        label: 'Pick the lock',
        result: 'You picked the lock in under a minute and stood in your own hallway feeling extremely pleased.',
        effect: (game) => game.stat('smarts', 3)
      },
      {
        label: 'Get a locksmith',
        require: (game) => game.canAfford(140) ? true : Needs.MONEY(140),
        result: 'A locksmith fixed it in four minutes and charged like it was four hours.',
        effect: (game) => { game.spend(140); game.setStat('happiness', game.stats.happiness - 1); }
      }
    ]
  },

  {
    id: 'rnd_social_trend',
    category: 'random',
    weight: 2,
    minAge: 13,
    maxAge: 50,
    once: false,
    text: 'Something you had never heard of became the only thing anyone at work would discuss.',
    choices: [
      {
        label: 'Get into it immediately',
        result: 'You were early, confident and slightly annoying about it for about a fortnight.',
        effect: (game) => { game.stat('fame', 4); game.setStat('happiness', game.stats.happiness - 1); }
      },
      {
        label: 'Let it pass over you',
        result: 'It passed over you entirely and you got on with the week.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Work out why it worked',
        result: 'You spent a week taking it apart to see what made it catch. It was a genuinely useful week.',
        effect: (game) => game.stat('smarts', 6)
      }
    ]
  },

  {
    id: 'rnd_coin_machine',
    category: 'random',
    weight: 2,
    minAge: 8,
    maxAge: 80,
    once: false,
    text: 'The change machine outside the shop swallowed a coin and gave back nothing but confidence.',
    choices: [
      {
        label: 'Feed it another one',
        result: 'It took three more and then gave you a dollar and a noise like a small appliance.',
        effect: (game) => game.addMoney(cash(game, 1, 40))
      },
      {
        label: 'Take it apart',
        result: 'You took it apart on a bench, learned how coin mechantry works, and lost a small spring.',
        effect: (game) => game.stat('smarts', 4)
      },
      {
        label: 'Walk away',
        result: 'You walked away. It is still there and it is still broken.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'rnd_spilled_coffee',
    category: 'random',
    weight: 2,
    minAge: 16,
    maxAge: 90,
    once: false,
    text: 'A full cup went across something that was not supposed to be ruined by coffee.',
    choices: [
      {
        label: 'Pay for it without arguing',
        result: 'You paid, cleaned it up, and left with your dignity and a stained sleeve.',
        effect: (game) => { game.addMoney(-cash(game, 10, 120)); game.stat('happiness', 1); }
      },
      {
        label: 'Try to save it with salt',
        result: 'The salt worked on the carpet and made the shirt a different problem entirely.',
        effect: (game) => { game.stat('happiness', -1); game.setStat('looks', game.stats.looks - 1); }
      },
      {
        label: 'Blame someone else',
        result: 'You looked at the nearest person until they accepted it. They did not, but it saved the ten seconds.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'rnd_old_photo',
    category: 'random',
    weight: 2,
    minAge: 25,
    maxAge: 100,
    once: false,
    text: 'You found a photograph of people you used to know and none of them are quite who you remember.',
    choices: [
      {
        label: 'Sit with it for a while',
        result: 'You looked at it for longer than you meant to and then put it in a drawer you know where it is.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 1); }
      },
      {
        label: 'Call one of them',
        require: (game) => game.peopleOf('friend').length > 0 ? true : Needs.FRIEND,
        result: 'You called. They picked up on the second ring and talked for an hour without once mentioning the photo.',
        effect: (game) => { game.rel(someone(game), 10); game.stat('happiness', 5); }
      },
      {
        label: 'Get rid of it',
        result: 'You threw it away. It was still in the bin the next day and you took it out again.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'rnd_bad_week',
    category: 'random',
    weight: 3,
    minAge: 10,
    maxAge: 100,
    once: false,
    text: 'Nothing in particular happened this week, all of it at once, for seven days.',
    choices: [
      {
        label: 'Push through it',
        result: 'You got through it. The week is gone and the next one did not notice.',
        effect: (game) => { game.stat('happiness', -3); game.stat('health', -2); }
      },
      {
        label: 'Do absolutely nothing about it',
        result: 'You gave the week up to the week. It was the correct decision and it did not feel like one.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Tell somebody how it is going',
        require: (game) => game.people.length > 0 ? true : Needs.FRIEND,
        result: 'You said it out loud to somebody who had been thinking the same thing about you for a month.',
        effect: (game) => { game.rel(someone(game), 12); game.stat('happiness', 5); }
      }
    ]
  },

  {
    id: 'rnd_good_run',
    category: 'random',
    weight: 3,
    minAge: 8,
    maxAge: 100,
    once: false,
    text: 'For about three weeks, things were simply going your way, with no effort involved at all.',
    choices: [
      {
        label: 'Enjoy it',
        result: 'You enjoyed it and did nothing to deserve it, which is the rarest part.',
        effect: (game) => game.stat('happiness', 8)
      },
      {
        label: 'Assume it is coming',
        result: 'You assumed it was coming, spent some of it, and went back to paying full price for everything.',
        effect: (game) => { game.addMoney(cash(game, 200, 4000)); game.setStat('happiness', game.stats.happiness - 2); }
      },
      {
        label: 'Save it',
        result: 'You put it aside. There is more of it there now than there was when the run started.',
        effect: (game) => { game.addMoney(cash(game, 500, 8000)); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'rnd_stranger_knock',
    category: 'random',
    weight: 2,
    minAge: 14,
    maxAge: 90,
    once: false,
    text: 'Somebody knocked at the door who did not say who they were and did not have an appointment.',
    choices: [
      {
        label: 'Open the door',
        result: 'It was a misdelivered parcel the size of a small animal. You were out of breath for no reason.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Ignore it',
        result: 'They went away. The knocking did not repeat, which solved the problem and left it open.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Ask through the door who it is',
        result: 'They answered politely, apologised, and left. It was the least dramatic possible knock.',
        effect: (game) => { game.stat('smarts', 2); game.setStat('happiness', game.stats.happiness - 1); }
      }
    ]
  },

  {
    id: 'rnd_pigeon',
    category: 'random',
    weight: 1,
    minAge: 5,
    maxAge: 95,
    once: false,
    text: 'A pigeon walked into the middle of a perfectly ordinary moment and stood there.',
    choices: [
      {
        label: 'Feed it',
        result: 'It took everything and left. You are fairly sure it will be back tomorrow.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Move it out of the way',
        result: 'You moved it out of the way. It waited until you had gone before doing the same thing again.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Follow it to see where it goes',
        result: 'You followed it for six streets. It went into a doorway and the doorway was a takeaway.',
        effect: (game) => { game.stat('happiness', 4); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'rnd_sudden_good_news',
    category: 'random',
    weight: 2,
    minAge: 16,
    maxAge: 100,
    once: false,
    text: (game) =>
      game.job
        ? `A letter arrived from ${game.job.company}, and the first line was not a complaint.`
        : 'A letter arrived with good news in it, which is a rarer event than losing money.',
    choices: [
      {
        label: 'Read it twice',
        result: 'You read it twice, then again in the evening, because the first two readings were not enough.',
        effect: (game) => game.stat('happiness', 9)
      },
      {
        label: 'Tell somebody immediately',
        require: (game) => game.people.length > 0 ? true : Needs.FRIEND,
        result: 'You told somebody within the hour. They were delighted for you in a way that was generous.',
        effect: (game) => { game.rel(someone(game), 8); game.stat('happiness', 5); }
      },
      {
        label: 'Suspect a mistake',
        result: 'You spent a week looking for the mistake. There was not one, which is worse somehow.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 1); }
      }
    ]
  }
]);
