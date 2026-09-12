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

export type ModeId = "classic" | "no-guess" | "daily" | "rush" | "zen";

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
}