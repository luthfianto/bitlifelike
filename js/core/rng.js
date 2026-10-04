/*
 * Deterministic RNG (mulberry32).
 *
 * One Rng instance is owned by GameState, so every roll advances a single
 * reproducible stream that a save file can capture and restore exactly.
 */
const UINT32 = 4294967296; // 2^32

class Rng {
  #state;

  constructor(seed = 1) {
    this.#state = seed >>> 0;
  }

  /* Raw uint32, exposed so save/load can round-trip the cursor. */
  get state() {
    return this.#state;
  }

  set state(v) {
    this.#state = v >>> 0;
  }

  /* One step of mulberry32. */
  next() {
    const t = (this.#state + 0x6d2b79f5) >>> 0;
    this.#state = t;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / UINT32;
  }

  /* float in [0,1) */
  float() {
    return this.next();
  }

  /* float in [min,max) */
  range(min, max) {
    return min + this.next() * (max - min);
  }

  /* integer in [min,max], both inclusive; a one-arg call means [0,min] */
  int(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    if (max < min) [min, max] = [max, min];
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /* true with probability p (0..1); also accepts a percent like 35 */
  chance(p) {
    if (p == null) return false;
    if (p > 1) p /= 100;
    if (p <= 0) return false;
    if (p >= 1) return true;
    return this.next() < p;
  }

  /* one element, or undefined when the collection is empty */
  pick(items) {
    if (!items || items.length === 0) return undefined;
    return items[this.int(0, items.length - 1)];
  }

  /* one element chosen proportionally to weightOf(item) */
  weighted(items, weightOf = (x) => x?.weight) {
    if (!items || items.length === 0) return undefined;
    let total = 0;
    for (const item of items) {
      const w = Number(weightOf(item));
      total += Number.isFinite(w) && w > 0 ? w : 0;
    }
    if (total <= 0) return this.pick(items);
    let target = this.next() * total;
    for (const item of items) {
      const w = Number(weightOf(item));
      target -= Number.isFinite(w) && w > 0 ? w : 0;
      if (target < 0) return item;
    }
    return items.at(-1);
  }

  /* Fisher-Yates on a copy (does not mutate the input) */
  shuffle(items) {
    if (!items) return [];
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /* n distinct elements, or all of them when n is larger */
  sample(items, n) {
    if (!items || items.length === 0) return [];
    return this.shuffle(items).slice(0, Math.max(0, Math.min(n, items.length)));
  }

  /* roughly normal: mean of 3 rolls, scaled by spread */
  gauss(mean = 0, spread = 1) {
    const v = (this.next() + this.next() + this.next()) / 3;
    return mean + (v - 0.5) * 2 * spread;
  }

  /* Stable FNV-1a seed so "name+year" rerolls identically. */
  static seedFrom(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
}