/*
 * School and education events, roughly ages 5-24.
 *
 * A life can skip elementary school, drop out of university, graduate early or
 * never enroll at all, so nothing here gates on age alone: enrolment events ask
 * `Education.canEnroll`, and everything else reads `game.education` directly.
 */
EventEngine.register([
  {
    id: 'school_enroll_elementary',
    category: 'school',
    weight: 5,
    minAge: 5,
    maxAge: 8,
    text: 'Your parents have started talking about which school you will go to, and how much it will cost.',
    require: (game) => Education.canEnroll(game, 'elementary') ?? true,
    choices: [
      {
        label: 'Start school on time',
        result: 'You started a week late and spent the whole first year drawing in the margins.',
        effect: (game) => {
          Education.enroll(game, 'elementary');
          game.stat('smarts', 2);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Keep them home another year',
        result: 'You stayed home for a year and learned to hold a conversation with adults without flinching.',
        effect: (game) => game.stat('happiness', 4)
      },
      {
        label: 'Insist on starting early',
        result: 'You were the youngest in the room by four years and did not care for the comparison.',
        effect: (game) => {
          Education.enroll(game, 'elementary');
          game.stat('smarts', 4);
          game.stat('happiness', -1);
        }
      }
    ]
  },

  {
    id: 'school_first_grade_day',
    category: 'school',
    weight: 3,
    minAge: 6,
    maxAge: 7,
    text: (game) => `Your first real day of school arrived, and you were ${game.age}.`,
    choices: [
      {
        label: 'Refuse to let go of your mother',
        result: 'You cried until the teacher picked you up, and then you were fine for the rest of the morning.',
        effect: (game) => game.stat('happiness', -3)
      },
      {
        label: 'Say hello to everyone in the room',
        result: 'By lunch you had made four friends and forgotten to be scared.',
        effect: (game) => game.stat('happiness', 5)
      },
      {
        label: 'Sit at the front and ask questions',
        result: 'You absorbed the entire morning. The teacher mentioned it to your parents for years afterward.',
        effect: (game) => game.stat('smarts', 6)
      }
    ]
  },

  {
    id: 'school_math_tutor',
    category: 'school',
    weight: 2,
    minAge: 8,
    maxAge: 13,
    text: (game) => `You came home with a test score of ${game.rng.int(38, 61)} and a note about the shape of your numbers.`,
    choices: [
      {
        label: 'Hire a private tutor',
        require: (game) => game.canAfford(400) ? true : Needs.MONEY(400),
        result: 'A very patient woman tutored you on Tuesdays. You still do not know why you kept dividing by nine.',
        effect: (game) => {
          game.spend(400);
          game.stat('smarts', 8);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Work through it every night',
        result: 'You did an hour of sums after dinner until the numbers stopped being personal.',
        effect: (game) => { game.stat('smarts', 6); game.stat('happiness', -2); }
      },
      {
        label: 'Copy the answers of someone clever',
        result: 'The tests stopped being a problem. Nobody checked whether you had learned anything.',
        effect: (game) => { game.stat('smarts', -2); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'school_book_fair',
    category: 'school',
    weight: 2,
    minAge: 7,
    maxAge: 12,
    text: 'The book fair came to the school hall, and your parents had made it clear that you were buying one book.',
    choices: [
      {
        label: 'Buy everything on the table',
        require: (game) => game.canAfford(60) ? true : Needs.MONEY(60),
        result: 'You went home with nine books and a plastic bookmark you still have.',
        effect: (game) => {
          game.spend(60);
          game.stat('smarts', 6);
          game.stat('happiness', 4);
        }
      },
      {
        label: 'Buy the one you actually wanted',
        require: (game) => game.canAfford(12) ? true : Needs.MONEY(12),
        result: 'One hardback, chosen carefully. You read it twice in a fortnight.',
        effect: (game) => {
          game.spend(12);
          game.stat('smarts', 3);
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Take the free paperback shelf',
        result: 'You picked the one with the most dogs on the cover. It was a good call for its time.',
        effect: (game) => game.stat('happiness', 3)
      }
    ]
  },

  {
    id: 'school_class_election',
    category: 'school',
    weight: 2,
    minAge: 9,
    maxAge: 13,
    text: 'The class was picking a representative, and everyone assumed it was going to be the same kid as last year.',
    choices: [
      {
        label: 'Stand against the favourite',
        result: 'You lost by four votes and it stayed with you for about a week.',
        effect: (game) => {
          game.stat('fame', 4);
          game.stat('smarts', 2);
          if (game.rng.chance(30)) game.stat('happiness', 4);
          else game.stat('happiness', -2);
        }
      },
      {
        label: 'Campaign for someone else',
        result: 'You wrote the speech. They won. Nobody remembered who wrote it.',
        effect: (game) => { game.stat('smarts', 3); game.stat('fame', 2); }
      },
      {
        label: 'Stay out of it entirely',
        result: 'You spent the assembly doing sums in the back of your book.',
        effect: (game) => game.stat('smarts', 2)
      }
    ]
  },

  {
    id: 'school_sports_tryout',
    category: 'school',
    weight: 3,
    minAge: 9,
    maxAge: 16,
    text: 'Tryouts for the school team were on Thursday, and half the school had already decided it was the main event of the year.',
    choices: [
      {
        label: 'Train hard and make the team',
        result: 'You made the team. Practice was four mornings a week and your knees have never quite forgiven it.',
        effect: (game) => {
          game.stat('fitness', 12);
          game.stat('happiness', 4);
          game.stat('health', -2);
        }
      },
      {
        label: 'Turn up once, badly, and quit',
        result: 'You lasted one practice. The coach was disappointed in a way you found oddly restful.',
        effect: (game) => { game.stat('fitness', -1); game.stat('happiness', -1); }
      },
      {
        label: 'Join a sport nobody takes seriously',
        result: 'You joined the least competitive team in the school and had a very good four years.',
        effect: (game) => { game.stat('fitness', 7); game.stat('happiness', 5); }
      }
    ]
  },

  {
    id: 'school_music_lessons',
    category: 'school',
    weight: 2,
    minAge: 8,
    maxAge: 16,
    text: 'Someone at home suggested an instrument, in the tone of someone who has already been through this argument.',
    choices: [
      {
        label: 'Practise every single day',
        result: 'You did it for five years. You are not great, but you are the person people ask to play at parties.',
        effect: (game) => { game.stat('smarts', 6); game.stat('happiness', -2); }
      },
      {
        label: 'Play when you feel like it',
        result: 'You played when you felt like it, which turned out to be about twice a year.',
        effect: (game) => game.stat('happiness', 3)
      },
      {
        label: 'Enter the school talent show',
        result: 'You played badly to applause anyway, and you have never needed anyone to like your music since.',
        effect: (game) => { game.stat('fame', 6); game.stat('happiness', 5); }
      }
    ]
  },

  {
    id: 'school_lunch_money',
    category: 'school',
    weight: 2,
    minAge: 8,
    maxAge: 12,
    text: 'You forgot your lunch money, and the office window had already closed.',
    choices: [
      {
        label: 'Take it off a younger kid',
        result: 'It worked. You felt sick for most of the day and not, if you are honest, about the reason.',
        effect: (game) => { game.stat('happiness', -3); game.stat('health', -2); }
      },
      {
        label: 'Tell the office you forgot',
        result: 'They gave you a sandwich and did not make it into anything. That was the whole crisis.',
        effect: (game) => game.stat('happiness', 2)
      },
      {
        label: 'Go hungry for a day',
        result: 'You went without. You have used this technique on yourself several times since.',
        effect: (game) => { game.stat('health', -3); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'school_enroll_middle',
    category: 'school',
    weight: 5,
    minAge: 12,
    maxAge: 13,
    text: 'Middle school started at twelve, which is the age at which everyone suddenly thinks they are old.',
    require: (game) => Education.canEnroll(game, 'middle') ?? true,
    choices: [
      {
        label: 'Enroll and start over',
        result: 'You enrolled in the local middle school and started again as the smallest person in every corridor.',
        effect: (game) => {
          Education.enroll(game, 'middle');
          game.stat('smarts', 2);
          game.stat('happiness', -1);
        }
      },
      {
        label: 'Go straight to work instead',
        result: 'You did not enroll. Everyone assumed you were being disciplined, which is a useful thing to be assumed.',
        effect: (game) => { game.stat('smarts', -1); game.stat('happiness', 3); }
      },
      {
        label: 'Enroll but complain about it daily',
        result: 'You enrolled, and complained about it daily, which became a routine you liked more than school itself.',
        effect: (game) => {
          Education.enroll(game, 'middle');
          game.stat('smarts', 3);
          game.stat('happiness', -3);
        }
      }
    ]
  },

  {
    id: 'school_classmate_crush',
    category: 'school',
    weight: 2,
    minAge: 12,
    maxAge: 15,
    text: 'You developed a crush on someone in your class and you have been rearranging your entire timetable around it.',
    choices: [
      {
        label: 'Say something out loud',
        result: 'They said something back. Whether it was a yes was a question for the rest of the term.',
        effect: (game) => {
          const p = Relationships.meetFriend(game);
          game.rel(p, 30);
          game.stat('happiness', 6);
        }
      },
      {
        label: 'Write notes and pass them',
        result: 'You passed notes for a term. They were returned with corrections, which felt worse than nothing.',
        effect: (game) => {
          const p = Relationships.meetFriend(game);
          game.rel(p, 10);
          game.stat('happiness', 2);
        }
      },
      {
        label: 'Say nothing and think about it forever',
        result: 'You never said anything. You still have the folder of evidence.',
        effect: (game) => game.stat('happiness', -2)
      }
    ]
  },

  {
    id: 'school_cheat_on_test',
    category: 'school',
    weight: 2,
    minAge: 12,
    maxAge: 19,
    text: 'You had a test you had not studied for, and a folded sheet in the bottom of your bag.',
    choices: [
      {
        label: 'Use the sheet',
        result: 'You used it. The grade was good and you spent the rest of the term unable to look at the subject.',
        effect: (game) => { game.stat('smarts', -2); game.stat('happiness', -2); }
      },
      {
        label: 'Stay up all night and do it honestly',
        result: 'You stayed up until four. You got a middling grade and could actually do the work.',
        effect: (game) => { game.stat('smarts', 7); game.stat('happiness', -3); game.stat('health', -3); }
      },
      {
        label: 'Hand it in blank and take the hit',
        result: 'You handed in a blank page. The teacher looked at you with what might have been respect.',
        effect: (game) => { game.stat('smarts', 1); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'school_enroll_high_school',
    category: 'school',
    weight: 5,
    minAge: 14,
    maxAge: 16,
    text: 'High school enrollment paperwork sat on the kitchen table for a month, waiting for a signature.',
    require: (game) => Education.canEnroll(game, 'high_school') ?? true,
    choices: [
      {
        label: 'Enroll at the good school',
        result: 'You enrolled at the school with the long waiting list. The commute alone was a daily commitment.',
        effect: (game) => {
          Education.enroll(game, 'high_school');
          game.stat('smarts', 5);
          game.stat('happiness', -1);
        }
      },
      {
        label: 'Enroll at the one you could get into',
        result: 'You enrolled at the nearest school and stopped thinking about it, which is its own kind of relief.',
        effect: (game) => {
          Education.enroll(game, 'high_school');
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Sign nothing and leave',
        result: 'You did not enroll. Four years later this decision will look either brave or catastrophic.',
        effect: (game) => { game.stat('smarts', -2); game.stat('happiness', 2); }
      }
    ]
  },

  {
    id: 'school_skip_class',
    category: 'school',
    weight: 3,
    minAge: 14,
    maxAge: 18,
    text: 'There is a free period you are not enrolled in, and the car park behind the sports hall has no supervision.',
    choices: [
      {
        label: 'Go to class like a sensible person',
        result: 'You went to class. Nothing happened, which is the entire reward.',
        effect: (game) => game.stat('smarts', 4)
      },
      {
        label: 'Skip with friends',
        result: 'You skipped with four friends and spent the period behind the sports hall being fairly happy.',
        effect: (game) => { game.stat('smarts', -3); game.stat('happiness', 6); }
      },
      {
        label: 'Skip and get caught',
        result: 'You were in the corridor when the head walked past. The detention was two hours of silence.',
        effect: (game) => { game.stat('smarts', -2); game.stat('happiness', -4); }
      }
    ]
  },

  {
    id: 'school_after_school_job',
    category: 'school',
    weight: 2,
    minAge: 14,
    maxAge: 18,
    text: (game) => `A job came up that finished at six, which was fine in theory, because school let out at ${game.age > 16 ? 'three' : 'three-thirty'}.`,
    choices: [
      {
        label: 'Take the shifts',
        result: 'You worked four evenings a week and your grades developed a predictable dip in the third term.',
        effect: (game) => {
          game.addMoney(cash(game, 300, 900));
          game.stat('smarts', -3);
          game.stat('happiness', 1);
          game.stat('health', -3);
        }
      },
      {
        label: 'Take two shifts a week',
        result: 'You worked the busiest two nights. It was a compromise nobody was fully happy with, least of all the manager.',
        effect: (game) => {
          game.addMoney(cash(game, 150, 400));
          game.stat('smarts', -1);
          game.stat('fitness', 1);
        }
      },
      {
        label: 'Keep your afternoons free',
        result: 'You turned it down and spent the year doing very little, productively.',
        effect: (game) => game.stat('happiness', 4)
      }
    ]
  },

  {
    id: 'school_driving_lessons',
    category: 'school',
    weight: 3,
    minAge: 15,
    maxAge: 18,
    text: 'Learning to drive was the first thing anyone had ever let you do badly in public.',
    choices: [
      {
        label: 'Take paid lessons',
        require: (game) => game.canAfford(600) ? true : Needs.MONEY(600),
        result: 'You took paid lessons and passed the test at the third attempt. The instructor still praised you, generously.',
        effect: (game) => {
          game.spend(600);
          game.stat('happiness', 4);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Learn in an empty car park with a relative',
        result: 'You learned in a car park with a relative who shouted, and you were driving properly within a month.',
        effect: (game) => { game.stat('happiness', 2); game.stat('smarts', 3); }
      },
      {
        label: 'Learn from a friend who is also learning',
        result: 'You and a friend taught each other. Neither of you learned anything and both of you were confident.',
        effect: (game) => game.stat('happiness', 3)
      }
    ]
  },

  {
    id: 'school_entrance_exam',
    category: 'school',
    weight: 2,
    minAge: 16,
    maxAge: 17,
    text: 'The entrance exam for university was approaching, and everyone you knew had either a plan or a panic.',
    choices: [
      {
        label: 'Buy the expensive prep course',
        require: (game) => game.canAfford(900) ? true : Needs.MONEY(900),
        result: 'You paid for the prep course and attended every session, including the ones about writing essays nobody reads.',
        effect: (game) => {
          game.spend(900);
          game.stat('smarts', 10);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Prepare using free material',
        result: 'You worked through free practice papers at two in the morning and slept in class the next day.',
        effect: (game) => { game.stat('smarts', 7); game.stat('happiness', -2); game.stat('health', -2); }
      },
      {
        label: 'Walk in unprepared',
        result: 'You turned up and did your best on no sleep. It went exactly as well as it sounds.',
        effect: (game) => { game.stat('smarts', 1); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'school_open_day',
    category: 'school',
    weight: 2,
    minAge: 16,
    maxAge: 17,
    text: 'A university held an open day, and the campus was nicer than any building you had ever been inside.',
    choices: [
      {
        label: 'Spend the day there',
        result: 'You spent the day wandering halls that smelled of floor polish and decided you belonged in them.',
        effect: (game) => { game.stat('smarts', 4); game.stat('happiness', 6); }
      },
      {
        label: 'Bring a parent to see the money side',
        result: 'You brought a parent. The conversation about fees in the car home lasted the entire journey.',
        effect: (game) => game.stat('smarts', 2)
      },
      {
        label: 'Skip it and stay home',
        result: 'You skipped it and spent the day in bed, which you would describe as saving energy.',
        effect: (game) => game.stat('happiness', 1)
      }
    ]
  },

  {
    id: 'school_scholarship_offer',
    category: 'school',
    weight: 2,
    minAge: 17,
    maxAge: 19,
    text: 'A letter arrived offering you money for university, conditional on you being exactly as impressive as the paperwork claims.',
    require: (game) => (game.stats.smarts >= 65 || game.education.gpa >= 3.2) ? true : Needs.SMARTS,
    choices: [
      {
        label: 'Accept it',
        result: 'You accepted. Someone you never met decided your tuition was an investment, which is a strange kind of vote of confidence.',
        effect: (game) => {
          game.addMoney(cash(game, 4000, 12000));
          game.stat('happiness', 7);
          game.stat('smarts', 2);
        }
      },
      {
        label: 'Decline it for the better school',
        result: 'You turned it down for a better university and found out later how the arithmetic worked out.',
        effect: (game) => game.stat('smarts', 3)
      },
      {
        label: 'Accept and treat it as a reason to coast',
        result: 'You accepted the money and coasted for two years, which was rude but effective.',
        effect: (game) => {
          game.addMoney(cash(game, 4000, 12000));
          game.stat('smarts', -4);
          game.stat('happiness', 2);
        }
      }
    ]
  },

  {
    id: 'school_enroll_university',
    category: 'school',
    weight: 6,
    minAge: 18,
    maxAge: 19,
    text: 'Your acceptance letters arrived, and every one of them wanted four years of your life in exchange.',
    require: (game) => Education.canEnroll(game, 'university') ?? true,
    choices: [
      {
        label: 'Enroll in the field you actually wanted',
        result: 'You enrolled in the thing you had wanted since you were eleven. Tuition left a visible hole.',
        effect: (game) => {
          Education.enroll(game, 'university', game.rng.pick(Careers.DEGREES).id);
          const fee = Education.tuition(game);
          game.spend(fee);
          game.log(`You paid tuition of ${Format.money(fee)}.`, 'school');
          game.stat('smarts', 4);
        }
      },
      {
        label: 'Enroll in General Studies',
        result: 'You enrolled in General Studies, which is the respectable version of deciding later.',
        effect: (game) => {
          Education.enroll(game, 'university', 'general');
          const fee = Education.tuition(game);
          game.spend(fee);
          game.log(`You paid tuition of ${Format.money(fee)}.`, 'school');
          game.stat('happiness', 5);
        }
      },
      {
        label: 'Ask for financial aid and take whatever you get',
        result: 'You filled in the aid forms. Whether that covered the difference depended on a stranger with a spreadsheet.',
        effect: (game) => {
          Education.enroll(game, 'university', game.rng.pick(Careers.DEGREES).id);
          const fee = Education.tuition(game);
          const grant = game.stats.smarts >= 70 && game.education.gpa >= 3.2 ? fee : Math.round(fee * 0.4);
          game.spend(fee - grant);
          game.log(`Tuition was ${Format.money(fee)} and you covered ${Format.money(grant)} of it.`, 'school');
          game.stat('happiness', 3);
        }
      },
      {
        label: 'Skip university and start earning',
        result: 'You skipped university. Everyone who went was very relaxed for a while, and then they were not.',
        effect: (game) => game.stat('happiness', 4)
      }
    ]
  },

  {
    id: 'school_campus_job',
    category: 'school',
    weight: 2,
    minAge: 18,
    maxAge: 24,
    text: 'Money had become a subject with the same weight as your degree.',
    require: (game) => Can.student(game) ? true : Needs.SCHOOL,
    choices: [
      {
        label: 'Work every spare hour',
        result: 'You worked every hour that was not in the timetable. The degree survived; your sleep did not.',
        effect: (game) => {
          game.addMoney(cash(game, 1800, 5200));
          game.stat('smarts', -2);
          game.stat('health', -4);
        }
      },
      {
        label: 'Work a little and study a lot',
        result: 'You split the week evenly and got slightly good at both, which is more than most people manage.',
        effect: (game) => {
          game.addMoney(cash(game, 700, 2000));
          game.stat('smarts', 4);
        }
      },
      {
        label: 'Ignore money and take the degree seriously',
        result: 'You ignored money entirely and finished with a grade you have never once regretted.',
        effect: (game) => { game.stat('smarts', 9); game.stat('happiness', -2); }
      }
    ]
  },

  {
    id: 'school_dropout',
    category: 'school',
    weight: 2,
    minAge: 16,
    maxAge: 26,
    text: 'You had stopped going to the lectures a while ago, and somebody finally asked about it.',
    require: (game) => Can.student(game) ? true : Needs.SCHOOL,
    choices: [
      {
        label: 'Drop out',
        result: 'You dropped out. The paperwork took an afternoon and the relief lasted about a month.',
        effect: (game) => {
          game.education.yearsLeft = 0;
          game.education.schoolName = '';
          game.log('You dropped out of school.', 'school');
          game.stat('happiness', 7);
        }
      },
      {
        label: 'Start going again',
        result: 'You started going again, which took a month of embarrassment and then nothing.',
        effect: (game) => { game.stat('smarts', 6); game.stat('happiness', -2); }
      },
      {
        label: 'Keep drifting and hope nobody notices',
        result: 'You kept drifting. Nobody noticed for a while, which was its own kind of problem.',
        effect: (game) => { game.stat('smarts', -5); game.stat('happiness', -3); }
      }
    ]
  },

  {
    id: 'school_final_exams',
    category: 'school',
    weight: 2,
    minAge: 18,
    maxAge: 26,
    text: 'Final exams arrived, and the revision you had been putting off for a semester was now the only thing you owned.',
    require: (game) => Can.student(game) ? true : Needs.SCHOOL,
    choices: [
      {
        label: 'Cram until it stops being useful',
        result: 'You crammed until the words stopped meaning anything. It worked well enough.',
        effect: (game) => { game.stat('smarts', 8); game.stat('happiness', -3); game.stat('health', -4); }
      },
      {
        label: 'Do an honest revision schedule',
        result: 'You revised on a schedule with meals in it and finished still able to read.',
        effect: (game) => { game.stat('smarts', 6); game.stat('happiness', -1); }
      },
      {
        label: 'Wing it',
        result: 'You winged it. The exam was easier than the week of dread before it, which never stops being a surprise.',
        effect: (game) => { game.stat('smarts', 1); game.stat('happiness', -1); }
      }
    ]
  },

  {
    id: 'school_enroll_grad',
    category: 'school',
    weight: 4,
    minAge: 21,
    maxAge: 24,
    text: 'With a degree in hand, the sensible next step was two more years of it for a qualification nobody outside a university had heard of.',
    require: (game) => Education.canEnroll(game, 'grad') ?? true,
    choices: [
      {
        label: 'Enroll in graduate school',
        result: 'You enrolled in graduate school and discovered what the word thesis actually meant.',
        effect: (game) => {
          Education.enroll(game, 'grad', game.education.degree ?? 'general');
          const fee = Education.tuition(game);
          game.spend(fee);
          game.log(`You paid tuition of ${Format.money(fee)}.`, 'school');
          game.stat('smarts', 5);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Go straight into the workforce',
        result: 'You skipped graduate school and started earning immediately, which is a defensible kind of pragmatism.',
        effect: (game) => { game.stat('happiness', 4); game.stat('smarts', -1); }
      },
      {
        label: 'Take a year to decide',
        result: 'You took a year to decide. You are still deciding, but you are a year older and reasonably fed.',
        effect: (game) => { game.stat('happiness', 2); game.addMoney(cash(game, 400, 1500)); }
      }
    ]
  },

  {
    id: 'school_thesis',
    category: 'school',
    weight: 2,
    minAge: 22,
    maxAge: 26,
    text: 'Your thesis was due, and it had existed so far as a title and an argument with your supervisor.',
    require: (game) => (game.education.level === 'grad' && game.education.yearsLeft > 0) ? true : Needs.SCHOOL,
    choices: [
      {
        label: 'Actually write it',
        result: 'You wrote it, properly, over one very bad winter. It was the hardest and best thing you have done.',
        effect: (game) => { game.stat('smarts', 10); game.stat('happiness', -4); }
      },
      {
        label: 'Write it the night before',
        result: 'You wrote it the night before. It passed, and nobody has ever opened it, including you.',
        effect: (game) => { game.stat('smarts', 2); game.stat('happiness', -3); }
      },
      {
        label: 'Pay somebody else to write it',
        result: 'You paid somebody to write it. The supervisor asked one question about the methodology and then signed it.',
        effect: (game) => {
          game.addMoney(cash(game, 600, 1400));
          game.stat('smarts', -3);
        }
      }
    ]
  },

  {
    id: 'school_online_course',
    category: 'school',
    weight: 2,
    minAge: 20,
    maxAge: 24,
    text: 'The kind of knowledge that gets you a job now comes with certificates nobody verifies and everybody asks about.',
    choices: [
      {
        label: 'Pay for a proper certification',
        require: (game) => game.canAfford(350) ? true : Needs.MONEY(350),
        result: 'You paid for the certification and sat the exam. It took every evening for two months.',
        effect: (game) => {
          game.spend(350);
          game.stat('smarts', 8);
          game.stat('happiness', -2);
        }
      },
      {
        label: 'Teach yourself for free',
        result: 'You taught yourself from free material and built something small to prove you had understood it.',
        effect: (game) => game.stat('smarts', 6)
      },
      {
        label: 'Collect the certificate and learn nothing',
        result: 'You finished the course and retained approximately the title of the course.',
        effect: (game) => { game.stat('smarts', 1); game.stat('happiness', 3); }
      }
    ]
  }
]);