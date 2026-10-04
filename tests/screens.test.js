/*
 * Screen rendering tests.
 *
 * Screens are pure functions from a ui object to an HTML string, so they can
 * be exercised without a browser. This catches the class of bug that unit
 * tests on the core miss: a screen reaching for a field that does not exist,
 * or rendering differently depending on the state of the life.
 */
const test = require('node:test');
const assert = require('node:assert');
const { loadFiles } = require('./load.js');

loadFiles([
  '../js/ui/dom.js',
  '../js/ui/screens.js',
  '../js/ui/app.js'
]);

/* A stand-in for the app controller: screens only read from it. */
function fakeUi(game) {
  return {
    game,
    toast: '',
    message: '',
    encounter: null,
    draft: { gender: 'male', city: 'Detroit', birthYear: 1990 },
    offers() {
      return Career.generateOffers(game);
    }
  };
}

const SCREENS = ['home', 'career', 'assets', 'activities', 'crime', 'relationships', 'log', 'prison', 'school', 'legacy'];

test('every screen renders for an ordinary life', () => {
  const game = new GameState({ seed: 1, birthYear: 2000 });
  game.age = 24;
  game.addMoney(20000);
  const ui = fakeUi(game);

  for (const name of SCREENS) {
    if (name === 'legacy') continue;
    const html = Screens[name](ui);
    assert.strictEqual(typeof html, 'string', `${name} did not return a string`);
    assert.ok(html.length > 0, `${name} rendered nothing`);
  }
});

test('screens render for the awkward states: broke, jailed, dead, childless', () => {
  const cases = {
    broke: (g) => g.addMoney(5000),
    jailed: (g) => Prison.send(g, 'armed robbery', 9),
    marriedWithKids: (g) => {
      const p = g.addPerson({ type: 'spouse', firstName: 'Sam', lastName: 'Reyes', age: 30, relationship: 80 });
      g.maritalStatus = 'married';
      for (let i = 0; i < 3; i++) {
        g.addPerson({ type: 'child', firstName: `Kid${i}`, lastName: g.lastName, age: i * 3, relationship: 70 });
      }
      g.addPerson({ type: 'boss', firstName: 'Dana', lastName: 'Klein', age: 44 });
      return p;
    },
    old: (g) => { g.age = 88; g.setStat('health', 12); },
    dead: (g) => Death.kill(g, 'old age')
  };

  for (const [label, setup] of Object.entries(cases)) {
    const game = new GameState({ seed: 2, birthYear: 1970 });
    game.age = 30;
    setup(game);
    const ui = fakeUi(game);

    for (const name of SCREENS) {
      if (name === 'legacy' && label !== 'dead') continue;
      const html = Screens[name](ui);
      assert.strictEqual(typeof html, 'string', `${label}/${name} did not return a string`);
      assert.ok(html.length > 0, `${label}/${name} rendered nothing`);
    }
  }
});

test('the new life screen renders with no game at all', () => {
  const birthYear = new Date().getFullYear() - 12; // inside the offered range
  const html = Screens.newLife({ draft: { gender: 'female', city: 'Osaka', birthYear } });
  assert.ok(html.includes('Begin Life'));
  assert.ok(html.includes('Osaka'));
  assert.ok(html.includes(String(birthYear)));
});

test('the legacy screen shows the full record of a finished life', () => {
  const game = new GameState({ seed: 3, birthYear: 1960 });
  game.age = 79;
  game.addMoney(500000);
  game.legacy.crimesCommitted = 4;
  game.legacy.arrests = 1;
  game.legacy.jailYears = 3;
  game.legacy.jobsHeld.push({ title: 'Chef', company: 'Benson Inc' });
  Death.kill(game, 'heart failure');

  const html = Screens.legacy(fakeUi(game));
  assert.ok(html.includes('heart failure'), 'should name the cause');
  assert.ok(html.includes('Chef'), 'should list positions held');
  assert.ok(html.includes('Start a New Life'));
  assert.ok(html.includes('4'), 'should include the crime count');
});

test('home escapes user-supplied names', () => {
  const game = new GameState({ seed: 4, birthYear: 2000, firstName: '<img src=x onerror=alert(1)>' });
  const html = Screens.home(fakeUi(game));
  assert.ok(!html.includes('<img src=x'), 'raw markup must not reach innerHTML');
  assert.ok(html.includes('&lt;img'), 'the name should be escaped');
});

test('the jail screen exposes the escape action while incarcerated', () => {
  const game = new GameState({ seed: 5, birthYear: 1980 });
  game.age = 40;
  Prison.send(game, 'fraud', 8);
  const html = Screens.prison(fakeUi(game));
  assert.ok(html.includes('data-action="escape"'));
  assert.ok(html.includes('data-action="age"'));
  assert.ok(html.includes('fraud'), 'should name the crime');
});

test('every rendered screen escapes its dynamic values', () => {
  const game = new GameState({ seed: 6, birthYear: 1990 });
  game.age = 40;
  game.addPerson({
    type: 'friend',
    firstName: '<script>alert(1)</script>',
    lastName: '"onmouseover="alert(1)',
    age: 30,
    relationship: 60
  });

  const ui = fakeUi(game);
  for (const name of ['home', 'relationships', 'career', 'assets', 'log']) {
    const html = Screens[name](ui);
    // Raw markup must never survive; escaped entities are fine.
    assert.ok(!html.includes('<script>'), `${name} leaked a script tag`);
    assert.ok(!html.includes('onmouseover="'), `${name} leaked an inline event handler`);
  }

  // The relationships screen is the one that actually prints this person.
  const rel = Screens.relationships(ui);
  assert.ok(rel.includes('&quot;onmouseover=&quot;'), 'the quote should be escaped');
  assert.ok(rel.includes('&lt;script&gt;'), 'the angle brackets should be escaped');
});