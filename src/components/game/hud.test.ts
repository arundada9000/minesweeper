import { describe, expect, it } from "vitest";
import { formatMines } from "./Hud";

describe("formatMines", () => {
  it("pads positive values to three digits", () => {
    expect(formatMines(9)).toBe("009");
    expect(formatMines(10)).toBe("010");
    expect(formatMines(0)).toBe("000");
  });

  it("shows negatives with the sign before padded digits, not mid-string", () => {
    expect(formatMines(-1)).toBe("-001");
    expect(formatMines(-2)).toBe("-002");
    expect(formatMines(-12)).toBe("-012");
  });
});