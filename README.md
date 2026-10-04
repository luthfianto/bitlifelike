# BitLife

A text life simulator in the style of BitLife. Create a character, age year by
year through randomized events with real choices, and see whether the life you
built holds up.

No build step, no dependencies, no network. **Double-click `index.html` and
play.**

```
index.html          open this
css/style.css
js/
  util/format.js    money and text formatting
  core/             rng, game state, subsystems, event engine, year pipeline
  data/             catalogs (names, cities, careers, crimes) and event content
  ui/               dom helpers, screens, app controller
tests/              node:test suites, run with `node tests/run.js`
```

## Playing

- **Age →** advances the year and runs every subsystem: pay, upkeep, health,
  education, relationships, prison, then a random event.
- Events offer two to four choices. Some are locked, and the lock tells you why.
- You start with nothing. School opens the job market; jobs pay for property;
  property costs upkeep; crime pays fast and ends in prison more often than not.
- Everything autosaves to `localStorage` after each action. Close the tab and
  come back.

Press `1`–`4` to pick a choice without touching the mouse.

## Architecture

The game uses **classic `<script>` tags with top-level classes** rather than ES
modules. This is deliberate: browsers block `import`/`export` from `file://`, so
modules would mean giving up double-click-to-play. Script order in
`index.html` therefore matters — a script can only reference a class declared
earlier.

Classes are used where there is real instance state:

| Class | Role |
| --- | --- |
| `Rng` | seeded PRNG; the cursor lives in `GameState` so a seed reproduces a life exactly |
| `GameState` | all mutable state, plus the mutation API every event calls |
| `Person`, `Asset` | data with behaviour |
| `EventEngine`, `Encounter` | the event registry and one pending event |

Everything else is a plain frozen namespace of functions that take `game` as
their first argument (`Career`, `Education`, `Relationships`, `Portfolio`,
`Health`, `Crime`, `Prison`, `Death`, `Activities`, `Year`, `Save`). No lazy
wiring, no circular construction.

### The age-up pipeline

`Year.tick` runs in a fixed order — age everyone, work, upkeep, health,
education, stat drift, crime cooling, mortality, then the event roll. While
incarcerated it routes to `Prison.serveYear` and the prison event pool only.

### Writing events

An event is data:

```js
EventEngine.register([
  {
    id: 'unique_snake_id',
    category: 'school',
    weight: 3,              // 1 rare, 6 very common
    minAge: 5, maxAge: 12,
    once: true,
    text: 'You did a thing.',
    require: (game) => true,          // false | 'reason string'
    choices: [
      { label: 'Option A', result: 'What happened.',
        effect: (game) => game.stat('happiness', 5) },
      { label: 'Option B', require: (game) => Can.job(game) ? true : Needs.JOB,
        result: 'Other outcome.', effect: (game) => {} }
    ]
  }
]);
```

Rules that matter: use `game.rng` for all randomness (never `Math.random`), and
never gate every choice — an event where nothing is selectable is a soft-lock.

`Encounter.resolve` runs `effect` before `result`, so an event whose ending
depends on what the effect actually did can stash a note in `game.flags` and
read it back when producing its result sentence.

Health settles on a ceiling set by age rather than falling forever: young bodies
recover, old ones erode, and untreated conditions drag the ceiling down by their
own damage. The fuzz suite guards the resulting lifespan distribution.

## Content

285 events across 13 files:

| | | | |
| --- | --- | --- | --- |
| childhood | school | teen | romance |
| family | work | money | health |
| elder | crime | prison | random |

## Tests

```
node tests/run.js            # whole suite
node tests/engine.test.js    # or one file at a time
FUZZ_LIVES=10000 node tests/fuzz.test.js
```

- `engine` — RNG, stat clamping, the age-up loop, save round-trips
- `events` — validates every event: unique ids, well-formed choices, non-empty
  copy, no soft-locks, prison events that cannot fire in ordinary life
- `systems` — education, career gating and promotion, crime and sentencing,
  prison timers and parole, the health curve, mortgages, activities
- `screens` — every screen rendered for broke, jailed, married, elderly and dead
  characters, and that nothing user-supplied escapes into the markup
- `playthrough` — one full life the way a player actually plays it: school,
  career, property, marriage, retirement, death
- `fuzz` — thousands of complete lives played by a bot, asserting the game's
  invariants after every single year

The fuzz run is also a balance check. A healthy 10,000-life run reports a
median lifespan in the low sixties and a long tail past 100; if health or
mortality is mistuned, the median moves and the test says so.