/**
 * Core engine types. Shared by the engine, the solver, and the UI glue,
 * but never owned by the UI.
 */

import type { GridTopologyId } from "./topology";
import type { Seed } from "./rng";

export type { Seed } from "./rng";

export type CellState = "hidden" | "revealed" | "flagged" | "questioned" | "exploded";

/**
 * Lifecycle of a single run:
 *   Ready -> Playing -> Won / Lost, with Playing <-> Paused.
 * `idle` is the pre-config state; `ready` is a configured, unplayed board.
 */
export type GamePhase = "idle" | "ready" | "playing" | "paused" | "won" | "lost";

export interface Cell {
  readonly index: number;
  readonly isMine: boolean;
  readonly adjacentMineCount: number;
  state: CellState;
  /** Move sequence number at which this cell was revealed (0 = never). */
  revealedAt: number;
  /** Set on loss: this cell carries a flag but is not a mine. */
  wrongFlag: boolean;
}

export interface BoardConfig {
  width: number;
  height: number;
  mineCount: number;
  seed: Seed;
  topology: GridTopologyId;
  /** First reveal must never be a mine. */
  firstClickSafe: boolean;
  /** Exclude the first click neighborhood from mines for a useful opening. */
  generousOpening: boolean;
  /** Whether the question-mark state participates in the flag cycle. */
  questionMarks: boolean;
  /**
   * Generate a logically solvable board (No Guess / Daily). The board is
   * retried until the solver confirms it can be cleared without guessing.
   */
  noGuess?: boolean;
  /**
   * Where the guaranteed opening is anchored when the board is generated:
   *  - "click": around the actual first click (default, first-click safety)
   *  - "center": around a fixed center cell, so a fixed seed yields the exact
   *    same layout regardless of which cell the player clicks first (Daily).
   */
  openAt?: "click" | "center";
  /** Optional countdown: when elapsed reaches this, the run ends in a loss. */
  timeLimitMs?: number;
}

export interface Board {
  width: number;
  height: number;
  mineCount: number;
  safeCount: number;
  cells: Cell[];
  /** Index the board was generated around, or null for a fixed seed board. */
  generatedFor: number | null;
}

export interface BoardConfigDefaults {
  width: number;
  height: number;
  mineCount: number;
  firstClickSafe: boolean;
  generousOpening: boolean;
  questionMarks: boolean;
}

export type ModeId = "classic" | "no-guess" | "daily" | "rush" | "zen" | "practice";

export interface ModeDefinition {
  readonly id: ModeId;
  readonly name: string;
  readonly description: string;
  readonly topology: GridTopologyId;
  readonly defaults: BoardConfigDefaults;
  readonly timer: "count-up" | "count-down" | "none";
  readonly score: "none" | "time" | "rush" | "zen";
  readonly undoAllowed: boolean;
  readonly hintsAllowed: boolean;
  readonly flagsAllowed: boolean;
  readonly questionAllowed: boolean;
  readonly competitive: boolean;
  readonly deterministic: boolean;
  readonly winRule: "clear" | "rush";
  /** Learning mode: mines and adjacency counts are shown on hidden cells. */
  readonly train?: boolean;
}