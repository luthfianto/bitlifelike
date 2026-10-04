/*
 * Runs the whole suite in one process.
 *
 * `node --test` spawns a child process per test file, which is blocked in some
 * sandboxed environments. Node's test module runs perfectly well in-process
 * too, so this loads each suite directly:
 *
 *   node tests/run.js
 *
 * Set FUZZ_LIVES to change the fuzz size (default 2000).
 */
require('./engine.test.js');
require('./events.test.js');
require('./systems.test.js');
require('./screens.test.js');
require('./playthrough.test.js');
require('./fuzz.test.js');