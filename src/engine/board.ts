/**
 * Board generation: deterministic mine placement, first-click safety,
 * generous openings, and config validation.
 */

import { createRng, shuffle, type Seed } from "./rng";
import { getTopology, type GridTopologyId } from "./topology";
import type { Board, Cell, CellState, BoardConfig } from "./types";

/** Safe, explainable error for impossible configurations. */
export class BoardConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BoardConfigError";
  }
}

export const MIN_DIMENSION = 5;
export const MAX_DIMENSION = 60;
export const MAX_CELLS = 1600;
/** Lower bound ensuring at least one safe cell can be revealed. */
export const MAX_MINE_RATIO = 0.85;

export interface GenerateOptions {
  width: number;
  height: number;
  mineCount: number;
  seed: Seed;
  topology: GridTopologyId;
  /** Cell indices that must not contain mines (first-click safety). */
  excluded: readonly number[];
}

export function validateDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new BoardConfigError("Board dimensions must be integers.");
  }
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    throw new BoardConfigError(
      `Board is too small. Minimum size is ${MIN_DIMENSION} x ${MIN_DIMENSION}.`
    );
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new BoardConfigError(
      `Board is too large. Maximum size is ${MAX_DIMENSION} x ${MAX_DIMENSION}.`
    );
  }
  if (width * height > MAX_CELLS) {
    throw new BoardConfigError(`A board may not exceed ${MAX_CELLS} cells.`);
  }
}

export function validateMineCount(mineCount: number, totalCells: number): void {
  const maxMines = Math.floor(totalCells * MAX_MINE_RATIO);
  if (!Number.isInteger(mineCount) || mineCount <= 0) {
    throw new BoardConfigError("Mine count must be a positive integer.");
  }
  if (mineCount > maxMines) {
    throw new BoardConfigError(
      `Too many mines. A board of ${totalCells} cells supports at most ${maxMines}.`
    );
  }
}

function createCell(index: number, isMine: boolean): Cell {
  return {
    index,
    isMine,
    adjacentMineCount: 0,
    state: "hidden",
    revealedAt: 0,
    wrongFlag: false,
  };
}

/** Validation used before any interaction starts. */
export function validateConfig(config: BoardConfig): void {
  validateDimensions(config.width, config.height);
  validateMineCount(config.mineCount, config.width * config.height);
}

/**
 * Neighbor cells of `index` on this board, from the topology.
 * Kept as a function so the engine never hand-rolls neighbors.
 */
export function neighborCells(
  width: number,
  height: number,
  topologyId: GridTopologyId,
  index: number
): readonly number[] {
  return getTopology(topologyId).neighbors(width, height, index);
}

/**
 * Generate a deterministic board.
 *
 * Mines are placed among indices not in `excluded` so a first click can be
 * guaranteed safe. When the excluded set is the full 3x3 neighborhood of the
 * first click, we also get a natural opening without deliberately terrible
 * starts.
 */
export function generateBoard(opts: GenerateOptions): Board {
  const { width, height, mineCount, seed, topology } = opts;

  validateDimensions(width, height);

  const totalCells = width * height;
  validateMineCount(mineCount, totalCells);

  const excluded = new Set(opts.excluded);
  if (excluded.size >= totalCells - mineCount) {
    throw new BoardConfigError(
      "The first-click exclusion leaves no room for the requested mine count."
    );
  }

  const candidates: number[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (!excluded.has(i)) candidates.push(i);
  }

  const rng = createRng(seed);
  const mineIndices = new Set(shuffle(candidates.slice(), rng).slice(0, mineCount));

  const cells: Cell[] = Array.from({ length: totalCells }, (_, i) => createCell(i, mineIndices.has(i)));

  // Adjacency counts via the topology; capped at 8 so no cell reads 9.
  for (let i = 0; i < totalCells; i++) {
    if (cells[i].isMine) continue;
    let count = 0;
    const neighbors = neighborCells(width, height, topology, i);
    for (const n of neighbors) {
      if (cells[n].isMine) count++;
    }
    cells[i] = { ...cells[i], adjacentMineCount: count };
  }

  return {
    width,
    height,
    mineCount,
    safeCount: totalCells - mineCount,
    cells,
    generatedFor: opts.excluded.length > 0 ? opts.excluded[0] : null,
  };
}

/** Restore a serialized board (used by undo and continue-game). */
export function deserializeBoard(data: unknown): Board {
  const parsed = data as { width: number; height: number; mineCount: number; safeCount: number; cells: Cell[] };
  if (
    !parsed ||
    typeof parsed.width !== "number" ||
    typeof parsed.height !== "number" ||
    typeof parsed.mineCount !== "number" ||
    typeof parsed.safeCount !== "number" ||
    !Array.isArray(parsed.cells)
  ) {
    throw new BoardConfigError("Saved board data is corrupt.");
  }
  if (parsed.cells.length !== parsed.width * parsed.height) {
    throw new BoardConfigError("Saved board dimensions do not match its cells.");
  }
  return parsed as Board;
}