/**
 * GameEngine: authoritative game state machine.
 *
 * Owns phase, timer, move history (undo), and win/loss resolution. Everything
 * mutates data in place and emits change notifications; rendering frameworks
 * subscribe and read state directly. All board math stays deterministic.
 */

import { generateBoard, validateConfig, deserializeBoard, neighborCells, BoardConfigError } from "./board";
import { chordReveal, chordTargets, floodReveal, cycleFlag, type FloodResult } from "./actions";
import { boardIsLogical, generateNoGuessBoard } from "./solver";
import { createRng } from "./rng";
import type { Board, BoardConfig, GamePhase } from "./types";

export interface RevealResult {
  /** Cells revealed this move, in order. */
  revealed: number[];
  /** True when this reveal generated the board (first click). */
  firstReveal: boolean;
  /** Mine index triggered by this move, or null. */
  explodedMine: number | null;
  /** Phase after the move. */
  phase: GamePhase;
  /** True if this move was a successful chord. */
  chord: boolean;
}

export interface EngineState {
  phase: GamePhase;
  elapsedMs: number;
  moves: number;
  revealedSafeCount: number;
  /** Number of times a flag has been placed this run (prevents undo-cheating
   *  for No-Flagger-style outcomes). */
  flagsPlaced: number;
  autoPaused: boolean;
  reason: string | null;
}

interface HistoryEntry {
  board: Board;
  phase: GamePhase;
  elapsedMs: number;
  moves: number;
  revealedSafeCount: number;
  flagsPlaced: number;
}

const AUTO_PAUSE_REASON = "You paused because the window lost focus.";

export class GameEngine {
  readonly config: BoardConfig;
  private state: EngineState;
  private board: Board | null = null;
  private snapshot: HistoryEntry[] = [];
  private listeners = new Set<() => void>();
  private seq = 0;

  constructor(config: BoardConfig) {
    validateConfig(config);
    this.config = config;
    this.state = {
      phase: "ready",
      elapsedMs: 0,
      moves: 0,
      revealedSafeCount: 0,
      flagsPlaced: 0,
      autoPaused: false,
      reason: null,
    };
  }

  /* ---------------------------------- state ---------------------------------- */

  get phase(): GamePhase {
    return this.state.phase;
  }

  get cells(): Board["cells"] {
    return this.board ? this.board.cells : [];
  }

  get elapsedMs(): number {
    return this.state.elapsedMs;
  }

  get minesLeft(): number {
    return this.board ? this.config.mineCount - this.countState("flagged") : this.config.mineCount;
  }

  get revealedSafeCount(): number {
    return this.state.revealedSafeCount;
  }

  get moves(): number {
    return this.state.moves;
  }

  get flagsPlaced(): number {
    return this.state.flagsPlaced;
  }

  /** Countdown budget for Rush; null when the mode is untimed. */
  get timeLimitMs(): number | null {
    return this.config.timeLimitMs ?? null;
  }

  isFlagged(index: number): boolean {
    return this.board?.cells[index]?.state === "flagged";
  }

  /** True when undo is currently allowed by the mode and the running game. */
  get canUndo(): boolean {
    return this.state.phase === "playing";
  }

  get isPaused(): boolean {
    return this.state.phase === "paused";
  }

  get isFinished(): boolean {
    return this.state.phase === "won" || this.state.phase === "lost";
  }

  get autoPaused(): boolean {
    return this.state.autoPaused;
  }

  get reason(): string | null {
    return this.state.reason;
  }

  /* ---------------------------------- events --------------------------------- */

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  /* ---------------------------------- actions -------------------------------- */

  /**
   * Reveal a cell. The first reveal generates the board (respecting
   * first-click safety and the generous-opening neighborhood).
   */
  reveal(index: number): RevealResult | null {
    if (this.phase !== "ready" && this.phase !== "playing") return null;

    const firstReveal = this.phase === "ready" && this.board === null;
    if (!firstReveal) {
      const cell = this.board?.cells[index];
      if (!cell || cell.state === "flagged" || cell.state === "exploded") return null;
      if (cell.state === "revealed") return { revealed: [], firstReveal: false, explodedMine: null, phase: this.phase, chord: false };
    }

    let explode: number | null = null;
    let revealed: number[] = [];

    if (firstReveal) this.generateBoardAt(index);
    this.pushSnapshot();

    const result = floodReveal(this.board!, this.config, index, ++this.seq);
    revealed = result.revealed;
    explode = result.explodedMine;

    if (this.phase === "ready") this.setState({ phase: "playing" });
    if (result.explodedMine !== null) this.lose(result.explodedMine);
    else this.checkWin();
    this.setState({ moves: this.state.moves + 1 });

    this.emit();
    return { revealed, firstReveal, explodedMine: explode, phase: this.phase, chord: false };
  }

  /**
   * Chord reveal on an already-revealed number cell. Returns null when the
   * chord precondition (flagged neighbors == number) is not met.
   */
  chord(index: number): RevealResult | null {
    if (this.phase !== "playing") return null;
    const cell = this.board?.cells[index];
    if (!cell || cell.state !== "revealed" || cell.adjacentMineCount === 0) return null;
    if (!chordTargets(this.board!, this.config, index)) return null;

    this.pushSnapshot();
    const result = chordReveal(this.board!, this.config, index, ++this.seq)!;
    const explode = result.explodedMine;

    if (explode !== null) this.lose(explode);
    else this.checkWin();
    this.setState({ moves: this.state.moves + 1 });

    this.emit();
    return {
      revealed: result.revealed,
      firstReveal: false,
      explodedMine: explode,
      phase: this.phase,
      chord: true,
    };
  }

  /** Cycle a hidden cell through the flag states. */
  cycleFlag(index: number): void {
    if (this.phase !== "playing") return;
    const cell = this.board?.cells[index];
    if (!cell || cell.state === "revealed" || cell.state === "exploded") return;

    this.pushSnapshot();
    cycleFlag(this.board!, index, this.config.questionMarks);
    if (this.board!.cells[index].state === "flagged") {
      this.setState({ flagsPlaced: this.state.flagsPlaced + 1 });
    }
    this.setState({ moves: this.state.moves + 1 });
    this.emit();
  }

  /** Remove the flag from a flagged cell (touch: tap a flag to take it off). */
  unflag(index: number): void {
    if (this.phase !== "playing") return;
    const cell = this.board?.cells[index];
    if (!cell || cell.state !== "flagged") return;

    this.pushSnapshot();
    cell.state = "hidden";
    this.setState({ moves: this.state.moves + 1 });
    this.emit();
  }

  /** Undo the last action (reveal, chord, or flag). */
  undo(): boolean {
    if (this.phase !== "playing" || this.snapshot.length === 0) return false;
    const prev = this.snapshot.pop()!;
    this.board = prev.board;
    this.state = {
      ...this.state,
      phase: prev.phase,
      elapsedMs: prev.elapsedMs,
      moves: prev.moves,
      revealedSafeCount: prev.revealedSafeCount,
      flagsPlaced: prev.flagsPlaced,
    };
    this.emit();
    return true;
  }

  /** Start a fresh run of the same configuration (same layout via same seed). */
  restart(): void {
    this.board = null;
    this.snapshot = [];
    this.seq = 0;
    this.state = {
      phase: "ready",
      elapsedMs: 0,
      moves: 0,
      revealedSafeCount: 0,
      flagsPlaced: 0,
      autoPaused: false,
      reason: null,
    };
    this.emit();
  }

  /** Replace the configuration and reset the run. */
  setConfig(config: BoardConfig): void {
    validateConfig(config);
    (this as { config: BoardConfig }).config = config;
    this.restart();
  }

  /** Pause while playing. Auto-pause (e.g. tab loses focus) sets a reason. */
  pause(auto = false): void {
    if (this.phase !== "playing") return;
    this.setState({ phase: "paused", autoPaused: auto, reason: auto ? AUTO_PAUSE_REASON : null });
    this.emit();
  }

  resume(): void {
    if (this.phase !== "paused") return;
    this.setState({ phase: "playing", autoPaused: false, reason: null });
    this.emit();
  }

  /** Advance the running clock while the game is actively playing. */
  tick(deltaMs: number): void {
    if (this.phase !== "playing") return;
    this.state.elapsedMs += deltaMs;
    const limit = this.config.timeLimitMs;
    if (limit !== undefined && this.state.elapsedMs >= limit) {
      this.state.elapsedMs = limit;
      this.lose(null);
      this.setState({ reason: "Time's up." });
    }
    this.emit();
  }

  /* ----------------------------- serialization ---------------------------- */

  /** Serialize for "continue game" persistence. */
  serialize(): unknown {
    return {
      config: this.config,
      phase: this.phase,
      elapsedMs: this.state.elapsedMs,
      moves: this.state.moves,
      revealedSafeCount: this.state.revealedSafeCount,
      flagsPlaced: this.state.flagsPlaced,
      seq: this.seq,
      board: this.board ? { cells: this.board.cells, width: this.board.width, height: this.board.height, mineCount: this.board.mineCount, safeCount: this.board.safeCount, generatedFor: this.board.generatedFor } : null,
    };
  }

  /** Restore a run produced by serialize(). */
  hydrate(data: unknown): void {
    const parsed = data as {
      config: BoardConfig;
      phase: GamePhase;
      elapsedMs: number;
      moves: number;
      revealedSafeCount: number;
      flagsPlaced?: number;
      seq: number;
      board: unknown;
    };
    validateConfig(parsed.config);
    this.setConfigLocal(parsed.config);

    const board = parsed.board ? deserializeBoard(parsed.board) : null;
    this.board = board;
    this.seq = parsed.seq ?? 0;
    this.snapshot = [];
    this.state = {
      phase: parsed.phase,
      elapsedMs: parsed.elapsedMs ?? 0,
      moves: parsed.moves ?? 0,
      revealedSafeCount: parsed.revealedSafeCount ?? 0,
      flagsPlaced: parsed.flagsPlaced ?? 0,
      autoPaused: false,
      reason: parsed.phase === "paused" ? "Paused" : null,
    };
    this.emit();
  }

  /* --------------------------------- internals ------------------------------ */

  private setConfigLocal(config: BoardConfig): void {
    // Like setConfig but without validate spam or emitting.
    (this as { config: BoardConfig }).config = config;
    this.board = null;
  }

  private generateBoardAt(firstIndex: number): void {
    // Fixed opening (Daily): one deterministic layout per seed, identical for
    // every player regardless of which cell they open with.
    if ((this.config.openAt ?? "click") === "center") {
      this.board = this.generateFixedBoard();
      return;
    }

    const excluded: number[] = [firstIndex];
    if (this.config.generousOpening) {
      for (const n of neighborCells(this.config.width, this.config.height, this.config.topology, firstIndex)) {
        excluded.push(n);
      }
    }

    // No Guess: keep generating candidate boards until the solver confirms the
    // run can be cleared by logic alone from the player's actual first click.
    if (this.config.noGuess) {
      this.board = this.generateLogicalBoard(excluded, firstIndex);
      return;
    }

    try {
      this.board = generateBoard(this.generateOptions(excluded));
    } catch (err) {
      if (!(err instanceof BoardConfigError) || !this.config.generousOpening) throw err;
      // Rare: a near-capacity board where the opening excludes all candidates.
      // Fall back to first-click-only safety so the game is still playable.
      this.board = generateBoard(this.generateOptions([firstIndex]));
    }
  }

  /** Daily: a deterministic, logically solvable board anchored at the center. */
  private generateFixedBoard(): Board {
    const { width, height, mineCount } = this.config;
    const result = generateNoGuessBoard({
      width,
      height,
      mineCount,
      seed: this.config.seed,
      maxAttempts: 80,
    });
    return result.board;
  }

  /** No Guess: retry candidate boards (same seed family) until solvable. */
  private generateLogicalBoard(excluded: readonly number[], startIndex: number): Board {
    const rng = createRng(this.config.seed);
    let last: Board | null = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const seed = attempt === 0 ? this.config.seed : (rng() * 0xffffffff) >>> 0;
      const candidate = generateBoard({
        width: this.config.width,
        height: this.config.height,
        mineCount: this.config.mineCount,
        seed,
        topology: this.config.topology,
        excluded,
      });
      last = candidate;
      if (boardIsLogical(candidate, this.config, startIndex)) return candidate;
    }
    // Extremely rare: hand back the last safe board rather than crash.
    return last!;
  }

  private generateOptions(excluded: readonly number[]): {
    width: number;
    height: number;
    mineCount: number;
    seed: BoardConfig["seed"];
    topology: BoardConfig["topology"];
    excluded: readonly number[];
  } {
    return {
      width: this.config.width,
      height: this.config.height,
      mineCount: this.config.mineCount,
      seed: this.config.seed,
      topology: this.config.topology,
      excluded,
    };
  }

  private pushSnapshot(): void {
    if (!this.board || this.snapshot.length >= 256) {
      if (this.snapshot.length >= 256) this.snapshot.shift();
    }
    this.snapshot.push({
      board: cloneBoard(this.board!),
      phase: this.phase,
      elapsedMs: this.state.elapsedMs,
      moves: this.state.moves,
      revealedSafeCount: this.state.revealedSafeCount,
      flagsPlaced: this.state.flagsPlaced,
    });
  }

  private lose(explodedMine: number | null): void {
    if (!this.board) return;
    for (const cell of this.board.cells) {
      if (cell.state === "flagged" && !cell.isMine) {
        cell.wrongFlag = true;
      }
      if (cell.isMine && cell.state !== "exploded") {
        cell.state = "revealed";
      }
    }
    this.setState({ phase: "lost" });
  }

  private win(): void {
    if (!this.board) return;
    for (const cell of this.board.cells) {
      if (cell.isMine) cell.state = "flagged";
    }
    this.setState({ phase: "won" });
  }

  private checkWin(): void {
    if (!this.board) return;
    const safeCount = this.board.safeCount;
    let revealed = 0;
    for (const cell of this.board.cells) {
      if (!cell.isMine && cell.state === "revealed") revealed++;
    }
    this.state.revealedSafeCount = revealed;
    if (revealed === safeCount) this.win();
  }

  private countState(state: string): number {
    if (!this.board) return 0;
    let count = 0;
    for (const cell of this.board.cells) {
      if (cell.state === state) count++;
    }
    return count;
  }

  private setState(patch: Partial<EngineState>): void {
    this.state = { ...this.state, ...patch };
  }
}

function cloneBoard(board: Board): Board {
  return {
    ...board,
    cells: board.cells.map((cell) => ({ ...cell })),
  };
}

export { BoardConfigError } from "./board";
export type { Board, BoardConfig } from "./types";