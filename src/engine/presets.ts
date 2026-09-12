/**
 * Difficulty presets and custom-board validation for Classic mode.
 * Values live here so the UI never hard-codes board sizes.
 */

export type ClassicPresetId = "beginner" | "intermediate" | "expert" | "custom";

export interface ClassicPreset {
  readonly id: ClassicPresetId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly mineCount: number;
}

export const CLASSIC_PRESETS: readonly ClassicPreset[] = [
  { id: "beginner", name: "Beginner", width: 9, height: 9, mineCount: 10 },
  { id: "intermediate", name: "Intermediate", width: 16, height: 16, mineCount: 40 },
  { id: "expert", name: "Expert", width: 30, height: 16, mineCount: 99 },
];

export const CUSTOM_DEFAULTS: Readonly<Omit<ClassicPreset, "id" | "name">> = {
  width: 16,
  height: 16,
  mineCount: 40,
};

export function getPreset(id: ClassicPresetId): ClassicPreset | null {
  return CLASSIC_PRESETS.find((p) => p.id === id) ?? null;
}

export interface CustomBoardSpec {
  width: number;
  height: number;
  mineCount: number;
}

/** Clamp arbitrary custom values to the engine's supported range. */
export function clampCustom(spec: CustomBoardSpec): CustomBoardSpec {
  const width = Math.min(60, Math.max(5, Math.round(spec.width)));
  const height = Math.min(60, Math.max(5, Math.round(spec.height)));
  const maxMines = Math.floor((width * height) * 0.85);
  return {
    width,
    height,
    mineCount: Math.min(maxMines, Math.max(1, Math.round(spec.mineCount))),
  };
}