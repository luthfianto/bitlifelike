/*
 * Loads the game's source files into the current global scope.
 *
 * The game uses classic <script> tags with top-level classes rather than ES
 * modules (so index.html works from file://). To reuse those exact files in
 * Node we evaluate them with vm.runInThisContext, which shares one global
 * lexical scope — the same way the browser does.
 *
 * ORDER MUST MATCH the <script> order in index.html: a classic script can only
 * reference a class declared by an earlier one.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ORDER = [
  '../js/util/format.js',
  '../js/core/rng.js',
  '../js/data/names.js',
  '../js/data/cities.js',
  '../js/data/careers.js',
  '../js/data/catalog.js',
  '../js/data/crimes.js',
  '../js/core/person.js',
  '../js/core/asset.js',
  '../js/core/game.js',
  '../js/core/events.js',
  '../js/core/career.js',
  '../js/core/education.js',
  '../js/core/relationships.js',
  '../js/core/portfolio.js',
  '../js/core/health.js',
  '../js/core/crime.js',
  '../js/core/prison.js',
  '../js/core/death.js',
  '../js/core/activities.js',
  '../js/core/year.js',
  '../js/core/save.js'
];

/* Event content, loaded after the core so EventEngine and friends exist. */
const EVENTS = [
  '../js/data/events/helpers.js',
  '../js/data/events/childhood.js',
  '../js/data/events/school.js',
  '../js/data/events/teen.js',
  '../js/data/events/romance.js',
  '../js/data/events/family.js',
  '../js/data/events/work.js',
  '../js/data/events/money.js',
  '../js/data/events/health.js',
  '../js/data/events/elder.js',
  '../js/data/events/crime.js',
  '../js/data/events/prison.js',
  '../js/data/events/random.js'
];

let loaded = false;
let eventsLoaded = false;

function loadCore() {
  if (loaded) return;
  loaded = true;
  run(ORDER);
}

function loadEvents() {
  loadCore();
  if (eventsLoaded) return;
  eventsLoaded = true;
  run(EVENTS);
}

function run(files) {
  for (const rel of files) {
    const file = path.join(__dirname, rel);
    if (!fs.existsSync(file)) {
      // Tolerated so the suite can run against a partially built tree; the
      // "200+ events" assertion in events.test.js is what catches a real gap.
      console.warn(`[load] skipped missing ${rel}`);
      continue;
    }
    vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
  }
}

/* Load a list of additional content files (event data) after the core. */
function loadFiles(relativePaths) {
  loadCore();
  run(relativePaths);
}

module.exports = { loadCore, loadEvents, loadFiles, ORDER, EVENTS };