import { describe, expect, it } from "vitest";
import { chordReveal, chordTargets, cycleFlag, floodReveal, revealCell } from "./actions";
import type { Board, BoardConfig } from "./types";

function makeConfig(overrides: Partial<BoardConfig> = {}): BoardConfig {
  return {
    width: 3,
    height: 3,
    mineCount: 1,
    seed: "actions",
    topology: "square",
    firstClickSafe: true,
    generousOpening: false,
    questionMarks: true,
    ...overrides,
  };
}

function boardFor(mineIndices: number[]): Board {
  const cells = Array.from({ length: 9 }, (_, i) => ({
    index: i,
    isMine: mineIndices.includes(i),
    adjacentMineCount: 0,
    state: "hidden" as const,
    revealedAt: 0,
    wrongFlag: false,
  }));
  for (let i = 0; i < 9; i++) {
    if (cells[i].isMine) continue;
    cells[i] = { ...cells[i], adjacentMineCount: countAdjacent(i, mineIndices) };
  }
  return { width: 3, height: 3, mineCount: mineIndices.length, safeCount: 9 - mineIndices.length, cells, generatedFor: null };
}

function countAdjacent(index: number, mines: number[]): number {
  const width = 3;
  const x = index % width;
  const y = Math.floor(index / width);
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= 3 || ny >= 3) continue;
      if (mines.includes(ny * width + nx)) count++;
    }
  }
  return count;
}

function boardFor5(mineIndices: number[]): Board {
  const width = 5;
  const height = 5;
  const cells = Array.from({ length: width * height }, (_, i) => ({
    index: i,
    isMine: mineIndices.includes(i),
    adjacentMineCount: 0,
    state: "hidden" as const,
    revealedAt: 0,
    wrongFlag: false,
  }));
  const near = (a: number, b: number): boolean => {
    const ax = a % width;
    const ay = Math.floor(a / width);
    const bx = b % width;
    const by = Math.floor(b / width);
    return Math.abs(ax - bx) <= 1 && Math.abs(ay - by) <= 1;
  };
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].isMine) continue;
    cells[i] = { ...cells[i], adjacentMineCount: mineIndices.filter((m) => near(i, m)).length };
  }
  return {
    width,
    height,
    mineCount: mineIndices.length,
    safeCount: width * height - mineIndices.length,
    cells,
    generatedFor: null,
  };
}

describe("cycleFlag", () => {
  it("cycles hidden -> flagged -> questioned -> hidden when enabled", () => {
    const board = boardFor([4]);
    expect(cycleFlag(board, 0, true)).toBe("flagged");
    expect(cycleFlag(board, 0, true)).toBe("questioned");
    expect(cycleFlag(board, 0, true)).toBe("hidden");
  });

  it("skips the question mark when disabled", () => {
    const board = boardFor([4]);
    expect(cycleFlag(board, 0, false)).toBe("flagged");
    expect(cycleFlag(board, 0, false)).toBe("hidden");
  });
});

describe("reveal & flood", () => {
  it("reveals exactly the zero-region when flooding an empty board", () => {
    const board = boardFor([]);
    const result = floodReveal(board, makeConfig(), 4, 1);
    expect(result.revealed.length).toBe(9);
    expect(board.cells.every((c) => c.state === "revealed")).toBe(true);
  });

  it("marks a mine click as exploded", () => {
    const board = boardFor([4]);
    const result = floodReveal(board, makeConfig(), 4, 1);
    expect(result.explodedMine).toBe(4);
    expect(board.cells[4].state).toBe("exploded");
  });

  it("does not flood through flagged cells", () => {
    // 5x5 with a single corner mine. Cells 1,2,5,6 form the numeral ring;
    // everything else is zero. Flag a zero cell; the flood must skip it.
    const board = boardFor5([0]);
    board.cells[7].state = "flagged"; // (2,1): a zero cell
    const result = floodReveal(board, makeConfig({ width: 5, height: 5 }), 24, 1);
    expect(result.revealed).not.toContain(7);
    expect(result.revealed.length).toBeGreaterThan(10);
  });

  it("allows revealCell without interfering with neighbors", () => {
    const board = boardFor([4]);
    const result = revealCell(board, 0, 5);
    expect(result.revealed).toEqual([0]);
    expect(board.cells[0].state).toBe("revealed");
    expect(board.cells[0].revealedAt).toBe(5);
  });
});

describe("chording", () => {
  it("returns null when flagged count does not match the number", () => {
    const board = boardFor([4]); // corner 0 has number 1
    board.cells[0].state = "revealed";
    board.cells[1].state = "revealed";
    expect(chordTargets(board, makeConfig(), 0)).toBeNull();
  });

  it("chords matching flags and exposes a wrong guess", () => {
    const board = boardFor([4]); // numbers: every cell reads 1
    board.cells[0].state = "revealed";
    board.cells[1].state = "flagged";
    const targets = chordTargets(board, makeConfig(), 0);
    expect(targets).toContain(4);
    expect(targets).not.toContain(1);
    expect(targets).not.toContain(0); // already revealed
  });

  it("reveals hidden neighbors and can trigger the mine", () => {
    const board = boardFor([4]);
    board.cells[1].state = "revealed";
    board.cells[2].state = "revealed";
    // 1 reads 1 (mine at center). Flag center to satisfy it.
    board.cells[4].state = "flagged";
    const result = chordReveal(board, makeConfig(), 1, 7)!;
    // Hidden neighbors of 1 were revealed; 4 was flagged (correct).
    expect(result.revealed.length).toBeGreaterThan(0);
    expect(result.explodedMine).toBeNull();
  });
});