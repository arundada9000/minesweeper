/**
 * Difficulty presets and custom-board validation, data-driven by mode.
 * Every board geometry and Rush countdown lives here, never in the UI.
 */

import type { ModeId } from "./types";

export type PresetId = "beginner" | "intermediate" | "expert" | "advanced" | "custom";

export interface ModePreset {
  readonly id: PresetId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly mineCount: number;
  /** Rush: the whole board must be cleared within this window. */
  readonly timeLimitMs?: number;
  /** Difficulty frames shown in pickers. */
  readonly hint: string;
}

export const CLASSIC_PRESETS: readonly ModePreset[] = [
  { id: "beginner", name: "Beginner", width: 9, height: 9, mineCount: 10, hint: "9 x 9, 10 mines" },
  { id: "intermediate", name: "Intermediate", width: 16, height: 16, mineCount: 40, hint: "16 x 16, 40 mines" },
  { id: "expert", name: "Expert", width: 30, height: 16, mineCount: 99, hint: "30 x 16, 99 mines" },
];

export const ZEN_PRESETS: readonly ModePreset[] = [...CLASSIC_PRESETS];

export const PRACTICE_PRESETS: readonly ModePreset[] = [...CLASSIC_PRESETS];

export const NO_GUESS_PRESETS: readonly ModePreset[] = [
  { id: "beginner", name: "Beginner", width: 9, height: 9, mineCount: 10, hint: "9 x 9, 10 mines" },
  { id: "advanced", name: "Advanced", width: 14, height: 14, mineCount: 30, hint: "14 x 14, 30 mines" },
];

export const RUSH_PRESETS: readonly ModePreset[] = [
  { id: "beginner", name: "Beginner", width: 9, height: 9, mineCount: 10, timeLimitMs: 60_000, hint: "9 x 9, 60 seconds" },
  { id: "intermediate", name: "Intermediate", width: 16, height: 16, mineCount: 40, timeLimitMs: 150_000, hint: "16 x 16, 2:30" },
  { id: "expert", name: "Expert", width: 30, height: 16, mineCount: 99, timeLimitMs: 300_000, hint: "30 x 16, 5:00" },
];

export const DAILY_PRESET: ModePreset = {
  id: "beginner",
  name: "Today",
  width: 9,
  height: 9,
  mineCount: 12,
  hint: "One board per day",
};

export const PRESETS_BY_MODE: Record<ModeId, readonly ModePreset[]> = {
  classic: CLASSIC_PRESETS,
  "no-guess": NO_GUESS_PRESETS,
  daily: [DAILY_PRESET],
  rush: RUSH_PRESETS,
  zen: ZEN_PRESETS,
  practice: PRACTICE_PRESETS,
};

export function getPreset(mode: ModeId, id: PresetId): ModePreset | null {
  return PRESETS_BY_MODE[mode]?.find((p) => p.id === id) ?? null;
}

export const CUSTOM_DEFAULTS: Readonly<CustomBoardSpec> = {
  width: 16,
  height: 16,
  mineCount: 40,
  firstClickSafe: true,
  questionMarks: true,
};

export interface CustomBoardSpec {
  width: number;
  height: number;
  mineCount: number;
  /** Classic: the first reveal must never land on a mine (game-logic §6). */
  firstClickSafe: boolean;
  /** Classic: the flag cycle may pass through a question-mark state. */
  questionMarks: boolean;
}

/** Clamp arbitrary custom values to the engine's supported range. */
export function clampCustom(spec: CustomBoardSpec): CustomBoardSpec {
  const width = Math.min(60, Math.max(5, Math.round(spec.width)));
  const height = Math.min(60, Math.max(5, Math.round(spec.height)));
  const maxMines = Math.floor(width * height * 0.85);
  return {
    width,
    height,
    mineCount: Math.min(maxMines, Math.max(1, Math.round(spec.mineCount))),
    firstClickSafe: spec.firstClickSafe !== false,
    questionMarks: spec.questionMarks !== false,
  };
}