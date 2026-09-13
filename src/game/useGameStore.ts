/**
 * Game store: binds the headless GameEngine to React. Owns the active
 * engine instance, exposes derived counters for cheap re-rendering, and
 * persists unfinished runs for the Continue flow (game-logic section 34, 35).
 */

import { create } from "zustand";
import { GameEngine, randomSeed } from "@/engine";
import type { BoardConfig, ModeId } from "@/engine";
import { getMode } from "@/engine/modes";
import { getPreset, CLASSIC_PRESETS, CUSTOM_DEFAULTS, clampCustom, type ClassicPresetId, type CustomBoardSpec } from "@/engine/presets";

export const SAVE_KEY = "swm.run.v1";

export interface SavedRun {
  mode: ModeId;
  preset: ClassicPresetId;
  custom: CustomBoardSpec;
  savedAt: number;
  payload: unknown;
}

export function loadSavedRun(): SavedRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedRun;
    if (!parsed || !parsed.payload || !parsed.mode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedRun(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage unavailable; nothing to clear */
  }
}

function saveRun(engine: GameEngine, mode: ModeId, preset: ClassicPresetId, custom: CustomBoardSpec): void {
  if (typeof window === "undefined") return;
  const phase = engine.phase;
  if (phase === "won" || phase === "lost" || phase === "idle") {
    clearSavedRun();
    return;
  }
  try {
    const entry: SavedRun = {
      mode,
      preset,
      custom,
      savedAt: Date.now(),
      payload: engine.serialize(),
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(entry));
  } catch {
    /* storage full or locked; continue without persistence */
  }
}

export function buildConfig(mode: ModeId, preset: ClassicPresetId, custom: CustomBoardSpec): BoardConfig {
  const def = getMode(mode).defaults;
  const presetData = getPreset(preset);
  const width = preset === "custom" ? custom.width : presetData?.width ?? def.width;
  const height = preset === "custom" ? custom.height : presetData?.height ?? def.height;
  const mineCount = preset === "custom" ? custom.mineCount : presetData?.mineCount ?? def.mineCount;
  return {
    width,
    height,
    mineCount,
    seed: randomSeed(),
    topology: "square",
    firstClickSafe: true,
    generousOpening: true,
    questionMarks: true,
  };
}

interface GameStore {
  mode: ModeId;
  preset: ClassicPresetId;
  custom: CustomBoardSpec;
  cols: number;
  rows: number;
  engine: GameEngine;
  /** Bumped on every engine emission (timer, phase, counters). */
  clockVersion: number;
  /** Bumped only when the board's cells changed. */
  boardVersion: number;
  /** Indices disclosed by the last reveal/chord, for stagger animation. */
  lastReveal: readonly number[];
  hasSavedRun: boolean;

  newGame: (mode?: ModeId, preset?: ClassicPresetId, custom?: CustomBoardSpec) => void;
  restart: () => void;
  continueSaved: () => void;
  dismissSaved: () => void;
  reveal: (index: number) => void;
  chord: (index: number) => void;
  cycleFlag: (index: number) => void;
  unflag: (index: number) => void;
  undo: () => void;
  pause: () => void;
  resume: () => void;
  tick: (deltaMs: number) => void;
}

let prevSignature = "";

function signatureOf(engine: GameEngine): string {
  return `${engine.phase}|${engine.moves}|${engine.minesLeft}|${engine.revealedSafeCount}`;
}

export const useGame = create<GameStore>()((set, get) => {
  const sync = (engine: GameEngine, mode: ModeId, preset: ClassicPresetId, custom: CustomBoardSpec) => {
    const signature = signatureOf(engine);
    const cellsChanged = signature !== prevSignature;
    prevSignature = signature;

    const finished = engine.phase === "won" || engine.phase === "lost";
    if (finished) clearSavedRun();
    else if (engine.cells.length > 0) saveRun(engine, mode, preset, custom);

    set((s) => ({
      clockVersion: s.clockVersion + 1,
      boardVersion: cellsChanged ? s.boardVersion + 1 : s.boardVersion,
      hasSavedRun: finished ? false : get().hasSavedRun,
    }));
  };

  return {
    mode: "classic",
    preset: "beginner",
    custom: { ...CUSTOM_DEFAULTS },
    cols: buildConfig("classic", "beginner", CUSTOM_DEFAULTS).width,
    rows: buildConfig("classic", "beginner", CUSTOM_DEFAULTS).height,
    engine: new GameEngine(buildConfig("classic", "beginner", CUSTOM_DEFAULTS)),
    clockVersion: 0,
    boardVersion: 0,
    lastReveal: [],
    hasSavedRun: loadSavedRun() !== null,

    newGame: (mode = get().mode, preset = get().preset, custom = get().custom) => {
      clearSavedRun();
      const config = buildConfig(mode, preset, custom);
      const next = new GameEngine(config);
      prevSignature = signatureOf(next);
      set({
        engine: next,
        mode,
        preset,
        custom,
        cols: config.width,
        rows: config.height,
        clockVersion: 0,
        boardVersion: 0,
        lastReveal: [],
        hasSavedRun: false,
      });
    },

    restart: () => {
      const { engine, mode, preset, custom } = get();
      prevSignature = signatureOf(engine);
      engine.restart();
      set({ lastReveal: [], boardVersion: get().boardVersion + 1 });
    },

    continueSaved: () => {
      const saved = loadSavedRun();
      if (!saved) return;
      const config = buildConfig(saved.mode, saved.preset, saved.custom);
      const next = new GameEngine(config);
      prevSignature = signatureOf(next);
      next.hydrate(saved.payload);
      set({
        engine: next,
        mode: saved.mode,
        preset: saved.preset,
        custom: saved.custom,
        cols: config.width,
        rows: config.height,
        clockVersion: 0,
        boardVersion: 0,
        lastReveal: [],
        hasSavedRun: false,
      });
    },

    dismissSaved: () => {
      clearSavedRun();
      set({ hasSavedRun: false });
    },

    reveal: (index) => {
      const { engine, mode, preset, custom } = get();
      const result = engine.reveal(index);
      if (result) set({ lastReveal: result.revealed });
      sync(engine, mode, preset, custom);
    },

    chord: (index) => {
      const { engine, mode, preset, custom } = get();
      const result = engine.chord(index);
      if (result) set({ lastReveal: result.revealed });
      sync(engine, mode, preset, custom);
    },

    cycleFlag: (index) => {
      const { engine, mode, preset, custom } = get();
      engine.cycleFlag(index);
      sync(engine, mode, preset, custom);
    },

    unflag: (index) => {
      const { engine, mode, preset, custom } = get();
      engine.unflag(index);
      sync(engine, mode, preset, custom);
    },

    undo: () => {
      const { engine, mode, preset, custom } = get();
      if (engine.undo()) {
        set({ lastReveal: [] });
        sync(engine, mode, preset, custom);
      }
    },

    pause: () => {
      const { engine, mode, preset, custom } = get();
      engine.pause();
      sync(engine, mode, preset, custom);
    },

    resume: () => {
      const { engine, mode, preset, custom } = get();
      engine.resume();
      sync(engine, mode, preset, custom);
    },

    tick: (deltaMs) => {
      const { engine, mode, preset, custom } = get();
      engine.tick(deltaMs);
      sync(engine, mode, preset, custom);
    },
  };
});

export { CLASSIC_PRESETS };
export type { ClassicPresetId, CustomBoardSpec };