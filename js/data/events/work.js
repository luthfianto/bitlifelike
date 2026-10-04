/*
 * Work content, roughly ages 18-70.
 *
 * Same event shape as childhood.js; Needs / Can / someone / cash come from
 * helpers.js. Anything that touches a job goes through the Career subsystem
 * (generateOffers / accept / attemptPromotion / quit / fire / retire) so the
 * salary, the performance score, the job panel and the legacy counters all
 * stay honest.
 *
 * Every event keeps at least one choice with no `require`, so an encounter can
 * never leave the player with nothing to press.
 */
EventEngine.register([
  {
    id: 'work_first_job',
    category: 'career',
    weight: 4,
    minAge: 18,
    maxAge: 24,
    once: true,
    require: (game) => Can.noJob(game),
    text: 'School was over and nobody was going to hand you anything. It was time to go and ask.',
    choices: [
      {
        label: 'Take the first thing offered',
        result: (game) => {
          const offers = Career.generateOffers(game);
          if (!offers.length) return 'Nothing in town would hire you on the spot. You took the paperwork with you.';
          game.offers = offers;
          return Career.accept(game, offers[0]).text;
        }
      },
      {
        label: 'Go back to school instead',
        result: (game) => {
          const degree = game.rng.pick(Careers.DEGREES).id;
          const res = Education.enroll(game, 'university', degree);
          if (!res.ok) return 'You went down to enrol and were told the deadline had passed. You went back to the job hunt.';
          game.log(`You started a degree in ${Careers.degreeName(degree)}.`, 'school');
          return `${res.text} You picked ${Careers.degreeName(degree)}, which was as good a reason as any.`;
        }
      },
      {
        label: 'Take whatever will hire you',
        result: 'You started on a temporary contract that renewed twice and then quietly stopped renewing.',
        effect: (game) => { game.addMoney(cash(game, 1200, 4200)); game.stat('fitness', 2); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'work_job_hunt',
    category: 'career',
    weight: 5,
    minAge: 18,
    maxAge: 40,
    once: false,
    require: (game) => Can.noJob(game),
    text: (game) => `You were out of work at ${Format.ordinal(game.age)} and the rent did not care about that.`,
    choices: [
      {
        label: 'Take the best offer on the table',
        result: (game) => {
          const offers = Career.generateOffers(game);
          if (!offers.length) return 'Every office you walked into wanted a qualification you did not have. You walked back out into the car park.';
          game.offers = offers;
          const best = offers.reduce((a, b) => (b.salary > a.salary ? b : a), offers[0]);
          return Career.accept(game, best).text;
        }
      },
      {
        label: 'Ask them to improve the number',
        result: (game) => {
          const offers = Career.generateOffers(game);
          if (!offers.length) return 'There was nobody in the room to negotiate with.';
          game.offers = offers;
          const best = offers.reduce((a, b) => (b.salary > a.salary ? b : a), offers[0]);
          if (!game.rng.chance(45)) return 'They were extremely gracious about it, which is how they usually say no.';
          best.salary = Math.round(best.salary * game.rng.range(1.08, 1.25));
          return Career.accept(game, best).text;
        }
      },
      {
        label: 'Keep looking a while longer',
        result: 'You stayed out of work on purpose. It felt like a plan for about five weeks.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'work_first_paycheck',
    category: 'career',
    weight: 4,
    minAge: 18,
    maxAge: 30,
    once: true,
    require: (game) => Can.job(game),
    text: (game) => `Your first real paycheck from ${game.job.company} arrived and you did the arithmetic on it before you did anything else.`,
    choices: [
      {
        label: 'Save most of it',
        result: 'You put the bulk of it somewhere dull and left it there, which was the entire strategy.',
        effect: (game) => { game.addMoney(Math.round(game.money * 0.1)); game.stat('smarts', 2); }
      },
      {
        label: 'Spend it on the thing you have wanted',
        result: 'You bought it on the way home. It did not fix anything, but it was good.',
        effect: (game) => { game.spend(Math.round(game.money * 0.6)); game.stat('happiness', 6); }
      },
      {
        label: 'Buy lunch for the people who hired you',
        result: 'A modest gesture. It landed about as well as modest gestures do, which is not badly.',
        effect: (game) => {
          game.spend(Math.min(game.money, 200));
          game.addPerson({ type: 'friend', age: game.age, relationship: 55 });
          game.stat('happiness', 4);
        }
      }
    ]
  },

  {
    id: 'work_bad_boss',
    category: 'career',
    weight: 4,
    minAge: 20,
    maxAge: 65,
    once: false,
    require: (game) => Can.job(game),
    text: (game) => `Your boss at ${game.job.company} had an opinion about everything, including the subjects they had no standing to have opinions about.`,
    choices: [
      {
        label: 'Push back, in writing',
        result: 'You sent a calm, well-argued email about it. It was received calmly and not well.',
        effect: (game) => {
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(4, 10));
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Say nothing and do the work',
        result: 'You let it go and did the job properly, which is usually the whole trick.',
        effect: (game) => {
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(3, 8));
          game.stat('happiness', -4);
        }
      },
      {
        label: 'Take it to human resources',
        result: 'HR read it carefully, thanked you for your time, and changed nothing at all.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'work_promotion_review',
    category: 'career',
    weight: 4,
    minAge: 22,
    maxAge: 60,
    once: false,
    require: (game) => Can.employed(game) ? true : Needs.JOB,
    text: (game) => `Review season came round at ${game.job.company} and your name was on one of the forms.`,
    choices: [
      {
        label: 'Ask for the promotion',
        result: (game) => Career.attemptPromotion(game).text
      },
      {
        label: 'Spend the year making yourself obvious',
        result: 'You did the visible work for a year, in front of people who decide things.',
        effect: (game) => {
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(7, 14));
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Ask what it would actually take',
        result: 'You left the room with a list. It was specific, and none of it was flattering.',
        effect: (game) => { game.job.performance = Math.min(100, game.job.performance + 5); game.stat('smarts', 3); }
      },
      {
        label: 'Say you are happy where you are',
        result: 'You said the safe thing. The safe thing was heard, and noted, and filed.',
        effect: (game) => { game.job.performance = Math.min(100, game.job.performance + 2); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'work_office_gossip',
    category: 'career',
    weight: 3,
    minAge: 20,
    maxAge: 65,
    once: false,
    require: (game) => Can.job(game),
    text: 'A story about you was going round the office, and nobody could say where it had started.',
    choices: [
      {
        label: 'Ignore it completely',
        result: 'It faded on its own, which is the usual outcome and by far the best one.',
        effect: (game) => game.stat('happiness', 1)
      },
      {
        label: 'Address it in front of everyone',
        result: 'You said it plainly in a meeting. The story stopped that day, and so did some of the conversation.',
        effect: (game) => {
          game.job.performance = Math.max(0, game.job.performance - game.rng.int(2, 6));
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Find out who started it',
        require: (game) => game.job.yearsInRole >= 3 ? true : 'You have not been here long enough to ask that question.',
        result: 'You found out. It was not the person you would have guessed, and it did not make you feel any better.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'work_workfriend',
    category: 'career',
    weight: 3,
    minAge: 20,
    maxAge: 58,
    once: true,
    require: (game) => Can.job(game),
    text: (game) => `There was someone at ${game.job.company} in exactly the same position as you, who had also stopped enjoying it.`,
    choices: [
      {
        label: 'Become close friends',
        result: 'You became the sort of colleagues who talk about anything, and it made the place survivable.',
        effect: (game) => {
          game.addPerson({ type: 'friend', age: game.age + game.rng.int(-3, 3), relationship: 68 });
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Stay friendly but keep your distance',
        result: 'Pleasant, professional, uninformative. The safest way to do it.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Keep your head down',
        result: 'You sat beside them for years and never once learned anything about them.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'work_overtime',
    category: 'career',
    weight: 4,
    minAge: 20,
    maxAge: 60,
    once: false,
    require: (game) => Can.job(game),
    text: 'The project had a deadline, the deadline was not moving, and the project was not finished.',
    choices: [
      {
        label: 'Work the weekends',
        result: 'You worked most weekends for a quarter and were thanked for it in front of everyone.',
        effect: (game) => {
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(6, 12));
          game.stat('happiness', -5);
          game.stat('health', -3);
        }
      },
      {
        label: 'Do some of it and keep some evenings',
        result: 'You split the difference, and everyone called it a good attitude.',
        effect: (game) => {
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(2, 6));
          game.stat('happiness', 1);
        }
      },
      {
        label: 'Say no, and do the hours properly',
        result: 'You stayed inside the contracted week and finished all of it inside it. Nobody noticed.',
        effect: (game) => {
          game.job.performance = Math.max(0, game.job.performance - game.rng.int(1, 4));
          game.stat('happiness', 4);
        }
      }
    ]
  },

  {
    id: 'work_layoff',
    category: 'career',
    weight: 2,
    minAge: 22,
    maxAge: 62,
    once: true,
    require: (game) => Can.job(game),
    text: (game) => `${game.job.company} announced a restructure, and your job was in the part of the org chart being shortened.`,
    choices: [
      {
        label: 'Take the severance and go quietly',
        result: (game) => {
          const years = game.job.yearsInRole;
          const severance = Math.round(game.job.salary * game.rng.range(0.2, 0.6));
          game.addMoney(severance);
          Career.fire(game, 'You were let go in a restructure.');
          game.log(`You were paid ${Format.money(severance)} to leave quietly.`, 'career');
          return `You were let go after ${Format.ordinal(years)} years. They paid ${Format.money(severance)} and you did not argue.`;
        }
      },
      {
        label: 'Fight for it with everything you have',
        result: (game) => {
          if (game.rng.chance(40)) {
            game.job.performance = Math.min(100, game.job.performance + 8);
            game.log('You argued hard enough to keep your job. Two people above you did not.', 'career');
            return 'You argued hard enough to keep it. Two people above you did not. You said nothing about that part.';
          }
          const years = game.job.yearsInRole;
          Career.fire(game, 'You were let go in a restructure, after arguing.');
          return `You argued, and they were very gracious about it, and then you had been there ${Format.ordinal(years)} years.`;
        }
      },
      {
        label: 'Start the paperwork yourself',
        result: (game) => {
          Career.fire(game, 'You handed in your notice before the letter arrived.');
          return 'You handed in your notice the week before the letter came. It cost you the severance and saved you the meeting.';
        }
      },
      {
        label: 'Wait and see what happens',
        result: (game) => {
          Career.fire(game, 'You were let go in a restructure.');
          return 'You waited, which is a strategy with a known ending.';
        }
      }
    ]
  },

  {
    id: 'work_side_hustle',
    category: 'career',
    weight: 3,
    minAge: 20,
    maxAge: 55,
    once: false,
    require: (game) => Can.job(game),
    text: (game) => (game.flags['side_hustle']
      ? 'The little thing you run alongside the day job is still turning over.'
      : `You have energy left over at the end of a day that ${game.job.company} has already paid you for.`),
    choices: [
      {
        label: 'Keep the side thing running',
        require: (game) => game.flags['side_hustle'] ? true : 'You have not started anything yet.',
        result: (game) => {
          const take = Math.round(3000 + game.age * game.rng.int(60, 180));
          game.addMoney(take);
          game.log(`Your side business brought in ${Format.money(take)} this year.`, 'assets');
          return `It was a slow year and it brought in ${Format.money(take)}. You did all of it on evenings that used to be yours.`;
        }
      },
      {
        label: 'Wind it down',
        require: (game) => game.flags['side_hustle'] ? true : 'You have not started anything yet.',
        result: 'You closed the books on it. The evenings came back and you did not really know what to do with them.',
        effect: (game) => { game.flags['side_hustle'] = false; game.stat('happiness', 3); }
      },
      {
        label: 'Start something small',
        require: (game) => game.flags['side_hustle'] ? true : 'You already have something on the side.',
        result: 'You started on a borrowed laptop in a spare room, and told nobody, in case it did not work.',
        effect: (game) => {
          const cost = Math.min(game.money, 2500);
          game.spend(cost);
          game.flags['side_hustle'] = true;
          game.log('You started a small business on the side.', 'assets');
          game.stat('happiness', 4);
        }
      },
      {
        label: 'Leave it alone',
        result: 'You did nothing. The evenings stayed the way they were.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'work_burnout',
    category: 'career',
    weight: 3,
    minAge: 25,
    maxAge: 60,
    once: false,
    require: (game) => Can.job(game),
    text: 'You had stopped being able to tell the difference between a bad day and a bad year.',
    choices: [
      {
        label: 'Take a month off, properly off',
        require: (game) => game.canAfford(3000) ? true : Needs.MONEY(3000),
        result: 'You went somewhere with no wifi and came back a slightly different person.',
        effect: (game) => { game.spend(3000); game.stat('health', 8); game.stat('happiness', 9); }
      },
      {
        label: 'Push through it',
        result: 'You pushed through it. It worked, in the way that pushing through things works.',
        effect: (game) => {
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(4, 9));
          game.stat('health', -8);
          game.stat('happiness', -7);
        }
      },
      {
        label: 'See someone about it',
        require: (game) => game.canAfford(2000) ? true : Needs.MONEY(2000),
        result: 'An hour a week, on a couch, talking about nothing in particular. It helped more than expected.',
        effect: (game) => { game.spend(2000); game.stat('happiness', 11); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'work_transfer',
    category: 'career',
    weight: 2,
    minAge: 24,
    maxAge: 55,
    once: true,
    require: (game) => Can.employed(game) ? true : Needs.JOB,
    text: (game) => `An office in another city offered to move you up a rung and sideways to a different desk.`,
    choices: [
      {
        label: 'Take the transfer',
        result: (game) => {
          const cost = Math.min(game.money, 4000);
          game.spend(cost);
          game.job.salary = Math.round(game.job.salary * 1.22);
          game.job.performance = game.rng.int(55, 72);
          game.job.yearsInRole = 0;
          game.log(`You transferred to another office on ${Format.money(game.job.salary)} a year.`, 'career');
          game.stat('happiness', -3);
          return `You moved, unpacked, and started again on ${Format.money(game.job.salary)} a year. It took a year to feel like it was worth it.`;
        }
      },
      {
        label: 'Ask them to match the money first',
        result: (game) => {
          if (game.rng.chance(40)) {
            game.job.salary = Math.round(game.job.salary * 1.2);
            game.job.performance = game.rng.int(55, 72);
            game.job.yearsInRole = 0;
            game.stat('happiness', 3);
            game.log('You negotiated a transfer and a better salary.', 'career');
            return 'They matched most of it. You moved, and you were not poorer for moving, which is rarer than it should be.';
          }
          game.stat('happiness', -2);
          return 'They said the number was fixed. You stayed, and felt oddly good about being stubborn.';
        }
      },
      {
        label: 'Stay where you are',
        result: 'You stayed. You knew everyone at that desk, and the desk was comfortable, and that counted for something.',
        effect: (game) => { game.job.performance = Math.min(100, game.job.performance + 5); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'work_startup',
    category: 'career',
    weight: 2,
    minAge: 25,
    maxAge: 45,
    once: true,
    require: (game) => Can.job(game),
    text: 'A company with eleven people and a whiteboard offered you a job, less money, and a lot of words.',
    choices: [
      {
        label: 'Join them on less money',
        result: (game) => {
          game.job.salary = Math.round(game.job.salary * 0.72);
          game.stat('happiness', 7);
          game.stat('fame', 4);
          if (game.rng.chance(35)) {
            const payday = Math.round(game.job.salary * game.rng.range(6, 20));
            game.addMoney(payday);
            game.log(`The startup bought out your equity for ${Format.money(payday)}.`, 'career');
            return `You took the pay cut, spent two years exhausted, and the company bought you out. It was ${Format.money(payday)}.`;
          }
          game.log('The startup you joined ran out of money.', 'career');
          return 'You took the pay cut and spent two years exhausted. The company ran out of money about seven months before you did.';
        }
      },
      {
        label: 'Put your own savings into it instead',
        require: (game) => game.canAfford(20000) ? true : Needs.MONEY(20000),
        result: (game) => {
          const stake = 20000;
          game.spend(stake);
          const out = Math.round(stake * game.rng.range(0, 6));
          game.addMoney(out);
          game.log(`You invested ${Format.money(stake)} in a startup.`, 'assets');
          return out >= stake
            ? `You put ${Format.money(stake)} in and got ${Format.money(out)} back, which does not happen often enough to be normal.`
            : `You put ${Format.money(stake)} in and got ${Format.money(out)} of it back. You told yourself the next one would be different.`;
        }
      },
      {
        label: 'Stay where you are',
        result: 'You stayed. The whiteboard kept being somebody else problem.',
        effect: (game) => game.stat('happiness', 2)
      }
    ]
  },

  {
    id: 'work_quit_gamble',
    category: 'career',
    weight: 2,
    minAge: 22,
    maxAge: 50,
    once: true,
    require: (game) => Can.job(game),
    text: 'You had an idea. What you actually had was a sentence describing an idea, which is where most ideas start.',
    choices: [
      {
        label: 'Resign and go for it',
        result: (game) => {
          Career.quit(game, 'You quit to start something of your own.');
          game.stat('happiness', 5);
          game.stat('smarts', 3);
          if (game.rng.chance(30)) {
            const take = cash(game, 8000, 45000);
            game.addMoney(take);
            game.log(`Your idea paid off early. It made ${Format.money(take)}.`, 'career');
            return `It took eighteen months and most of your savings, and then it made ${Format.money(take)}.`;
          }
          game.log('The thing you left your job to build did not take off.', 'career');
          return 'It took eighteen months and most of your savings. It did not take off, and you went back to looking.';
        }
      },
      {
        label: 'Keep the job and build it at night',
        result: 'You kept the wage and did the work at night, which is the version people tell afterwards was the brave one.',
        effect: (game) => { game.stat('smarts', 5); game.stat('happiness', -3); }
      },
      {
        label: 'Drop the idea',
        result: 'You let it go. It was a relief for about a week and then it was gone.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'work_unemployment_gap',
    category: 'career',
    weight: 4,
    minAge: 20,
    maxAge: 60,
    once: false,
    require: (game) => Can.noJob(game),
    text: 'The gap between jobs had gone on long enough that it stopped feeling like a gap.',
    choices: [
      {
        label: 'Claim what the state owes you',
        result: 'You filled in the forms and waited. The money arrived on a schedule, which was something.',
        effect: (game) => { game.addMoney(cash(game, 1500, 7000)); game.stat('happiness', -2); }
      },
      {
        label: 'Take the first thing that pays',
        result: (game) => {
          const offers = Career.generateOffers(game);
          if (!offers.length) return 'Even the jobs that pay nothing much wanted experience you had never been asked for.';
          game.offers = offers;
          return Career.accept(game, offers[game.rng.int(0, offers.length - 1)]).text;
        }
      },
      {
        label: 'Spend the time training',
        result: 'You did the course, the certificate and the very boring part where you retake the module twice.',
        effect: (game) => { game.stat('smarts', 7); game.stat('happiness', 1); }
      },
      {
        label: 'Live off what you have',
        result: 'You cut everything to the bone and watched the balance fall slowly, like a very dull clock.',
        effect: (game) => { game.spend(Math.round(game.money * 0.5)); game.stat('health', -2); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'work_union_strike',
    category: 'career',
    weight: 1,
    minAge: 20,
    maxAge: 65,
    once: true,
    require: (game) => Can.job(game),
    text: 'The picket line went up on a Tuesday and stayed up through the rain.',
    choices: [
      {
        label: 'Stand on the line',
        result: (game) => {
          if (game.rng.chance(30)) {
            game.stat('health', -4);
            game.stat('happiness', -2);
            return 'You stood on it for six days. On the sixth, a van went past too close and everybody went home early.';
          }
          game.stat('happiness', 7);
          game.stat('fitness', 2);
          return 'You stood on it for nineteen days in the cold. It was the most awake you had been in years.';
        }
      },
      {
        label: 'Cross the line',
        result: 'You walked past a line of people you know to get to work, and then spent the shift not looking up.',
        effect: (game) => { game.stat('happiness', -5); game.job.performance = Math.min(100, game.job.performance + 3); }
      },
      {
        label: 'Stay home until it is over',
        result: 'You waited it out at home. It ended in a settlement that was somewhere between the two positions.',
        effect: (game) => { game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'work_mentor',
    category: 'career',
    weight: 2,
    minAge: 25,
    maxAge: 55,
    once: true,
    require: (game) => Can.job(game),
    text: 'Someone senior took an interest in your career, which is not something that happens on a schedule.',
    choices: [
      {
        label: 'Take every piece of advice',
        result: 'They explained how decisions actually got made, which nobody had done for you before.',
        effect: (game) => {
          game.stat('smarts', 6);
          game.job.performance = Math.min(100, game.job.performance + game.rng.int(5, 10));
        }
      },
      {
        label: 'Be polite and carry on your way',
        result: 'You were gracious about it and went back to your own methods, which were slower.',
        effect: (game) => { game.stat('smarts', 1); game.stat('happiness', 2); }
      },
      {
        label: 'Ask them to put their name on your work',
        result: (game) => {
          if (game.rng.chance(50)) {
            game.job.performance = Math.min(100, game.job.performance + 12);
            game.stat('fame', 5);
            return 'They said yes, and then the work was read very differently by people who read it.';
          }
          game.job.performance = Math.max(0, game.job.performance - 3);
          return 'They said that was not how it was done here. It was the only sentence you got.';
        }
      }
    ]
  },

  {
    id: 'work_award',
    category: 'career',
    weight: 2,
    minAge: 28,
    maxAge: 62,
    once: true,
    require: (game) => Can.job(game),
    text: 'You were nominated for an award nobody had heard of, and then you won it.',
    choices: [
      {
        label: 'Give the credit to the team',
        result: 'You read out the names of eleven other people and got a genuinely warm standing ovation.',
        effect: (game) => {
          game.stat('happiness', 7);
          game.stat('fame', 3);
          game.addPerson({ type: 'friend', age: game.age, relationship: 60 });
        }
      },
      {
        label: 'Give a short speech and take it well',
        result: 'You were gracious, brief, and photographed well. The photograph is the part that survived.',
        effect: (game) => { game.stat('fame', 13); game.stat('happiness', 2); }
      },
      {
        label: 'Decline it',
        result: 'You explained that the work had been done by other people, and the room found that unusual.',
        effect: (game) => { game.stat('happiness', 4); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'work_remote_work',
    category: 'career',
    weight: 3,
    minAge: 22,
    maxAge: 60,
    once: true,
    require: (game) => Can.job(game),
    text: (game) => `Someone at ${game.job.company} floated the idea of working from home, as though it were a small thing.`,
    choices: [
      {
        label: 'Take it and never go back',
        result: 'You did two hours of commuting a day for years and then, one Tuesday, stopped.',
        effect: (game) => {
          game.stat('happiness', 9);
          game.stat('fitness', -4);
          game.job.performance = Math.max(0, game.job.performance - game.rng.int(1, 5));
        }
      },
      {
        label: 'Negotiate two days a week',
        result: 'You got the two days and spent them doing the washing up as well.',
        effect: (game) => { game.stat('happiness', 5); game.stat('smarts', 1); }
      },
      {
        label: 'Decline and keep commuting',
        result: 'You kept the commute. It was a long time on a train and it did build a kind of patience.',
        effect: (game) => { game.stat('happiness', -1); game.stat('fitness', 2); }
      }
    ]
  },

  {
    id: 'work_career_pivot',
    category: 'career',
    weight: 2,
    minAge: 45,
    maxAge: 68,
    once: true,
    require: (game) => Can.job(game),
    text: 'You looked at the ladder in front of you and worked out that it had about four rungs left in it.',
    choices: [
      {
        label: 'Retrain and start again at the bottom',
        result: (game) => {
          Career.quit(game, 'You left to retrain, at some cost to your seniority.');
          game.stat('smarts', 8);
          const offers = Career.generateOffers(game);
          if (!offers.length) {
            game.stat('happiness', -4);
            return 'You left with a plan and arrived to find that your old qualification was worth exactly nothing. You started looking from nothing.';
          }
          game.offers = offers;
          const best = offers.reduce((a, b) => (b.salary > a.salary ? b : a), offers[0]);
          game.stat('happiness', 5);
          return `You went back to the bottom of a different ladder on purpose. ${Career.accept(game, best).text}`;
        }
      },
      {
        label: 'Stay and coast',
        result: 'You did the job, did not do more than the job, and went home on time for four years.',
        effect: (game) => { game.job.performance = Math.min(100, game.job.performance + 5); game.stat('happiness', 4); }
      },
      {
        label: 'Stop now, while stopping is still your choice',
        require: (game) => game.job.yearsInRole >= 3 ? true : 'You have not held this role long enough to walk away from it.',
        result: (game) => Career.retire(game).text
      }
    ]
  },

  {
    id: 'work_office_affair',
    category: 'career',
    weight: 1,
    minAge: 22,
    maxAge: 60,
    once: true,
    require: (game) => Can.job(game),
    text: 'There was something happening with a colleague. It was, historically, never subtle.',
    choices: [
      {
        label: 'See where it goes',
        result: (game) => {
          game.addPerson({ type: 'partner', age: game.age + game.rng.int(-4, 4), relationship: 65 });
          const partner = game.partner();
          if (partner && game.maritalStatus === 'married') game.rel(partner, -35);
          game.stat('happiness', 8);
          return 'It went on for a while. Nothing in the office said anything, which was its own kind of announcement.';
        }
      },
      {
        label: 'Keep well out of it',
        result: 'You kept your eyes down and your mouth shut, which is the correct strategy for everyone except two people.',
        effect: (game) => { game.stat('happiness', -1); game.stat('smarts', 2); }
      },
      {
        label: 'Tell your partner everything',
        require: (game) => game.partner() ? true : Needs.PARTNER,
        result: (game) => {
          const partner = game.partner();
          game.rel(partner, 22);
          game.stat('happiness', -6);
          return 'You told them before anyone else did, which is the only version of this that ends in a conversation rather than a solicitor.';
        }
      }
    ]
  },

  {
    id: 'work_long_service',
    category: 'career',
    weight: 2,
    minAge: 20,
    maxAge: 65,
    once: false,
    require: (game) => (game.job && game.job.yearsInRole >= 5) ? true : 'You have not been with them five years yet.',
    text: (game) => `You had done ${Format.ordinal(game.job.yearsInRole)} years at ${game.job.company}, and somebody finally noticed.`,
    choices: [
      {
        label: 'Take the watch and enjoy it',
        result: (game) => {
          const years = game.job.yearsInRole;
          game.log('You were given a service award at work.', 'career');
          Career.fire(game, 'You were made redundant the same year they gave you a watch.');
          return `They gave you a watch for ${Format.ordinal(years)} years, and made half the numbers redundant in the same quarter.`;
        }
      },
      {
        label: 'Let the years pile up',
        result: 'Nothing happened, which was the correct outcome and exactly as exciting as it sounds.',
        effect: (game) => {
          if (game.rng.chance(40)) {
            const raise = Math.round(game.job.salary * game.rng.range(0.03, 0.08));
            game.job.salary += raise;
            game.log(`You got a long-service raise of ${Format.money(raise)}.`, 'career');
          }
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Use the occasion to ask for the next rung',
        result: (game) => Career.attemptPromotion(game).text
      }
    ]
  },

  {
    id: 'work_conference',
    category: 'career',
    weight: 2,
    minAge: 25,
    maxAge: 60,
    once: true,
    require: (game) => Can.job(game),
    text: (game) => `${game.job.company} offered to pay for you to go to a conference.`,
    choices: [
      {
        label: 'Go and actually learn something',
        require: (game) => game.canAfford(2500) ? true : Needs.MONEY(2500),
        result: 'Three days of talks by people who care about one narrow thing, and you came back with two ideas that worked.',
        effect: (game) => {
          game.spend(2500);
          game.stat('smarts', 6);
          game.job.performance = Math.min(100, game.job.performance + 6);
        }
      },
      {
        label: 'Go and talk to people instead',
        require: (game) => game.canAfford(2500) ? true : Needs.MONEY(2500),
        result: 'You went to the talks for twenty minutes each and spent the rest of it in the corridor, which is where the actual work happens.',
        effect: (game) => {
          game.spend(2500);
          game.addPerson({ type: 'friend', age: game.age + game.rng.int(-6, 6), relationship: 58 });
          game.stat('fame', 4);
        }
      },
      {
        label: 'Send someone from the team',
        result: 'You sent a colleague and kept the three days. The team appreciated the vote of confidence.',
        effect: (game) => { game.stat('happiness', 2); game.job.performance = Math.min(100, game.job.performance + 3); }
      }
    ]
  },

  {
    id: 'work_supervisory_offer',
    category: 'career',
    weight: 2,
    minAge: 28,
    maxAge: 60,
    once: true,
    require: (game) => Can.employed(game) ? true : Needs.JOB,
    text: (game) => `They wanted to make you a team lead at ${game.job.company}, which mostly means your friends now report to you.`,
    choices: [
      {
        label: 'Take it and take the money',
        result: (game) => {
          game.job.salary = Math.round(game.job.salary * 1.14);
          game.log(`You took on a team lead role at ${Format.money(game.job.salary)} a year.`, 'career');
          game.stat('happiness', -3);
          game.job.performance = Math.min(100, game.job.performance + 4);
          return `The extra came to ${Format.money(game.job.salary)} a year, and the extra meetings came with it.`;
        }
      },
      {
        label: 'Stay hands-on and decline',
        result: 'You said you would rather keep doing the work. They said that was fine, and it was, mostly.',
        effect: (game) => { game.stat('happiness', 4); game.job.performance = Math.min(100, game.job.performance + 2); }
      },
      {
        label: 'Ask what the title actually involves',
        result: 'You asked for the job description. It was four bullets long and none of them were about the work.',
        effect: (game) => game.stat('smarts', 3)
      }
    ]
  },

  {
    id: 'work_industry_declines',
    category: 'career',
    weight: 1,
    minAge: 40,
    maxAge: 66,
    once: true,
    require: (game) => Can.job(game),
    text: 'The industry you worked in stopped needing as many of you, and it did not put that in a memo.',
    choices: [
      {
        label: 'Retrain for whatever is hiring',
        result: (game) => {
          Career.quit(game, 'You left before the decline reached you.');
          const offers = Career.generateOffers(game);
          if (!offers.length) {
            game.stat('happiness', -4);
            return 'You left before it got to you. Nothing else was hiring, so you started from further back than you planned.';
          }
          game.offers = offers;
          const best = offers.reduce((a, b) => (b.salary > a.salary ? b : a), offers[0]);
          return `You left before it got to you. ${Career.accept(game, best).text}`;
        }
      },
      {
        label: 'Ride it out',
        result: (game) => {
          game.job.salary = Math.round(game.job.salary * 0.9);
          game.job.performance = Math.max(0, game.job.performance - game.rng.int(6, 14));
          game.stat('happiness', -3);
          game.log('Your industry shrank and so did your pay.', 'career');
          return 'The work got thinner and the pay went with it. You stayed, because staying was still the plan.';
        }
      },
      {
        label: 'Move to the cheapest place that still has the work',
        result: (game) => {
          const cost = Math.min(game.money, 6000);
          game.spend(cost);
          game.job.salary = Math.round(game.job.salary * 0.95);
          game.stat('happiness', -7);
          game.log('You relocated to follow the work.', 'career');
          return 'You moved somewhere with no charm and a rent you could survive, and kept about the same money.';
        }
      }
    ]
  }
]);
