/**
 * Settings: themes, accent, typography, sizing, motion, and feedback toggles.
 * Every option writes a setting and the document re-resolves tokens from it.
 */

import { Sheet, SegmentedControl, Switch, Slider, type SegmentedOption } from "../ui/primitives";
import {
  useSettings,
  resolvedAccent,
  rawThemes,
  type AccentPreference,
  type DensityPreference,
  type FontPreference,
  type MotionPreference,
  type ScalePreference,
  type ThemePreference,
} from "@/game/useSettingsStore";
import { playSound, haptic } from "@/game/sound";
import { MoonIcon, SunIcon } from "../ui/icons";
import type { ReactNode } from "react";

const THEME_LABELS: Record<string, string> = {
  paper: "Paper",
  mist: "Mist",
  sepia: "Sepia",
  slate: "Slate",
  midnight: "Midnight",
  ocean: "Ocean",
  grape: "Grape",
  contrast: "Contrast",
};

const ACCENTS: { value: AccentPreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "amber", label: "Amber" },
  { value: "pink", label: "Pink" },
  { value: "teal", label: "Teal" },
  { value: "gold", label: "Gold" },
];

const FONT_OPTIONS: readonly SegmentedOption<FontPreference>[] = [
  { label: "System", value: "system" },
  { label: "Public Sans", value: "public-sans" },
  { label: "Lexend", value: "lexend" },
];

const SCALE_OPTIONS: readonly SegmentedOption<ScalePreference>[] = [
  { label: "S", value: "compact", hint: "Compact" },
  { label: "M", value: "regular", hint: "Regular" },
  { label: "L", value: "large", hint: "Large" },
  { label: "XL", value: "x-large", hint: "Extra large" },
];

const DENSITY_OPTIONS: readonly SegmentedOption<DensityPreference>[] = [
  { label: "Compact", value: "compact" },
  { label: "Cozy", value: "cozy" },
  { label: "Roomy", value: "roomy" },
];

const MOTION_OPTIONS: readonly SegmentedOption<MotionPreference>[] = [
  { label: "System", value: "system" },
  { label: "Reduced", value: "reduced" },
  { label: "Full", value: "full" },
];

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const s = useSettings();
  const set = (patch: Parameters<typeof s.set>[0]) => {
    s.set(patch);
    playSound("click");
    haptic("tap");
  };

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <Section label="Theme">
        <div className="grid grid-cols-4 gap-2">
          <ThemeChip
            label={s.theme === "system" ? "Auto" : THEME_LABELS[s.theme]}
            selected={s.theme === "system"}
            onClick={() => set({ theme: "system" as ThemePreference })}
          />
          {rawThemes.map((theme) => (
            <ThemeChip
              key={theme}
              label={THEME_LABELS[theme]}
              selected={s.theme === theme}
              onClick={() => set({ theme })}
            />
          ))}
        </div>
      </Section>

      <Section label="Accent">
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              aria-pressed={s.accent === a.value}
              aria-label={`Accent ${a.label}`}
              onClick={() => set({ accent: a.value })}
              className={`press no-select flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
                s.accent === a.value ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              <span
                className={`size-3.5 rounded-full ${s.accent === a.value ? "ring-1 ring-line-strong" : ""}`}
                style={{ background: a.value === "auto" ? "var(--accent)" : `var(--accent-${a.value})` }}
              />
              {a.label}
            </button>
          ))}
        </div>
        {s.accent === "auto" && (
          <p className="mt-2 text-xs text-ink-muted">Auto follows the theme's accent ({resolvedAccent("auto")}).</p>
        )}
      </Section>

      <Section label="Typography">
        <SegmentedControl ariaLabel="Font" options={FONT_OPTIONS} value={s.font} onChange={(v) => set({ font: v })} className="w-full" />
      </Section>

      <Section label="Size">
        <div className="flex flex-col gap-2">
          <Row label="Cell size" hint="Adjust touch-target sizing">
            <SegmentedControl ariaLabel="Scale" options={SCALE_OPTIONS} value={s.scale} onChange={(v) => set({ scale: v })} />
          </Row>
          <Row label="Spacing" hint="Density of the layout">
            <SegmentedControl ariaLabel="Density" options={DENSITY_OPTIONS} value={s.density} onChange={(v) => set({ density: v })} />
          </Row>
        </div>
      </Section>

      <Section label="Motion">
        <SegmentedControl ariaLabel="Motion" options={MOTION_OPTIONS} value={s.motion} onChange={(v) => set({ motion: v })} className="w-full" />
      </Section>

      <Section label="Feedback">
        <Row label="Sound" hint="Key, flag, and result sounds">
          <Switch checked={s.sound} onChange={(v) => set({ sound: v })} label="Sound" />
        </Row>
        <Row label="Haptics" hint="Tap and press vibrations">
          <Switch checked={s.haptics} onChange={(v) => set({ haptics: v })} label="Haptics" />
        </Row>
        <Row label="Auto-pause" hint="Stop the clock when you leave the tab">
          <Switch checked={s.autoPause} onChange={(v) => set({ autoPause: v })} label="Auto-pause" />
        </Row>
        <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
          <div className="mb-1 flex items-baseline justify-between">
            <div>
              <div className="text-sm font-medium text-ink">Hold duration</div>
              <div className="text-2xs text-ink-muted">How long a press flags a cell</div>
            </div>
            <span className="tabular text-2xs font-semibold text-ink-soft">{s.longPressDelayMs} ms</span>
          </div>
          <Slider
            label="Hold duration"
            value={s.longPressDelayMs}
            min={200}
            max={900}
            step={20}
            onChange={(v) => set({ longPressDelayMs: v })}
          />
        </div>
      </Section>

      <Section label="About">
        <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
            <span className="flex gap-0.5">
              <MoonIcon size={16} />
              <SunIcon size={16} />
            </span>
          </span>
          <div className="min-w-0">
<div className="flex items-center gap-2 text-sm font-semibold text-ink">
            SweeperMine <MoonIcon size={13} className="text-ink-muted" />
          </div>
          <p className="text-xs text-ink-muted">Version 1.0.0 by Arun Neupane (Sajilo Digital). Every pixel and sound is local.</p>
          </div>
        </div>
      </Section>
    </Sheet>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      {children}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        {hint && <div className="text-2xs text-ink-muted">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function ThemeChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`press no-select flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2 ${
        selected ? "bg-surface-2 ring-1 ring-line-strong" : "hover:bg-surface-2/60"
      }`}
    >
      <span className="relative flex size-7 items-center justify-center overflow-hidden rounded-lg bg-[var(--canvas)] hairline">
        <span className="absolute inset-y-1 left-1 w-2 rounded-sm bg-[var(--accent)]" />
        <span className="absolute inset-y-1 right-1 w-2 rounded-sm bg-[var(--ink)] opacity-80" />
      </span>
      <span className={`text-2xs ${selected ? "font-semibold text-ink" : "text-ink-muted"}`}>{label}</span>
    </button>
  );
}