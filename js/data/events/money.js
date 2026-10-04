/*
 * Money content, roughly ages 18-90.
 *
 * Same event shape as childhood.js; Needs / Can / someone / cash come from
 * helpers.js. Anything that moves a real object (a house, a car) goes through
 * the Portfolio subsystem, and the text reports what that subsystem actually
 * did rather than what the player hoped would happen.
 *
 * There is no investment account in the game, so "investing" is modelled as
 * seeded outcomes plus two latched flags. The flags are deliberately not named
 * after events, because EventEngine writes fired event ids into game.flags:
 *   flags['debt']         number still owed
 *   flags['index_fund']   true once an automatic contribution is running
 *   flags['business']     true once money is parked in someone else's company
 *
 * Every event keeps at least one choice with no `require`.
 */
EventEngine.register([
  {
    id: 'money_found_wallet',
    category: 'money',
    weight: 3,
    minAge: 18,
    maxAge: 75,
    once: false,
    text: 'You found a wallet on the pavement with money in it and no obvious owner attached.',
    choices: [
      {
        label: 'Hand it in',
        result: 'You handed it to the nearest desk. Nobody thanked you, which was not the arrangement.',
        effect: (game) => { game.stat('fame', 3); game.stat('happiness', 2); }
      },
      {
        label: 'Keep the cash',
        result: 'You took the money out and threw the wallet somewhere you did not have to explain yourself.',
        effect: (game) => { game.addMoney(cash(game, 40, 400)); game.stat('happiness', -3); }
      },
      {
        label: 'Track down the owner and return all of it',
        require: (game) => game.stats.smarts >= 50 ? true : Needs.SMARTS,
        result: 'It took four receipts and a bit of deduction. The owner was delighted and slightly suspicious of you.',
        effect: (game) => { game.stat('fame', 5); game.stat('happiness', 4); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'money_savings_account',
    category: 'money',
    weight: 3,
    minAge: 18,
    maxAge: 60,
    once: true,
    text: 'You opened an account that pays you a small amount for doing nothing at all.',
    choices: [
      {
        label: 'Put a little in and forget about it',
        result: 'You set up something small and automatic, which is the whole trick and nobody mentions it.',
        effect: (game) => { game.spend(Math.round(game.money * 0.2)); game.flags['index_fund'] = true; game.stat('smarts', 2); }
      },
      {
        label: 'Put everything into it',
        result: 'You moved it all across on a Tuesday and felt, for about a day, extremely responsible.',
        effect: (game) => { game.spend(Math.round(game.money * 0.7)); game.stat('smarts', 2); game.stat('happiness', 2); }
      },
      {
        label: 'Not this year',
        result: 'You closed the tab and did not think about it again for some time.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'money_first_investment',
    category: 'money',
    weight: 3,
    minAge: 18,
    maxAge: 62,
    once: true,
    text: 'You put money into something that was described to you as going up.',
    choices: [
      {
        label: 'Put in as much as you can afford',
        result: (game) => {
          const stake = Math.round(game.money * 0.6);
          if (stake < 200) return 'You had almost nothing to put in, which is its own kind of education.';
          game.spend(stake);
          const out = Math.round(stake * game.rng.range(0.25, 2.4));
          game.addMoney(out);
          game.log(`You invested ${Format.money(stake)} and ended with ${Format.money(out)}.`, 'assets');
          return out > stake
            ? `It went up. You put in ${Format.money(stake)} and got ${Format.money(out)} back, which is not the usual result.`
            : `It went down. ${Format.money(stake)} in, ${Format.money(out)} out.`;
        }
      },
      {
        label: 'Start small and add to it slowly',
        result: 'You bought a little and bought a bit more, and never once had to decide about it all at once.',
        effect: (game) => { game.spend(Math.min(game.money, 1500)); game.stat('smarts', 3); game.stat('happiness', 2); }
      },
      {
        label: 'Watch for a year before risking anything',
        result: 'You spent a year watching other people lose money, which is a serviceable education.',
        effect: (game) => game.stat('smarts', 5)
      }
    ]
  },

  {
    id: 'money_market_crash',
    category: 'money',
    weight: 3,
    minAge: 22,
    maxAge: 80,
    once: false,
    text: 'The market fell sharply and everything you had put in fell faster than the headlines said it should.',
    choices: [
      {
        label: 'Sell before it falls further',
        result: (game) => {
          const loss = Math.round(game.money * game.rng.range(0.2, 0.45));
          game.addMoney(-loss);
          game.log(`You sold out during the crash, down ${Format.money(loss)}.`, 'assets');
          return `You got out. You were down ${Format.money(loss)} and you were out, which cost you the recovery as well as the drop.`;
        }
      },
      {
        label: 'Hold and wait it out',
        result: 'You did nothing for eighteen months, which is a strategy made entirely of refusing to decide.',
        effect: (game) => { game.stat('happiness', -6); game.stat('smarts', 2); }
      },
      {
        label: 'Buy more while it is cheap',
        require: (game) => game.canAfford(5000) ? true : Needs.MONEY(5000),
        result: (game) => {
          const stake = Math.min(game.money, 20000);
          game.spend(stake);
          const out = Math.round(stake * game.rng.range(0.6, 2.2));
          game.addMoney(out);
          return out >= stake
            ? `You bought ${Format.money(stake)} at the bottom and it came back. You ended with ${Format.money(out)}.`
            : `You bought ${Format.money(stake)} at the bottom and it kept going. You ended with ${Format.money(out)}.`;
        }
      },
      {
        label: 'Stop reading the news',
        result: 'You closed the app and did not open it for months, which was the single most effective thing you did that year.',
        effect: (game) => game.stat('happiness', 3)
      }
    ]
  },

  {
    id: 'money_bull_run',
    category: 'money',
    weight: 2,
    minAge: 22,
    maxAge: 75,
    once: false,
    text: 'A run of good news had everybody confident, including the people who had been pessimistic for years.',
    choices: [
      {
        label: 'Take some of the profit off the table',
        result: (game) => {
          const gain = Math.round(game.money * game.rng.range(0.25, 0.7));
          game.addMoney(gain);
          game.log(`You banked ${Format.money(gain)} during the run.`, 'assets');
          return `You sold part of it and banked ${Format.money(gain)}. The rest kept going up for another year, and you thought about that.`;
        }
      },
      {
        label: 'Ride it all the way',
        result: (game) => {
          const out = Math.round(game.money * game.rng.range(0.4, 2.6));
          game.addMoney(out - game.money);
          return out >= game.money
            ? 'It kept climbing, and you let it, and by the end of it you were not the person you were in January.'
            : `It went up and then it went down, and by the end of it you had about ${Format.money(out)} left.`;
        }
      },
      {
        label: 'Sit it out',
        result: 'You did nothing at all and watched other people become briefly insufferable.',
        effect: (game) => game.stat('happiness', 2)
      }
    ]
  },

  {
    id: 'money_lottery',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 90,
    once: true,
    text: 'You bought a ticket on a hunch, which is a perfectly respectable reason and not a good one.',
    choices: [
      {
        label: 'Buy a stack of them',
        require: (game) => game.canAfford(500) ? true : Needs.MONEY(500),
        result: (game) => {
          const cost = Math.min(game.money, 2500);
          game.spend(cost);
          if (game.rng.chance(12)) {
            const win = cost * game.rng.int(40, 900);
            game.addMoney(win);
            game.log(`You won ${Format.money(win)} on a stack of lottery tickets.`, 'assets');
            game.stat('happiness', 20);
            game.stat('fame', 6);
            return `One of them was worth ${Format.money(win)}. You did not believe it for two full days.`;
          }
          game.stat('happiness', -2);
          return 'None of them were worth anything. You kept the ticket in a drawer for a while, for no reason.';
        }
      },
      {
        label: 'Keep the one ticket',
        result: (game) => {
          if (game.rng.chance(20)) {
            const win = cash(game, 2000, 60000);
            game.addMoney(win);
            game.log(`Your single lottery ticket won ${Format.money(win)}.`, 'assets');
            game.stat('happiness', 15);
            return `The single ticket was worth ${Format.money(win)}, which is roughly two hundred times what it cost.`;
          }
          return 'The one ticket was not a winner, and you never bought another, and that is the whole story.';
        }
      },
      {
        label: 'Stop buying them',
        result: 'You put the ticket away and did not buy another one, which is a rare kind of discipline.',
        effect: (game) => game.stat('smarts', 2)
      }
    ]
  },

  {
    id: 'money_credit_card',
    category: 'money',
    weight: 3,
    minAge: 18,
    maxAge: 60,
    once: true,
    text: 'A card arrived in the post with an introductory offer and a rate that only applies to year one.',
    choices: [
      {
        label: 'Use it for everything',
        result: (game) => {
          const borrowed = Math.round(game.money * 0.8 + 4000);
          game.addMoney(borrowed);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + borrowed;
          game.log(`You ran up ${Format.money(borrowed)} on a card.`, 'assets');
          game.stat('happiness', 9);
          return `It was a very good year, on paper. The statement for it would arrive later, at ${Format.money(borrowed)}.`;
        }
      },
      {
        label: 'Use it only for the things you would have bought anyway',
        result: (game) => {
          const borrowed = Math.round(game.money * 0.3 + 800);
          game.addMoney(borrowed);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + borrowed;
          game.stat('happiness', 3);
          return `You kept it to the small stuff, which still added up to ${Format.money(borrowed)} by the end of the year.`;
        }
      },
      {
        label: 'Cut it up',
        result: 'You cut it into six pieces and put them in the recycling, which was satisfying and slightly pointless.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', 1); }
      }
    ]
  },

  {
    id: 'money_personal_loan',
    category: 'money',
    weight: 2,
    minAge: 22,
    maxAge: 58,
    once: true,
    text: 'The bank would lend you money at a rate their brochure described as competitive.',
    choices: [
      {
        label: 'Take the full amount',
        result: (game) => {
          const loan = Math.round(game.money * 0.7 + 20000);
          game.addMoney(loan);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + loan;
          game.log(`You borrowed ${Format.money(loan)} from a bank.`, 'assets');
          return `The money arrived the same week. The repayments start next month, at a figure that sounds manageable until you write it down.`;
        }
      },
      {
        label: 'Take a small amount',
        result: (game) => {
          const loan = 5000;
          game.addMoney(loan);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + loan;
          return 'You took a small one. It was still money you did not have, which is the part people skip.';
        }
      },
      {
        label: 'Decline it',
        result: 'You said no and went home, and then wondered all the way whether you should have.',
        effect: (game) => game.stat('smarts', 2)
      }
    ]
  },

  {
    id: 'money_home_purchase',
    category: 'money',
    weight: 3,
    minAge: 24,
    maxAge: 62,
    once: true,
    text: 'You got serious about buying somewhere, which in this market means getting serious about a number.',
    choices: [
      {
        label: 'Buy something and mortgage the rest',
        require: (game) => (game.hasHouse() ? 'You already own a home.' : true),
        result: (game) => {
          const priced = Catalog.HOUSES.map((def) => ({ def, price: Portfolio.housePrice(game, def) }));
          const doable = priced.filter((x) => x.price * 0.2 <= game.money);
          const target = (doable.length ? doable : priced).at(-1);
          return Portfolio.buyHouse(game, target.def, { mortgage: 0.8 }).text;
        }
      },
      {
        label: 'Buy something outright',
        require: (game) => {
          if (game.hasHouse()) return 'You already own a home.';
          return game.canAfford(Portfolio.housePrice(game, Catalog.HOUSES[0])) ? true : Needs.MONEY(Portfolio.housePrice(game, Catalog.HOUSES[0]));
        },
        result: (game) => {
          const priced = Catalog.HOUSES.map((def) => ({ def, price: Portfolio.housePrice(game, def) }));
          const affordable = priced.filter((x) => x.price <= game.money);
          const target = (affordable.length ? affordable : priced).at(0);
          return Portfolio.buyHouse(game, target.def, { mortgage: 0 }).text;
        }
      },
      {
        label: 'Keep renting',
        result: 'You looked at the numbers for another month and then stopped looking at them.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'money_sell_car',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 70,
    once: true,
    require: (game) => Can.hasCar(game) ? true : Needs.CAR,
    text: (game) => `Your ${game.assetsOf('c')[0].label} had reached the stage where every repair cost more than the problem did.`,
    choices: [
      {
        label: 'Sell it',
        result: (game) => Portfolio.sell(game, game.assetsOf('c')[0])
      },
      {
        label: 'Get it fixed one more time',
        require: (game) => game.canAfford(2500) ? true : Needs.MONEY(2500),
        result: 'You paid for one more repair, and it was the last one, and they all said so.',
        effect: (game) => { game.spend(2500); game.stat('happiness', -1); }
      },
      {
        label: 'Keep it and live with the noise',
        result: 'You kept it. It made a noise that a mechanic described as characterful and you described as unbearable.',
        effect: (game) => game.stat('happiness', -4)
      }
    ]
  },

  {
    id: 'money_scam',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 90,
    once: false,
    text: 'Someone got in touch with a proposition that was extremely good and slightly too fast.',
    choices: [
      {
        label: 'Send a small amount to see what happens',
        require: (game) => game.canAfford(500) ? true : Needs.MONEY(500),
        result: 'The small amount was gone within the hour, along with any interest you had in the arrangement.',
        effect: (game) => { game.addMoney(-Math.min(game.money, 1500)); game.stat('happiness', -5); }
      },
      {
        label: 'Send everything you have',
        require: (game) => game.money > 20000 ? true : Needs.MONEY(20000),
        result: (game) => {
          const stake = Math.round(game.money * 0.9);
          game.addMoney(-stake);
          game.stat('happiness', -12);
          return `You sent ${Format.money(stake)} to a person whose photograph was not their face, and there was no reply after the second one.`;
        }
      },
      {
        label: 'Report it',
        result: 'You reported it, filled in the form, and never heard anything again, which is the usual outcome.',
        effect: (game) => { game.stat('smarts', 3); game.stat('fame', 2); game.stat('happiness', 2); }
      },
      {
        label: 'Walk away and block the number',
        result: 'You blocked the number, which is the entire defence, and it worked.',
        effect: (game) => game.stat('smarts', 2)
      }
    ]
  },

  {
    id: 'money_inheritance',
    category: 'money',
    weight: 1,
    minAge: 30,
    maxAge: 90,
    once: true,
    text: 'A relative you half-remembered died, and left you something in a solicitor letter.',
    choices: [
      {
        label: 'Take it',
        result: (game) => {
          const amount = cash(game, 5000, 120000) * (game.rng.chance(0.15) ? 8 : 1);
          game.addMoney(amount);
          game.log(`You inherited ${Format.money(amount)}.`, 'assets');
          return `It came to ${Format.money(amount)}, which is a strange amount of money to receive from somebody you met twice.`;
        }
      },
      {
        label: 'Split it with everyone else in the family',
        result: (game) => {
          const amount = Math.round(cash(game, 20000, 300000) * 0.3);
          game.addMoney(amount);
          for (const person of game.peopleOf('parent')) game.rel(person, 18);
          game.stat('happiness', 8);
          game.log(`You shared an inheritance and kept ${Format.money(amount)}.`, 'assets');
          return `Everyone took a share and nobody minded. You kept ${Format.money(amount)} and got the family back, which was worth more.`;
        }
      },
      {
        label: 'Walk away from it',
        result: 'You told the solicitor you did not want it. She wrote to you twice and then stopped.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'money_broke',
    category: 'money',
    weight: 3,
    minAge: 18,
    maxAge: 75,
    once: false,
    require: (game) => game.money < 5000 ? true : 'You are doing well enough for this not to be a problem.',
    text: 'The balance had got low enough that you had started doing the maths at the wrong end of the month.',
    choices: [
      {
        label: 'Pick up extra shifts',
        require: (game) => Can.job(game) ? true : Needs.JOB,
        result: 'You took every hour going and were home so tired that you slept through them.',
        effect: (game) => { game.addMoney(cash(game, 1500, 9000)); game.stat('health', -3); game.stat('happiness', -2); }
      },
      {
        label: 'Sell something you own',
        require: (game) => game.assetsOf('c').length > 0 || game.assetsOf('h').length > 0 ? true : 'You do not own anything worth selling.',
        result: (game) => {
          const sellable = [...game.assetsOf('c'), ...game.assetsOf('h')].toSorted((a, b) => a.value - b.value);
          return Portfolio.sell(game, sellable[0]);
        }
      },
      {
        label: 'Borrow to cover the month',
        require: (game) => game.money >= 0 ? true : 'You already owe more than you can borrow your way out of.',
        result: (game) => {
          const loan = 4000;
          game.addMoney(loan);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + loan;
          game.stat('happiness', -3);
          return 'You covered the month, which is all the month asked for, and the next four months now know about it.';
        }
      },
      {
        label: 'Cut everything back to nothing',
        result: 'You cancelled things, cooked at home, and did not go out. The balance stopped moving, at least.',
        effect: (game) => { game.stat('happiness', -4); game.stat('health', 2); game.stat('fitness', 2); }
      }
    ]
  },

  {
    id: 'money_windfall',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 70,
    once: false,
    text: 'Money arrived from nowhere in particular. A refund, an old account, an award nobody remembers entering.',
    choices: [
      {
        label: 'Put it somewhere dull',
        result: 'It went somewhere dull and stayed there, doing the only reliable thing money does.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', 2); }
      },
      {
        label: 'Spend it on something you will remember',
        result: 'You bought the thing you had wanted for two years, and it was worth about one afternoon.',
        effect: (game) => { game.stat('happiness', 7); game.stat('looks', 2); }
      },
      {
        label: 'Split it with someone',
        result: 'You sent half of it to somebody who needed it more, which you mentioned in your next message to nobody.',
        effect: (game) => {
          const person = someone(game);
          if (person) game.rel(person, 16);
          else game.addPerson({ type: 'friend', age: game.age, relationship: 62 });
          game.stat('happiness', 5);
        }
      }
    ]
  },

  {
    id: 'money_friend_loan',
    category: 'money',
    weight: 2,
    minAge: 20,
    maxAge: 60,
    once: true,
    require: (game) => (someone(game) ? true : Needs.FRIEND),
    text: (game) => `${Format.fullName(someone(game))} asked to borrow money, with the amount already decided.`,
    choices: [
      {
        label: 'Lend it and expect it back',
        require: (game) => game.canAfford(2000) ? true : Needs.MONEY(2000),
        result: (game) => {
          const loan = Math.min(game.money, Math.round(game.job ? game.job.salary * 0.4 : 3000));
          game.spend(loan);
          const person = someone(game);
          if (person) game.rel(person, 18);
          if (game.rng.chance(55)) {
            game.addMoney(Math.round(loan * game.rng.range(0.4, 1)));
            game.log(`You lent ${Format.money(loan)} and got most of it back.`, 'assets');
            return `You lent ${Format.money(loan)} and most of it came back, later, in instalments, with a card at Christmas.`;
          }
          game.log(`You lent ${Format.money(loan)} and it did not come back.`, 'assets');
          return `You lent ${Format.money(loan)}. They did not mention it again, which is how you knew.`;
        }
      },
      {
        label: 'Give it as a gift and say nothing',
        require: (game) => game.canAfford(1000) ? true : Needs.MONEY(1000),
        result: (game) => {
          const gift = Math.min(game.money, 1500);
          game.spend(gift);
          const person = someone(game);
          if (person) game.rel(person, 30);
          game.stat('happiness', 6);
          return 'You gave it and never mentioned it again, and never once had to. It was the best money you spent that year.';
        }
      },
      {
        label: 'Say no',
        result: 'You said no. It was the correct decision and it cost you the friendship a little.',
        effect: (game) => {
          const person = someone(game);
          if (person) game.rel(person, -12);
          game.stat('happiness', -3);
        }
      }
    ]
  },

  {
    id: 'money_crypto',
    category: 'money',
    weight: 2,
    minAge: 20,
    maxAge: 60,
    once: true,
    text: 'Everyone you knew had an opinion about the new kind of money, and most of the opinions came from people who had bought some.',
    choices: [
      {
        label: 'Put in a serious amount',
        require: (game) => game.canAfford(5000) ? true : Needs.MONEY(5000),
        result: (game) => {
          const stake = Math.min(game.money, 15000);
          game.spend(stake);
          const out = Math.round(stake * game.rng.range(0, 7));
          game.addMoney(out);
          game.log(`You put ${Format.money(stake)} into crypto.`, 'assets');
          return out >= stake
            ? `You put in ${Format.money(stake)} and it went up by a stupid amount. It came out at ${Format.money(out)}.`
            : `You put in ${Format.money(stake)} and it came out at ${Format.money(out)}, which is ${Format.money(stake - out)} less than you had.`;
        }
      },
      {
        label: 'Put in an amount you would not miss',
        result: 'You put in an amount you could describe as an entertainment expense and then did not describe it that way.',
        effect: (game) => {
          const stake = Math.min(game.money, 800);
          game.spend(stake);
          if (game.rng.chance(45)) {
            const out = Math.round(stake * game.rng.range(1.5, 6));
            game.addMoney(out);
            return `The small amount became ${Format.money(out)}, which did not make you rich but was a memorable lesson.`;
          }
          game.stat('happiness', -2);
          return 'The small amount became nothing at all, which is the most common outcome by a very long way.';
        }
      },
      {
        label: 'Decide it is all a scam',
        result: 'You said it was a scam at a barbecue and were, in the circumstances, correct.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'money_business_investment',
    category: 'money',
    weight: 2,
    minAge: 25,
    maxAge: 70,
    once: false,
    text: (game) => (game.flags['business']
      ? 'The business you had put money into sent you a letter, which is more than most of them ever do.'
      : 'You looked at a business that was growing quickly and needed money now, which is the same sentence twice.'),
    choices: [
      {
        label: 'Keep putting money in',
        require: (game) => (game.flags['business'] ? true : 'You do not own a piece of anything yet.'),
        result: (game) => {
          const stake = Math.min(game.money, 8000);
          game.spend(stake);
          const back = Math.round(stake * game.rng.range(0.4, 2.4));
          game.addMoney(back);
          return `You put another ${Format.money(stake)} in and got ${Format.money(back)} back over the year.`;
        }
      },
      {
        label: 'Take your money back out',
        require: (game) => (game.flags['business'] ? true : 'You do not own a piece of anything yet.'),
        result: (game) => {
          game.flags['business'] = false;
          const back = cash(game, 4000, 60000);
          game.addMoney(back);
          game.log(`You pulled your money out of a business for ${Format.money(back)}.`, 'assets');
          return `They honoured it without a fight, which was generous, and it came to ${Format.money(back)}.`;
        }
      },
      {
        label: 'Buy in',
        require: (game) => (game.flags['business'] ? true : 'You are already in this one.'),
        result: (game) => {
          const stake = Math.min(game.money, 10000);
          game.spend(stake);
          game.flags['business'] = true;
          game.stat('smarts', 2);
          return `You bought ${Format.money(stake)} of a company you had never heard of, on the strength of one meeting.`;
        }
      },
      {
        label: 'Leave it alone',
        result: 'You did nothing about it, which is a perfectly respectable position in a market like this.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'money_late_paycheck',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 60,
    once: false,
    require: (game) => Can.job(game),
    text: (game) => `${game.job.company} was late paying again, and this time the note said nothing at all.`,
    choices: [
      {
        label: 'Chase it',
        result: (game) => {
          const owed = Math.round(game.job.salary * game.rng.range(0.5, 1.2));
          game.addMoney(owed);
          game.job.performance = Math.min(100, game.job.performance + 4);
          game.log(`You chased a late payment of ${Format.money(owed)} and got it.`, 'career');
          return `You chased it, and it turned up four days later, along with an apology that read like a template.`;
        }
      },
      {
        label: 'Start looking elsewhere',
        result: (game) => {
          Career.quit(game, 'You left over a late payment.');
          const offers = Career.generateOffers(game);
          if (!offers.length) {
            game.stat('happiness', -3);
            return 'You handed in your notice over a payment that was late. Nothing better came along straight away.';
          }
          game.offers = offers;
          const best = offers.reduce((a, b) => (b.salary > a.salary ? b : a), offers[0]);
          return `You handed in your notice over a payment that was late. ${Career.accept(game, best).text}`;
        }
      },
      {
        label: 'Wait it out',
        result: 'You waited. The money came, three weeks late, and the shop stayed open.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'money_tax_audit',
    category: 'money',
    weight: 1,
    minAge: 25,
    maxAge: 72,
    once: true,
    text: 'A letter from the tax office asked for a decade of your records and used the phrase "routine review".',
    choices: [
      {
        label: 'Pay someone to deal with it',
        require: (game) => game.canAfford(4000) ? true : Needs.MONEY(4000),
        result: 'An accountant read everything, found one small omission, and closed the matter for a fee that felt enormous and was worth it.',
        effect: (game) => { game.spend(4000); game.stat('happiness', 4); }
      },
      {
        label: 'Sort it out yourself',
        require: (game) => game.stats.smarts >= 55 ? true : Needs.SMARTS,
        result: (game) => {
          if (game.rng.chance(60)) {
            game.stat('smarts', 4);
            game.stat('happiness', 3);
            return 'You found one line that had been reported slightly differently for two years and quietly fixed both of them.';
          }
          const bill = Math.round(3000 + game.legacy.totalEarned * game.rng.range(0.02, 0.08));
          game.addMoney(-Math.min(game.money, bill));
          game.stat('happiness', -8);
          return `You found a great deal in there that you had forgotten about. It cost ${Format.money(bill)} and several evenings.`;
        }
      },
      {
        label: 'Put it in a drawer',
        result: (game) => {
          if (game.rng.chance(35)) {
            const bill = Math.round(5000 + game.legacy.totalEarned * game.rng.range(0.05, 0.15));
            game.addMoney(-Math.min(game.money, bill));
            game.flags['debt'] = (game.flags['debt'] ?? 0) + bill;
            return `It came back with interest, at ${Format.money(bill)}, and a letter that was no longer described as routine.`;
          }
          game.stat('happiness', 4);
          return 'It sat in the drawer for two years and then went away on its own, which happens more often than it should.';
        }
      }
    ]
  },

  {
    id: 'money_rent_increase',
    category: 'money',
    weight: 3,
    minAge: 18,
    maxAge: 65,
    once: false,
    text: 'Your landlord put a letter through the door with a bigger number on it.',
    choices: [
      {
        label: 'Pay the increase',
        require: (game) => game.canAfford(1500) ? true : Needs.MONEY(1500),
        result: 'You paid it without arguing, because arguing takes an evening and most of the outcome anyway.',
        effect: (game) => { game.spend(1500); game.stat('happiness', -2); }
      },
      {
        label: 'Move somewhere cheaper',
        require: (game) => game.canAfford(3000) ? true : Needs.MONEY(3000),
        result: (game) => {
          game.spend(3000);
          game.stat('happiness', -5);
          return 'You moved somewhere smaller and cheaper and further from everything, which saved the money and cost the evenings.';
        }
      },
      {
        label: 'Go back and talk to them',
        result: (game) => {
          if (game.rng.chance(35)) {
            game.stat('happiness', 5);
            return 'They took it off the letter without much discussion, which was more than you expected and more than they owed anyone.';
          }
          game.stat('happiness', -3);
          return 'You made your case at some length. The letter did not change, and now they knew you had read it.';
        }
      },
      {
        label: 'Do nothing until the next letter',
        result: 'You put the letter in a drawer with the other administrative decisions.',
        effect: (game) => game.stat('happiness', -1)
      }
    ]
  },

  {
    id: 'money_car_upgrade',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 65,
    once: true,
    text: 'The car you had been keeping alive finally stopped being worth keeping alive.',
    choices: [
      {
        label: 'Buy something considerably better',
        result: (game) => {
          const priced = Catalog.CARS.map((def) => ({ def, price: Math.round(def.price * Cities.costMultiplier(game.birthCity)) }));
          const doable = priced.filter((x) => x.price <= game.money);
          const target = (doable.length ? doable : priced).at(-1);
          return Portfolio.buyCar(game, target.def).text;
        }
      },
      {
        label: 'Buy the cheapest thing that will start',
        result: (game) => Portfolio.buyCar(game, Catalog.CARS[0]).text
      },
      {
        label: 'Manage without one',
        result: (game) => {
          const car = game.assetsOf('c')[0];
          if (car) return `You sold the car and made do. ${Portfolio.sell(game, car)} You got used to the buses.`;
          return 'You managed without, and found you walked more and hated it.';
        }
      }
    ]
  },

  {
    id: 'money_gambling',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 70,
    once: true,
    text: 'You had a system, and the system had lost eleven of the last twelve nights.',
    choices: [
      {
        label: 'Double down, obviously',
        result: (game) => {
          const stake = Math.min(game.money, 4000);
          game.spend(stake);
          if (game.rng.chance(22)) {
            const out = Math.round(stake * game.rng.range(2, 5));
            game.addMoney(out);
            game.stat('happiness', 8);
            return `It came in on the last night, and you walked out with ${Format.money(out)}. You did not learn anything from it.`;
          }
          game.stat('happiness', -8);
          game.stat('addiction', 5);
          return 'It did not come in. You lost the stake and then sat there for another hour, which is the part that matters.';
        }
      },
      {
        label: 'Borrow to keep playing',
        require: (game) => game.canAfford(2000) ? true : Needs.MONEY(2000),
        result: (game) => {
          const loan = 3000;
          game.addMoney(loan);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + loan;
          game.addMoney(-Math.min(game.money - loan, 2500));
          game.stat('addiction', 8);
          game.stat('happiness', -3);
          return 'You borrowed to keep playing, which is the exact sentence every casino is built around.';
        }
      },
      {
        label: 'Walk away for good',
        result: 'You gave the money back, kept the change, and did not go back. It was the single best decision of the year.',
        effect: (game) => { game.stat('happiness', 6); game.stat('smarts', 3); }
      }
    ]
  },

  {
    id: 'money_charity',
    category: 'money',
    weight: 1,
    minAge: 25,
    maxAge: 90,
    once: true,
    text: 'An organisation you had never heard of wrote to ask whether you were the sort of person who gives things away.',
    choices: [
      {
        label: 'Give a real sum',
        require: (game) => game.canAfford(10000) ? true : Needs.MONEY(10000),
        result: 'You gave more than you had planned and wrote off the tax relief immediately, which is a famously bad system.',
        effect: (game) => { game.spend(10000); game.stat('happiness', 10); game.stat('fame', 4); }
      },
      {
        label: 'Give a small sum',
        require: (game) => game.canAfford(200) ? true : Needs.MONEY(200),
        result: 'You gave a small sum and kept the receipt in a drawer, which is a strange thing to keep.',
        effect: (game) => { game.spend(200); game.stat('happiness', 3); }
      },
      {
        label: 'Send the letter to someone else',
        result: 'You passed the letter on to a person who was more likely to be feeling generous about it.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'money_index_fund',
    category: 'money',
    weight: 3,
    minAge: 25,
    maxAge: 80,
    once: false,
    text: (game) => (game.flags['index_fund']
      ? 'Your monthly statement came through, with a small gain attached that required nothing of you at all.'
      : 'You read, repeatedly, that money left alone for long enough would eventually do something.'),
    choices: [
      {
        label: 'Let it keep running',
        require: (game) => (game.flags['index_fund'] ? true : 'You have not set anything up to run.'),
        result: (game) => {
          const gain = Math.round(500 + game.money * game.rng.range(0.02, 0.09));
          game.addMoney(gain);
          game.log(`Your savings returned ${Format.money(gain)} this year.`, 'assets');
          return `It returned ${Format.money(gain)}, which was nobody in particular doing anything clever on your behalf.`;
        }
      },
      {
        label: 'Take it all out and put it somewhere else',
        require: (game) => (game.flags['index_fund'] ? true : 'You have not set anything up to run.'),
        result: (game) => {
          game.flags['index_fund'] = false;
          const out = Math.round(game.money * 0.8);
          game.stat('happiness', 1);
          return `You moved ${Format.money(out)} across to somewhere with a slightly better rate and a considerably worse year.`;
        }
      },
      {
        label: 'Set up a small monthly contribution',
        require: (game) => (game.flags['index_fund'] ? true : 'You already have something running.'),
        result: 'You set up an amount small enough that you would not notice it and large enough to matter in forty years.',
        effect: (game) => { game.flags['index_fund'] = true; game.spend(Math.min(game.money, 1200)); game.stat('smarts', 2); }
      },
      {
        label: 'Leave it alone either way',
        result: 'You did nothing about money this year, which at least is consistent.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'money_moving_costs',
    category: 'money',
    weight: 2,
    minAge: 18,
    maxAge: 50,
    once: true,
    text: 'You moved. Boxes, a van, and a deposit on a place that was not the old place.',
    choices: [
      {
        label: 'Hire movers and do it properly',
        require: (game) => game.canAfford(3000) ? true : Needs.MONEY(3000),
        result: 'Everything arrived intact, including a lamp you had forgotten owning, and the whole thing took a day.',
        effect: (game) => { game.spend(3000); game.stat('happiness', 3); }
      },
      {
        label: 'Do it with friends and one car',
        require: (game) => (someone(game) ? true : Needs.FRIEND),
        result: (game) => {
          game.spend(Math.min(game.money, 400));
          const person = someone(game);
          if (person) game.rel(person, 14);
          game.stat('happiness', 4);
          game.stat('fitness', -2);
          return 'It took two days and one argument about a sofa, and the sofa won. You saw more of your friends that month than in the previous year.';
        }
      },
      {
        label: 'Give away whatever will not fit',
        result: 'You put a box out for collection and gave most of it away, which was a whole attic cleared in ten minutes.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', 1); }
      }
    ]
  },

  {
    id: 'money_debt_collector',
    category: 'money',
    weight: 4,
    minAge: 18,
    maxAge: 90,
    once: false,
    require: (game) => (game.flags['debt'] ?? 0) > 0,
    text: (game) => `The statement for what you owe came through, with ${Format.money(game.flags['debt'])} on it and the word "final" in the subject line.`,
    choices: [
      {
        label: 'Pay what you can this month',
        result: (game) => {
          const pay = Math.min(Math.max(game.money, 0), Math.round((game.flags['debt'] ?? 0) * 0.15));
          game.addMoney(-pay);
          game.flags['debt'] = Math.max(0, (game.flags['debt'] ?? 0) - pay);
          if (game.flags['debt'] === 0) game.log('You cleared the last of what you owed.', 'assets');
          return `You paid ${Format.money(pay)} and ${game.flags['debt'] > 0 ? `${Format.money(game.flags['debt'])} of it is still there.` : 'that was the last of it.'}`;
        }
      },
      {
        label: 'Pay it all off now',
        require: (game) => game.canAfford(game.flags['debt'] ?? 0) ? true : Needs.MONEY(game.flags['debt'] ?? 0),
        result: (game) => {
          const total = game.flags['debt'] ?? 0;
          game.spend(total);
          game.flags['debt'] = 0;
          game.stat('happiness', 12);
          game.log(`You cleared ${Format.money(total)} of debt in one go.`, 'assets');
          return `You cleared all ${Format.money(total)} in a single afternoon and slept unusually well for a month.`;
        }
      },
      {
        label: 'Ignore the statement',
        result: (game) => {
          const grew = Math.round((game.flags['debt'] ?? 0) * 0.12);
          game.flags['debt'] = (game.flags['debt'] ?? 0) + grew;
          game.stat('happiness', -4);
          return `You did nothing for a year. It is now ${Format.money(game.flags['debt'])}.`;
        }
      }
    ]
  }
]);
