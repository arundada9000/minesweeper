/**
 * Logic-based constraint solver.
 *
 * Deduces forced-safe and forced-mine cells from the revealed frontier
 * using classic Minesweeper rules (numeral counts + subset subtraction),
 * with an exact enumeration fallback for small frontiers. Powers No Guess
 * mode, hint generation, and daily-puzzle construction.
 */

import { generateBoard } from "./board";
import { getTopology } from "./topology";
import { createRng } from "./rng";
import type { Board, BoardConfig } from "./types";

export interface Deduction {
  forcedSafe: number[];
  forcedMines: number[];
}

interface Constraint {
  cells: number[];
  target: number;
}

/** Extremely small frontiers get an exact check via enumeration. */
const MAX_ENUMERATE = 16;

function frontierOf(board: Board, config: BoardConfig): Set<number> {
  const set = new Set<number>();
  const { width, height, topology } = config;
  const topo = getTopology(topology);
  for (let i = 0; i < width * height; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.state !== "revealed") continue;
    if (cell.adjacentMineCount === 0) continue;
    for (const n of topo.neighbors(width, height, i)) {
      const state = board.cells[n].state;
      if (state === "hidden" || state === "questioned") set.add(n);
    }
  }
  return set;
}

function constraintsOf(board: Board, config: BoardConfig, frontier: Set<number>): Constraint[] {
  const { width, height, topology } = config;
  const topo = getTopology(topology);
  const out: Constraint[] = [];
  for (let i = 0; i < width * height; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.state !== "revealed" || cell.adjacentMineCount === 0) continue;
    const cells: number[] = [];
    let flagged = 0;
    for (const n of topo.neighbors(width, height, i)) {
      const neighbor = board.cells[n];
      if (neighbor.state === "flagged") flagged++;
      else if (frontier.has(n)) cells.push(n);
    }
    const target = cell.adjacentMineCount - flagged;
    if (cells.length > 0 && target >= 0 && target <= cells.length) {
      out.push({ cells, target });
    }
  }
  return out;
}

/**
 * Deduce every cell that is logically forced right now. Returns forced
 * safe cells and forced mines (deduced as such; both are playable).
 */
export function deduce(board: Board, config: BoardConfig): Deduction {
  const forcedSafe = new Set<number>();
  const forcedMines = new Set<number>();

  let frontier = frontierOf(board, config);
  if (frontier.size === 0) return { forcedSafe: [], forcedMines: [] };
  let cons = constraintsOf(board, config, frontier);

  let progressed = true;
  while (progressed) {
    progressed = false;

    for (const c of cons) {
      if (c.target === 0) {
        for (const i of c.cells) {
          if (!forcedMines.has(i) && !forcedSafe.has(i)) {
            forcedSafe.add(i);
            progressed = true;
          }
        }
      } else if (c.target === c.cells.length) {
        for (const i of c.cells) {
          if (!forcedSafe.has(i) && !forcedMines.has(i)) {
            forcedMines.add(i);
            progressed = true;
          }
        }
      }
    }

    // Subset subtraction: for A ⊆ B, mines in (B \ A) == targetB - targetA.
    for (const a of cons) {
      for (const b of cons) {
        if (a === b) continue;
        if (!a.cells.every((x) => b.cells.includes(x))) continue;
        const dm = b.target - a.target;
        const dn = b.cells.length - a.cells.length;
        if (dm === dn) {
          for (const i of b.cells) {
            if (!a.cells.includes(i) && !forcedSafe.has(i) && !forcedMines.has(i)) {
              forcedMines.add(i);
              progressed = true;
            }
          }
        } else if (dm === 0) {
          for (const i of b.cells) {
            if (!a.cells.includes(i) && !forcedSafe.has(i) && !forcedMines.has(i)) {
              forcedSafe.add(i);
              progressed = true;
            }
          }
        }
      }
    }

    frontier = frontierOf(board, config);
    for (const i of forcedSafe) frontier.delete(i);
    for (const i of forcedMines) frontier.delete(i);
    cons = constraintsOf(board, config, frontier);
  }

  if (forcedSafe.size > 0 || forcedMines.size > 0) {
    return { forcedSafe: [...forcedSafe], forcedMines: [...forcedMines] };
  }

  // Exact fallback for tiny frontiers: enumerate every feasible mine layout.
  if (frontier.size <= MAX_ENUMERATE) {
    const exact = enumerate(board, config, frontier, cons);
    return {
      forcedSafe: [...new Set([...forcedSafe, ...exact.forcedSafe])],
      forcedMines: [...new Set([...forcedMines, ...exact.forcedMines])],
    };
  }

  return { forcedSafe: [], forcedMines: [] };
}

function enumerate(board: Board, config: BoardConfig, frontier: Set<number>, cons: Constraint[]): Deduction {
  const cells = [...frontier];
  const k = cells.length;
  const indexOf = new Map<number, number>();
  cells.forEach((c, i) => indexOf.set(c, i));

  const masks: { mask: number; target: number }[] = [];
  for (const c of cons) {
    let mask = 0;
    for (const i of c.cells) {
      const bit = indexOf.get(i);
      if (bit !== undefined) mask |= 1 << bit;
    }
    masks.push({ mask, target: c.target });
  }

  const lim = 1 << k;
  let feasible = 0;
  const alwaysMine = Array.from({ length: k }, () => true);
  const alwaysSafe = Array.from({ length: k }, () => true);

  for (let bits = 0; bits < lim; bits++) {
    let ok = true;
    for (const c of masks) {
      if (popcount(bits & c.mask) !== c.target) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    feasible++;
    for (let i = 0; i < k; i++) {
      if (bits & (1 << i)) alwaysSafe[i] = false;
      else alwaysMine[i] = false;
    }
  }

  const forcedSafe: number[] = [];
  const forcedMines: number[] = [];
  if (feasible > 1) {
    // Only cells pinned across ALL feasible layouts are certain.
    for (let i = 0; i < k; i++) {
      if (alwaysMine[i]) forcedMines.push(cells[i]);
      if (alwaysSafe[i]) forcedSafe.push(cells[i]);
    }
  }
  return { forcedSafe, forcedMines };
}

function popcount(x: number): number {
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

/* --------------------------- No Guess generation --------------------------- */

/**
 * Simulate logical play on a fresh board and report if a guess is unavoidable.
 * `startIndex` is where the logical run's first reveal happens (the board's
 * guaranteed opening); validation from that cell makes the guarantee honest.
 */
export function boardIsLogical(board: Board, config: BoardConfig, startIndex = 0): boolean {
  const sim = cloneBoard(board);
  if (!sim) return false;

  const { width, height, topology } = config;

  floodRevealSim(sim, config, startIndex);

  let guard = 0;
  const maxGuard = width * height + 60;
  while (!isSimWin(sim) && guard++ < maxGuard) {
    const { forcedSafe, forcedMines } = deduce(sim, config);
    // Logical play: flag forced mines, reveal forced safe cells.
    let acted = false;
    for (const i of forcedMines) {
      const c = sim.cells[i];
      if (c.state === "hidden" || c.state === "questioned") {
        c.state = "flagged";
        acted = true;
      }
    }
    for (const i of forcedSafe) {
      const c = sim.cells[i];
      if (c.state === "hidden" || c.state === "questioned") {
        floodRevealSim(sim, config, i);
        acted = true;
      }
    }
    if (!acted) return false; // stuck: a guess is unavoidable
  }
  return isSimWin(sim);
}

function isSimWin(board: Board): boolean {
  for (const cell of board.cells) {
    if (!cell.isMine && cell.state !== "revealed") return false;
  }
  return true;
}

function floodRevealSim(board: Board, config: BoardConfig, start: number): void {
  const { width, height, topology } = config;
  const topo = getTopology(topology);
  const queue = [start];
  let head = 0;
  while (head < queue.length) {
    const i = queue[head++];
    const cell = board.cells[i];
    if (cell.isMine || cell.state === "revealed" || cell.state === "flagged") continue;
    cell.state = "revealed";
    if (cell.adjacentMineCount === 0) {
      for (const n of topo.neighbors(width, height, i)) {
        const state = board.cells[n].state;
        if (state === "hidden" || state === "questioned") queue.push(n);
      }
    }
  }
}

function cloneBoard(board: Board): Board {
  return {
    ...board,
    cells: board.cells.map((cell) => ({ ...cell })),
  };
}

export interface NoGuessOptions {
  width: number;
  height: number;
  mineCount: number;
  seed?: string | number;
  maxAttempts?: number;
}

/**
 * Generate a deterministically-seeded board that is solvable by logic alone
 * from its opening click. Retries candidate seeds until one qualifies.
 */
export function generateNoGuessBoard(opts: NoGuessOptions): { board: Board; seed: string | number } {
  const { width, height, mineCount, seed, maxAttempts = 60 } = opts;
  let seedIndex = 0;
  const base = seed ?? 0;
  const rng = createRng(base);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateSeed = attempt === 0 && seed !== undefined ? seed : rng() * 0xffffffff;
    const board = generateCandidate(width, height, mineCount, candidateSeed);
    const config: BoardConfig = {
      width,
      height,
      mineCount,
      seed: candidateSeed,
      topology: "square",
      firstClickSafe: true,
      generousOpening: true,
      questionMarks: true,
    };
    // Validate from the board's actual center opening, not a hard-coded corner.
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    if (boardIsLogical(board, config, cy * width + cx)) {
      return { board, seed: candidateSeed };
    }
    seedIndex++;
  }
  throw new Error("Unable to generate a No Guess board after the allowed attempts.");
}

function generateCandidate(width: number, height: number, mineCount: number, seed: string | number): Board {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const start = cy * width + cx;
  const excluded = [start, start - 1, start + 1, start - width, start + width];
  excluded.push(start - width - 1, start - width + 1, start + width - 1, start + width + 1);
  return generateBoard({
    width,
    height,
    mineCount,
    seed,
    topology: "square",
    excluded: excluded.filter((i) => i >= 0 && i < width * height),
  });
}

export { createRng };