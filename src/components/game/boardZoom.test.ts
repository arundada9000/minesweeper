import { describe, expect, it } from "vitest";
import {
  boardPinch,
  pointerDownOnBoard,
  pointerLeftBoard,
  pinchTapSuppressed,
  resetBoardPinch,
} from "./boardZoom";

describe("boardZoom pointer bookkeeping", () => {
  it("suppresses taps during a multi-touch pinch", () => {
    resetBoardPinch();
    pointerDownOnBoard();
    pointerDownOnBoard();
    expect(boardPinch.multi).toBe(true);
    expect(pinchTapSuppressed(performance.now())).toBe(true);
  });

  it("suppresses the lift that ends a pinch, then recovers", () => {
    resetBoardPinch();
    pointerDownOnBoard();
    pointerDownOnBoard();
    pointerLeftBoard();
    expect(pinchTapSuppressed(performance.now())).toBe(true);
    pointerLeftBoard();
    expect(boardPinch.multi).toBe(false);
  });

  it("a leaked pointer count permanently suppresses taps until reset", () => {
    resetBoardPinch();
    // A pointer goes down and the browser never delivers the matching up
    // (e.g. native scroll takeover); even after taps, the count never drops
    // below two, so every later tap is suppressed.
    pointerDownOnBoard();
    pointerDownOnBoard();
    for (let i = 0; i < 10; i++) {
      pointerDownOnBoard();
      pointerLeftBoard();
    }
    expect(boardPinch.multi).toBe(true);
    expect(pinchTapSuppressed(performance.now())).toBe(true);

    // The reset BoardGrid runs when a fresh run starts must clear the leak.
    resetBoardPinch();
    expect(boardPinch.multi).toBe(false);
    expect(pinchTapSuppressed(performance.now())).toBe(false);
  });
});