import { describe, expect, it } from "vitest";
import { findHint } from "./hints";
import { getTopology } from "./topology";
import type { Board, BoardConfig, Cell } from "./types";

const CFG: BoardConfig = {
  width: 3,
  height: 3,
  mineCount: 1,
  seed: "hint",
  topology: "square",
  firstClickSafe: true,
  generousOpening: true,
  questionMarks: true,
};

function cell(index: number, isMine: boolean, adjacentMineCount: number, state: Cell["state"]): Cell {
  return { index, isMine, adjacentMineCount, state, revealedAt: state === "revealed" ? 1 : 0, wrongFlag: false };
}

/** Build a board with hand-placed mines; adjacency counts follow the grid. */
function makeBoard(
  width: number,
  height: number,
  mines: number[],
  revealed: number[] = [],
  flagged: number[] = []
): Board {
  const topo = getTopology("square");
  const mineSet = new Set(mines);
  const cells: Cell[] = [];
  for (let i = 0; i < width * height; i++) {
    const isMine = mineSet.has(i);
    const adj = isMine ? 0 : topo.neighbors(width, height, i).filter((n) => mineSet.has(n)).length;
    cells.push(cell(i, isMine, adj, "hidden"));
  }
  for (const i of revealed) cells[i].state = "revealed";
  for (const i of flagged) cells[i].state = "flagged";
  return { width, height, mineCount: mines.length, safeCount: width * height - mines.length, cells, generatedFor: null };
}

describe("findHint", () => {
  it("returns null when every numbered cell is settled", () => {
    const cleared = makeBoard(3, 3, [], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(findHint(cleared, CFG)).toBeNull();
  });

  it("reveals the remaining neighbour when a number is satisfied", () => {
    const b = makeBoard(1, 4, [0], [1], [0]);
    const r = findHint(b, CFG)!;
    expect(r.action).toBe("reveal");
    expect(r.actionCells).toEqual([2]);
    expect(r.clueCells).toEqual([1]);
    expect(r.level).toBe("deduce");
    expect(r.explanation).toContain("This 1");
    expect(r.explanation).toContain("safe");
  });

  it("flags a cell when every remaining neighbour must be a mine", () => {
    const b = makeBoard(1, 4, [0, 2], [1], [0]);
    const r = findHint(b, CFG)!;
    expect(r.action).toBe("flag");
    expect(r.actionCells).toEqual([2]);
    expect(r.clueCells).toEqual([1]);
    expect(r.level).toBe("deduce");
  });

  it("falls back to a quiet guess when nothing is forced", () => {
    const b = makeBoard(3, 3, [0], [1]);
    const r = findHint(b, CFG)!;
    expect(r.level).toBe("guess");
    expect(r.action).toBe("reveal");
    expect(r.actionCells).toHaveLength(1);
    expect(r.areaCells).toContain(r.actionCells[0]);
    expect(r.explanation).toContain("guess");
  });

  it("answers are deterministic across calls", () => {
    const b = makeBoard(3, 3, [0], [1]);
    const first = findHint(b, CFG)!;
    const second = findHint(b, CFG)!;
    expect(first.actionCells).toEqual(second.actionCells);
    expect(first.explanation).toBe(second.explanation);
  });
});