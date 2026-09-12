import { describe, expect, it } from "vitest";
import { createRng, hashSeed, mulberry32, puzzleId, randomSeed, shuffle } from "./rng";

describe("rng", () => {
  it("produces identical sequences for identical seeds", () => {
    const a = createRng("daily-2026-01-01");
    const b = createRng("daily-2026-01-01");
    expect(Array.from({ length: 20 }, () => a())).toEqual(Array.from({ length: 20 }, () => b()));
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng("seed-a");
    const b = createRng("seed-b");
    expect(Array.from({ length: 8 }, () => a())).not.toEqual(Array.from({ length: 8 }, () => b()));
  });

  it("keeps values in [0, 1)", () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("hashes numbers and strings deterministically", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed(42)).toBe(hashSeed(42));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });

  it("produces a readable, stable puzzle id", () => {
    expect(puzzleId("alpha")).toBe(puzzleId("alpha"));
    expect(puzzleId("alpha")).toMatch(/^MS-[2-9A-HJKMNP-Z]{6}$/);
  });

  it("shuffles deterministically with a seeded rng", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const rngA = createRng("shuffle");
    const rngB = createRng("shuffle");
    expect(shuffle(items.slice(), rngA)).toEqual(shuffle(items.slice(), rngB));
  });

  it("randomSeed produces 14-char base36 strings", () => {
    const seeds = new Set(Array.from({ length: 50 }, () => randomSeed()));
    expect(seeds.size).toBe(50);
    seeds.forEach((s) => expect(s).toMatch(/^[0-9a-z]{14}$/));
  });
});