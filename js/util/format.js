/*
 * Formatting helpers. Static-only utility class.
 *
 * File pattern used across the game: every script declares one or more
 * top-level classes. Classic scripts share a single global lexical scope, so
 * files reference each other's classes by bare name — no import/export, no
 * wrapper. That is what keeps index.html playable straight from file://.
 */
class Format {
  /* $1,234,567 — negative values keep the sign in front. */
  static #group(n) {
    return String(Math.floor(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static #trim(v) {
    return String(Math.round(v * 10) / 10);
  }

  static money(n) {
    if (!Number.isFinite(n)) n = 0;
    return (n < 0 ? '-$' : '$') + Format.#group(n);
  }

  /* Compact form for tight spaces: $12.4K, $3.1M */
  static moneyShort(n) {
    if (!Number.isFinite(n)) n = 0;
    const a = Math.abs(n);
    let out;
    if (a >= 1e9) out = `${Format.#trim(a / 1e9)}B`;
    else if (a >= 1e6) out = `${Format.#trim(a / 1e6)}M`;
    else if (a >= 1e4) out = `${Format.#trim(a / 1e3)}K`;
    else out = Format.#group(a);
    return (n < 0 ? '-$' : '$') + out;
  }

  /* "$12,000" -> "12K"; used when writing inline event copy. */
  static abbrev(n) {
    if (!Number.isFinite(n)) n = 0;
    const a = Math.abs(n);
    if (a >= 1e6) return (n < 0 ? '-' : '') + Format.#trim(a / 1e6) + 'M';
    if (a >= 1e3) return (n < 0 ? '-' : '') + Format.#trim(a / 1e3) + 'K';
    return (n < 0 ? '-' : '') + String(Math.floor(a));
  }

  static fullName(p) {
    if (!p) return 'Someone';
    if (p.type === 'pet') return p.firstName;
    return `${p.firstName} ${p.lastName}`;
  }

  static possessive(s) {
    return s.endsWith('s') ? `${s}'` : `${s}'s`;
  }

  /* Clamp helper shared by every stat mutation in the game. */
  static clamp(n, lo, hi) {
    if (!Number.isFinite(n)) return lo;
    return n < lo ? lo : n > hi ? hi : n;
  }

  static num(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  static ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  }

  static list(items) {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
  }
}