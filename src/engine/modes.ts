/**
 * Mode definitions: the declarative shape of every game style.
 * Each mode packages its board defaults and its play rules so the
 * UI and scoring read from one source of truth.
 */

import type { ModeDefinition, ModeId } from "./types";

const SHARED_DEFAULTS = {
  firstClickSafe: true,
  generousOpening: true,
  questionMarks: true,
} as const;

export const MODES: Record<ModeId, ModeDefinition> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "The original. Clear every safe cell before the clock runs long.",
    topology: "square",
    defaults: { ...SHARED_DEFAULTS, width: 9, height: 9, mineCount: 10 },
    timer: "count-up",
    score: "time",
    undoAllowed: false,
    hintsAllowed: true,
    flagsAllowed: true,
    questionAllowed: true,
    competitive: true,
    deterministic: false,
    winRule: "clear",
  },

  "no-guess": {
    id: "no-guess",
    name: "No Guess",
    description: "Every move is solvable by logic alone. Deduction over luck.",
    topology: "square",
    defaults: { ...SHARED_DEFAULTS, width: 9, height: 9, mineCount: 10 },
    timer: "count-up",
    score: "time",
    undoAllowed: true,
    hintsAllowed: true,
    flagsAllowed: true,
    questionAllowed: true,
    competitive: false,
    deterministic: false,
    winRule: "clear",
  },

  daily: {
    id: "daily",
    name: "Daily Puzzle",
    description: "One hand-crafted, solvable board per day. Everyone plays the same.",
    topology: "square",
    defaults: { ...SHARED_DEFAULTS, width: 9, height: 9, mineCount: 12 },
    timer: "count-up",
    score: "time",
    undoAllowed: false,
    hintsAllowed: false,
    flagsAllowed: true,
    questionAllowed: true,
    competitive: true,
    deterministic: true,
    winRule: "clear",
  },

  rush: {
    id: "rush",
    name: "Rush",
    description: "The clock is against you. Flag fast, think faster.",
    topology: "square",
    defaults: { ...SHARED_DEFAULTS, width: 9, height: 9, mineCount: 10 },
    timer: "count-down",
    score: "rush",
    undoAllowed: false,
    hintsAllowed: false,
    flagsAllowed: true,
    questionAllowed: false,
    competitive: true,
    deterministic: false,
    winRule: "clear",
  },

  zen: {
    id: "zen",
    name: "Zen",
    description: "No timer, no pressure. Undo is always available.",
    topology: "square",
    defaults: { ...SHARED_DEFAULTS, width: 9, height: 9, mineCount: 10 },
    timer: "none",
    score: "zen",
    undoAllowed: true,
    hintsAllowed: true,
    flagsAllowed: true,
    questionAllowed: true,
    competitive: false,
    deterministic: false,
    winRule: "clear",
  },

  practice: {
    id: "practice",
    name: "Practice",
    description: "Every mine and every number stays in sight. Learn by playing.",
    topology: "square",
    defaults: { ...SHARED_DEFAULTS, width: 9, height: 9, mineCount: 10 },
    timer: "none",
    score: "zen",
    undoAllowed: true,
    hintsAllowed: true,
    flagsAllowed: true,
    questionAllowed: true,
    competitive: false,
    deterministic: false,
    winRule: "clear",
    train: true,
  },
};

export function getMode(id: ModeId): ModeDefinition {
  const mode = MODES[id];
  if (!mode) throw new Error(`Unknown mode: ${id}`);
  return mode;
}

export const MODE_LIST: readonly ModeDefinition[] = [
  MODES.classic,
  MODES["no-guess"],
  MODES.daily,
  MODES.rush,
  MODES.zen,
  MODES.practice,
];