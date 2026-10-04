/*
 * Career data.
 *
 * Every job is one rung of a field's ladder. Promotion moves the player to
 * tier+1 within the same field, so `field` is the progression spine.
 *
 *   tier   1..5 seniority
 *   edu    minimum education level key (see EDU_ORDER)
 *   degree required field of study, or null for an open-entry rung
 *   pay    annual salary band before city cost-of-living scaling
 */
class Careers {
  static EDU_ORDER = Object.freeze({
    'none': 0,
    'elementary': 1,
    'middle': 2,
    'high_school': 3,
    'university': 4,
    'grad': 5
  });

  static EDU_LABEL = Object.freeze({
    'none': 'No Schooling',
    'elementary': 'Elementary School',
    'middle': 'Middle School',
    'high_school': 'High School',
    'university': 'University',
    'grad': 'Graduate School'
  });

  static DEGREES = Object.freeze([
    { id: 'general', name: 'General Studies' },
    { id: 'business', name: 'Business' },
    { id: 'computer', name: 'Computer Science' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'medical', name: 'Pre-Med' },
    { id: 'law', name: 'Political Science' },
    { id: 'arts', name: 'Arts' },
    { id: 'science', name: 'Biology' }
  ]);

  static JOBS = Object.freeze([
    // --- retail ---
    { id: 'retail_t1', title: 'Cashier', emoji: '🛒', field: 'retail', tier: 1, edu: 'none', degree: null, pay: [17000, 24000] },
    { id: 'retail_t2', title: 'Sales Associate', emoji: '🛍️', field: 'retail', tier: 2, edu: 'none', degree: null, pay: [24000, 34000] },
    { id: 'retail_t3', title: 'Shift Supervisor', emoji: '🧾', field: 'retail', tier: 3, edu: 'high_school', degree: null, pay: [38000, 52000] },
    { id: 'retail_t4', title: 'Store Manager', emoji: '🏬', field: 'retail', tier: 4, edu: 'university', degree: 'business', pay: [62000, 90000] },
    { id: 'retail_t5', title: 'Regional Director', emoji: '🏢', field: 'retail', tier: 5, edu: 'university', degree: 'business', pay: [140000, 240000] },

    // --- food service ---
    { id: 'food_t1', title: 'Dishwasher', emoji: '🍽️', field: 'food', tier: 1, edu: 'none', degree: null, pay: [16000, 22000] },
    { id: 'food_t2', title: 'Line Cook', emoji: '🍳', field: 'food', tier: 2, edu: 'high_school', degree: null, pay: [24000, 32000] },
    { id: 'food_t3', title: 'Sous Chef', emoji: '🔪', field: 'food', tier: 3, edu: 'high_school', degree: null, pay: [38000, 54000] },
    { id: 'food_t4', title: 'Head Chef', emoji: '👨‍🍳', field: 'food', tier: 4, edu: 'university', degree: null, pay: [65000, 95000] },
    { id: 'food_t5', title: 'Executive Chef', emoji: '⭐', field: 'food', tier: 5, edu: 'university', degree: null, pay: [120000, 210000] },

    // --- skilled trades ---
    { id: 'trade_t1', title: 'Apprentice Electrician', emoji: '🔌', field: 'trades', tier: 1, edu: 'middle', degree: null, pay: [20000, 28000] },
    { id: 'trade_t2', title: 'Electrician', emoji: '💡', field: 'trades', tier: 2, edu: 'high_school', degree: null, pay: [32000, 46000] },
    { id: 'trade_t3', title: 'Master Electrician', emoji: '🔧', field: 'trades', tier: 3, edu: 'high_school', degree: null, pay: [48000, 68000] },
    { id: 'trade_t4', title: 'Site Foreman', emoji: '🏗️', field: 'trades', tier: 4, edu: 'university', degree: 'engineering', pay: [80000, 120000] },
    { id: 'trade_t5', title: 'Construction Director', emoji: '🏗️', field: 'trades', tier: 5, edu: 'university', degree: 'engineering', pay: [160000, 300000] },

    // --- transport ---
    { id: 'trans_t1', title: 'Bus Driver', emoji: '🚌', field: 'transport', tier: 1, edu: 'middle', degree: null, pay: [22000, 30000] },
    { id: 'trans_t2', title: 'Truck Driver', emoji: '🚚', field: 'transport', tier: 2, edu: 'high_school', degree: null, pay: [34000, 48000] },
    { id: 'trans_t3', title: 'Long-Haul Driver', emoji: '🛻', field: 'transport', tier: 3, edu: 'high_school', degree: null, pay: [50000, 72000] },
    { id: 'trans_t4', title: 'Fleet Manager', emoji: '🚦', field: 'transport', tier: 4, edu: 'university', degree: 'business', pay: [85000, 125000] },
    { id: 'trans_t5', title: 'Logistics CEO', emoji: '🌐', field: 'transport', tier: 5, edu: 'university', degree: 'business', pay: [200000, 420000] },

    // --- teaching ---
    { id: 'edu_t1', title: 'Teaching Assistant', emoji: '📚', field: 'education', tier: 1, edu: 'high_school', degree: null, pay: [21000, 29000] },
    { id: 'edu_t2', title: 'Teacher', emoji: '🍎', field: 'education', tier: 2, edu: 'university', degree: 'general', pay: [34000, 48000] },
    { id: 'edu_t3', title: 'Department Head', emoji: '📖', field: 'education', tier: 3, edu: 'university', degree: 'general', pay: [52000, 70000] },
    { id: 'edu_t4', title: 'Principal', emoji: '🏫', field: 'education', tier: 4, edu: 'university', degree: 'general', pay: [85000, 120000] },
    { id: 'edu_t5', title: 'School Superintendent', emoji: '🎓', field: 'education', tier: 5, edu: 'grad', degree: 'general', pay: [130000, 210000] },

    // --- healthcare ---
    { id: 'med_t1', title: 'Medical Assistant', emoji: '🩺', field: 'healthcare', tier: 1, edu: 'high_school', degree: null, pay: [25000, 35000] },
    { id: 'med_t2', title: 'Registered Nurse', emoji: '💉', field: 'healthcare', tier: 2, edu: 'university', degree: 'medical', pay: [58000, 78000] },
    { id: 'med_t3', title: 'Resident Doctor', emoji: '👨‍⚕️', field: 'healthcare', tier: 3, edu: 'grad', degree: 'medical', pay: [62000, 88000] },
    { id: 'med_t4', title: 'Attending Physician', emoji: '🩺', field: 'healthcare', tier: 4, edu: 'grad', degree: 'medical', pay: [150000, 260000] },
    { id: 'med_t5', title: 'Chief of Surgery', emoji: '🔬', field: 'healthcare', tier: 5, edu: 'grad', degree: 'medical', pay: [300000, 650000] },

    // --- technology ---
    { id: 'tech_t1', title: 'Computer Technician', emoji: '🖥️', field: 'tech', tier: 1, edu: 'high_school', degree: null, pay: [28000, 40000] },
    { id: 'tech_t2', title: 'Software Developer', emoji: '💻', field: 'tech', tier: 2, edu: 'university', degree: 'computer', pay: [62000, 95000] },
    { id: 'tech_t3', title: 'Senior Engineer', emoji: '🧠', field: 'tech', tier: 3, edu: 'university', degree: 'computer', pay: [105000, 155000] },
    { id: 'tech_t4', title: 'Engineering Manager', emoji: '📡', field: 'tech', tier: 4, edu: 'university', degree: 'computer', pay: [160000, 250000] },
    { id: 'tech_t5', title: 'Chief Technology Officer', emoji: '🚀', field: 'tech', tier: 5, edu: 'grad', degree: 'computer', pay: [300000, 800000] },

    // --- engineering ---
    { id: 'eng_t1', title: 'Engineering Intern', emoji: '📐', field: 'engineering', tier: 1, edu: 'university', degree: 'engineering', pay: [32000, 45000] },
    { id: 'eng_t2', title: 'Junior Engineer', emoji: '🧮', field: 'engineering', tier: 2, edu: 'university', degree: 'engineering', pay: [58000, 78000] },
    { id: 'eng_t3', title: 'Project Engineer', emoji: '🏗️', field: 'engineering', tier: 3, edu: 'university', degree: 'engineering', pay: [90000, 130000] },
    { id: 'eng_t4', title: 'Lead Engineer', emoji: '⚙️', field: 'engineering', tier: 4, edu: 'university', degree: 'engineering', pay: [140000, 210000] },
    { id: 'eng_t5', title: 'Chief Engineer', emoji: '🛰️', field: 'engineering', tier: 5, edu: 'grad', degree: 'engineering', pay: [250000, 500000] },

    // --- law ---
    { id: 'law_t1', title: 'Paralegal', emoji: '📋', field: 'law', tier: 1, edu: 'university', degree: 'law', pay: [38000, 52000] },
    { id: 'law_t2', title: 'Associate Attorney', emoji: '⚖️', field: 'law', tier: 2, edu: 'grad', degree: 'law', pay: [90000, 140000] },
    { id: 'law_t3', title: 'Senior Attorney', emoji: '⚖️', field: 'law', tier: 3, edu: 'grad', degree: 'law', pay: [160000, 280000] },
    { id: 'law_t4', title: 'Partner', emoji: '🏛️', field: 'law', tier: 4, edu: 'grad', degree: 'law', pay: [300000, 600000] },
    { id: 'law_t5', title: 'Supreme Court Justice', emoji: '🏛️', field: 'law', tier: 5, edu: 'grad', degree: 'law', pay: [250000, 380000] },

    // --- finance ---
    { id: 'fin_t1', title: 'Bank Teller', emoji: '🏦', field: 'finance', tier: 1, edu: 'high_school', degree: null, pay: [22000, 30000] },
    { id: 'fin_t2', title: 'Financial Analyst', emoji: '📈', field: 'finance', tier: 2, edu: 'university', degree: 'business', pay: [58000, 82000] },
    { id: 'fin_t3', title: 'Portfolio Manager', emoji: '💹', field: 'finance', tier: 3, edu: 'university', degree: 'business', pay: [110000, 190000] },
    { id: 'fin_t4', title: 'Investment Banker', emoji: '🏛️', field: 'finance', tier: 4, edu: 'university', degree: 'business', pay: [200000, 420000] },
    { id: 'fin_t5', title: 'Chief Financial Officer', emoji: '💰', field: 'finance', tier: 5, edu: 'grad', degree: 'business', pay: [400000, 1100000] },

    // --- entertainment ---
    { id: 'ent_t1', title: 'Barista', emoji: '☕', field: 'entertainment', tier: 1, edu: 'none', degree: null, pay: [16000, 22000] },
    { id: 'ent_t2', title: 'Musician', emoji: '🎸', field: 'entertainment', tier: 2, edu: 'high_school', degree: null, pay: [18000, 60000] },
    { id: 'ent_t3', title: 'Actor', emoji: '🎬', field: 'entertainment', tier: 3, edu: 'high_school', degree: null, pay: [30000, 250000] },
    { id: 'ent_t4', title: 'Director', emoji: '🎥', field: 'entertainment', tier: 4, edu: 'university', degree: 'arts', pay: [150000, 500000] },
    { id: 'ent_t5', title: 'Streaming Mogul', emoji: '🌟', field: 'entertainment', tier: 5, edu: 'university', degree: 'arts', pay: [500000, 3000000] }
  ]);

  /* Derived lookups, built once on first use. */
  static #byId = null;
  static #byField = null;

  static #index() {
    if (Careers.#byId) return;
    Careers.#byId = new Map(Careers.JOBS.map((j) => [j.id, j]));
    Careers.#byField = Careers.JOBS.reduce((map, j) => {
      const list = map.get(j.field) ?? [];
      list.push(j);
      map.set(j.field, list);
      return map;
    }, new Map());
  }

  static byId(id) {
    Careers.#index();
    return Careers.#byId.get(id) ?? null;
  }

  static inField(field) {
    Careers.#index();
    return Careers.#byField.get(field) ?? [];
  }

  static fields() {
    Careers.#index();
    return [...Careers.#byField.keys()];
  }

  /* Entry rungs the given education could actually land on. */
  static entryJobs(education) {
    const rank = Careers.EDU_ORDER[education.level] ?? 0;
    return Careers.JOBS.filter(
      (j) =>
        j.tier === 1 &&
        rank >= Careers.EDU_ORDER[j.edu] &&
        (!j.degree || education.degree === j.degree)
    );
  }

  static degreeName(id) {
    return Careers.DEGREES.find((d) => d.id === id)?.name ?? 'Nothing';
  }

  /* Senior roles expect a clean record; the bar tightens with tier. */
  static recordCeilingFor(job) {
    if (job.tier >= 5) return 10;
    if (job.tier >= 4) return 25;
    if (job.tier >= 3) return 45;
    return 100;
  }
}