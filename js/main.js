/*
 * Boot. Waits for the DOM, then hands control to the UI controller.
 */
(() => {
  const start = () => ui.mount(document.getElementById('app'));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  // Expose the classes for poking at in the console while playing.
  globalThis.BitLife = { GameState, EventEngine, Career, Prison, Crime, Death, Health, Education, Relationships, Portfolio, Activities, Save, Rng, Format };
})();