/**
 * Deterministic seeded RNG utilities.
 *
 * A seed must produce the same sequence every time. Used for board
 * generation, Daily Puzzle, shared puzzles, replay, and tests.
 */

export type Seed = string | number;
export type Rng = () => number;

/**
 * Hash any seed (string or number) into a 32-bit unsigned integer.
 * cyrb128-style mixing: fast, and two seeds collide rarely enough for
 * gameplay purposes. Deterministic across platforms.
 */
export function hashSeed(seed: Seed): number {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return ((h1 ^ h2 ^ h3 ^ h4) >>> 0) >>> 0;
}

/**
 * mulberry32: tiny, fast, high-quality PRNG. Returns values in [0, 1).
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a fresh RNG from a seed (string or number, hashed deterministically). */
export function createRng(seed: Seed): Rng {
  return mulberry32(hashSeed(seed));
}

/** Generate an unguessable, uncached random seed (used for fresh games). */
export function randomSeed(): string {
  const bytes = new Uint32Array(2);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = (Math.random() * 0xffffffff) >>> 0;
    }
  }
  return bytes[0].toString(36).padStart(7, "0") + bytes[1].toString(36).padStart(7, "0");
}

/** Compact shareable identifier: `MS-XXXXXX` from a seed. */
export function puzzleId(seed: Seed): string {
  let n = hashSeed(seed);
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no ambiguous 0/O/1/I/L
  let out = "";
  for (let i = 0; i < 6; i++) {
    out = alphabet[n % alphabet.length] + out;
    n = Math.floor(n / alphabet.length);
  }
  return `MS-${out}`;
}

/** Fisher-Yates shuffle over an array using the given RNG. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Deterministic per-day seed. Any change to board-gen rules must bump the
 * generator version so past puzzles keep their identity (game-logic 52).
 */
export const DAILY_GENERATOR_VERSION = "v1";

export function dailySeed(dateISO: string, variant = "daily"): string {
  return `swm|daily|${dateISO}|${variant}|${DAILY_GENERATOR_VERSION}`;
}