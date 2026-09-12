import { describe, expect, it } from "vitest";
import { generateBoard, validateConfig, validateDimensions, validateMineCount, neighborCells, BoardConfigError } from "./board";
import type { BoardConfig } from "./types";

function makeConfig(overrides: Partial<BoardConfig> = {}): BoardConfig {
  return {
    width: 9,
    height: 9,
    mineCount: 10,
    seed: "test",
    topology: "square",
    firstClickSafe: true,
    generousOpening: true,
    questionMarks: true,
    ...overrides,
  };
}

describe("validation", () => {
  it("rejects boards smaller than 5 cells", () => {
    expect(() => validateDimensions(4, 9)).toThrow(BoardConfigError);
    expect(() => validateDimensions(9, 5)).not.toThrow();
  });

  it("rejects boards larger than 60x60 or 1600 cells", () => {
    expect(() => validateDimensions(61, 9)).toThrow(BoardConfigError);
    expect(() => validateDimensions(40, 45)).toThrow(BoardConfigError);
  });

  it("rejects zero and over-capacity mine counts", () => {
    expect(() => validateMineCount(0, 81)).toThrow(BoardConfigError);
    expect(() => validateMineCount(69, 81)).toThrow(BoardConfigError);
    expect(() => validateMineCount(68, 81)).not.toThrow();
  });

  it("validates full configs", () => {
    expect(() => validateConfig(makeConfig())).not.toThrow();
    expect(() => validateConfig(makeConfig({ mineCount: 0 }))).toThrow(BoardConfigError);
  });
});

describe("generateBoard", () => {
  it("is deterministic for the same seed", () => {
    const a = generateBoard({ width: 9, height: 9, mineCount: 10, seed: "x", topology: "square", excluded: [0] });
    const b = generateBoard({ width: 9, height: 9, mineCount: 10, seed: "x", topology: "square", excluded: [0] });
    expect(a.cells.map((c) => c.isMine)).toEqual(b.cells.map((c) => c.isMine));
  });

  it("never places mines inside the excluded set", () => {
    const excluded = [0, 1, 9, 10];
    const board = generateBoard({ width: 9, height: 9, mineCount: 4, seed: "pick", topology: "square", excluded });
    for (const i of excluded) {
      expect(board.cells[i].isMine).toBe(false);
    }
    expect(board.cells.filter((c) => c.isMine).length).toBe(4);
  });

  it("places the requested number of mines", () => {
    const board = generateBoard({ width: 16, height: 16, mineCount: 40, seed: "count", topology: "square", excluded: [] });
    expect(board.cells.filter((c) => c.isMine).length).toBe(40);
    expect(board.safeCount).toBe(256 - 40);
  });

  it("computes adjacency counts that match the topology", () => {
    const board = generateBoard({ width: 30, height: 16, mineCount: 99, seed: "adj", topology: "square", excluded: [] });
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const idx = y * board.width + x;
        const cell = board.cells[idx];
        if (cell.isMine) continue;
        let expected = 0;
        for (const n of neighborCells(board.width, board.height, "square", idx)) {
          if (board.cells[n].isMine) expected++;
        }
        expect(cell.adjacentMineCount).toBe(expected);
      }
    }
  });

  it("throws when the exclusion leaves no room for mines", () => {
    expect(() =>
      generateBoard({ width: 5, height: 5, mineCount: 20, seed: "tight", topology: "square", excluded: [0, 1, 2, 3, 4, 5, 10] })
    ).toThrow(BoardConfigError);
  });

  it("honors cylinder topology wrapping the horizontal edge", () => {
    const board = generateBoard({ width: 10, height: 5, mineCount: 3, seed: "cyl", topology: "cylinder", excluded: [] });
    // Left-column cell must include the right column as a neighbor.
    const neighbors = neighborCells(10, 5, "cylinder", 9);
    expect(neighbors).toContain(0);
    // Top row must NOT wrap to the bottom row.
    const top = neighborCells(10, 5, "cylinder", 0);
    expect(top).not.toContain(49);
  });
});