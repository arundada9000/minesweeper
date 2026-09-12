import { describe, expect, it } from "vitest";
import { computeMetrics } from "./metrics";
import type { Board } from "./types";

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

describe("computeMetrics", () => {
  it("is 1 for an empty board (a single opening)", () => {
    const board = makeBoard(3, 3, []);
    expect(computeMetrics(board).threeBV).toBe(1);
    expect(computeMetrics(board).openings).toBe(1);
  });

  it("is N for a board with no zeros at all", () => {
    // 3x3 with a center mine: every cell reads a number, none open.
    const board = makeBoard(3, 3, [4]);
    expect(computeMetrics(board).threeBV).toBe(8);
    expect(computeMetrics(board).openings).toBe(0);
  });

  it("counts a single opening around a ring of numbers", () => {
    // 5x5 with the center mine. All 24 neighbors read numbers but they
    // touch one connected zero region, so the opening click clears it all.
    const board = makeBoard(5, 5, [12]);
    expect(computeMetrics(board).openings).toBe(1);
    expect(computeMetrics(board).threeBV).toBe(1);
  });

  it("splits one mine-free board into the number of its openings", () => {
    // Two full mine columns (x = 1 and x = 3) dominate every cell: no zeros
    // remain, so all 15 non-mine cells need their own click.
    const wall = makeBoard(5, 5, [1, 3, 6, 8, 11, 13, 16, 18, 21, 23]);
    const metrics = computeMetrics(wall);
    expect(metrics.openings).toBe(0);
    expect(metrics.threeBV).toBe(15);
  });

  it("handles a small corner mine with an open field", () => {
    // 5x5, mine at corner (0,0). The ring cells 1,2,5,6 are numbers; the
    // rest is one zero region (single opening).
    const board = makeBoard(5, 5, [0]);
    const metrics = computeMetrics(board);
    expect(metrics.openings).toBe(1);
    // 25 cells - 1 mine - 4 ring numbers, all reachable by the single opening.
    expect(metrics.threeBV).toBe(1);
  });
});