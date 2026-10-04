# BitLife-style Life Simulator — Zero-Build Web Game

> This is the original plan, annotated with what was actually executed.
> **Executed:** callouts mark where the build diverged from the plan and why.
> Unmarked sections were built as written.

## Goal

Build a BitLife-style text life simulator that runs entirely offline by
opening `index.html`. Player creates a character, ages year by year through
randomized life events with meaningful choices, and experiences career,
relationships, assets, crime, prison, health, and death — ending in a legacy
summary.

## Success criteria

- [x] Double-clicking `index.html` shows the character-creation screen and the
      game is fully playable with no server, no install, and no network.
- [x] A complete playthrough works: birth → school → job →
      relationships/marriage/kids → assets → crime → prison → release →
      retirement → death → legacy → new life. *Verified by
      `tests/playthrough.test.js`, which plays exactly this path.*
- [~] Zero `console.error` across a full playthrough; no screen can dead-end on
      "no events available". *The no-dead-end half holds — `EventEngine.quiet()`
      supplies a line when nothing qualifies, and no event can leave every
      choice locked. The zero-console-error half was **not** verified: no
      browser was available in the build environment. Rendering is checked by
      string-level tests instead.*
- [x] Progress autosaves to `localStorage` and survives a page refresh
      mid-life. *Round-trip is covered by fuzz tests, including continuing to
      produce identical rolls after reload.*
- [~] `node --test tests/` passes with zero dependencies; a 10,000-life fuzz
      run throws no exceptions. *`node --test <dir>` cannot be used here — see
      the Tests section. `node tests/run.js` runs the same suites in one
      process: 64 tests, 0 failures, and 10,000 lives clean.*

## Tech decisions (settled)

No build step. Plain `index.html` + `css/` + `js/`, loaded with classic
`<script>` tags (not ES modules) so `file://` works — ES module CORS rules would
block it.

> **Executed — the module pattern changed.** The plan called for "a small UMD
> wrapper so it attaches to `window.BitLife.*` in the browser and to
> `module.exports` in Node." This was dropped mid-build at your direction, when
> the scope was corrected to *"use js classes to organize your code, use
> ECMAScript 2026"*, *"you do not have to use IIFE"*, and *"Classes, no
> modules"*.
>
> What shipped instead: each file declares top-level classes and plain
> functions, sharing the single global lexical scope that classic scripts get.
> No wrappers, no namespace object, no IIFEs. Classes were used where there is
> real instance state (`Rng`, `GameState`, `Person`, `Asset`, `EventEngine`,
> `Encounter`) and frozen namespaces of functions taking `game` first for every
> subsystem (`Career`, `Education`, `Relationships`, `Portfolio`, `Health`,
> `Crime`, `Prison`, `Death`, `Activities`, `Year`, `Save`) — *"simpler is
> better"*.
>
> **The load-order constraint that replaced it:** a classic script can only
> reference a class declared by an earlier script, so `index.html` script order
> must match the `ORDER` array in `tests/load.js`. This is load-bearing, not
> cosmetic. Content files declare no top-level names at all, so they cannot
> collide with each other; only `js/data/events/helpers.js` declares top-level
> bindings.

Tests: Node's built-in runner (`node:test`), no npm dependencies.

> **Executed — in-process runner.** `node --test <dir>` spawns a child process
> per file, which fails with `spawn EPERM` in a sandboxed environment.
> `node:test` works fine when required directly, so `tests/run.js` requires each
> suite in turn. Zero dependencies is preserved. The spawning form should not be
> retried.

UI: mobile-first dark theme, max-width 430px centered phone frame, emoji + CSS
only (no image files, no CDN) so it works fully offline.

Content: ~250 events across 12 age/category files, including unfiltered crime,
prison, and violence. *Executed: **285 events** across the same 12 content
files (plus `helpers.js`), written by five agents working in parallel against
`childhood.js` as the reference.*

Single local player, no backend or accounts.

## File layout

```
bitlife/
├── index.html            # phone shell + <script> tags in dependency order (39)
├── css/style.css         # dark mobile UI, stat bars, modal, grids
├── js/
│   ├── main.js           # boot: restore save or show creation; wire router
│   ├── core/             # pure logic, no DOM
│   │   ├── rng.js        # seeded PRNG: rand, pick(weighted), chance
│   │   ├── game.js       # GameState shape, createLife, mutation helpers
│   │   ├── events.js     # event selection engine + requirement DSL
│   │   ├── year.js       # the age-up pipeline
│   │   ├── education.js  # school progression, GPA, graduation
│   │   ├── career.js     # job ladder, promotions, firing, offers
│   │   ├── relationships.js
│   │   ├── portfolio.js
│   │   ├── health.js
│   │   ├── crime.js
│   │   ├── prison.js
│   │   ├── death.js
│   │   ├── activities.js
│   │   └── save.js       # localStorage serialize/restore + migration
│   ├── data/
│   │   ├── names.js      # name pools by gender
│   │   ├── cities.js     # cities with country + cost-of-living tier
│   │   ├── careers.js    # job ladder by education tier
│   │   ├── catalog.js    # houses, cars, pets, activities
│   │   ├── crimes.js     # crime catalog
│   │   └── events/       # helpers + childhood, school, teen, romance, family,
│   │                     # work, money, health, elder, crime, prison, random
│   ├── ui/
│   │   ├── dom.js        # h() element builder + render helpers
│   │   ├── screens.js    # screen stack + navigation
│   │   └── app.js        # choice dialog
│   └── util/format.js    # money/age/number formatting
└── tests/                # node:test suites + fuzz
```

> **Executed — four files are named differently.** `core/state.js` became
> `core/game.js` (the original `state.js` was left behind by the rename and
> deleted; nothing referenced it). `core/assets.js` became `core/portfolio.js`,
> since it covers houses, cars and pets rather than assets generically.
> `ui/router.js` and `ui/eventModal.js` were merged into `ui/app.js`, which holds
> routing, the encounter modal, persistence and keyboard handling together.
> `ui/screens/` as a directory became the single file `ui/screens.js`.
> `core/activities.js` was added, which the plan did not list.
>
> Screens ended up as pure functions from a `ui` object to an HTML string. That
> turned out to matter more than expected: it let `tests/screens.test.js` render
> every screen in every significant life state with no browser at all.

## Data model

```js
GameState = {
  version, seed, rngState,
  firstName, lastName, gender, birthCity, birthCountry, birthYear,
  happiness, health, smarts, looks, fitness, fame,      // 0-100
  prisonFitness, criminalRecord /*0-100*/, jailYears,
  age, money, maritalStatus, education, job, assets, people,
  conditions, sentences, offers,
  flags:   { [eventId]: true },        // one-shot events already fired
  history: [ { year, age, text, kind } ],   // capped ring buffer
  alive, deathInfo, legacy
}

Person = { id, firstName, lastName, gender, age, type, relationship /*0-100*/,
           happiness, isDead, isJailed, jailYears, jailReason,
           job, netWorth, spouseName, children: [ids], lastInteractionYear }
// type: parent | sibling | friend | bestFriend | partner | spouse | ex |
//       child | boss | coworker | inLaw | pet
```

> **Executed — the nested `char` object was flattened.** Identity and stats sit
> directly on `GameState` (`game.happiness`, `game.criminalRecord`, …). The
> flattening was forced by a real bug: the first draft had `money()`, `people()`
> and `assets()` methods shadowed by same-named fields, so `game.money` resolved
> to a number and threw `TypeError: game.money is not a function`. Those methods
> were renamed to `addMoney(delta)`, `peopleOf(type)` and `assetsOf(type)`
> across `js/` and `tests/` — and every `char.` access site had to move with
> them. `conditions`, `sentences` and `offers` were added to the constructor,
> `toJSON()` and `fromJSON()` together, so saves stay complete.

Invariants enforced by helpers in `game.js`, never by raw assignment in
effects: `adjustStat()` clamps 0–100 · `earn()`/`spend()` forbid NaN and
negative-balance corruption · `addPerson()` allocates ids · `log()` caps history
length.

## Event engine DSL

```js
{ id, weight?, minAge?, maxAge?, once?, category?,
  text: string | (state) => string,
  require?: (state) => true | false | 'reason string',
  choices: [ { label, require?, weight?, result, effect?(state) } ] }
```

Selection filters by age range, `require`, and the `once` flag, then picks by
weight. If nothing qualifies, `events.js` falls back to a quiet-year line drawn
from the player's current age band and life stage, so aging can never dead-end.

> **Executed — additions worth knowing.** `require` returning a **string** is
> used as the lock reason shown on the disabled button, so the player can see
> why they cannot do the thing they wanted. `once` defaults to `true` when
> omitted, which is why most content omits it.
>
> `Encounter.resolve` runs `effect` **before** `result`, so an event whose
> ending depends on what the effect actually did stashes a note in `game.flags`
> and reads it back while producing its result sentence.
>
> Two rules the suites enforce: all randomness goes through `game.rng`
> (`Math.random` appears nowhere in `js/`), and no event may leave every choice
> gated — that is a soft-lock and fails the build.

## Age-up pipeline (year.js)

`ageUp()` runs in this fixed order:

1. Increment player age; age every person; roll natural deaths for NPCs.
2. Stat drift by band — looks rise to about 25 then decline; smarts rise
   through the 20s and slowly decline after 70; happiness pulled toward a
   baseline; fitness decays without gym activity.
3. Assets: houses appreciate, cars depreciate; apply upkeep costs.
4. Career: raise roll, company-performance roll, firing chance.
5. Education: advance a year, update GPA, fire graduation events.
6. Relationships: decay unless interacted with; NPC-driven breakups.
7. Criminal record cools; jail sentence counts down (or runs `Prison.serveYear`
   — see below).
8. Pets age and may die.
9. Random event roll, in context (prison events while jailed, crime events only
   when eligible).
10. Player death check → `death.js`.
11. Append to the history log; autosave.

> **Executed — health drift was rewritten.** The plan specified "health decays
> with age (≈-0.2/yr under 30 ramping to -6/yr past 75)." That decay-only model
> was built as written and then measured: the first fuzz run reported **average
> lifespan 41**, with "organ failure" accounting for 74% of all deaths. A body
> that only ever loses health never recovers, so by 51 health was at 43 and
> still falling.
>
> `Health.drift` now settles on an **age-based ceiling** minus condition damage
> — young bodies mend, old ones erode, and untreated conditions drag the
> ceiling down by their own `damage` value. Median lifespan moved to roughly
> 62–72, with deaths spread across old age and causes dominated by cancer, heart
> failure and old age. The fuzz suite now carries explicit balance guards
> (median between 55 and 95, some lives past 90, under 10% childhood deaths) so
> this cannot silently regress.

## Prison system

Committing a crime adds `criminalRecord` by the crime's severity. When the
record crosses the threshold, a jail roll may send the player in for N years
scaled by severity and prior record.

While jailed, `ageUp()` routes through `Prison.serveYear()`: no career or normal
events; prison gym raises `prisonFitness`; prison-specific events cover fights,
gangs, mental illness, assault, and injury. Consequences accrue during
incarceration: assets repossessed, relationships decay faster, mortgage
defaults.

Parole becomes eligible at half the sentence, then is a yearly roll. Escape is a
small yearly chance; success means freedom plus a permanent escape-attempt mark
on the record, failure adds years.

> **Executed.** One deviation: `Year.tickPrisonYear` calls
> `EventEngine.prisonPool()`, which filters the registry by
> `category === 'prison'`. Until that existed, prison years were rolling against
> the **entire** registry — every event file — because the call fell back to the
> full list. It is deliberately not aliased to `all()`.
>
> The 22 prison events are doubly gated (`category: 'prison'` **and**
> `require: (game) => game.jailed`), so they cannot fire outside prison, and the
> event suite asserts it.

## Crime catalog

Shoplifting, pickpocket, mugging, burglary, car theft, drug dealing, armed
robbery, arson, fraud, hacking, hitman work, murder. Each entry defines base
risk, record gained, jail-year range, payout, and effects on fame and
relationships. A criminal record gates senior job tiers permanently.

> **Executed — 12 crimes, 24 crime events.** Two bugs found during integration:
> `Crimes.availableFor` still read `game.char.criminalRecord` after the state
> flattening described above, so the crime screen threw
> `TypeError: Cannot read properties of undefined (reading 'criminalRecord')`
> for every player. And `Crime.commit` enforces no record threshold of its own —
> gating lives in `availableFor`, which two events had to mirror by hand.
>
> A test confirms that `Career.eligible` refuses senior tiers on a long record.

## Death & legacy

Natural (probability curve over age × health), medical (illness events drain
health; untreated conditions can kill), violent (crime, adversaries, prison
fights), and accidental. On death the legacy screen reports net worth, fame,
jobs held, years married, children, crimes committed, jail years, and longest
relationship — then offers "Start New Life".

> **Executed — one real bug in the death path.** `Person.kill()` checked for a
> partner *after* setting `isDead`, but `partner()` only searches living people,
> so the check never matched and losing a spouse left the player **married to a
> corpse**. The check now resolves the attachment before marking the person
> dead. Found independently by the content agent that hit it while simulating
> lives; it reported the bug rather than editing a file outside its scope.
> Regression tests cover both the widowed and the single case.

## Save/load

Single key `bitlife.save.v1` holding the full state as JSON, autosaved after
every action. On boot: valid save → resume; missing/corrupt/version-mismatched →
character creation. A `version` field gates migration; unknown versions are
discarded rather than crashing.

> **Executed — one adjustment.** The plan listed the six stat fields as living
> under `char`, which the flattening above removed; `conditions`, `sentences`,
> `offers` and `legacy` were added to `toJSON()`/`fromJSON()` to match.
> `GameState.SAVE_VERSION` is `1`.
>
> `Save.available()` correctly reports `false` under Node, where there is no
> `localStorage`; the round-trip itself is tested through `toJSON()`/`fromJSON()`
> rather than through storage.

## UI screens

Character creation → Home → {Relationships, Assets, Career, Activities, Log,
Prison (when jailed), Legacy}.

Home shows name, age, job, city, and money above stat bars for Happiness /
Health / Smarts / Looks / Fame, with an action grid led by a prominent Age
button. Events appear in a modal card with choice buttons and outcome text.

UX details: 44px minimum tap targets, keyboard 1–4 shortcuts for choices,
`aria-live` on the event modal, and re-entrancy guards so a double-click cannot
advance the year twice.

> **Executed.** One fix was needed on the tuition path: `Education.enroll()`
> does not charge, because the content events charge tuition themselves so the
> bill reflects the newly-enrolled level. That left the UI's Enroll button
> handing out a **free university**, so it now spends `Education.tuition()`
> after enrolling, and rolls the enrollment back if the player cannot pay.

## Tests

| Suite (planned) | Executed |
| --- | --- |
| `rng.test.js` — determinism, weight honoring, empty-array safety, chance bounds | folded into `engine.test.js` |
| `events.test.js` — age gating, once behaviour, requirement filtering, well-formed, no soft-locks | `events.test.js` ✓ |
| `year.test.js` — stats in 0–100, money never NaN, ages increment, log appended | folded into `engine.test.js` |
| `career.test.js` — education gates tiers, promotions raise salary, firing clears job | `systems.test.js` |
| `prison.test.js` — countdown, parole after half, escape bounds, no career events while jailed | `systems.test.js` |
| `save.test.js` — round-trip fidelity, version mismatch | folded into `engine.test.js` + `systems.test.js` |
| `fuzz.test.js` — 10,000 lives × 120 years | `fuzz.test.js` ✓ |
| — | **`screens.test.js`** — every screen in broke/jailed/married/elderly/dead states, plus XSS escaping *(not planned)* |
| — | **`playthrough.test.js`** — one full life played the way a player would *(not planned)* |

> **Executed: 6 files, 64 tests, 0 failures.** Planned 7 files; the year, rng and
> save cases were consolidated into `engine.test.js` and career/prison into
> `systems.test.js`, while two suites were added that the plan did not call for.
>
> `screens.test.js` exists because screens are pure string builders and could be
> exercised without a browser. `playthrough.test.js` exists because the fuzz bot
> only ever ages up and picks a choice — it never enrolls, applies for a job,
> buys anything or retires, so it could not catch systems that only fail when
> used together.
>
> The fuzz test doubles as the balance guard described under health drift. A
> representative played life from `playthrough.test.js`: university, five
> promotions, a mortgaged house, marriage, retirement on a 40% pension, death at
> 74 with $2.7M net worth and 31 distinct events encountered.

## Implementation order

1. ~~Scaffolding: `index.html`, `css/style.css`, UMD wrapper, `util/format.js`,
   `core/rng.js`, `core/state.js`.~~ → built, with the UMD wrapper replaced by
   top-level classes and `state.js` renamed `game.js`.
2. ~~Event engine + `year.js` pipeline + `death.js`.~~ → built.
3. ~~Data: names, cities, careers, catalog, crimes, then the 12 event files.~~
   → built; five agents wrote the event files in parallel, **285 events**.
4. ~~Subsystems: education, career, relationships, assets, health, crime,
   prison.~~ → built, with `assets.js` as `portfolio.js` and `activities.js`
   added.
5. ~~UI screens and router, wired to the core.~~ → built; router and event
   modal merged into `app.js`.
6. ~~Save/load, legacy screen, polish.~~ → built.
7. ~~Test suites, then run the fuzz pass and fix whatever it surfaces.~~ → built.
   The fuzz pass found the health model, and the suites found a layoff crash in
   `Career.workYear`, the married-to-a-corpse bug in `Person.kill`, a crash in
   `Screens.log`, a `game.char` reference left behind by the state flattening,
   and a missed call site from the `addMoney` rename.

## Assumptions

No backend, accounts, or network calls of any kind.

English-only UI.

Desktop and mobile browsers; both mouse and touch.

RNG is seeded so any bug is reproducible from its seed. *Executed: the cursor
is persisted as `rngState`, so a reloaded save continues producing exactly the
rolls the original life would have produced. `Math.random` and `Date.now` appear
nowhere in `js/`.*

"New Life" rerolls the seed unless the player pins on.

## Known gaps

- **Duplicate themes across content files.** Several independently written files
  cover the same beat: `romance_widowed` and `elder_widowed`,
  `romance_remarry` and `elder_remarry`, `family_inheritance` and
  `money_inheritance`, and several crush/breakup events. Most events are
  `once: true`, which limits the damage, but a trim pass is available.
- **The `assets` and `life` categories are thin** — 3 and 5 events against 20–40
  elsewhere. Harmless to the fuzz suite, possibly noticeable in play.
