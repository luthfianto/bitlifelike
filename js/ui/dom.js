/*
 * Minimal DOM helpers.
 *
 * The UI is built from template strings rather than a hyperscript layer:
 * screens return HTML, one delegated listener handles clicks. That keeps the
 * rendering code close to the markup it produces.
 */
const dom = {
  /* Escape anything that reaches innerHTML. */
  esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  },

  qs(selector, root = document) {
    return root.querySelector(selector);
  },

  qsa(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  },

  /* Replace a container's contents with an HTML string. */
  render(container, html) {
    container.innerHTML = html;
    return container;
  },

  /*
   * One delegated click handler for the whole app.
   * Elements opt in with data-action="name" and optional data-* arguments.
   */
  bindActions(root, handlers) {
    root.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target || !root.contains(target)) return;

      const name = target.dataset.action;
      const handler = handlers[name];
      if (!handler) return;

      event.preventDefault();
      if (target.dataset.locked === 'true' || target.disabled) return;
      handler(target.dataset);
    });
  },

  /* A stat bar: label, emoji, and a fill coloured by value. */
  bar(label, value, { emoji = '', showNumber = true } = {}) {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    const tone = v >= 66 ? 'good' : v >= 33 ? 'mid' : 'bad';
    return `
      <div class="stat">
        <div class="stat-head">
          <span class="stat-label">${emoji} ${dom.esc(label)}</span>
          ${showNumber ? `<span class="stat-value">${v}</span>` : ''}
        </div>
        <div class="bar"><div class="bar-fill ${tone}" style="width:${v}%"></div></div>
      </div>`;
  },

  /* A horizontal scrollable row of choices, used by event modals. */
  buttons(list) {
    return list
      .map(
        (item) => `
        <button class="choice ${item.enabled ? '' : 'locked'}"
                data-action="${dom.esc(item.action)}"
                ${item.enabled ? '' : 'data-locked="true"'}>
          <span class="choice-label">${dom.esc(item.label)}</span>
          ${item.note ? `<span class="choice-note">${dom.esc(item.note)}</span>` : ''}
        </button>`
      )
      .join('');
  }
};