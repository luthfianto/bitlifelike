/*
 * UI controller: navigation, action handling, and the event modal.
 *
 * One delegated click listener covers the whole app. Any action that produces
 * a result opens a message overlay, which both blocks further input and gives
 * the player a natural place to read what happened.
 */
const ui = {
  game: null,
  screen: 'home',
  draft: { gender: 'male', city: 'Detroit', birthYear: new Date().getFullYear() - 20 },
  encounter: null,
  encounterResult: '',
  message: '',
  toast: '',
  root: null,

  mount(root) {
    ui.root = root;
    dom.bindActions(root, ui.handlers());
    document.addEventListener('keydown', ui.onKey);
    ui.boot();
  },

  /* Resume a life, or start a new one. */
  boot() {
    const saved = Save.load();
    if (saved && saved.alive) {
      ui.game = saved;
      ui.screen = saved.jailed ? 'prison' : 'home';
      ui.toast = 'Welcome back.';
    } else {
      ui.game = null;
      ui.screen = 'newlife';
    }
    ui.render();
  },

  /* ------------------------------------------------------------ render */

  /*
   * Anything that blocks the screen: a pending event, the outcome of a
   * choice, or a one-off message. Exactly one is ever shown.
   */
  overlayHtml() {
    if (ui.encounter) {
      const choices = ui.encounter.choices
        .map(
          (c, i) => `
          <button class="choice ${c.enabled ? '' : 'locked'}"
                  data-action="choose" data-index="${c.index}"
                  ${c.enabled ? '' : 'data-locked="true"'}>
            <span class="choice-label">${i + 1}. ${dom.esc(c.label)}</span>
            ${c.note ? `<span class="choice-note">${dom.esc(c.note)}</span>` : ''}
          </button>`
        )
        .join('');
      return `
        <div class="overlay" role="dialog" aria-modal="true" aria-live="polite">
          <div class="card modal">
            <p class="modal-text">${dom.esc(ui.encounter.text)}</p>
            <div class="choices">${choices}</div>
            <p class="sub center small">Press 1–${ui.encounter.choices.length} to choose.</p>
          </div>
        </div>`;
    }

    if (ui.encounterResult) {
      return `
        <div class="overlay" role="dialog" aria-modal="true" aria-live="polite">
          <div class="card modal">
            <p class="modal-text">${dom.esc(ui.encounterResult)}</p>
            <button class="btn primary big" data-action="close">OK</button>
          </div>
        </div>`;
    }

    if (ui.message) {
      return `
        <div class="overlay" role="dialog" aria-modal="true" aria-live="polite">
          <div class="card modal">
            <p class="modal-text">${dom.esc(ui.message)}</p>
            <button class="btn primary big" data-action="close">OK</button>
          </div>
        </div>`;
    }

    return '';
  },

  render() {
    if (!ui.root) return;
    const overlay = ui.overlayHtml();

    if (ui.screen === 'newlife' || !ui.game) {
      dom.render(ui.root, `<div class="phone">${Screens.newLife(ui)}${overlay}</div>`);
      return;
    }
    if (ui.screen === 'legacy') {
      dom.render(ui.root, `<div class="phone">${Screens.legacy(ui)}${overlay}</div>`);
      return;
    }

    const body = Screens[ui.screen] ? Screens[ui.screen](ui) : Screens.home(ui);
    dom.render(ui.root, `<div class="phone">${body}${overlay}</div>`);
  },

  go(screen) {
    if (!ui.game && screen !== 'newlife') return;
    ui.screen = screen;
    ui.message = '';
    ui.render();
    ui.root?.scrollTo?.({ top: 0 });
  },

  say(text) {
    if (!text) return;
    ui.message = text;
    ui.render();
  },

  /* Cached job offers so they stay put until the player rerolls. */
  offers() {
    if (!ui.game.offers) ui.game.offers = Career.generateOffers(ui.game);
    return ui.game.offers;
  },

  persist() {
    if (ui.game) Save.save(ui.game);
  },

  /* ------------------------------------------------------------- flows */

  age() {
    if (!ui.game || !ui.game.alive) return;

    const encounter = ui.game.ageUp();
    ui.encounter = null;
    ui.encounterResult = '';
    ui.persist();

    if (!ui.game.alive) {
      ui.screen = 'legacy';
      ui.render();
      return;
    }
    if (ui.game.jailed && ui.screen !== 'prison') ui.screen = 'prison';
    if (encounter) ui.encounter = encounter;
    ui.render();
  },

  choose(index) {
    if (!ui.encounter) return;
    const choice = ui.encounter.choices[index];
    if (!choice || !choice.enabled) return;

    ui.encounterResult = ui.encounter.resolve(index);
    ui.encounter = null;
    ui.persist();
    ui.render();
  },

  closeModal() {
    ui.encounter = null;
    ui.encounterResult = '';
    ui.message = '';
    ui.render();
  },

  begin() {
    const first = dom.qs('#f-first')?.value.trim();
    const last = dom.qs('#f-last')?.value.trim();
    const city = dom.qs('#f-city')?.value ?? 'Detroit';
    const birthYear = Number(dom.qs('#f-year')?.value) || new Date().getFullYear() - 20;

    ui.game = new GameState({
      firstName: first || undefined,
      lastName: last || undefined,
      gender: ui.draft.gender,
      city,
      birthYear
    });

    // Nobody starts school on their own; the opening years handle themselves.
    ui.screen = 'home';
    ui.persist();
    ui.render();
    ui.say(`You were born in ${ui.game.birthCity}. Age through your life and see how it goes.`);
  },

  newLife() {
    ui.game = null;
    ui.screen = 'newlife';
    ui.encounter = null;
    ui.encounterResult = '';
    ui.message = '';
    Save.clear();
    ui.render();
  },

  wipe() {
    Save.clear();
    ui.say('Any existing save has been deleted.');
  },

  onKey(event) {
    if (!ui.encounter) return;
    const n = Number(event.key);
    if (n >= 1 && n <= ui.encounter.choices.length) {
      ui.choose(n - 1);
    }
  },

  /* ----------------------------------------------------------- actions */

  handlers() {
    const g = () => ui.game;

    const social = (fn) => (data) => {
      const person = g().person(Number(data.id));
      if (!person) return;
      const result = fn(g(), person, data);
      ui.persist();
      ui.say(result?.text ?? String(result));
    };

    return {
      /* navigation */
      nav: (data) => ui.go(data.screen),
      back: () => ui.go('home'),
      close: () => ui.closeModal(),

      /* life */
      age: () => ui.age(),
      choose: (data) => ui.choose(Number(data.index)),
      begin: () => ui.begin(),
      newlife: () => ui.newLife(),
      wipe: () => ui.wipe(),
      draft: (data) => {
        ui.draft[data.field] = data.value;
        ui.render();
      },

      /* people */
      socialise: social((game, p) => Relationships.interact(game, p)),
      date: social((game, p) => ({ text: Relationships.date(game, p) })),
      propose: social((game, p) => Relationships.propose(game, p)),
      marry: social((game, p) => Relationships.marry(game, p)),
      breakup: () => {
        const result =
          g().maritalStatus === 'married' ? Relationships.divorce(g()) : Relationships.breakUp(g());
        ui.persist();
        ui.say(result.text);
      },
      child: () => {
        const result = Relationships.tryForChild(g());
        ui.persist();
        ui.say(result.text);
      },

      /* career */
      promote: () => {
        const result = Career.attemptPromotion(g());
        ui.persist();
        ui.say(result.text);
      },
      retire: () => {
        const result = Career.retire(g());
        ui.persist();
        ui.say(result.text);
      },
      quit: () => {
        Career.quit(g(), 'You handed in your notice.');
        g().offers = null;
        ui.persist();
        ui.say('You quit your job.');
      },
      accept: (data) => {
        const offer = ui.offers()[Number(data.index)];
        if (!offer) return;
        const result = Career.accept(g(), offer);
        if (result.ok) g().offers = null;
        ui.persist();
        ui.say(result.text);
      },
      'reroll-offers': () => {
        g().offers = null;
        ui.offers();
        ui.render();
      },
      school: () => ui.go('school'),
      enroll: (data) => {
        const level = data.level;
        const degree = dom.qs('#f-degree')?.value ?? null;
        const result = Education.enroll(g(), level, degree);
        // enroll() does not charge; the tuition bill lands here.
        if (result.ok) {
          const tuition = Education.tuition(g());
          if (tuition > 0) {
            if (!g().spend(tuition)) {
              g().education.yearsLeft = 0;
              g().education.level = 'none';
              ui.say(`You enrolled, but could not afford the ${Format.money(tuition)} tuition, so it did not work out.`);
              ui.persist();
              return;
            }
            ui.say(`${result.text} Tuition: ${Format.money(tuition)}.`);
            ui.persist();
            return;
          }
        }
        ui.persist();
        ui.say(result.text);
      },

      /* property */
      'buy-h': (data) => {
        const def = Catalog.assetById(data.id);
        // A mortgage is taken by default; expensive homes always need one.
        const mortgage = Portfolio.housePrice(g(), def) > g().money ? 0.8 : 0.2;
        const result = Portfolio.buyHouse(g(), def, { mortgage });
        ui.persist();
        ui.say(result.text);
      },
      'buy-c': (data) => {
        const result = Portfolio.buyCar(g(), Catalog.assetById(data.id));
        ui.persist();
        ui.say(result.text);
      },
      'buy-p': (data) => {
        const result = Portfolio.adoptPet(g(), Catalog.assetById(data.id));
        ui.persist();
        ui.say(result.text);
      },
      'sell-asset': (data) => {
        const asset = g().assets.find((a) => a.uid === Number(data.uid));
        if (!asset) return;
        ui.say(Portfolio.sell(g(), asset));
        ui.persist();
      },

      /* activities */
      activity: (data) => {
        const result = Activities.run(g(), data.id);
        ui.persist();
        ui.say(result.text);
      },
      rehab: () => {
        const result = Health.rehab(g());
        ui.persist();
        ui.say(result.text);
      },

      /* crime */
      crime: (data) => {
        const result = Crime.commit(g(), data.id);
        ui.persist();
        if (result.caught && g().jailed) ui.screen = 'prison';
        ui.say(result.text);
      },
      escape: () => {
        const result = Prison.tryEscape(g());
        ui.persist();
        if (result.ok) ui.screen = 'home';
        ui.say(result.text);
      }
    };
  }
};