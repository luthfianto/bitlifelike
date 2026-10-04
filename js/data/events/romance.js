/*
 * Romance and marriage, roughly ages 16-75.
 *
 * The relationship spine of a life: crushes, dates, the slow drift of a long
 * marriage, and whatever is left afterwards. Most events gate on marital status
 * so nothing fires for a player who is single, partnered, married, divorced or
 * widowed at the wrong moment. A handful are deliberately ungated so the file
 * always has something to say.
 */
EventEngine.register([
  {
    id: 'romance_first_crush',
    category: 'social',
    weight: 3,
    minAge: 15,
    maxAge: 19,
    once: true,
    text: 'Someone has taken up most of the available space in your head. You have said about four words to them all semester.',
    choices: [
      {
        label: 'Say nothing and quietly suffer',
        result: 'You said nothing for another year. It faded into a low hum you still hear occasionally.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      },
      {
        label: 'Tell them how you feel',
        result: (game) => game.maritalStatus === 'dating'
          ? 'They said yes. It is still slightly unreal, like a rumour about you.'
          : 'They said no, gently, which somehow made it worse than a flat refusal would have.',
        effect: (game) => {
          const p = game.peopleOf('friend')[0] ?? Relationships.meetFriend(game);
          if (game.rng.chance(45)) {
            game.rel(p, 45);
            Relationships.becomePartner(game, p);
          } else {
            game.rel(p, -15);
            game.stat('happiness', -5);
          }
        }
      },
      {
        label: 'Write it down and never send it',
        result: 'You filled three pages and deleted all of them.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'romance_first_date',
    category: 'social',
    weight: 3,
    minAge: 16,
    maxAge: 24,
    once: true,
    text: 'Someone asked you out. It is the first time, which is why you rehearsed the whole conversation in the shower.',
    choices: [
      {
        label: 'Pay for something nice',
        result: 'You paid, and were gracious about it, which is how you get asked again.',
        effect: (game) => {
          const p = game.peopleOf('friend')[0] ?? Relationships.meetFriend(game);
          game.spend(cash(game, 40, 180));
          Relationships.date(game, p);
        }
      },
      {
        label: 'Suggest a walk and something cheap',
        result: 'It cost almost nothing and went on much longer than either of you planned.',
        effect: (game) => {
          const p = game.peopleOf('friend')[0] ?? Relationships.meetFriend(game);
          game.spend(cash(game, 5, 20));
          Relationships.date(game, p);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Say no and stay in',
        result: 'You stayed in and watched something you had already seen twice.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'romance_rejected',
    category: 'social',
    weight: 2,
    minAge: 16,
    maxAge: 40,
    once: true,
    text: 'You asked someone out and they said no. They were kind about it, which turned out to be the worst part.',
    choices: [
      {
        label: 'Be gracious and wish them well',
        result: 'You wished them well and meant most of it. It cost you something.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 2); }
      },
      {
        label: 'Disappear from their life completely',
        result: 'You removed them from everything. It worked, efficiently and completely.',
        effect: (game) => game.stat('happiness', -4)
      },
      {
        label: 'Train until you stop thinking about it',
        result: 'You ran, lifted, sweated. The problem stayed, but quieter.',
        effect: (game) => { game.stat('fitness', 6); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'romance_unwanted_pursuer',
    category: 'social',
    weight: 2,
    minAge: 14,
    maxAge: 50,
    once: true,
    text: 'Someone you have no interest in has decided otherwise. The messages continue after you have asked them to stop.',
    choices: [
      {
        label: 'Block the number and say nothing more',
        result: 'Silence is apparently the answer they were missing. It worked.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Confront them in person',
        result: (game) => game.flags.romance_pursuer_confronted
          ? 'You said it plainly. They got the message, eventually, after an audience.'
          : 'It did not go the way you planned, and now they have an audience for it too.',
        effect: (game) => {
          if (game.rng.chance(55)) {
            game.flags.romance_pursuer_confronted = true;
            game.stat('happiness', 3);
          } else {
            game.flags.romance_pursuer_confronted = false;
            game.stat('happiness', -5);
          }
        }
      },
      {
        label: 'Hand it to a friend to deal with',
        result: 'A friend handled it with more confidence than you would have managed.',
        effect: (game) => { game.stat('happiness', 1); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'romance_bad_first_relationship',
    category: 'social',
    weight: 2,
    minAge: 16,
    maxAge: 30,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: 'You are seeing someone, and you have started explaining yourself before anyone asks. It has become a habit.',
    choices: [
      {
        label: 'Name the habit out loud',
        result: 'They said they had not noticed. They had noticed.',
        effect: (game) => { game.rel(game.partner(), 12); game.stat('happiness', 3); }
      },
      {
        label: 'Keep explaining yourself',
        result: 'You kept justifying every small decision. It did not help.',
        effect: (game) => { game.rel(game.partner(), -8); game.stat('happiness', -2); }
      },
      {
        label: 'End it before it becomes a habit',
        result: 'You ended it in a diner, which is a cheap place for a decision this size.',
        effect: (game) => Relationships.breakUp(game, 'You ended it in a diner, and meant it.')
      }
    ]
  },

  {
    id: 'romance_rough_patch',
    category: 'social',
    weight: 3,
    minAge: 18,
    maxAge: 70,
    once: false,
    require: (game) => (Can.partnered(game) || Can.married(game)) ? true : Needs.PARTNER,
    text: 'You had the same argument for the third time this month. Different trigger, identical silence afterwards.',
    choices: [
      {
        label: 'Actually talk it through this time',
        result: 'You got to the bottom of it. The bottom was less impressive than the shouting.',
        effect: (game) => { game.rel(game.partner(), 10); game.stat('happiness', 4); }
      },
      {
        label: 'Say the worst thing you can think of',
        result: 'You said it. You will be quoting it back at yourself for years.',
        effect: (game) => { game.rel(game.partner(), -18); game.stat('happiness', -7); }
      },
      {
        label: 'Stay at a friend place for a few nights',
        result: 'Three days away, and the house was exactly as you left it.',
        effect: (game) => { game.rel(game.partner(), -5); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'romance_jealous',
    category: 'social',
    weight: 2,
    minAge: 17,
    maxAge: 60,
    once: true,
    require: (game) => (Can.partnered(game) || Can.married(game)) ? true : Needs.PARTNER,
    text: 'An old flame messaged your partner. You read it over their shoulder twice before they noticed you doing it.',
    choices: [
      {
        label: 'Bring it up calmly at dinner',
        result: 'It turned out to be about a borrowed lawnmower. You apologised for an entire evening.',
        effect: (game) => { game.rel(game.partner(), 8); game.stat('happiness', 2); }
      },
      {
        label: 'Say nothing and stew for a month',
        result: 'A month of polite nothing, which was worse than an argument.',
        effect: (game) => game.stat('happiness', -5)
      },
      {
        label: 'Read every message on their phone tonight',
        result: 'You got through four years of messages in an hour and liked yourself less afterwards.',
        effect: (game) => { game.rel(game.partner(), -14); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'romance_long_distance',
    category: 'social',
    weight: 2,
    minAge: 18,
    maxAge: 45,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: 'The job that actually matters is two hundred miles away. So is the person you are seeing.',
    choices: [
      {
        label: 'Take the job and go long distance',
        result: 'You moved. The money improved and the goodbyes got longer.',
        effect: (game) => {
          game.addMoney(cash(game, 2000, 6000));
          game.rel(game.partner(), -8);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Follow them and pay to move',
        require: (game) => game.canAfford(3000) ? true : Needs.MONEY(3000),
        result: 'You followed. It cost more than expected and was worth it.',
        effect: (game) => {
          game.spend(cash(game, 1500, 4000));
          game.rel(game.partner(), 10);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Refuse to move and see if it survives',
        result: 'Neither of you moved. Neither of you said why, either.',
        effect: (game) => { game.rel(game.partner(), -4); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'romance_meet_the_parents',
    category: 'social',
    weight: 2,
    minAge: 18,
    maxAge: 45,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: 'You met the parents. They were polite in the specific way of people quietly deciding something about you.',
    choices: [
      {
        label: 'Charm them',
        result: (game) => (game.partner()?.relationship ?? 0) >= 70
          ? 'They warmed up entirely and asked about your plans, which is progress.'
          : 'It went fine. Fine is the most anyone can reasonably ask for.',
        effect: (game) => {
          if (game.rng.chance(55)) { game.rel(game.partner(), 14); game.stat('happiness', 4); game.stat('smarts', 2); }
          else { game.rel(game.partner(), 2); game.stat('happiness', -2); }
        }
      },
      {
        label: 'Answer every question honestly',
        result: 'You told them the truth about most things. It went better than you feared.',
        effect: (game) => { game.rel(game.partner(), 6); game.stat('happiness', 2); }
      },
      {
        label: 'Wait in the car until it is over',
        result: 'You spent the afternoon in a car park. They noticed.',
        effect: (game) => { game.rel(game.partner(), -8); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'romance_moving_in',
    category: 'social',
    weight: 2,
    minAge: 20,
    maxAge: 50,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: 'Your partner asked whether you wanted to stop paying rent on two places. The question was practical. It did not feel practical.',
    choices: [
      {
        label: 'Move in and split everything',
        result: 'One set of keys, one address, half the arguments about thermostat settings.',
        effect: (game) => {
          game.spend(cash(game, 800, 3500));
          game.rel(game.partner(), 6);
          game.stat('happiness', 8);
        }
      },
      {
        label: 'Keep your own place for another year',
        result: 'You kept the lease. It was expensive peace.',
        effect: (game) => { game.rel(game.partner(), -3); game.stat('happiness', -1); }
      },
      {
        label: 'Say no',
        result: 'You said no. The question came up again two weeks later.',
        effect: (game) => { game.rel(game.partner(), -7); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'romance_proposal',
    category: 'social',
    weight: 2,
    minAge: 20,
    maxAge: 65,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: 'The subject of marriage came up at dinner, sideways, in the middle of something else entirely.',
    choices: [
      {
        label: 'Buy the ring and ask properly',
        require: (game) => game.canAfford(12000) ? true : Needs.MONEY(12000),
        result: (game) => game.maritalStatus === 'engaged'
          ? 'They said yes before you got to the speech you had prepared.'
          : 'They were not ready. The ring is in a drawer now.',
        effect: (game) => Relationships.propose(game, game.partner())
      },
      {
        label: 'Ask them to wait another year',
        result: 'They agreed to wait. Waiting turned out to be the harder part.',
        effect: (game) => { game.rel(game.partner(), -5); game.stat('happiness', -2); }
      },
      {
        label: 'Propose with no ring at all',
        result: (game) => game.maritalStatus === 'engaged'
          ? 'No ring, no speech. They said yes, which was the only part that mattered.'
          : 'They said not yet, and then you had to keep eating dinner.',
        effect: (game) => {
          const p = game.partner();
          if (game.rng.chance(40)) {
            game.rel(p, 12);
            game.maritalStatus = 'engaged';
            game.log(`You proposed to ${p.firstName}.`, 'social');
          } else {
            game.rel(p, -14);
            game.stat('happiness', -6);
          }
        }
      }
    ]
  },

  {
    id: 'romance_wedding_day',
    category: 'social',
    weight: 2,
    minAge: 19,
    maxAge: 70,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: (game) => game.maritalStatus === 'engaged'
      ? 'The date is set. Everyone involved already owns a hat.'
      : 'You decided to get married before either of you had managed the word proposal.',
    choices: [
      {
        label: 'Spend real money on a real wedding',
        require: (game) => game.canAfford(25000) ? true : Needs.MONEY(25000),
        result: 'You married them in front of everyone you know. Two of them cried and one of them was you.',
        effect: (game) => Relationships.marry(game, game.partner())
      },
      {
        label: 'Courthouse, two witnesses, dinner after',
        require: (game) => game.canAfford(400) ? true : Needs.MONEY(400),
        result: 'It took twenty minutes. The dinner afterwards was better anyway.',
        effect: (game) => { game.spend(400); Relationships.marry(game, game.partner()); }
      },
      {
        label: 'Call the whole thing off',
        result: 'You called it off a week out. The deposits were non-refundable, which felt pointed.',
        effect: (game) => {
          Relationships.breakUp(game, 'You called off the wedding. Everyone had already booked travel.');
          game.stat('happiness', -8);
        }
      }
    ]
  },

  {
    id: 'romance_first_child',
    category: 'social',
    weight: 2,
    minAge: 20,
    maxAge: 55,
    once: true,
    require: (game) => Can.married(game) ? true : Needs.MARRIED,
    text: 'The conversation about children has been circling the house for months without ever quite landing.',
    choices: [
      {
        label: 'Start trying',
        require: (game) => game.canAfford(20000) ? true : Needs.MONEY(20000),
        result: (game) => game.flags.romance_baby_yes
          ? 'There is a baby in the house and neither of you has slept properly since.'
          : 'It did not work this time. You both pretended to be fine about it.',
        effect: (game) => { game.flags.romance_baby_yes = Relationships.tryForChild(game).ok; }
      },
      {
        label: 'Decide against having children',
        result: 'You decided against it, and the house got noticeably quieter and larger.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 1); }
      },
      {
        label: 'Say it is still too early',
        result: 'It is never too early, said nobody, including you.',
        effect: (game) => { game.stat('happiness', -2); game.rel(game.partner(), -3); }
      }
    ]
  },

  {
    id: 'romance_childfree',
    category: 'social',
    weight: 2,
    minAge: 26,
    maxAge: 60,
    once: true,
    require: (game) => (Can.married(game) && !Can.parent(game)) ? true : Needs.MARRIED,
    text: 'You said out loud, like adults, that you are not going to have children. There is no way to take it back afterwards.',
    choices: [
      {
        label: 'Agree enthusiastically',
        result: 'You agreed with yourself, out loud, and slept well for a month.',
        effect: (game) => game.stat('happiness', 6)
      },
      {
        label: 'Agree and quietly wonder about it',
        result: 'You agreed and then looked it up at two in the morning.',
        effect: (game) => { game.stat('happiness', 1); game.stat('smarts', 2); }
      },
      {
        label: 'Change the subject',
        result: 'You changed the subject. It came back around within the hour.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'romance_breakup',
    category: 'social',
    weight: 2,
    minAge: 17,
    maxAge: 60,
    once: true,
    require: (game) => Can.partnered(game) ? true : Needs.PARTNER,
    text: 'One of you ended it, and now there is a box in the hall and an evening ahead of you.',
    choices: [
      {
        label: 'End it yourself, cleanly',
        result: 'You ended it and did not look back at the box for a month.',
        effect: (game) => Relationships.breakUp(game, 'You broke up. It was cleaner than expected.')
      },
      {
        label: 'Try to fix it one more time',
        result: (game) => game.maritalStatus === 'single'
          ? 'It lasted another two weeks and then ended over nothing at all.'
          : 'You patched it up. Neither of you has mentioned the box in the hall since.',
        effect: (game) => {
          const p = game.partner();
          if (game.rng.chance(35)) {
            Relationships.breakUp(game, 'It did not survive the repair. You split two weeks later, over nothing.');
          } else {
            game.rel(p, 10);
            game.stat('happiness', -3);
          }
        }
      },
      {
        label: 'Agree to stay friends',
        result: 'You stayed friends. Being friends took considerably more effort than being together had.',
        effect: (game) => {
          const p = game.partner();
          Relationships.breakUp(game, 'You broke up and stayed on friendly terms, which nobody expects to work.');
          p.type = 'friend';
          p.relationship = Math.min(p.relationship, 40);
          game.stat('happiness', -3);
        }
      }
    ]
  },

  {
    id: 'romance_couple_routine',
    category: 'social',
    weight: 3,
    minAge: 24,
    maxAge: 78,
    once: false,
    require: (game) => (Can.partnered(game) || Can.married(game)) ? true : Needs.PARTNER,
    text: 'You and your partner have fallen into a routine. You could narrate each other week from memory and be right most of the time.',
    choices: [
      {
        label: 'Break the routine on purpose',
        require: (game) => game.canAfford(500) ? true : Needs.MONEY(500),
        result: 'You did something unpredictable. It worked, mostly.',
        effect: (game) => {
          game.spend(cash(game, 80, 500));
          game.rel(game.partner(), 9);
          game.stat('happiness', 5);
        }
      },
      {
        label: 'Take up something completely new together',
        result: (game) => game.flags.romance_new_hobby
          ? 'You both turned out to be good at it. There is now a version of you that exists at weekends.'
          : 'You both turned out to be bad at it. You kept at it anyway, which is most of it.',
        effect: (game) => {
          game.flags.romance_new_hobby = game.rng.chance(55);
          if (game.flags.romance_new_hobby) { game.rel(game.partner(), 12); game.stat('happiness', 6); game.stat('fitness', 2); }
          else { game.rel(game.partner(), -3); game.stat('happiness', -2); }
        }
      },
      {
        label: 'Leave it alone, it works',
        result: 'You left it alone. It does work, in the way a reliable appliance works.',
        effect: (game) => { game.stat('happiness', 1); game.stat('health', -1); }
      }
    ]
  },

  {
    id: 'romance_surprise',
    category: 'social',
    weight: 2,
    minAge: 20,
    maxAge: 78,
    once: false,
    require: (game) => (Can.partnered(game) || Can.married(game)) ? true : Needs.PARTNER,
    text: (game) => `You arranged something for ${game.partner()?.firstName ?? 'your partner'} without mentioning it in advance.`,
    choices: [
      {
        label: 'Something small and sincere',
        result: 'It was cheap and it landed. They kept the receipt in a drawer for years.',
        effect: (game) => {
          game.spend(cash(game, 30, 250));
          game.rel(game.partner(), 8);
          game.stat('happiness', 4);
        }
      },
      {
        label: 'Something enormous and expensive',
        require: (game) => game.canAfford(5000) ? true : Needs.MONEY(5000),
        result: 'It was absurd and photographed extensively. You regret the invoice and nothing else.',
        effect: (game) => {
          game.spend(cash(game, 4000, 9000));
          game.rel(game.partner(), 14);
          game.stat('happiness', 8);
        }
      },
      {
        label: 'Forget to mention it',
        result: 'You forgot to mention it, so they were surprised by the idea rather than the gift.',
        effect: (game) => game.stat('happiness', -3)
      }
    ]
  },

  {
    id: 'romance_affair',
    category: 'social',
    weight: 2,
    minAge: 24,
    maxAge: 68,
    once: true,
    require: (game) => Can.married(game) ? true : Needs.MARRIED,
    text: 'Someone has been extremely interested in you, and you have been extremely interested back. Your spouse has no idea.',
    choices: [
      {
        label: 'End it before it starts',
        result: 'You ended it before it started. That took more discipline than the relationship would have.',
        effect: (game) => { game.rel(game.partner(), 6); game.stat('happiness', 3); }
      },
      {
        label: 'See where it goes',
        result: (game) => game.flags.romance_romance_caught
          ? 'Somebody noticed within the year. The arguing has not really stopped since.'
          : 'It stayed a secret, and it made you difficult to be around at home.',
        effect: (game) => {
          const p = game.partner();
          game.flags.romance_romance_caught = game.rng.chance(50);
          if (game.flags.romance_romance_caught) { game.rel(p, -32); game.stat('happiness', -9); }
          else { game.rel(p, -6); game.stat('happiness', 9); }
        }
      },
      {
        label: 'Tell your spouse yourself',
        result: (game) => game.flags.romance_forgiven
          ? 'They took it badly, then forgave you. The forgiveness was harder than the fight.'
          : 'They did not take it badly. They were simply finished.',
        effect: (game) => {
          const p = game.partner();
          game.flags.romance_forgiven = game.rng.chance(45);
          if (game.flags.romance_forgiven) { game.rel(p, 6); game.stat('happiness', -3); }
          else { game.rel(p, -26); game.stat('happiness', -12); }
        }
      }
    ]
  },

  {
    id: 'romance_divorce',
    category: 'social',
    weight: 2,
    minAge: 22,
    maxAge: 78,
    once: true,
    require: (game) => Can.married(game) ? true : Needs.MARRIED,
    text: 'You both agreed it was time. Nobody plans for this, which is the only mercy in it.',
    choices: [
      {
        label: 'File the paperwork',
        require: (game) => game.canAfford(20000) ? true : Needs.MONEY(20000),
        result: (game) => game.maritalStatus === 'divorced'
          ? 'The divorce is final. You split everything, including the part that was your fault.'
          : 'The paperwork did not go through. You are still married.',
        effect: (game) => Relationships.divorce(game)
      },
      {
        label: 'Try counselling first',
        require: (game) => game.canAfford(3200) ? true : Needs.MONEY(3200),
        result: (game) => game.flags.romance_counselling
          ? 'A year of talking turned out to be worth more than a year of not. You stayed married.'
          : 'The counsellor was professional and the problem was still there at the end of it.',
        effect: (game) => {
          game.spend(3200);
          game.flags.romance_counselling = game.rng.chance(55);
          if (game.flags.romance_counselling) { game.rel(game.partner(), 16); game.stat('happiness', 3); }
          else { game.rel(game.partner(), -10); game.stat('happiness', -6); }
        }
      },
      {
        label: 'Stay together, for appearances',
        result: 'You stayed together for appearances. The appearances were maintained at both your expense.',
        effect: (game) => { game.rel(game.partner(), 4); game.stat('happiness', -6); }
      }
    ]
  },

  {
    id: 'romance_anniversary',
    category: 'social',
    weight: 2,
    minAge: 22,
    maxAge: 80,
    once: false,
    require: (game) => Can.married(game) ? true : Needs.MARRIED,
    text: (game) => `You and your spouse made it ${Math.max(1, game.year - (game.partner()?.metYear ?? game.year))} years together. You remembered, mostly.`,
    choices: [
      {
        label: 'Plan something and say nothing about it',
        require: (game) => game.canAfford(1500) ? true : Needs.MONEY(1500),
        result: 'They found out at the door. That part worked exactly as planned.',
        effect: (game) => {
          game.spend(cash(game, 600, 2000));
          game.rel(game.partner(), 10);
          game.stat('happiness', 6);
        }
      },
      {
        label: 'Admit that you forgot the date',
        result: 'You admitted you had forgotten, which was somehow worse and better.',
        effect: (game) => { game.rel(game.partner(), -6); game.stat('happiness', 2); }
      },
      {
        label: 'Redo the first date, badly',
        result: 'You redid the first date. The restaurant had changed and neither of you mentioned it.',
        effect: (game) => { game.rel(game.partner(), 7); game.stat('happiness', 4); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'romance_empty_nest',
    category: 'social',
    weight: 2,
    minAge: 45,
    maxAge: 80,
    once: true,
    require: (game) => Can.parent(game) ? true : 'You do not have any children.',
    text: 'The last one moved out. The house has more rooms than people in it now.',
    choices: [
      {
        label: 'Turn the spare room into something useful',
        result: 'You turned the spare room into a room you use. It worked.',
        effect: (game) => { game.stat('smarts', 5); game.stat('happiness', 3); }
      },
      {
        label: 'Travel with your spouse',
        require: (game) => Can.married(game) ? true : Needs.NOT_MARRIED,
        result: 'You went somewhere you had both wanted to go for twenty years.',
        effect: (game) => {
          game.spend(cash(game, 2000, 9000));
          game.rel(game.partner(), 10);
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Keep the room exactly as it was',
        result: 'You kept the room as it was. You went in less often than you meant to.',
        effect: (game) => { game.stat('happiness', -4); game.stat('health', -2); }
      }
    ]
  },

  {
    id: 'romance_online_dating',
    category: 'social',
    weight: 2,
    minAge: 18,
    maxAge: 58,
    once: true,
    require: (game) => ['single', 'divorced', 'widowed'].includes(game.maritalStatus) ? true : Needs.SINGLE,
    text: 'You downloaded an app. It took eleven minutes to establish that the pool is shallow.',
    choices: [
      {
        label: 'Give it a genuine go',
        result: (game) => game.maritalStatus === 'dating'
          ? 'You met someone who answered the questions, which is rarer than it should be.'
          : 'You met someone. Three dates in, you deleted the app anyway.',
        effect: (game) => {
          const gender = game.rng.pick(['male', 'female']);
          const p = game.addPerson({
            firstName: Names.firstName(game.rng, gender),
            lastName: Names.lastName(game.rng),
            gender,
            type: 'friend',
            age: Math.max(18, game.age + game.rng.int(-6, 6)),
            relationship: 45,
            happiness: game.rng.int(40, 80),
            job: game.rng.pick(Relationships.JOBS),
            netWorth: game.rng.int(0, 40000)
          });
          game.rel(p, 22);
          if (game.rng.chance(45)) Relationships.becomePartner(game, p);
        }
      },
      {
        label: 'Ask everyone you know to set you up',
        result: (game) => game.maritalStatus === 'dating'
          ? 'Somebody signed you up without asking. It worked, which was annoying.'
          : 'Three blind dates, none of whom were the person you were expecting.',
        effect: (game) => {
          for (let i = 0; i < 3; i++) Relationships.meetFriend(game);
          const p = game.peopleOf('friend').at(-1);
          if (p && game.rng.chance(35)) { game.rel(p, 20); Relationships.becomePartner(game, p); }
        }
      },
      {
        label: 'Delete it and claim you hate technology',
        result: 'You deleted it and told people you had never liked apps.',
        effect: (game) => { game.stat('happiness', 1); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'romance_late_start',
    category: 'social',
    weight: 2,
    minAge: 55,
    maxAge: 80,
    once: true,
    require: (game) => ['single', 'divorced', 'widowed'].includes(game.maritalStatus) ? true : Needs.SINGLE,
    text: 'Someone at the community centre asked whether you would like to do something on Sunday. Your first instinct was no.',
    choices: [
      {
        label: 'Say yes',
        result: 'You said yes, and then had to explain what you had been doing for the last thirty years.',
        effect: (game) => {
          const gender = game.rng.pick(['male', 'female']);
          const p = game.addPerson({
            firstName: Names.firstName(game.rng, gender),
            lastName: Names.lastName(game.rng),
            gender,
            type: 'partner',
            age: game.age + game.rng.int(-5, 5),
            relationship: 62,
            happiness: game.rng.int(55, 85),
            job: game.rng.pick(Relationships.JOBS),
            netWorth: game.rng.int(20000, 220000)
          });
          game.maritalStatus = 'dating';
          game.log(`You started seeing ${p.firstName}.`, 'social');
          game.stat('happiness', 9);
        }
      },
      {
        label: 'Say not this time',
        result: 'You said not this time. They said that was fine, and meant it, which was the worst part.',
        effect: (game) => { game.stat('happiness', -1); game.stat('smarts', 2); }
      },
      {
        label: 'Say yes, and tell everybody',
        result: 'You said yes and told everybody within a day. The phone did not stop.',
        effect: (game) => {
          const gender = game.rng.pick(['male', 'female']);
          const p = game.addPerson({
            firstName: Names.firstName(game.rng, gender),
            lastName: Names.lastName(game.rng),
            gender,
            type: 'partner',
            age: game.age + game.rng.int(-5, 5),
            relationship: 62,
            happiness: game.rng.int(55, 85),
            job: game.rng.pick(Relationships.JOBS),
            netWorth: game.rng.int(20000, 220000)
          });
          game.maritalStatus = 'dating';
          game.log(`You started seeing ${p.firstName}.`, 'social');
          game.stat('happiness', 12);
          game.stat('fame', 2);
        }
      }
    ]
  },

  {
    id: 'romance_remarry',
    category: 'social',
    weight: 2,
    minAge: 35,
    maxAge: 80,
    once: true,
    require: (game) => (game.maritalStatus === 'divorced' || game.maritalStatus === 'widowed') ? true : Needs.SINGLE,
    text: 'People keep asking whether you are seeing anyone. Lately you have been giving the question more thought than it deserves.',
    choices: [
      {
        label: 'Look properly this time',
        result: (game) => game.maritalStatus === 'dating'
          ? 'You took your time and then met someone worth the wait.'
          : 'You took your time. The time passed, as it does.',
        effect: (game) => {
          const gender = game.rng.pick(['male', 'female']);
          const p = game.addPerson({
            firstName: Names.firstName(game.rng, gender),
            lastName: Names.lastName(game.rng),
            gender,
            type: 'friend',
            age: game.age + game.rng.int(-5, 8),
            relationship: 58,
            happiness: game.rng.int(55, 85),
            job: game.rng.pick(Relationships.JOBS),
            netWorth: game.rng.int(10000, 250000)
          });
          game.rel(p, 25);
          if (game.rng.chance(60)) Relationships.becomePartner(game, p);
        }
      },
      {
        label: 'Stay single on purpose',
        result: 'You decided to stay single on purpose. The deciding was the enjoyable part.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 2); }
      },
      {
        label: 'Marry the first person who asks',
        result: (game) => game.flags.romance_hasty_marriage
          ? 'You married someone you had known six weeks. It has held, against the odds.'
          : 'You married someone you had known six weeks. It did not hold.',
        effect: (game) => {
          const gender = game.rng.pick(['male', 'female']);
          const p = game.addPerson({
            firstName: Names.firstName(game.rng, gender),
            lastName: Names.lastName(game.rng),
            gender,
            type: 'partner',
            age: game.age + game.rng.int(-6, 8),
            relationship: 62,
            happiness: game.rng.int(45, 80),
            job: game.rng.pick(Relationships.JOBS),
            netWorth: game.rng.int(5000, 300000)
          });
          game.flags.romance_hasty_marriage = game.rng.chance(50);
          if (game.flags.romance_hasty_marriage) {
            p.type = 'spouse';
            p.isMarried = true;
            p.spouseName = game.fullName;
            p.metYear = game.year;
            game.maritalStatus = 'married';
            game.legacy.marriages++;
            game.stat('happiness', 10);
            game.stat('fame', 2);
            game.log(`You married ${p.firstName}.`, 'social');
          } else {
            game.rel(p, -18);
            game.stat('happiness', -7);
          }
        }
      }
    ]
  },

  {
    id: 'romance_widowed',
    category: 'social',
    weight: 3,
    minAge: 35,
    maxAge: 85,
    once: true,
    require: (game) => game.maritalStatus === 'widowed' ? true : Needs.MARRIED,
    text: 'You buried your spouse this year. People brought food, which was kind, and casseroles with opinions about what you should do next.',
    choices: [
      {
        label: 'Take the whole year to grieve',
        result: 'You took the year. Nothing was fixed at the end of it, but you were less brittle.',
        effect: (game) => { game.stat('happiness', -9); game.stat('health', -4); }
      },
      {
        label: 'Go back to work immediately',
        result: 'You went back to work and were excellent at it, which nobody found comforting.',
        effect: (game) => {
          game.addMoney(cash(game, 3000, 20000));
          game.stat('happiness', -5);
          game.stat('health', -2);
        }
      },
      {
        label: 'Keep everything exactly where it was',
        result: 'You kept every object where it was. The house stayed honest and completely frozen.',
        effect: (game) => { game.stat('happiness', -3); game.stat('health', 1); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'romance_regret_about_ex',
    category: 'social',
    weight: 2,
    minAge: 28,
    maxAge: 78,
    once: true,
    require: (game) => game.peopleOf('ex').length > 0 ? true : 'You do not have an ex to look up.',
    text: (game) => `You found an old photo of you and ${game.peopleOf('ex')[0]?.firstName ?? 'someone'} while looking for something else entirely.`,
    choices: [
      {
        label: 'Burn it',
        result: 'You burned it in the sink, which did not help nearly as much as you expected.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 2); }
      },
      {
        label: 'Look up how they are doing',
        result: 'They are doing well. That was the least welcome piece of information of the year.',
        effect: (game) => { game.rel(game.peopleOf('ex').at(0), 8); game.stat('happiness', -3); }
      },
      {
        label: 'Put it back and carry on',
        result: 'You put it back in the box. You did not look at it again that year.',
        effect: (game) => game.stat('happiness', 2)
      }
    ]
  }
]);