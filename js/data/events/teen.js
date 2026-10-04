/*
 * Teenage life, roughly ages 13-19.
 *
 * Nothing here assumes the player is in school or out of it, has a partner,
 * or owns anything: the romance and driving events are gated on `game` state
 * and every event keeps one choice that cannot be locked, because a teenager
 * with no money, no friends and no qualifications still has to be able to
 * make a decision.
 */
EventEngine.register([
  {
    id: 'teen_first_kiss',
    category: 'social',
    weight: 3,
    minAge: 13,
    maxAge: 17,
    text: 'The evening had been going fine, and then it did not, and then it did again.',
    choices: [
      {
        label: 'Kiss them first',
        result: 'You kissed them first. Neither of you mentioned it for eleven days.',
        effect: (game) => {
          const p = Relationships.meetFriend(game);
          game.rel(p, 28);
          game.stat('happiness', 8);
          game.stat('looks', 2);
        }
      },
      {
        label: 'Wait until you are sure',
        result: 'You waited until you were sure. By the time you were sure, the evening was over.',
        effect: (game) => game.stat('happiness', -3)
      },
      {
        label: 'Say it was a bad idea and go home',
        result: 'You called it a bad idea and went home, which was at least a decision.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'teen_famous_crush',
    category: 'social',
    weight: 2,
    minAge: 13,
    maxAge: 19,
    text: 'You became mildly and completely unreasonable about someone who does not know you exist.',
    choices: [
      {
        label: 'Follow every single one of them online',
        result: 'You followed every post, back to a photograph from nine years ago.',
        effect: (game) => { game.stat('happiness', 6); game.stat('smarts', -3); game.stat('fame', 3); }
      },
      {
        label: 'Tell everyone about it loudly',
        result: 'You told everyone about it at volume, for about a year, which is exactly how long it took to get boring.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Get over it and get a personality instead',
        result: 'You got over it and spent the time on a hobby, which turned out to be a better use of the year.',
        effect: (game) => { game.stat('smarts', 4); game.stat('fitness', 3); }
      }
    ]
  },

  {
    id: 'teen_party_invite',
    category: 'social',
    weight: 3,
    minAge: 13,
    maxAge: 18,
    text: 'Somebody invited you to a party on a street you only know the name of.',
    choices: [
      {
        label: 'Go',
        result: 'You went. It got loud, then late, then very early indeed.',
        effect: (game) => {
          game.stat('happiness', 8);
          if (game.rng.chance(45)) game.stat('addiction', game.rng.int(8, 22));
          game.stat('health', -3);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Go but leave before it gets bad',
        result: 'You went, stayed two hours, and left at the point where leaving was still the obvious move.',
        effect: (game) => game.stat('happiness', 4)
      },
      {
        label: 'Stay home and be fine about it',
        result: 'You stayed in. The group chat was apparently very entertaining for everyone involved.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 3); }
      }
    ]
  },

  {
    id: 'teen_curfew',
    category: 'family',
    weight: 3,
    minAge: 13,
    maxAge: 17,
    text: 'You came home later than you said you would, to a house with the lights still on.',
    choices: [
      {
        label: 'Climb in through a window',
        result: 'You climbed in through a window, tore a trouser leg on the latch, and were in bed before anyone woke.',
        effect: (game) => { game.stat('happiness', 3); game.stat('health', -2); }
      },
      {
        label: 'Knock on the door and take it',
        result: 'You knocked and told the truth. You were grounded for two weeks and oddly lighter afterwards.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 2); }
      },
      {
        label: 'Blame a friend',
        result: 'You blamed a friend. They denied it the next day, in front of everyone.',
        effect: (game) => game.stat('happiness', -5)
      }
    ]
  },

  {
    id: 'teen_first_drink',
    category: 'health',
    weight: 3,
    minAge: 13,
    maxAge: 18,
    text: 'Someone handed you a cup at a gathering, and everyone watched to see what you would do with it.',
    choices: [
      {
        label: 'Drink it',
        result: 'You drank it. It tasted mostly of syrup and someone else deciding to experiment.',
        effect: (game) => {
          game.stat('addiction', game.rng.int(10, 26));
          game.stat('happiness', 5);
          game.stat('health', -4);
          game.stat('smarts', -2);
        }
      },
      {
        label: 'Hold the cup and never drink it',
        result: 'You held the cup for an hour, which fooled nobody except yourself.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Pour it into a plant pot',
        result: 'You poured it into a plant pot and went home on time.',
        effect: (game) => { game.stat('happiness', -2); game.stat('smarts', 3); }
      }
    ]
  },

  {
    id: 'teen_smoking',
    category: 'health',
    weight: 2,
    minAge: 13,
    maxAge: 18,
    text: 'Someone outside offered you one, and you thought about it for the entire length of the conversation.',
    choices: [
      {
        label: 'Take it',
        result: 'You took it. You coughed for four minutes and then smoked for eleven years.',
        effect: (game) => {
          game.stat('addiction', game.rng.int(12, 30));
          game.stat('health', -7);
          game.stat('fitness', -3);
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Say no and stay away from that group',
        result: 'You said no, and then actually stayed away from the group that offered, which is the harder half.',
        effect: (game) => { game.stat('health', 3); game.stat('happiness', -2); }
      },
      {
        label: 'Take it and throw it away after two puffs',
        result: 'You took it, gave it two puffs, and dropped the rest in a drain. Pure theatre, and you enjoyed it.',
        effect: (game) => game.stat('happiness', 2)
      }
    ]
  },

  {
    id: 'teen_cannabis',
    category: 'health',
    weight: 2,
    minAge: 14,
    maxAge: 19,
    text: 'A cousin with a bad reputation and a good supply made the offer at a family dinner, of all places.',
    choices: [
      {
        label: 'Try it once',
        result: 'You tried it once. Then once became a habit that stopped being a thing you did.',
        effect: (game) => {
          game.stat('addiction', game.rng.int(15, 35));
          game.stat('happiness', 6);
          game.stat('health', -6);
          game.stat('smarts', -4);
        }
      },
      {
        label: 'Refuse politely',
        result: 'You refused politely, and the conversation moved on without you, which you chose.',
        effect: (game) => { game.stat('happiness', -2); game.stat('health', 2); }
      },
      {
        label: 'Try it with a friend present',
        result: 'You tried it with a friend present, on the theory that someone there would keep an eye on you.',
        effect: (game) => {
          game.stat('addiction', game.rng.int(6, 18));
          game.stat('happiness', 5);
          game.stat('health', -3);
          const p = Relationships.meetFriend(game);
          game.rel(p, 15);
        }
      }
    ]
  },

  {
    id: 'teen_shoplifting',
    category: 'crime',
    weight: 2,
    minAge: 13,
    maxAge: 17,
    text: 'You were in a shop with nobody watching the door and something in your hand that you had not paid for.',
    choices: [
      {
        label: 'Walk out with it',
        result: 'You walked out with it. The outcome was decided by a stranger with a clipboard, not by you.',
        effect: (game) => {
          const res = Crime.commit(game, 'c_shoplift');
          game.log(res.text, 'crime');
        }
      },
      {
        label: 'Put it back',
        result: 'You put it back on the shelf, walked out, and thought about that decision for most of a week.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', -2); }
      },
      {
        label: 'Buy it with your last money',
        result: 'You bought it with money you had been saving. It did not feel nearly as good as taking it would have.',
        effect: (game) => game.spend(game.money)
      }
    ]
  },

  {
    id: 'teen_online_presence',
    category: 'social',
    weight: 2,
    minAge: 13,
    maxAge: 19,
    text: 'You posted something at two in the morning that a much larger number of people than you intended have now seen.',
    choices: [
      {
        label: 'Lean into it',
        result: 'You leaned into it and became briefly, and then permanently, a person who posts things at two in the morning.',
        effect: (game) => {
          game.stat('fame', 14);
          game.stat('happiness', 3);
          game.stat('smarts', -3);
        }
      },
      {
        label: 'Delete everything and go quiet',
        result: 'You deleted everything and went quiet. It took four hours and the screenshots lasted anyway.',
        effect: (game) => { game.stat('happiness', -5); game.stat('smarts', 2); }
      },
      {
        label: 'Delete it and keep the account',
        result: 'You deleted the post, kept the account, and spent the rest of the year being extremely careful.',
        effect: (game) => { game.stat('fame', 3); game.stat('smarts', 4); }
      }
    ]
  },

  {
    id: 'teen_first_relationship',
    category: 'social',
    weight: 3,
    minAge: 14,
    maxAge: 18,
    text: 'There was someone you had known for years, and neither of you had said anything about it.',
    require: (game) => {
      if (!Can.single(game)) return Needs.SINGLE;
      const p = someone(game);
      return p && p.relationship >= 35 ? true : Needs.FRIEND;
    },
    choices: [
      {
        label: 'Ask them out',
        result: 'You asked, in a stairwell, badly. They said yes before you finished the sentence.',
        effect: (game) => {
          const res = Relationships.becomePartner(game, someone(game));
          game.log(res.text, 'social');
        }
      },
      {
        label: 'Wait for a better opening',
        result: 'You waited for a better opening. A better opening never came, and neither did anything else.',
        effect: (game) => game.stat('happiness', -4)
      },
      {
        label: 'Say nothing and hope they notice',
        result: 'You said nothing and hoped they would notice. You were the only one doing any hoping.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'teen_first_heartbreak',
    category: 'social',
    weight: 2,
    minAge: 15,
    maxAge: 19,
    text: 'It turned out the relationship had been over for a while, and you were the last to be told.',
    require: (game) => game.partner() ? true : Needs.PARTNER,
    choices: [
      {
        label: 'End it yourself',
        result: 'You ended it first, which hurt exactly as much but at least kept the dignity.',
        effect: (game) => {
          Relationships.breakUp(game, 'You broke up. It was quiet and final.');
        }
      },
      {
        label: 'Try to save it',
        result: 'You tried to save it. You talked for hours and nothing in the last three weeks got better.',
        effect: (game) => {
          game.rel(game.partner(), 8);
          game.stat('happiness', -4);
        }
      },
      {
        label: 'Pretend you have not noticed',
        result: 'You pretended you had not noticed for another four months, and everyone was polite about it.',
        effect: (game) => {
          game.rel(game.partner(), -10);
          game.stat('happiness', -6);
        }
      }
    ]
  },

  {
    id: 'teen_someone_flirts',
    category: 'social',
    weight: 2,
    minAge: 15,
    maxAge: 19,
    text: 'Somebody who is not your partner made it very obvious that they were available, and your partner was not in the room.',
    require: (game) => game.partner() ? true : Needs.PARTNER,
    choices: [
      {
        label: 'Tell your partner about it',
        result: 'You told your partner about it that evening. They were less suspicious than you had planned to be generous.',
        effect: (game) => {
          game.rel(game.partner(), 12);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Flirt back, carefully',
        result: 'You flirted back, carefully, and then carried the guilt around for three weeks.',
        effect: (game) => {
          game.rel(game.partner(), -12);
          game.stat('happiness', 4);
        }
      },
      {
        label: 'Walk away',
        result: 'You walked away. It cost you an evening and it saved you considerably more than that.',
        effect: (game) => { game.stat('happiness', -1); game.stat('smarts', 3); }
      }
    ]
  },

  {
    id: 'teen_parents_split',
    category: 'family',
    weight: 2,
    minAge: 13,
    maxAge: 18,
    text: 'Your parents told you they were splitting up, in the tone of people who had rehearsed it.',
    choices: [
      {
        label: 'Take a side',
        result: 'You took a side, which meant losing the other one to a different suburb.',
        effect: (game) => {
          const parents = game.parents().filter((p) => !p.isDead);
          const chosen = game.rng.pick(parents);
          const other = parents.find((p) => p !== chosen);
          if (chosen) game.rel(chosen, 15);
          if (other) game.rel(other, -20);
          game.stat('happiness', -10);
          game.log('Your parents split up.', 'life');
        }
      },
      {
        label: 'Refuse to choose',
        result: 'You refused to choose, which nobody appreciated and everybody respected.',
        effect: (game) => {
          for (const p of game.parents()) if (!p.isDead) game.rel(p, -5);
          game.stat('happiness', -6);
          game.stat('smarts', 2);
          game.log('Your parents split up.', 'life');
        }
      },
      {
        label: 'Be glad it is finally happening',
        result: 'You were glad it was finally happening, which you have never entirely admitted out loud.',
        effect: (game) => {
          game.stat('happiness', -2);
          game.stat('smarts', 3);
          game.log('Your parents split up.', 'life');
        }
      }
    ]
  },

  {
    id: 'teen_sibling_rivalry',
    category: 'family',
    weight: 2,
    minAge: 13,
    maxAge: 19,
    text: 'A sibling got something you had wanted for a year, and everybody in the house knew exactly how to feel about that.',
    require: (game) => game.siblings().length > 0 ? true : 'You do not have a sibling.',
    choices: [
      {
        label: 'Fight about it properly',
        result: 'You fought about it until somebody cried. It was not resolved, but it was over.',
        effect: (game) => {
          const s = game.rng.pick(game.siblings());
          game.rel(s, -15);
          game.stat('happiness', -3);
        }
      },
      {
        label: 'Let it go, out loud, in public',
        result: 'You said you were happy for them, in a voice that surprised you by being convincing.',
        effect: (game) => {
          const s = game.rng.pick(game.siblings());
          game.rel(s, 15);
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Stop speaking to them',
        result: 'You stopped speaking to them for eleven months. The silence lasted most of a school year.',
        effect: (game) => {
          const s = game.rng.pick(game.siblings());
          game.rel(s, -20);
          game.stat('happiness', -2);
        }
      }
    ]
  },

  {
    id: 'teen_prom',
    category: 'social',
    weight: 3,
    minAge: 16,
    maxAge: 18,
    text: 'The prom was being organised, and the ticket cost more than your entire year had.',
    choices: [
      {
        label: 'Go with a date, properly dressed',
        require: (game) => {
          if (!game.partner()) return Needs.PARTNER;
          if (!game.canAfford(300)) return Needs.MONEY(300);
          return true;
        },
        result: 'You went with a date, in something you had to be talked into. It was a good night.',
        effect: (game) => {
          game.spend(300);
          game.rel(game.partner(), 18);
          game.stat('happiness', 10);
          game.stat('looks', 3);
          game.stat('fame', 4);
        }
      },
      {
        label: 'Go with a group of friends',
        result: 'You went with a group of friends and spent the evening photographing other people having a better night.',
        effect: (game) => {
          game.spend(60);
          const p = Relationships.meetFriend(game);
          game.rel(p, 20);
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Skip it and stay in',
        result: 'You skipped it and stayed in. Everyone has photographs; you have sleep.',
        effect: (game) => { game.stat('happiness', -2); game.stat('health', 2); }
      }
    ]
  },

  {
    id: 'teen_senior_trip',
    category: 'school',
    weight: 2,
    minAge: 17,
    maxAge: 18,
    text: 'The school was running a senior trip, and the cost had been in the letters home for two months.',
    choices: [
      {
        label: 'Go and work to pay for it',
        require: (game) => game.canAfford(200) ? true : Needs.MONEY(200),
        result: 'You worked the summer and went. The trip cost you three months of evenings and was worth about four days.',
        effect: (game) => {
          game.spend(200);
          game.stat('happiness', 8);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Go, and let the family cover it',
        result: 'You went, and the family covered it, and the debt was discussed at every meal for a year.',
        effect: (game) => {
          game.stat('happiness', 6);
          game.stat('smarts', -1);
        }
      },
      {
        label: 'Skip it and save the money',
        result: 'You skipped it and saved the money, which you still have and they never went.',
        effect: (game) => {
          game.addMoney(cash(game, 300, 900));
          game.stat('happiness', -3);
        }
      }
    ]
  },

  {
    id: 'teen_sleepover',
    category: 'social',
    weight: 2,
    minAge: 12,
    maxAge: 17,
    text: 'You were going to stay at somebody else house, which was either going to be the best or the worst night of the year.',
    choices: [
      {
        label: 'Stay up all night talking',
        result: 'You stayed up until four talking about things you have never discussed since.',
        effect: (game) => {
          const p = Relationships.meetFriend(game);
          game.rel(p, 25);
          game.stat('happiness', 8);
          game.stat('health', -3);
        }
      },
      {
        label: 'Sleep well for once',
        result: 'You slept eleven hours and woke up to someone else cooking breakfast. Unheard of.',
        effect: (game) => {
          game.stat('health', 5);
          game.stat('happiness', 4);
        }
      },
      {
        label: 'Go home at two in the morning',
        result: 'You went home at two in the morning, on foot, and felt extremely important doing it.',
        effect: (game) => {
          game.stat('happiness', 2);
          game.stat('fitness', 2);
          game.stat('health', -2);
        }
      }
    ]
  },

  {
    id: 'teen_midnight_drive',
    category: 'social',
    weight: 2,
    minAge: 16,
    maxAge: 19,
    text: 'It was past one in the morning, everyone had been drinking, and the car keys were still in the ignition.',
    choices: [
      {
        label: 'Drive',
        require: (game) => Can.hasCar(game) ? true : Needs.CAR,
        result: 'You drove. It went one of two ways, and there was no third option.',
        effect: (game) => {
          if (game.rng.chance(22)) {
            game.stat('health', -12);
            game.stat('happiness', -6);
            game.log('You crashed the car at two in the morning.', 'health');
          } else {
            game.stat('happiness', 6);
            game.stat('fame', 2);
            game.log('You got everyone home without incident, which felt like a triumph.', 'social');
          }
        }
      },
      {
        label: 'Give the keys to someone else',
        result: 'You handed the keys to somebody who looked even less tired, which solved nothing.',
        effect: (game) => { game.stat('happiness', 2); game.stat('health', -2); }
      },
      {
        label: 'Walk home',
        result: 'You walked home. It took an hour and a half and you have told the story more than the story deserves.',
        effect: (game) => { game.stat('fitness', 6); game.stat('happiness', 3); game.stat('health', -2); }
      }
    ]
  },

  {
    id: 'teen_school_prank',
    category: 'school',
    weight: 2,
    minAge: 14,
    maxAge: 18,
    text: 'A plan had been going around for a week, and it involved a room full of people and no adult in it.',
    choices: [
      {
        label: 'Help with the prank',
        result: 'You helped. It was funny for about forty minutes and then it was a conversation with the head teacher.',
        effect: (game) => {
          game.stat('happiness', 7);
          game.stat('fame', 5);
          game.stat('smarts', -2);
          if (game.rng.chance(40)) game.stat('happiness', -5);
        }
      },
      {
        label: 'Photograph it from a safe distance',
        result: 'You photographed it from a safe distance. The photographs were the only thing anybody still has.',
        effect: (game) => { game.stat('happiness', 4); game.stat('fame', 3); }
      },
      {
        label: 'Tell a teacher about it',
        result: 'You told a teacher, and a teacher took it seriously, which ruined it for everyone including you.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'teen_reputation',
    category: 'social',
    weight: 2,
    minAge: 14,
    maxAge: 18,
    text: 'Something you did had got around, and people who had never met you had opinions about it.',
    choices: [
      {
        label: 'Lean into the reputation',
        result: 'You leaned into it. Within a year it was not a reputation, it was a job description.',
        effect: (game) => { game.stat('fame', 8); game.stat('happiness', -3); }
      },
      {
        label: 'Apologise properly and move on',
        result: 'You apologised properly, in person, and then had to be the person who had apologised, which had its own cost.',
        effect: (game) => { game.stat('happiness', 4); game.stat('smarts', 2); }
      },
      {
        label: 'Change schools',
        result: 'You changed schools. It solved the problem by replacing it with a worse one, at a new school.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'teen_goth_phase',
    category: 'life',
    weight: 2,
    minAge: 13,
    maxAge: 18,
    text: 'You went through a phase involving black clothes and a very specific attitude.',
    choices: [
      {
        label: 'Do it properly',
        result: 'You did it properly, for three years, and emerged with a face and a posture that stuck.',
        effect: (game) => { game.stat('looks', 7); game.stat('fitness', -3); game.stat('happiness', 4); }
      },
      {
        label: 'Keep it subtle',
        result: 'You kept it to one ring and a bad attitude, which lasted about five months.',
        effect: (game) => { game.stat('looks', 3); game.stat('happiness', 2); }
      },
      {
        label: 'Decline to change anything',
        result: 'You declined to change anything and let people say what they liked, which was somehow worse.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 2); }
      }
    ]
  },

  {
    id: 'teen_summer_camp',
    category: 'social',
    weight: 2,
    minAge: 13,
    maxAge: 16,
    text: 'A summer camp place came through, along with a form and a list of things to pack.',
    choices: [
      {
        label: 'Go',
        result: 'You went. You were homesick for two days and then entirely absorbed for two weeks.',
        effect: (game) => {
          game.stat('happiness', 8);
          game.stat('fitness', 4);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Go but hate every minute',
        result: 'You went and complained about it the entire time, which is a perfectly good way to spend a summer.',
        effect: (game) => {
          game.stat('happiness', -2);
          game.stat('fitness', 4);
          const p = Relationships.meetFriend(game);
          game.rel(p, 12);
        }
      },
      {
        label: 'Skip it',
        result: 'You skipped it. You spent the summer at home, which was cheaper for everyone.',
        effect: (game) => { game.stat('happiness', -3); game.addMoney(cash(game, 200, 600)); }
      }
    ]
  },

  {
    id: 'teen_join_band',
    category: 'social',
    weight: 2,
    minAge: 13,
    maxAge: 18,
    text: 'Four people agreed to start a band, which is the part most bands never get past.',
    choices: [
      {
        label: 'Take it seriously and practise weekly',
        result: 'You practised weekly for two years and got good enough that people asked you to play unpaid.',
        effect: (game) => { game.stat('smarts', 4); game.stat('fitness', 3); game.stat('happiness', 5); }
      },
      {
        label: 'Learn three songs and record badly',
        result: 'You learned three songs and recorded something badly. It is still up somewhere.',
        effect: (game) => { game.stat('fame', 7); game.stat('happiness', 6); }
      },
      {
        label: 'Start a solo project instead',
        result: 'You started it alone, wrote four songs, and released none of them.',
        effect: (game) => { game.stat('smarts', 5); game.stat('fame', 2); game.stat('happiness', 1); }
      }
    ]
  },

  {
    id: 'teen_moving_out',
    category: 'life',
    weight: 2,
    minAge: 18,
    maxAge: 19,
    text: 'Leaving home was on the list of things that were supposed to happen, and it was supposed to happen now.',
    choices: [
      {
        label: 'Put down for a place with a deposit',
        require: (game) => game.canAfford(1200) ? true : Needs.MONEY(1200),
        result: 'You put down a deposit and moved out with three boxes and a kettle. It was small and it was yours.',
        effect: (game) => {
          game.spend(1200);
          game.stat('happiness', 9);
          game.stat('happiness', -3);
        }
      },
      {
        label: 'Move in with a friend',
        result: 'You moved in with a friend on the understanding that it was temporary. It is now two years.',
        effect: (game) => {
          const p = Relationships.meetFriend(game);
          game.rel(p, 25);
          game.stat('happiness', 5);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Stay at home and admit it suits you',
        result: 'You stayed at home and admitted that it suited you, which saved everybody a great deal of money.',
        effect: (game) => { game.stat('happiness', 3); game.stat('smarts', -1); }
      }
    ]
  },

  {
    id: 'teen_school_finished',
    category: 'school',
    weight: 3,
    minAge: 17,
    maxAge: 19,
    text: 'School was nearly over, and nobody had told you what the after part was supposed to look like.',
    choices: [
      {
        label: 'Plan a year of university',
        result: 'You planned a year of university and wrote down every deadline, which is a rare and moving thing to do.',
        effect: (game) => { game.stat('smarts', 5); game.stat('happiness', 3); }
      },
      {
        label: 'Line up a job instead',
        result: 'You lined up a job instead and started the first week before anyone had said congratulations.',
        effect: (game) => {
          game.addMoney(cash(game, 600, 1800));
          game.stat('happiness', 4);
          game.stat('smarts', -2);
        }
      },
      {
        label: 'Take a gap year and go somewhere',
        result: 'You took a gap year and went somewhere, which cost a fair bit and was the right decision.',
        effect: (game) => {
          game.spend(Math.min(game.money, cash(game, 1500, 4000)));
          game.stat('happiness', 9);
          game.stat('smarts', 3);
          game.stat('fitness', 3);
        }
      }
    ]
  }
]);