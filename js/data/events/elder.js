/*
 * Old age, roughly 60-100: retirement, family, the slow parts, and the
 * paperwork at the end of it.
 *
 * Same contract as childhood.js. Two rules that matter more here:
 *   - Every event is gated at minAge 60 or above, so nothing in this file can
 *     fire during a working life.
 *   - Retirement and treatment go through the real subsystems (Career.retire,
 *     Health, Portfolio.sell, Relationships.interact) rather than faking the
 *     numbers. A choice effect runs BEFORE its result, so any copy that
 *     depends on how the call went is stashed on game.flags and read back.
 */
EventEngine.register([
  {
    id: 'elder_retire_now',
    category: 'career',
    weight: 3,
    minAge: 60,
    maxAge: 70,
    once: true,
    require: (game) => (Can.job(game) ? true : Needs.JOB),
    text: (game) => `Your job has started mentioning next year, in a tone that means now. ${game.job ? `You are still the ${game.job.title} here.` : ''}`.trim(),
    choices: [
      {
        label: 'Retire at the end of the month',
        result: (game) => (game.flags['elder:retired'] ?? 'Nothing changed.'),
        effect: (game) => { game.flags['elder:retired'] = Career.retire(game).text; }
      },
      {
        label: 'Ask to stay on part-time',
        result: 'You kept the title and roughly half the days. Nobody could say that you had left.',
        effect: (game) => {
          if (game.job) game.job.salary = Math.round(game.job.salary * 0.6);
          game.stat('happiness', 5);
          game.stat('health', 2);
          game.log('You moved to part-time at the same job.', 'career');
        }
      },
      {
        label: 'Not yet',
        result: 'You said not yet, and then worked through the weekend again to prove a point to nobody.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'elder_retire_late',
    category: 'career',
    weight: 2,
    minAge: 63,
    maxAge: 78,
    once: false,
    require: (game) => (Can.job(game) ? true : Needs.JOB),
    text: 'You are still working, and the arithmetic about pensions has started keeping you awake in a way that money has not for years.',
    choices: [
      {
        label: 'Work another two years',
        result: 'Two more years and a bonus that was described as a thank you. Your back has its own view of the arrangement.',
        effect: (game) => { game.addMoney(cash(game, 8000, 45000)); game.stat('health', -8); game.stat('happiness', -2); }
      },
      {
        label: 'Retire before your body makes the decision',
        result: (game) => (game.flags['elder:retired2'] ?? 'Nothing changed.'),
        effect: (game) => { game.flags['elder:retired2'] = Career.retire(game).text; }
      },
      {
        label: 'Cut the hours, keep the desk',
        result: 'You negotiated four days and a decent handshake. You are still on the staff email, which is the point.',
        effect: (game) => {
          if (game.job) game.job.salary = Math.round(game.job.salary * 0.7);
          game.stat('happiness', 4);
          game.stat('health', 3);
        }
      }
    ]
  },

  {
    id: 'elder_grandchild',
    category: 'family',
    weight: 3,
    minAge: 60,
    maxAge: 88,
    once: true,
    require: (game) => (Can.parent(game) ? true : 'You do not have any children.'),
    text: 'A grandchild arrived, and is small enough that being handed one is the entire event.',
    choices: [
      {
        label: 'Take one every weekend without fail',
        result: 'Every Saturday, on time, for years. You are a fixed part of the schedule and you will be missed when it stops.',
        effect: (game) => {
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, 18);
          game.stat('happiness', 12);
          game.stat('health', -2);
        }
      },
      {
        label: 'Buy things for them instead of turning up',
        result: 'The house is full of things for a child who already has a bicycle. They said thank you, politely, twice.',
        effect: (game) => { game.spend(cash(game, 500, 2500)); game.stat('happiness', 4); }
      },
      {
        label: 'Hold them once and hand them straight back',
        result: 'You held them for four minutes, said something you had planned, and went back to your own afternoon.',
        effect: (game) => { game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'elder_babysit',
    category: 'family',
    weight: 2,
    minAge: 62,
    maxAge: 84,
    once: false,
    require: (game) => (Can.parent(game) ? true : 'You do not have any children.'),
    text: 'One of your children has asked whether you could look after the small one a few hours a week. The answer is yes, obviously.',
    choices: [
      {
        label: 'Agree to everything, immediately',
        result: 'You said yes to all of it before the sentence had finished. Your back has been very good about it.',
        effect: (game) => { game.stat('happiness', 9); game.stat('health', -3); }
      },
      {
        label: 'Agree to some of it',
        result: 'You negotiated Wednesdays and one weekend a month, which is a more sensible arrangement and slightly less happy.',
        effect: (game) => { game.stat('happiness', 5); game.stat('health', 1); }
      },
      {
        label: 'Suggest they manage on their own',
        result: 'You said they were perfectly capable. They were, and they did not ring back for some months.',
        effect: (game) => {
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, -12);
          game.stat('happiness', -3);
        }
      }
    ]
  },

  {
    id: 'elder_child_distant',
    category: 'family',
    weight: 2,
    minAge: 63,
    maxAge: 96,
    once: false,
    require: (game) => (Can.parent(game) ? true : 'You do not have any children.'),
    text: 'One of your children has stopped coming round. The reasons are ordinary, and you are not certain which of them applies.',
    choices: [
      {
        label: 'Ring every week, without fail',
        result: (game) => (game.flags['elder:kin']
          ? `You kept the phone going. ${game.flags['elder:kin']} picked up, eventually, and stayed on for forty minutes.`
          : 'You kept the phone going. It was picked up, eventually.'),
        effect: (game) => {
          const kid = game.rng.pick(game.children());
          if (kid) { game.rel(kid, 12); game.flags['elder:kin'] = kid.firstName; }
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Get in the car and go to them',
        require: (game) => (game.canAfford(600) ? true : Needs.MONEY(600)),
        result: 'You drove four hours for a Sunday lunch. They were glad to see you and slightly surprised.',
        effect: (game) => {
          game.spend(600);
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, 15);
          game.stat('happiness', 5);
        }
      },
      {
        label: 'Accept it and stop expecting visits',
        result: 'You stopped expecting visits, which is a kind of peace and not the kind you wanted.',
        effect: (game) => { game.stat('happiness', -5); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'elder_move_closer',
    category: 'family',
    weight: 1,
    minAge: 65,
    maxAge: 92,
    once: true,
    require: (game) => (Can.parent(game) ? true : 'You do not have any children.'),
    text: 'The practical question of where you live has quietly grown a right answer.',
    choices: [
      {
        label: 'Move closer to the family',
        require: (game) => (game.canAfford(30000) ? true : Needs.MONEY(30000)),
        result: 'You moved within an hour of them. Sunday lunch now happens on a normal Sunday, which was the whole point.',
        effect: (game) => {
          game.spend(30000);
          game.stat('happiness', 10);
          game.stat('health', 2);
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, 10);
        }
      },
      {
        label: 'Stay and travel instead',
        result: 'You kept the house and bought a better car for the driving. The car is excellent and rarely used.',
        effect: (game) => { game.spend(2000); game.stat('happiness', 2); }
      },
      {
        label: 'Stay exactly where you are',
        result: 'You stayed. The house has thirty years of your decisions in it and you are not ready to unpack again.',
        effect: (game) => { game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'elder_slowdown',
    category: 'health',
    weight: 4,
    minAge: 62,
    maxAge: 98,
    once: false,
    text: 'You got up the stairs without stopping this time, and then stood at the bottom waiting to see whether you would need to.',
    choices: [
      {
        label: 'Accept it and plan around it',
        result: 'You started putting things where they were already going. It is not a defeat, it is a spreadsheet.',
        effect: (game) => { game.stat('happiness', 3); game.stat('health', -2); }
      },
      {
        label: 'Refuse all of it and push on',
        result: 'You pushed on. The body took that as a formal challenge and has been keeping score.',
        effect: (game) => { game.stat('health', -6); game.stat('fitness', -3); }
      },
      {
        label: 'Book a full check-up',
        require: (game) => (game.canAfford(400) ? true : Needs.MONEY(400)),
        result: 'You went for a full check-up. They found one thing, sorted it, and told you to come back next year.',
        effect: (game) => { game.spend(400); game.stat('health', 3); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'elder_joints',
    category: 'health',
    weight: 3,
    minAge: 60,
    maxAge: 96,
    once: false,
    text: 'Your joints have started a running commentary on hills. They were not this talkative before.',
    choices: [
      {
        label: 'See somebody about it',
        require: (game) => (game.canAfford(900) ? true : Needs.MONEY(900)),
        result: 'You paid for the appointment and the advice. The advice was: keep moving, and be less interested in hills.',
        effect: (game) => { game.spend(900); game.stat('health', 4); game.stat('fitness', -1); }
      },
      {
        label: 'Buy supplements from the internet',
        require: (game) => (game.canAfford(150) ? true : Needs.MONEY(150)),
        result: 'You bought three months of tablets from a site with a picture of a doctor who is not a doctor.',
        effect: (game) => { game.spend(150); game.stat('happiness', 2); game.stat('smarts', -1); }
      },
      {
        label: 'Keep moving regardless',
        result: 'You kept walking the hills anyway. Slower, and with a stop, and at the top of every one.',
        effect: (game) => { game.stat('fitness', 5); game.stat('health', -1); }
      }
    ]
  },

  {
    id: 'elder_eyes',
    category: 'health',
    weight: 2,
    minAge: 65,
    maxAge: 96,
    once: false,
    text: 'The world has started going soft at the edges. Reading in bed has become a project with stages.',
    choices: [
      {
        label: 'Have the operation on one eye',
        require: (game) => (game.canAfford(12000) ? true : Needs.MONEY(12000)),
        result: 'Twelve thousand dollars, one very small incision, and a text you read without holding at arm length.',
        effect: (game) => { game.spend(12000); game.stat('smarts', 6); game.stat('happiness', 5); game.stat('health', -2); }
      },
      {
        label: 'Get stronger glasses and be done',
        require: (game) => (game.canAfford(400) ? true : Needs.MONEY(400)),
        result: 'Four hundred dollars for glasses heavy enough to see somebody without moving closer.',
        effect: (game) => { game.spend(400); game.stat('smarts', 2); }
      },
      {
        label: 'Give up on small print',
        result: 'You gave up on small print and took up the news at a volume the neighbours have opinions about.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', -1); }
      }
    ]
  },

  {
    id: 'elder_hearing',
    category: 'health',
    weight: 2,
    minAge: 68,
    maxAge: 96,
    once: false,
    text: 'You have been turning the television up past reasonable and still missing the important part.',
    choices: [
      {
        label: 'Get hearing aids fitted',
        require: (game) => (game.canAfford(4500) ? true : Needs.MONEY(4500)),
        result: 'The first thing you heard properly was the microwave in the kitchen. It has been humming for years.',
        effect: (game) => { game.spend(4500); game.stat('happiness', 4); game.stat('smarts', 3); }
      },
      {
        label: 'Insist that everyone speaks up',
        result: 'Everyone spoke up. The problem survived, as problems do when you address them in the wrong direction.',
        effect: (game) => { game.stat('happiness', -2); }
      },
      {
        label: 'Tell a joke to a full room',
        result: 'You told a joke to eleven people and got the silence of a waiting room. You laughed, which helped.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', -1); }
      }
    ]
  },

  {
    id: 'elder_advance_directive',
    category: 'health',
    weight: 2,
    minAge: 60,
    maxAge: 96,
    once: false,
    text: 'At a check-up the doctor asked whether you had thought about what you would want if things went wrong. It was an extremely calm question.',
    choices: [
      {
        label: 'Have the conversation properly',
        result: 'You wrote it down, told your family where it was, and were oddly cheerful about it for a fortnight.',
        effect: (game) => {
          game.flags['elder:directive'] = true;
          game.stat('smarts', 4);
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Pay someone to sort the paperwork out',
        require: (game) => (game.canAfford(600) ? true : Needs.MONEY(600)),
        result: 'You paid a lawyer to read the questions out loud and write the answers in plain English.',
        effect: (game) => {
          game.spend(600);
          game.flags['elder:directive'] = true;
          game.stat('smarts', 5);
        }
      },
      {
        label: 'Change the subject',
        result: 'You changed the subject to a documentary about bridges. It was a very good documentary.',
        effect: (game) => { game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'elder_surgery_risk',
    category: 'health',
    weight: 2,
    minAge: 65,
    maxAge: 95,
    once: false,
    text: 'You have been referred for an operation with a risk written on the leaflet that nobody reads aloud.',
    choices: [
      {
        label: 'Have it anyway',
        require: (game) => (game.canAfford(12000) ? true : Needs.MONEY(12000)),
        result: (game) => (game.flags['elder:operation']
          ? 'It worked, with complications, and you were in for three weeks rather than two.'
          : 'It worked. You were back on your feet in six weeks and slightly annoyed about all of it.'),
        effect: (game) => {
          game.spend(12000);
          if (game.rng.chance(25)) { game.stat('health', -14); game.flags['elder:operation'] = true; }
          else { game.stat('health', 7); game.stat('happiness', -2); }
        }
      },
      {
        label: 'Ask for a second opinion',
        require: (game) => (game.canAfford(2000) ? true : Needs.MONEY(2000)),
        result: 'A second doctor gave you a different opinion, slowly, and also a second bill.',
        effect: (game) => { game.spend(2000); game.stat('smarts', 4); game.stat('health', 1); }
      },
      {
        label: 'Decline it',
        result: 'You declined. It is still there, being patient, and you have got quite good at managing around it.',
        effect: (game) => { game.stat('health', -5); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'elder_forgetful',
    category: 'health',
    weight: 1,
    minAge: 72,
    maxAge: 100,
    once: false,
    require: (game) => (game.stats.smarts < 60 || game.age >= 80 ? true : 'Your mind is still fine, for now.'),
    text: 'You could not remember a name you have used for fifty years. It came back an hour later, slightly wrong.',
    choices: [
      {
        label: 'Write everything down immediately',
        result: 'You bought a notebook and filled nine pages a week. It helps more than anyone says it does.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', 1); }
      },
      {
        label: 'Get a proper assessment',
        require: (game) => (game.canAfford(2000) ? true : Needs.MONEY(2000)),
        result: 'They tested you for two hours and explained the results in language you mostly followed.',
        effect: (game) => { game.spend(2000); game.stat('smarts', 3); game.stat('happiness', -2); }
      },
      {
        label: 'Decide that it did not happen',
        result: 'You decided it did not happen. You have made a small and respectable agreement with yourself.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', -2); }
      }
    ]
  },

  {
    id: 'elder_widowed',
    category: 'family',
    weight: 2,
    minAge: 60,
    maxAge: 98,
    once: true,
    require: (game) => (Can.married(game) ? true : Needs.MARRIED),
    text: 'The thing you had been putting off for years happened quickly, the way those things do.',
    choices: [
      {
        label: 'Arrange it yourself, exactly as they asked',
        result: 'You followed their instructions to the letter. It took a year of phone calls and you would do it again.',
        effect: (game) => {
          // The status is set here as well as in Person.kill, which cannot see
          // the spouse it just lost: peopleOf() filters out the dead.
          const p = game.partner();
          if (p) p.kill(game, 'old age');
          game.maritalStatus = 'widowed';
          game.spend(8000);
          game.stat('happiness', -4);
          game.stat('smarts', 1);
        }
      },
      {
        label: 'Let the family take it on',
        result: 'They took it on and did it well. You were asked to speak and found that you could not.',
        effect: (game) => {
          const p = game.partner();
          if (p) p.kill(game, 'old age');
          game.maritalStatus = 'widowed';
          game.stat('happiness', -7);
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, 10);
        }
      },
      {
        label: 'Keep it together for the grandchildren',
        result: 'You kept it together in front of everybody, then sat in the car afterwards for a while.',
        effect: (game) => {
          const p = game.partner();
          if (p) p.kill(game, 'old age');
          game.maritalStatus = 'widowed';
          game.stat('happiness', -3);
          game.stat('smarts', 1);
        }
      }
    ]
  },

  {
    id: 'elder_remarry',
    category: 'family',
    weight: 1,
    minAge: 63,
    maxAge: 92,
    once: true,
    require: (game) => (
      game.maritalStatus === 'widowed' || game.maritalStatus === 'divorced'
        ? true
        : 'You are not on your own at the moment.'
    ),
    text: 'Somebody at the community centre asked whether you were eating properly. It turned into a considerably longer conversation than it sounded.',
    choices: [
      {
        label: 'Say yes',
        result: (game) => `You said yes. You are now married to ${game.flags['elder:spouse'] ?? 'somebody'}, and it took two years to stop surprising you.`,
        effect: (game) => {
          const gender = game.rng.pick(['male', 'female']);
          const p = game.addPerson({
            type: 'spouse',
            firstName: Names.firstName(game.rng, gender),
            lastName: game.lastName,
            gender,
            age: game.age + game.rng.int(-4, 4),
            relationship: 72,
            happiness: 68,
            isMarried: true,
            spouseName: game.firstName
          });
          game.flags['elder:spouse'] = p.firstName;
          game.maritalStatus = 'married';
          game.stat('happiness', 12);
          game.log(`You married ${p.fullName}.`, 'life');
        }
      },
      {
        label: 'Keep having coffee with them, slowly',
        result: 'You kept having coffee, weekly, for a year, and it turned out to be a slower and better route.',
        effect: (game) => {
          const p = game.addPerson({
            type: 'friend',
            firstName: Names.firstName(game.rng, 'female'),
            lastName: Names.lastName(game.rng),
            gender: 'female',
            age: game.age + game.rng.int(-6, 4),
            relationship: 62
          });
          game.rel(p, 15);
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Say not yet',
        result: 'You said not yet, kindly, and went home to a house that was exactly as quiet as before.',
        effect: (game) => { game.stat('happiness', -1); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'elder_downsize',
    category: 'assets',
    weight: 2,
    minAge: 65,
    maxAge: 94,
    once: true,
    require: (game) => (Can.hasHouse(game) ? true : Needs.HOUSE),
    text: 'The house has more rooms than you use, and stairs you use less of every year.',
    choices: [
      {
        label: 'Sell and move somewhere smaller',
        result: (game) => (game.flags['elder:sold'] ?? 'You did not get round to it.'),
        effect: (game) => {
          const home = game.assetsOf('h')[0];
          if (home) game.flags['elder:sold'] = Portfolio.sell(game, home);
          game.stat('happiness', 5);
          game.stat('health', 2);
        }
      },
      {
        label: 'Fit a stairlift',
        require: (game) => (game.canAfford(9000) ? true : Needs.MONEY(9000)),
        result: 'Nine thousand dollars and a chair that goes up a staircase. You use it eleven times a day.',
        effect: (game) => { game.spend(9000); game.stat('health', 5); game.stat('happiness', 4); }
      },
      {
        label: 'Stay and manage the stairs',
        result: 'You stayed. You now do the important rooms on the same floor and everything else in one trip.',
        effect: (game) => { game.stat('health', -5); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'elder_inheritance',
    category: 'family',
    weight: 1,
    minAge: 68,
    maxAge: 98,
    once: true,
    require: (game) => (
      game.parents().some((p) => !p.isDead) ? true : 'There is nobody left to leave you anything.'
    ),
    text: 'A parent of yours died and left you something. The solicitor was very calm about it, which was the part you had not expected.',
    choices: [
      {
        label: 'Take it and deal with the house',
        result: (game) => `You inherited ${Format.money(game.flags['elder:inherited'] ?? 0)} and sold everything in that house within a year, because you could not open the drawers.`,
        effect: (game) => {
          const p = game.rng.pick(game.parents().filter((x) => !x.isDead));
          if (p) p.kill(game, 'old age');
          const amount = cash(game, 8000, 180000);
          game.flags['elder:inherited'] = amount;
          game.addMoney(amount);
          game.stat('happiness', -5);
        }
      },
      {
        label: 'Split it with the family',
        result: (game) => `You took ${Format.money(game.flags['elder:inherited'] ?? 0)} and posted the rest where it was supposed to go. Three people have thanked you by letter.`,
        effect: (game) => {
          const p = game.rng.pick(game.parents().filter((x) => !x.isDead));
          if (p) p.kill(game, 'old age');
          const amount = Math.round(cash(game, 8000, 180000) / 2);
          game.flags['elder:inherited'] = amount;
          game.addMoney(amount);
          const sib = game.rng.pick(game.siblings());
          if (sib) game.rel(sib, 20);
          game.stat('happiness', 4);
        }
      },
      {
        label: 'Pay for everything first',
        result: (game) => `You paid the funeral, the outstanding bills and a small amount to everyone. You kept ${Format.money(game.flags['elder:inherited'] ?? 0)} and it was not the point.`,
        effect: (game) => {
          const p = game.rng.pick(game.parents().filter((x) => !x.isDead));
          if (p) p.kill(game, 'old age');
          const amount = Math.max(0, cash(game, 8000, 180000) - 8000);
          game.flags['elder:inherited'] = amount;
          game.addMoney(amount);
          game.stat('happiness', 3);
        }
      }
    ]
  },

  {
    id: 'elder_will',
    category: 'assets',
    weight: 2,
    minAge: 66,
    maxAge: 98,
    once: true,
    text: 'You have started thinking about what should happen to the things that are yours when you are not.',
    choices: [
      {
        label: 'Write it all down properly',
        result: 'You wrote it down, got it witnessed, and put it in a drawer where it can be found by people who are not you.',
        effect: (game) => {
          game.flags['elder:will'] = true;
          game.log('You wrote a will.', 'assets');
          game.stat('smarts', 4);
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Hand it over now, while they can be seen receiving it',
        require: (game) => (Can.parent(game) && game.canAfford(50000) ? true : 'That needs a child and a lot of money.'),
        result: (game) => (game.flags['elder:gift']
          ? `You gave ${game.flags['elder:gift']} away while you were there to see the face. That is the part people recommend.`
          : 'You handed it over and watched the face. That is the part people recommend.'),
        effect: (game) => {
          const kid = game.rng.pick(game.children());
          game.spend(50000);
          game.flags['elder:gift'] = Format.money(50000);
          if (kid) game.rel(kid, 25);
          game.stat('happiness', 8);
        }
      },
      {
        label: 'Leave it to the family to work out',
        result: 'You left it to the family to work out. They will work it out. Probably not quickly.',
        effect: (game) => { game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'elder_memoir',
    category: 'life',
    weight: 1,
    minAge: 68,
    maxAge: 95,
    once: true,
    text: 'You have decided that somebody ought to be told the story before you are the only person who remembers it correctly.',
    choices: [
      {
        label: 'Write it all down yourself',
        result: 'You wrote it yourself, badly, and it is 140 pages and it is the only accurate version.',
        effect: (game) => { game.stat('smarts', 5); game.stat('fame', 5); game.stat('happiness', 5); }
      },
      {
        label: 'Pay somebody to help with it',
        require: (game) => (game.canAfford(9000) ? true : Needs.MONEY(9000)),
        result: 'Nine thousand dollars to a ghostwriter who asked forty questions and got a book out of them.',
        effect: (game) => { game.spend(9000); game.stat('fame', 10); game.stat('smarts', 3); }
      },
      {
        label: 'Say it once, at a family dinner',
        result: 'You told the whole thing once, at dinner, with the good bit edited out. Nobody has asked for the rest.',
        effect: (game) => {
          game.stat('happiness', 4);
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, 10);
        }
      }
    ]
  },

  {
    id: 'elder_night_school',
    category: 'school',
    weight: 2,
    minAge: 62,
    maxAge: 88,
    once: false,
    text: 'You enrolled in an evening class. On the first night you were the oldest person in the room by thirty years and the only one who had volunteered.',
    choices: [
      {
        label: 'Take it seriously and finish it',
        result: 'You finished the course. The certificate is on the wall and two of you stayed to do the second one.',
        effect: (game) => { game.stat('smarts', 8); game.stat('happiness', 4); }
      },
      {
        label: 'Turn up, sit at the back, enjoy it',
        result: 'You sat at the back for a year. You learned a modest amount and you left every week glad about it.',
        effect: (game) => { game.stat('happiness', 6); game.stat('fitness', 2); }
      },
      {
        label: 'Drop out in the first fortnight',
        result: 'You dropped out before the first assessment. The refund policy is, of course, strict.',
        effect: (game) => { game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'elder_loneliness',
    category: 'social',
    weight: 3,
    minAge: 60,
    maxAge: 98,
    once: false,
    require: (game) => (game.stats.happiness < 65 || !someone(game) ? true : 'Your week is full enough.'),
    text: 'It has been a long week, and the phone does not ring as often as it used to.',
    choices: [
      {
        label: 'Ask somebody to come twice a week',
        require: (game) => (someone(game) ? true : Needs.FRIEND),
        result: (game) => (game.flags['elder:visit']
          ? `You asked, and they came. ${game.flags['elder:visit']}`
          : 'You asked, and they came.'),
        effect: (game) => {
          const p = someone(game);
          if (p) game.flags['elder:visit'] = Relationships.interact(game, p).text;
          game.stat('happiness', 7);
          game.stat('health', 1);
        }
      },
      {
        label: 'Join something at the community centre',
        result: 'You joined a committee. The committee has six meetings a month and every one of them is a reason to get dressed.',
        effect: (game) => {
          const p = game.addPerson({
            type: 'friend',
            firstName: Names.firstName(game.rng, 'male'),
            lastName: Names.lastName(game.rng),
            gender: 'male',
            age: game.age + game.rng.int(-8, 6),
            relationship: 60
          });
          game.rel(p, 18);
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Manage on your own',
        result: 'You managed on your own, competently, and ate standing up in a kitchen that was very quiet.',
        effect: (game) => { game.stat('happiness', -6); game.stat('health', -2); }
      }
    ]
  },

  {
    id: 'elder_daily_walk',
    category: 'health',
    weight: 3,
    minAge: 60,
    maxAge: 98,
    once: false,
    text: 'You have started walking the same stretch of road at the same time each day, which is the entire point of it.',
    choices: [
      {
        label: 'Walk it every day, whatever the weather',
        result: 'Every day, in all weathers, at the same hour. There are three dogs on that route and two of them know you by name.',
        effect: (game) => { game.stat('fitness', 7); game.stat('health', 3); game.stat('happiness', 2); }
      },
      {
        label: 'Walk it when the weather allows',
        result: 'You walked it when the weather allowed, which was often enough and never a chore.',
        effect: (game) => { game.stat('fitness', 3); game.stat('happiness', 3); }
      },
      {
        label: 'Drive past the people walking',
        result: 'You drove past them, and waved, and went home and sat down. It is not the version you had in mind.',
        effect: (game) => { game.stat('health', -4); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'elder_hobby_hour',
    category: 'life',
    weight: 2,
    minAge: 62,
    maxAge: 92,
    once: false,
    text: 'You have an hour most days that belongs to nobody, which at your age is a brand new luxury.',
    choices: [
      {
        label: 'Grow something',
        result: 'You grew something badly for three years and then suddenly not badly at all.',
        effect: (game) => { game.stat('happiness', 6); game.stat('fitness', 3); }
      },
      {
        label: 'Join a group that argues about something',
        result: 'You joined a group of people who disagree with you about history on a Sunday morning. It is the best part of the week.',
        effect: (game) => {
          const p = game.addPerson({
            type: 'friend',
            firstName: Names.firstName(game.rng, 'male'),
            lastName: Names.lastName(game.rng),
            gender: 'male',
            age: game.age + game.rng.int(-5, 8),
            relationship: 58
          });
          game.rel(p, 16);
          game.stat('smarts', 4);
          game.stat('happiness', 5);
        }
      },
      {
        label: 'Do nothing in particular, deliberately',
        result: 'You did nothing in particular and on purpose, for an hour, most days. It turns out to be quite a skill.',
        effect: (game) => { game.stat('happiness', 4); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'elder_nursing',
    category: 'health',
    weight: 2,
    minAge: 75,
    maxAge: 100,
    once: false,
    require: (game) => (game.stats.health < 50 ? true : 'You are managing on your own for now.'),
    text: 'It has become clear that living alone needs more of you than is currently available.',
    choices: [
      {
        label: 'Let the family arrange something',
        require: (game) => (Can.parent(game) ? true : 'You do not have anyone to arrange it.'),
        result: 'They rearranged their own lives around yours without being asked twice, which is the part you will remember.',
        effect: (game) => {
          game.stat('health', 7);
          game.stat('happiness', -2);
          const kid = game.rng.pick(game.children());
          if (kid) game.rel(kid, 8);
        }
      },
      {
        label: 'Pay for live-in care',
        require: (game) => (game.canAfford(8000) ? true : Needs.MONEY(8000)),
        result: 'Eight thousand dollars covered the year. She was excellent and the house is not the same.',
        effect: (game) => { game.spend(8000); game.stat('health', 5); game.stat('happiness', -1); }
      },
      {
        label: 'Refuse all of it',
        result: 'You refused. You are still here, which is the outcome you wanted, and the stairs have started feeling personal.',
        effect: (game) => { game.stat('health', -13); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'elder_giving',
    category: 'assets',
    weight: 1,
    minAge: 60,
    maxAge: 96,
    once: true,
    text: 'You have decided to do something with the money, which is an unusually forward-looking thought.',
    choices: [
      {
        label: 'Give it to a charity',
        require: (game) => (game.canAfford(100000) ? true : Needs.MONEY(100000)),
        result: 'A hundred thousand dollars and a letter thanking you for your generosity, which is the entire transaction.',
        effect: (game) => { game.spend(100000); game.stat('happiness', 10); game.stat('fame', 5); }
      },
      {
        label: 'Set up something small that carries your name',
        require: (game) => (game.canAfford(20000) ? true : Needs.MONEY(20000)),
        result: 'You put your name on a bench, a small fund, and a notice in a community centre nobody has opened yet.',
        effect: (game) => {
          game.spend(20000);
          game.log('You set up a fund in your name.', 'assets');
          game.stat('happiness', 6);
          game.stat('fame', 3);
        }
      },
      {
        label: 'Keep it',
        result: 'You kept it. It is the largest number in the house and it is doing nothing at all, quietly.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'elder_arrangements',
    category: 'life',
    weight: 1,
    minAge: 72,
    maxAge: 100,
    once: true,
    text: 'You have written down what you want, where you want it, and who is absolutely not to be told first.',
    choices: [
      {
        label: 'Sign it and file it',
        result: 'You signed it, filed it, and told one person where it is. That is the whole task done.',
        effect: (game) => { game.flags['elder:arrangements'] = true; game.stat('happiness', 5); game.stat('smarts', 2); }
      },
      {
        label: 'Keep revising it',
        result: 'You have revised it four times. The latest version is better and you are less sure about it.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', -1); }
      },
      {
        label: 'Throw it away',
        result: 'You threw it away, which felt freeing for about an hour and then felt like a decision you would regret.',
        effect: (game) => { game.stat('happiness', -3); }
      }
    ]
  }
]);
