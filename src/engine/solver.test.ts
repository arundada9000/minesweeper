import { describe, expect, it } from "vitest";
import { deduce, boardIsLogical, generateNoGuessBoard } from "./solver";
import type { Board, BoardConfig } from "./types";

/** Build a small hand-crafted board from a flat mine map. */
function makeBoard(width: number, height: number, mines: number[]): Board {
  const cells = Array.from({ length: width * height }, (_, i) => ({
    index: i,
    isMine: mines.includes(i),
    adjacentMineCount: 0,
    state: "hidden" as const,
    revealedAt: 0,
    wrongFlag: false,
  }));
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].isMine) continue;
    let count = 0;
    for (const n of neighbors(width, height, i)) {
      if (cells[n].isMine) count++;
    }
    cells[i] = { ...cells[i], adjacentMineCount: count };
  }
  return { width, height, mineCount: mines.length, safeCount: width * height - mines.length, cells, generatedFor: null };
}

function neighbors(width: number, height: number, i: number): number[] {
  const x = i % width;
  const y = Math.floor(i / width);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      out.push(ny * width + nx);
    }
  }
  return out;
}

function reveal(board: Board, index: number): void {
  const cell = board.cells[index];
  if (cell.isMine || cell.state === "revealed") return;
  cell.state = "revealed";
  if (cell.adjacentMineCount === 0) {
    for (const n of neighbors(board.width, board.height, index)) reveal(board, n);
  }
}

function configFor(board: Board): BoardConfig {
  return {
    width: board.width,
    height: board.height,
    mineCount: board.mineCount,
    seed: "test",
    topology: "square",
    firstClickSafe: true,
    generousOpening: true,
    questionMarks: true,
  };
}

describe("deduce", () => {
  it("flags a cell when a number can only point at one neighbor", () => {
    // 4x4, single mine at 5. Reveal 0,1,4 so that cell 0's only remaining
    // hidden neighbor is the mine itself.
    const board = makeBoard(4, 4, [5]);
    reveal(board, 0);
    reveal(board, 1);
    reveal(board, 4);
    const result = deduce(board, configFor(board));
    expect(result.forcedMines).toContain(5);
    expect(result.forcedSafe.length + result.forcedMines.length).toBeGreaterThan(0);
  });

  it("declares safe cells when a number is fully flagged", () => {
    // Mines at 5 and 9. Reveal 0,1,4; flag 5. Cells 2 and 6 must be safe.
    const board = makeBoard(4, 4, [5, 9]);
    reveal(board, 0);
    reveal(board, 1);
    reveal(board, 4);
    board.cells[5].state = "flagged";
    const result = deduce(board, configFor(board));
    expect(result.forcedSafe).toContain(2);
    expect(result.forcedSafe).toContain(6);
  });

  it("finds nothing on a big ambiguous frontier", () => {
    // 4x4 with three mines: too ambiguous to pin without more info.
    const board = makeBoard(4, 4, [5, 10, 15]);
    reveal(board, 0);
    const result = deduce(board, configFor(board));
    expect(result.forcedSafe).toHaveLength(0);
    expect(result.forcedMines).toHaveLength(0);
  });
});

describe("boardIsLogical", () => {
  it("detects an unavoidable coin flip", () => {
    // 2x2 with mines in opposite corners. Opening (0,0) only reveals the
    // corner, and its two hidden neighbors are a clean 50/50.
    const board = makeBoard(2, 2, [1, 2]);
    expect(boardIsLogical(board, configFor(board))).toBe(false);
  });

  it("acqualifies a trivially forced board", () => {
    // 4x4 with a single corner mine: opening floods the whole field, so the
    // remaining non-mine cells are all revealed and the board is cleared by
    // pure cascade.
    const board = makeBoard(4, 4, [15]);
    expect(boardIsLogical(board, configFor(board))).toBe(true);
  });
});

describe("generateNoGuessBoard", () => {
  it("returns a board the solver can clear without guessing", () => {
    const { board, seed } = generateNoGuessBoard({ width: 9, height: 9, mineCount: 10 });
    expect(board.cells.filter((c) => c.isMine)).toHaveLength(10);
    expect(Number.isFinite(String(seed).length)).toBe(true);
    const config = configFor(board);
    expect(boardIsLogical(board, config)).toBe(true);
  });

  it("is deterministic for the same seed", () => {
    const a = generateNoGuessBoard({ width: 9, height: 9, mineCount: 10, seed: "ng" });
    const b = generateNoGuessBoard({ width: 9, height: 9, mineCount: 10, seed: "ng" });
    expect(a.board.cells.map((c) => c.isMine)).toEqual(b.board.cells.map((c) => c.isMine));
  });
});