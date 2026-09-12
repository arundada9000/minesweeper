/**
 * Pure board mutations: reveal, flood fill, chording, flag cycling.
 * These functions mutate a Board's cells and return the indices that
 * changed (in order) so the UI can animate them; they never decide
 * phase, timer, or history. GameEngine owns the orchestration.
 */

import { getTopology, type GridTopologyId } from "./topology";
import type { Board, BoardConfig, CellState } from "./types";

export interface FloodResult {
  /** Cells that transitioned to revealed, in discovery order. */
  revealed: number[];
  /** Index of a mine revealed this move, if any. */
  explodedMine: number | null;
}

/**
 * Reveal a single cell. Mines are marked `exploded` so the UI can
 * distinguish the killer mine from its silent neighbors.
 */
export function revealCell(board: Board, index: number, seq: number): FloodResult {
  const cell = board.cells[index];
  const wasMine = cell.isMine;
  cell.state = wasMine ? "exploded" : "revealed";
  cell.revealedAt = seq;
  return { revealed: [index], explodedMine: wasMine ? index : null };
}

/**
 * Reveal from `index` and cascade through zero-regions (flood fill) using
 * the board topology. Handles being handed a mine directly (chording).
 */
export function floodReveal(board: Board, config: BoardConfig, index: number, seq: number): FloodResult {
  const start = board.cells[index];
  if (start.isMine) return revealCell(board, index, seq);

  const { width, height, topology } = config;
  const topo = getTopology(topology);
  const revealed: number[] = [];
  const queue: number[] = [index];
  let head = 0;

  while (head < queue.length) {
    const i = queue[head++];
    const cell = board.cells[i];
    if (cell.state === "revealed" || cell.state === "exploded") continue;
    cell.state = "revealed";
    cell.revealedAt = seq;
    revealed.push(i);
    if (cell.adjacentMineCount === 0) {
      for (const n of topo.neighbors(width, height, i)) {
        const neighbor = board.cells[n];
        if (neighbor.state === "hidden" || neighbor.state === "questioned") {
          queue.push(n);
        }
      }
    }
  }

  return { revealed, explodedMine: null };
}

/**
 * Compute the set of cells a chord on `index` would reveal, or null if a
 * chord is not permitted here (cell not revealed, number is zero, or the
 * flagged neighbor count does not match the number).
 */
export function chordTargets(board: Board, config: BoardConfig, index: number): number[] | null {
  const cell = board.cells[index];
  if (cell.state !== "revealed" || cell.adjacentMineCount === 0) return null;

  const { width, height, topology } = config;
  const neighbors = getTopology(topology).neighbors(width, height, index);

  let flags = 0;
  const targets: number[] = [];
  for (const n of neighbors) {
    const neighbor = board.cells[n];
    if (neighbor.state === "flagged") {
      flags++;
    } else if (neighbor.state === "hidden" || neighbor.state === "questioned") {
      targets.push(n);
    }
  }
  if (flags !== cell.adjacentMineCount) return null;
  return targets;
}

/**
 * Chord-reveal: simultaneously reveal (and cascade) every hidden neighbor
 * of a satisfied number. Returns null when the chord is not applicable
 * (flag count does not match), or the flood results when it fires.
 */
export function chordReveal(board: Board, config: BoardConfig, index: number, seq: number): FloodResult | null {
  const targets = chordTargets(board, config, index);
  if (!targets) return null;

  const revealed: number[] = [];
  let explodedMine: number | null = null;
  for (const n of targets) {
    const sub = floodReveal(board, config, n, seq);
    revealed.push(...sub.revealed);
    if (sub.explodedMine !== null) explodedMine = sub.explodedMine;
  }
  return { revealed, explodedMine };
}

/**
 * Advance a cell through the flag cycle. When question marks are disabled
 * the cycle is hidden -> flagged -> hidden.
 */
export function cycleFlag(board: Board, index: number, questionMarks: boolean): CellState {
  const cell = board.cells[index];
  switch (cell.state) {
    case "hidden":
      cell.state = "flagged";
      break;
    case "flagged":
      cell.state = questionMarks ? "questioned" : "hidden";
      break;
    case "questioned":
      cell.state = "hidden";
      break;
    default:
      return cell.state;
  }
  return cell.state;
}