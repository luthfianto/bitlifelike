/*
 * Reference event file — early childhood, ages 0-12.
 *
 * EVENT SHAPE
 *   { id, category, weight, minAge, maxAge, once,
 *     text: string | (game) => string,
 *     require?: (game) => true | false | 'reason',
 *     choices: [{ label, require?, result, effect?: (game) => void }] }
 *
 * RULES
 *   - ids are unique across every file
 *   - `game` is the GameState; everything reachable is listed in the contract
 *   - all randomness goes through game.rng (never Math.random) so a seed
 *     reproduces a life exactly
 *   - every event needs at least one choice that is never locked, so the
 *     player can always move forward
 *   - choice.require returning a string shows that string as the lock reason
 */
EventEngine.register([
  {
    id: 'kid_talk',
    category: 'child',
    weight: 3,
    minAge: 1,
    maxAge: 2,
    text: 'You said your first real word. It was aimed at the dog, and the word was wrong, but the dog responded anyway.',
    choices: [
      {
        label: 'Keep saying it',
        result: 'You said it forty more times that week.',
        effect: (game) => game.stat('happiness', 4)
      },
      {
        label: 'Move on to real words',
        result: 'Within a month you had a whole handful of them.',
        effect: (game) => game.stat('smarts', 3)
      }
    ]
  },

  {
    id: 'kid_first_day_school',
    category: 'school',
    weight: 4,
    minAge: 5,
    maxAge: 6,
    text: 'Your first day of school arrived and you hated every second of the walk there.',
    choices: [
      {
        label: 'Cry the whole way',
        result: 'You cried for an hour. The teacher was patient.',
        effect: (game) => game.stat('happiness', -4)
      },
      {
        label: 'Refuse to go',
        result: 'You sat in the corridor for two hours until your mother dragged you in.',
        effect: (game) => { game.stat('happiness', -3); game.stat('smarts', 1); }
      },
      {
        label: 'Say hello to everyone',
        result: 'By lunch you had made four friends and forgotten you were scared.',
        effect: (game) => game.stat('happiness', 5)
      },
      {
        label: 'Study quietly the whole day',
        result: 'You absorbed everything the teacher said. She asked your parents about it later.',
        effect: (game) => game.stat('smarts', 7)
      }
    ]
  },

  {
    id: 'kid_report_card',
    category: 'school',
    weight: 3,
    minAge: 7,
    maxAge: 12,
    text: (game) => `Your report card came home. You hid it from your parents for about an hour.`,
    choices: [
      {
        label: 'Fudge the grades',
        result: 'You rewrote them in pen. Nobody noticed until the teacher called.',
        effect: (game) => {
          game.stat('happiness', 2);
          game.setStat('smarts', game.stats.smarts - 3);
        }
      },
      {
        label: 'Show them honestly',
        result: 'You handed it over. Your parents were disappointed, then proud of the honesty.',
        effect: (game) => game.stat('happiness', -2)
      },
      {
        label: 'Work much harder this year',
        result: 'You actually did the reading. The difference showed.',
        effect: (game) => game.stat('smarts', 8)
      }
    ]
  },

  {
    id: 'kid_bully',
    category: 'child',
    weight: 3,
    minAge: 8,
    maxAge: 15,
    text: 'A kid who was bigger than you decided you were the easiest target in the yard.',
    choices: [
      {
        label: 'Fight back',
        result: 'You got a broken nose and gave one back. You earned some respect and some bruises.',
        effect: (game) => {
          game.stat('health', -6);
          game.stat('fitness', 4);
          game.stat('happiness', -3);
        }
      },
      {
        label: 'Tell a teacher',
        result: 'The kid got detention. Nothing changed, but you were not alone in it.',
        effect: (game) => game.stat('happiness', -1)
      },
      {
        label: 'Avoid them completely',
        result: 'You built a whole route around that kid and lived with it for a year.',
        effect: (game) => { game.stat('happiness', -4); game.stat('smarts', 2); }
      },
      {
        label: 'Befriend them instead',
        result: 'It took a month of effort and zero sense, but it worked.',
        effect: (game) => {
          const p = game.addPerson({ type: 'friend', age: game.age + 1, relationship: 62 });
          game.rel(p, 15);
        }
      }
    ]
  },

  {
    id: 'kid_talent',
    category: 'child',
    weight: 2,
    minAge: 6,
    maxAge: 14,
    text: 'A teacher pulled you aside after class and said you were unusually good at something.',
    choices: [
      {
        label: 'Work at it every day',
        result: 'You practised until it stopped being fun and then a bit past that.',
        effect: (game) => { game.stat('smarts', 6); game.stat('happiness', -2); }
      },
      {
        label: 'Take it easy',
        result: 'You did it when you felt like it, which turned out to be almost never.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Make it a performance',
        result: 'You put on shows and won things. Everyone knew your name.',
        effect: (game) => game.stat('fame', 12)
      }
    ]
  },

  {
    id: 'kid_family_move',
    category: 'family',
    weight: 2,
    minAge: 4,
    maxAge: 17,
    text: 'Your family moved. New street, new school, same furniture.',
    choices: [
      {
        label: 'Make friends quickly',
        result: 'It took a month of hanging around the edges before someone let you sit with them.',
        effect: (game) => game.stat('happiness', 5)
      },
      {
        label: 'Keep your head down',
        result: 'You stayed quiet the whole year and nobody bothered you.',
        effect: (game) => { game.stat('smarts', 3); game.stat('happiness', -3); }
      },
      {
        label: 'Beg to go back',
        result: 'Your parents said no, kindly, which somehow made it worse.',
        effect: (game) => game.stat('happiness', -6)
      }
    ]
  },

  {
    id: 'kid_pet_wish',
    category: 'child',
    weight: 2,
    minAge: 5,
    maxAge: 15,
    text: 'You asked your parents for a pet and they said we will see what we can do.',
    choices: [
      {
        label: 'Adopt one yourself',
        result: 'You found one at the shelter and worked on your parents for three months.',
        effect: (game) => {
          const res = Portfolio.adoptPet(game, Catalog.PETS[game.rng.int(2, 5)]);
          game.log(res.ok ? `Your parents gave in. You got ${res.asset.label}.` : res.text, 'assets');
        }
      },
      {
        label: 'Keep asking for years',
        result: 'They finally relented when you were old enough to help pay for it.',
        effect: (game) => {
          const def = Catalog.PETS[game.rng.int(1, 4)];
          if (game.money >= def.price) Portfolio.adoptPet(game, def);
          else game.stat('happiness', -4);
        }
      },
      {
        label: 'Drop the idea',
        result: 'You forgot about it by Christmas.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'kid_hospital',
    category: 'health',
    weight: 2,
    minAge: 1,
    maxAge: 14,
    text: 'You ended up in hospital for a few days. The cause was ordinary and uninteresting.',
    choices: [
      {
        label: 'Be brave about it',
        result: 'You were fine. The scar is small and you tell the story with a straight face.',
        effect: (game) => game.stat('health', -8)
      },
      {
        label: 'Use it to get out of school',
        result: 'You caught up in a week. Being sick had its perks.',
        effect: (game) => { game.stat('health', -8); game.stat('smarts', -1); }
      },
      {
        label: 'Develop a lasting fear of doctors',
        result: 'You have avoided dentists and hospitals ever since.',
        effect: (game) => { game.stat('health', -6); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'kid_friend_lost',
    category: 'child',
    weight: 2,
    minAge: 6,
    maxAge: 16,
    text: 'Your best friend moved away in the middle of the year.',
    choices: [
      {
        label: 'Write letters',
        result: 'You kept it up for a year and then life got in the way.',
        effect: (game) => game.stat('happiness', -3)
      },
      {
        label: 'Throw yourself into new friends',
        result: 'You replaced them within a month, and mostly forgot.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Keep the friendship going by phone',
        result: 'You are still in touch. Some people are like that.',
        effect: (game) => {
          game.stat('happiness', 2);
          game.addPerson({ type: 'friend', age: game.age, relationship: 70 });
        }
      }
    ]
  },

  {
    id: 'kid_neighbourhood_bullies',
    category: 'child',
    weight: 2,
    minAge: 9,
    maxAge: 16,
    text: 'A group of older kids started hanging around the end of your street.',
    choices: [
      {
        label: 'Avoid that route entirely',
        result: 'You added ten minutes to every journey and stopped complaining about it.',
        effect: (game) => { game.stat('happiness', -3); game.stat('fitness', 2); }
      },
      {
        label: 'Confront them',
        result: 'It went badly, and then it stopped.',
        effect: (game) => game.stat('health', -5)
      },
      {
        label: 'Persuade your parents to move',
        result: 'They resisted, then relented. You left the street behind.',
        effect: (game) => game.stat('happiness', 4)
      }
    ]
  },

  {
    id: 'kid_summer_job',
    category: 'child',
    weight: 2,
    minAge: 13,
    maxAge: 17,
    text: 'It was summer and every job in town had been taken by someone older.',
    choices: [
      {
        label: 'Wash cars for cash',
        result: 'You made a couple hundred dollars and an appreciation for sunburns.',
        effect: (game) => game.addMoney(cash(game, 150, 600))
      },
      {
        label: 'Mow lawns for cash',
        result: 'The money was thin but the work was honest.',
        effect: (game) => { game.addMoney(cash(game, 100, 450)); game.stat('fitness', 3); }
      },
      {
        label: 'Work in the family business',
        result: 'Your relatives gave you a job and paid you nothing, on the theory that family helps family.',
        effect: (game) => game.stat('smarts', 2)
      },
      {
        label: 'Skip working entirely',
        result: 'You spent the summer doing almost nothing, and it was fine.',
        effect: (game) => game.stat('happiness', 5)
      }
    ]
  }
]);