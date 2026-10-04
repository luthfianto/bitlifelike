/*
 * Every screen in the game. Each one is a function returning an HTML string;
 * app.js owns navigation and event wiring.
 */
const Screens = {
  /* ------------------------------------------------------------ shared */

  header(game) {
    const marital = game.maritalInfo;
    const jobLine = game.job
      ? `${game.job.emoji} ${dom.esc(game.job.title)}`
      : game.education.yearsLeft > 0
        ? '🎒 Student'
        : '💼 Unemployed';

    return `
      <header class="card profile">
        <div class="profile-top">
          <div>
            <h1>${dom.esc(game.firstName)} ${dom.esc(game.lastName)}</h1>
            <p class="sub">${dom.esc(game.birthCity)}, ${dom.esc(game.birthCountry)}</p>
          </div>
          <div class="profile-age"><span>${game.age}</span><small>years</small></div>
        </div>
        <div class="chips">
          <span class="chip">${jobLine}</span>
          <span class="chip">${marital.emoji} ${dom.esc(marital.label)}</span>
          ${game.jailed ? `<span class="chip danger">🔒 ${game.jailYears}y left</span>` : ''}
          ${game.criminalRecord >= 30 ? `<span class="chip danger">⚖️ Record ${Math.round(game.criminalRecord)}</span>` : ''}
        </div>
        <div class="wallet">
          <span>💵 <strong>${Format.money(game.money)}</strong></span>
          <span>🏦 <strong>${Format.moneyShort(game.netWorth())}</strong> net</span>
        </div>
      </header>`;
  },

  backBar(game, label = 'Back') {
    return `
      <nav class="backbar">
        <button class="btn ghost" data-action="nav" data-screen="home">← ${dom.esc(label)}</button>
      </nav>`;
  },

  /* ------------------------------------------------------------ new life */

  newLife(ui) {
    const cities = Cities.all();
    const year = new Date().getFullYear();

    return `
      <section class="card">
        <h1 class="title">BitLife</h1>
        <p class="sub center">One life at a time. Make it count.</p>
      </section>

      <section class="card">
        <h2>New Life</h2>

        <label class="field">
          <span>First name</span>
          <input id="f-first" type="text" maxlength="20" placeholder="Leave blank for random" value="${dom.esc(ui.draft.firstName ?? '')}">
        </label>

        <label class="field">
          <span>Last name</span>
          <input id="f-last" type="text" maxlength="20" placeholder="Leave blank for random" value="${dom.esc(ui.draft.lastName ?? '')}">
        </label>

        <label class="field">
          <span>Gender</span>
          <div class="segmented">
            <button class="btn seg ${ui.draft.gender === 'male' ? 'on' : ''}" data-action="draft" data-field="gender" data-value="male">Male</button>
            <button class="btn seg ${ui.draft.gender === 'female' ? 'on' : ''}" data-action="draft" data-field="gender" data-value="female">Female</button>
          </div>
        </label>

        <label class="field">
          <span>Born in</span>
          <select id="f-city">
            ${cities
              .map(
                (c) =>
                  `<option value="${dom.esc(c.name)}" ${c.name === (ui.draft.city ?? '') ? 'selected' : ''}>${dom.esc(c.name)}, ${dom.esc(c.country)}</option>`
              )
              .join('')}
          </select>
        </label>

        <label class="field">
          <span>Year of birth</span>
          <select id="f-year">
            ${Array.from({ length: 21 }, (_, i) => year - 5 - i)
              .map(
                (y) =>
                  `<option value="${y}" ${y === ui.draft.birthYear ? 'selected' : ''}>${y}</option>`
              )
              .join('')}
          </select>
        </label>

        <button class="btn primary big" data-action="begin">Begin Life</button>
        ${Save.available() ? '<button class="btn ghost small" data-action="wipe">Delete any existing save</button>' : ''}
        ${!Save.available() ? '<p class="warn small">Progress cannot be saved: localStorage is unavailable.</p>' : ''}
      </section>`;
  },

  /* --------------------------------------------------------------- home */

  home(ui) {
    const game = ui.game;
    const bars = GameState.CORE_STATS.map((key) => {
      const meta = GameState.STAT_META[key];
      return dom.bar(meta.label, game.stats[key], { emoji: meta.emoji });
    }).join('');

    const conditions = game.conditions
      .map((id) => {
        const c = Health.byId(id);
        return c ? `<span class="chip warn">${c.emoji} ${dom.esc(c.name)}</span>` : '';
      })
      .join('');

    const nav = [
      ['relationships', '👥', 'Relationships'],
      ['career', '💼', 'Career'],
      ['assets', '🏠', 'Assets'],
      ['activities', '🎯', 'Activities'],
      ['crime', '🔪', 'Crime'],
      ['log', '📖', 'Life Log']
    ]
      .map(
        ([screen, emoji, label]) =>
          `<button class="tile" data-action="nav" data-screen="${screen}"><span class="tile-emoji">${emoji}</span><span>${label}</span></button>`
      )
      .join('');

    return `
      ${Screens.header(game)}

      <section class="card">
        <h2>Status</h2>
        <div class="stats">${bars}</div>
        ${conditions ? `<div class="chips">${conditions}</div>` : ''}
        ${game.education.level !== 'none' ? `<p class="sub">🎓 ${dom.esc(Careers.EDU_LABEL[game.education.level])}${game.education.gpa ? ` — GPA ${game.education.gpa.toFixed(2)}` : ''}</p>` : ''}
        <button class="btn primary big age-btn" data-action="age">Age →</button>
        <p class="sub center small">Turn ${game.year}</p>
      </section>

      <section class="card">
        <h2>Actions</h2>
        <div class="tiles">${nav}</div>
      </section>

      ${ui.toast ? `<div class="toast">${dom.esc(ui.toast)}</div>` : ''}`;
  },

  /* --------------------------------------------------------- prison view */

  prison(ui) {
    const game = ui.game;
    const odds = Math.round(3 + game.stats.prisonFitness * 0.08);

    return `
      <section class="card jail">
        <h2>🔒 Prison</h2>
        <p>Serving time for <strong>${dom.esc(game.jailReason)}</strong>.</p>
        <div class="stat">
          <div class="stat-head"><span class="stat-label">Time remaining</span><span class="stat-value">${game.jailYears}y</span></div>
          <div class="bar"><div class="bar-fill bad" style="width:${Math.min(100, game.jailYears * 12)}%"></div></div>
        </div>
        ${dom.bar('Prison Fitness', game.stats.prisonFitness, { emoji: '🏋️' })}
        ${dom.bar('Happiness', game.stats.happiness, { emoji: '😊' })}
        <p class="sub">Roughly a ${odds}% chance of escaping if you try.</p>
        <div class="stack">
          <button class="btn danger" data-action="escape">Attempt Escape</button>
          <button class="btn primary big" data-action="age">Age →</button>
          ${Screens.backBar(game)}
        </div>
      </section>`;
  },

  /* ------------------------------------------------------- relationships */

  relationships(ui) {
    const game = ui.game;
    const partner = game.partner();
    const groups = [
      ['Family', [...game.parents(), ...game.siblings()]],
      ['Partner', partner ? [partner] : []],
      ['Children', game.children()],
      ['Friends', game.peopleOf('friend')],
      ['Acquaintances', game.peopleOf('ex').concat(game.peopleOf('coworker'), game.peopleOf('boss'))],
      ['The Dead', game.people.filter((p) => p.isDead).slice(-8)]
    ];

    const personCard = (p) => `
      <div class="person ${p.isDead ? 'gone' : ''}">
        <div class="person-main">
          <div class="person-name">${dom.esc(p.firstName)} ${dom.esc(p.type === 'pet' ? '' : p.lastName)}</div>
          <div class="person-meta">
            ${p.isDead
              ? `died at ${p.age}`
              : `${p.age} · ${dom.esc(p.occupation)}${p.netWorth ? ` · ${Format.moneyShort(p.netWorth)}` : ''}`}
          </div>
        </div>
        ${p.isDead
          ? ''
          : `<div class="person-rel">
               <div class="bar"><div class="bar-fill ${p.relationship >= 60 ? 'good' : p.relationship >= 30 ? 'mid' : 'bad'}" style="width:${Math.round(p.relationship)}%"></div></div>
               <span class="small">${Math.round(p.relationship)}</span>
             </div>`}
        ${p.isDead || p.type === 'parent' || p.type === 'child' ? '' : `<button class="btn tiny" data-action="socialise" data-id="${p.id}">Spend time</button>`}
      </div>`;

    const sections = groups
      .filter(([, list]) => list.length)
      .map(
        ([label, list]) => `
        <section class="card">
          <h2>${label} <span class="count">${list.length}</span></h2>
          ${list.map(personCard).join('')}
        </section>`
      )
      .join('');

    const partnerActions = partner
      ? `<section class="card">
           <h2>Your ${partner.type === 'spouse' ? 'spouse' : 'partner'}</h2>
           <div class="stack">
             ${partner.type === 'partner' ? `<button class="btn" data-action="date" data-id="${partner.id}">Go on a date</button>` : ''}
             ${partner.type === 'partner' ? `<button class="btn" data-action="propose" data-id="${partner.id}">Propose ($12,000)</button>` : ''}
             ${partner.type === 'partner' ? `<button class="btn" data-action="marry" data-id="${partner.id}">Get married ($25,000)</button>` : ''}
             ${game.maritalStatus === 'married' ? `<button class="btn" data-action="child">Try for a child ($20,000)</button>` : ''}
             <button class="btn" data-action="breakup">${game.maritalStatus === 'married' ? 'Divorce ($20,000)' : 'Break up'}</button>
           </div>
         </section>`
      : '';

    return `${Screens.backBar(game)}${partnerActions}${sections || '<section class="card"><h2>Nobody yet</h2><p class="sub">You have not met anyone. Get older.</p></section>'}`;
  },

  /* -------------------------------------------------------------- career */

  career(ui) {
    const game = ui.game;

    if (game.jailed) {
      return `${Screens.backBar(game)}<section class="card"><h2>Career</h2><p class="sub">Employable people are not hiring convicted felons.</p></section>`;
    }

    const block = game.education.yearsLeft > 0;

    if (game.job) {
      const promo = Career.nextRung(game);
      return `
        ${Screens.backBar(game)}
        <section class="card">
          <h2>${game.job.emoji} ${dom.esc(game.job.title)}</h2>
          <p class="sub">${dom.esc(game.job.company)}</p>
          <div class="kv">
            <span>Salary</span><strong>${Format.money(game.job.salary)}/yr</strong>
            <span>In role</span><strong>${game.job.yearsInRole} yr${game.job.yearsInRole === 1 ? '' : 's'}</strong>
            <span>Performance</span><strong>${Math.round(game.job.performance)}</strong>
            <span>Level</span><strong>${game.job.tier} of 5</strong>
          </div>
          <div class="stack">
            ${promo ? `<button class="btn" data-action="promote">Apply for promotion (${dom.esc(promo.title)})</button>` : '<p class="sub">This is the top of the ladder for your field.</p>'}
            ${game.age >= 65 ? '<button class="btn" data-action="retire">Retire</button>' : ''}
            <button class="btn danger" data-action="quit">Quit</button>
          </div>
        </section>`;
    }

    if (block) {
      return `${Screens.backBar(game)}<section class="card"><h2>Career</h2><p class="sub">You are still in school. Finish first, work later.</p></section>`;
    }

    const offers = ui.offers();
    const list = offers.length
      ? offers
          .map(
            (o, i) => `
        <button class="offer" data-action="accept" data-index="${i}">
          <span class="offer-title">${o.job.emoji} ${dom.esc(o.job.title)}</span>
          <span class="offer-meta">${dom.esc(o.company)} · ${Format.money(o.salary)}/yr</span>
          <span class="offer-meta small">${Career.eligible(game, o.job) ? 'Not eligible' : 'Level ' + o.job.tier}</span>
        </button>`
          )
          .join('')
      : '<p class="sub">Nothing suitable right now.</p>';

    return `
      ${Screens.backBar(game)}
      <section class="card">
        <h2>Job Offers</h2>
        ${list}
        <button class="btn ghost small" data-action="reroll-offers">Look for other work</button>
      </section>
      <section class="card">
        <h2>Qualifications</h2>
        <p class="sub">🎓 ${dom.esc(Careers.EDU_LABEL[game.education.level])}${game.education.degree ? ` in ${dom.esc(Careers.degreeName(game.education.degree))}` : ''}</p>
        ${game.criminalRecord > 20 ? `<p class="warn">⚖️ Criminal record (${Math.round(game.criminalRecord)}) is limiting your options.</p>` : ''}
        <div class="stack">
          <button class="btn" data-action="school">Enroll in school</button>
        </div>
      </section>`;
  },

  /* ------------------------------------------------------------- school */

  school(ui) {
    const game = ui.game;
    if (game.education.yearsLeft > 0) {
      return `${Screens.backBar(game)}
        <section class="card">
          <h2>School</h2>
          <p class="sub">${dom.esc(game.education.schoolName)}</p>
          <div class="kv">
            <span>Years left</span><strong>${game.education.yearsLeft}</strong>
            <span>GPA</span><strong>${game.education.gpa.toFixed(2)}</strong>
          </div>
        </section>`;
    }

    const next = Education.nextLevel(game.education.level);
    const block = next ? Education.canEnroll(game, next) : 'You have completed every level of education.';

    const degrees =
      next === 'university'
        ? `<label class="field"><span>Field of study</span><select id="f-degree">
             ${Careers.DEGREES.map((d) => `<option value="${d.id}">${dom.esc(d.name)}</option>`).join('')}
           </select></label>`
        : '';

    return `${Screens.backBar(game)}
      <section class="card">
        <h2>Enroll</h2>
        ${next ? `<p class="sub">Next: ${dom.esc(Careers.EDU_LABEL[next])}</p>` : '<p class="sub">You are done with school.</p>'}
        ${degrees}
        ${block ? `<p class="warn">${dom.esc(block)}</p>` : ''}
        <button class="btn primary" data-action="enroll" data-level="${dom.esc(next ?? '')}" ${block || !next ? 'data-locked="true"' : ''}>Enroll</button>
      </section>`;
  },

  /* ------------------------------------------------------------- assets */

  assets(ui) {
    const game = ui.game;

    const owned = game.assetsOf();
    const list = owned.length
      ? owned
          .map(
            (a) => `
        <div class="person">
          <div class="person-main">
            <div class="person-name">${a.emoji} ${dom.esc(a.label)}</div>
            <div class="person-meta">
              Worth ${Format.money(a.value)}${a.debt ? ` · debt ${Format.money(a.debt)}` : ''} · upkeep ${Format.money(a.upkeep)}/yr
              ${a.isPet && a.lifespan ? ` · age ${a.age}/${a.lifespan}` : ''}
            </div>
          </div>
          <button class="btn tiny danger" data-action="sell-asset" data-uid="${a.uid}">Sell</button>
        </div>`
          )
          .join('')
      : '<p class="sub">You do not own anything yet.</p>';

    const shopRow = (defs, kind) =>
      defs
        .map((def) => {
          const price =
            kind === 'p' ? def.price
            : Math.round(def.price * Cities.costMultiplier(game.birthCity));
          return `<button class="offer" data-action="buy-${kind}" data-id="${def.id}">
            <span class="offer-title">${def.emoji} ${dom.esc(def.name)}</span>
            <span class="offer-meta">${Format.money(price)} · upkeep ${Format.money(def.upkeep)}/yr</span>
          </button>`;
        })
        .join('');

    return `
      ${Screens.backBar(game)}
      <section class="card">
        <h2>Net Worth <span class="count">${Format.money(game.netWorth())}</span></h2>
        ${list}
      </section>

      <section class="card">
        <h2>Property</h2>
        ${shopRow(Catalog.HOUSES, 'h')}
      </section>

      <section class="card">
        <h2>Vehicles</h2>
        ${shopRow(Catalog.CARS, 'c')}
      </section>

      <section class="card">
        <h2>Pets</h2>
        ${shopRow(Catalog.PETS, 'p')}
      </section>`;
  },

  /* ---------------------------------------------------------- activities */

  activities(ui) {
    const game = ui.game;
    const list = Catalog.ACTIVITIES.map(
      (a) => `
      <button class="offer" data-action="activity" data-id="${a.id}" ${game.canAfford(a.cost) ? '' : 'data-locked="true"'}>
        <span class="offer-title">${a.emoji} ${dom.esc(a.name)}</span>
        <span class="offer-meta">${a.cost === 0 ? 'Free' : Format.money(a.cost)}</span>
        <span class="offer-meta small">${dom.esc(a.blurb)}</span>
      </button>`
    ).join('');

    return `
      ${Screens.backBar(game)}
      <section class="card">
        <h2>Activities</h2>
        <p class="sub">Spend money on yourself. It rarely works out.</p>
        ${list}
      </section>
      ${game.stats.addiction > 25
        ? `<section class="card"><h2>Rehab</h2><p class="warn">Addiction level ${Math.round(game.stats.addiction)}</p>
           <button class="btn danger" data-action="rehab">Enter rehab ($12,000)</button></section>`
        : ''}`;
  },

  /* -------------------------------------------------------------- crime */

  crime(ui) {
    const game = ui.game;
    const available = Crimes.availableFor(game);

    const list = available.length
      ? available
          .map((c) => {
            const payout = c.payout[1] ? `${Format.moneyShort(c.payout[0])}–${Format.moneyShort(c.payout[1])}` : '—';
            return `<button class="offer danger-edge" data-action="crime" data-id="${c.id}">
              <span class="offer-title">${c.emoji} ${dom.esc(c.name)}</span>
              <span class="offer-meta">take ${payout} · ${c.risk}% risk · ${c.jailMin}–${c.jailMax}y if caught</span>
              <span class="offer-meta small">${dom.esc(c.blurb)}</span>
            </button>`;
          })
          .join('')
      : '<p class="sub">Nothing you are old enough or known enough for.</p>';

    return `
      ${Screens.backBar(game)}
      <section class="card">
        <h2>Crime</h2>
        <p class="sub">Criminal record: <strong>${Math.round(game.criminalRecord)}</strong> · Crimes committed: ${game.crimesCommitted}</p>
        ${game.criminalRecord >= 45 ? '<p class="warn">Police know your face.</p>' : ''}
        ${list}
      </section>`;
  },

  /* ---------------------------------------------------------------- log */

  log(ui) {
    const game = ui.game;
    const entries = game.history.toReversed();
    const list = entries.length
      ? entries
          .slice(0, 200)
          .map(
            (e) => `
        <li class="log-${dom.esc(e.kind)}">
          <span class="log-year">${e.year}</span>
          <span class="log-age">age ${e.age}</span>
          <span class="log-text">${dom.esc(e.text)}</span>
        </li>`
          )
          .join('')
      : '<p class="sub">Nothing has happened yet.</p>';

    return `${Screens.backBar(game)}<section class="card"><h2>Life Log</h2><ul class="log">${list}</ul></section>`;
  },

  /* ------------------------------------------------------------- legacy */

  legacy(ui) {
    const d = ui.game.deathInfo ?? {};
    const row = (label, value) => `<span>${label}</span><strong>${value}</strong>`;

    const jobs = (d.jobsHeld ?? []).length
      ? `<ul class="jobs">${d.jobsHeld
          .map((j) => `<li>${dom.esc(j.title)} <span class="small">${dom.esc(j.company)}</span></li>`)
          .join('')}</ul>`
      : '<p class="sub">You never held a job.</p>';

    return `
      <section class="card legacy">
        <h1 class="title">${ui.game.firstName} ${ui.game.lastName}</h1>
        <p class="sub center">${d.age ? `${d.age} years old · ${d.year}` : ''}</p>
        <p class="cause">Died of ${dom.esc(d.cause ?? 'unknown causes')}.</p>
        <p class="epitaph">"${dom.esc(d.epitaph ?? '')}"</p>

        <div class="kv">
          ${row('Net worth', Format.money(d.netWorth ?? 0))}
          ${row('Peak net worth', Format.money(d.peakNetWorth ?? 0))}
          ${row('Lifetime earnings', Format.money(d.totalEarned ?? 0))}
          ${row('Promotions', d.promotions ?? 0)}
          ${row('Firings', d.firings ?? 0)}
          ${row('Marriages', d.marriages ?? 0)}
          ${row('Children', d.children ?? 0)}
          ${row('Longest relationship', d.longestRelationship?.name ? `${d.longestRelationship.years}y — ${dom.esc(d.longestRelationship.name)}` : 'None')}
          ${row('Crimes committed', d.crimes ?? 0)}
          ${row('Times arrested', d.arrests ?? 0)}
          ${row('Years inside', d.jailYears ?? 0)}
          ${row('Escape attempts', d.escapes ?? 0)}
          ${row('Pets owned', d.petsOwned ?? 0)}
        </div>

        <h3>Positions held</h3>
        ${jobs}

        <button class="btn primary big" data-action="newlife">Start a New Life</button>
      </section>`;
  }
};