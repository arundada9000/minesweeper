/**
 * Settings store: user-controllable experience, persisted to local storage.
 * Values are applied to <html> data-* attributes so the token system (CSS
 * variables) resolves them at runtime. Nothing here is hard-coded in the UI.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "paper" | "mist" | "sepia" | "slate" | "midnight" | "ocean" | "grape" | "contrast";
export type AccentPreference = "auto" | "blue" | "violet" | "red" | "green" | "amber" | "pink" | "teal" | "gold";
export type FontPreference = "system" | "public-sans" | "lexend";
export type DensityPreference = "compact" | "cozy" | "roomy";
export type ScalePreference = "compact" | "regular" | "large" | "x-large";
export type MotionPreference = "system" | "reduced" | "full";

export interface Settings {
  theme: ThemePreference;
  accent: AccentPreference;
  font: FontPreference;
  density: DensityPreference;
  scale: ScalePreference;
  motion: MotionPreference;
  sound: boolean;
  haptics: boolean;
  autoPause: boolean;
  longPressDelayMs: number;
}

export const defaultSettings: Settings = {
  theme: "system",
  accent: "auto",
  font: "system",
  density: "cozy",
  scale: "regular",
  motion: "system",
  sound: true,
  haptics: true,
  autoPause: true,
  longPressDelayMs: 420,
};

const THEME_ORDER = ["paper", "mist", "sepia", "slate", "midnight", "ocean", "grape", "contrast"] as const;
export type ThemeId = (typeof THEME_ORDER)[number];
export const rawThemes = THEME_ORDER;

export function systemTheme(): ThemeId {
  if (typeof window === "undefined") return "paper";
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return dark ? "slate" : "paper";
}

export function resolvedTheme(pref: ThemePreference): ThemeId {
  return pref === "system" ? systemTheme() : (pref as ThemeId);
}

export function resolvedAccent(pref: AccentPreference): AccentPreference {
  return pref === "auto" ? "blue" : pref;
}

interface SettingsState extends Settings {
  set: (patch: Partial<Settings>) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleMotion: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      set: (patch) => set(patch),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
      toggleMotion: () =>
        set((s) => ({ motion: s.motion === "full" ? "reduced" : s.motion === "reduced" ? "system" : "full" })),
    }),
    { name: "swm.settings.v1", version: 1 }
  )
);

/** Apply the active settings to the document root as data attributes. */
export function applySettingsToDocument(s: Settings): void {
  const root = document.documentElement;
  const theme = resolvedTheme(s.theme);
  const accent = resolvedAccent(s.accent);

  root.dataset.theme = theme;
  root.dataset.accent = accent;
  root.dataset.font = s.font;
  root.dataset.density = s.density;
  root.dataset.scale = s.scale;

  const colorScheme = theme === "paper" || theme === "mist" || theme === "sepia" ? "light" : "dark";
  root.style.colorScheme = colorScheme;
}

export function applyMotionMedia(s: Settings): void {
  const root = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reduce = s.motion === "reduced" || (s.motion === "system" && prefersReduced);
  if (reduce) root.dataset.motion = "reduced";
  else delete root.dataset.motion;
}