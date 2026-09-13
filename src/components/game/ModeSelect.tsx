/**
 * New game picker: mode list with per-mode difficulty panels.
 * Boards, difficulties, and countdowns come from engine presets; the daily
 * puzzle is generated from the player's local calendar date.
 */

import { useMemo, useState } from "react";
import { Sheet, SegmentedControl, Button, type SegmentedOption } from "../ui/primitives";
import { GridIcon, SparkleIcon, CalendarIcon, ZapIcon, LeafIcon } from "../ui/icons";
import { PRESETS_BY_MODE, CUSTOM_DEFAULTS, clampCustom, type PresetId, type CustomBoardSpec } from "@/engine/presets";
import { MODE_LIST } from "@/engine/modes";
import type { ModeId } from "@/engine/types";
import { dateStamp } from "@/game/useGameStore";
import { playSound, haptic } from "@/game/sound";

const MODE_ICONS = {
  classic: GridIcon,
  "no-guess": SparkleIcon,
  daily: CalendarIcon,
  rush: ZapIcon,
  zen: LeafIcon,
} as const;

interface ModeSelectProps {
  open: boolean;
  onClose: () => void;
  onStart: (mode: ModeId, preset: PresetId, custom: CustomBoardSpec) => void;
}

function presetHint(mode: ModeId): string {
  if (mode === "rush") return "Set your pace";
  if (mode === "daily") return `Today, ${dateStamp()}`;
  if (mode === "zen") return "No timer, undo always on";
  return "Set your challenge";
}

export function ModeSelect({ open, onClose, onStart }: ModeSelectProps) {
  const [modeId, setModeId] = useState<ModeId>("classic");
  const [preset, setPreset] = useState<PresetId>("beginner");
  const [custom, setCustom] = useState<CustomBoardSpec>({ ...CUSTOM_DEFAULTS });

  const presets = PRESETS_BY_MODE[modeId];
  const allowCustom = modeId === "classic";

  const options = useMemo<readonly SegmentedOption<PresetId>[]>(() => {
    const list = presets.map((p) => ({
      label: p.name,
      value: p.id,
      hint:
        modeId === "rush"
          ? `${p.width} x ${p.height} / ${Math.round((p.timeLimitMs ?? 0) / 1000)}s`
          : `${p.width} x ${p.height}, ${p.mineCount} mines`,
    }));
    if (allowCustom) list.push({ label: "Custom", value: "custom", hint: "Set your own board" });
    return list;
  }, [presets, allowCustom, modeId]);

  const currentPreset = preset === "custom" ? null : presets.find((p) => p.id === preset) ?? null;

  const selectMode = (id: ModeId) => {
    if (id === modeId) return;
    playSound("click");
    setModeId(id);
    setPreset(PRESETS_BY_MODE[id][0]?.id ?? "beginner");
  };

  const start = () => {
    playSound("confirm");
    haptic("tap");
    onStart(modeId, preset, preset === "custom" ? clampCustom(custom) : custom);
  };

  const setDim = (key: "width" | "height", v: number) => {
    setCustom((prev) => clampCustom({ ...prev, [key]: v }));
  };

  const startLabel =
    modeId === "daily" ? "Start today's board" : modeId === "rush" ? "Start the clock" : "Start board";
  const StartIcon = MODE_ICONS[modeId];

  return (
    <Sheet open={open} onClose={onClose} title="New game">
      <div className="mb-4 flex flex-col gap-2">
        {MODE_LIST.map((m) => {
          const Icon = MODE_ICONS[m.id];
          const active = m.id === modeId;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectMode(m.id)}
              className={`press no-select flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                active ? "bg-accent-soft" : "bg-surface-2 hover:bg-surface-hover"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  active ? "bg-accent text-on-accent" : "bg-accent-soft text-accent-strong"
                }`}
              >
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-md font-semibold text-ink">{m.name}</span>
                <span className="block truncate text-xs text-ink-muted">{m.description}</span>
              </span>
              <span className="shrink-0 rounded-full bg-ink-soft/10 px-2 py-0.5 text-2xs font-medium text-ink-soft">
                {modeHint(m.id)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-wide text-ink-muted">{presetHint(modeId)}</span>
          {currentPreset && (
            <span className="text-xs tabular text-ink-muted">
              {modeId === "rush"
                ? `${currentPreset.width} x ${currentPreset.height} / ${Math.round((currentPreset.timeLimitMs ?? 0) / 1000)}s`
                : `${currentPreset.width} x ${currentPreset.height} / ${currentPreset.mineCount}`}
            </span>
          )}
        </div>
        <SegmentedControl<PresetId>
          ariaLabel="Difficulty"
          options={options}
          value={preset}
          onChange={(v) => {
            setPreset(v);
            playSound("click");
          }}
        />
      </div>

      {preset === "custom" && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Stepper label="Width" value={custom.width} min={5} max={40} step={1} onChange={(v) => setDim("width", v)} />
          <Stepper label="Height" value={custom.height} min={5} max={40} step={1} onChange={(v) => setDim("height", v)} />
          <Stepper
            label="Mines"
            value={custom.mineCount}
            min={1}
            max={Math.floor(custom.width * custom.height * 0.85)}
            step={1}
            onChange={(v) => setCustom((prev) => clampCustom({ ...prev, mineCount: v }))}
          />
        </div>
      )}

      <Button className="w-full" onClick={start}>
        <StartIcon size={18} />
        {startLabel}
      </Button>
    </Sheet>
  );
}

function modeHint(id: ModeId): string {
  switch (id) {
    case "no-guess":
      return "0 luck";
    case "daily":
      return "Daily";
    case "rush":
      return "Timed";
    case "zen":
      return "Relaxed";
    default:
      return "Original";
  }
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-3 text-center">
      <div className="text-2xs font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="my-2 font-mono text-lg font-bold tabular text-ink">{value}</div>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className="press no-select flex size-7 items-center justify-center rounded-full bg-elevated text-ink-soft shadow-ios hover:text-ink"
        >
          -
        </button>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className="press no-select flex size-7 items-center justify-center rounded-full bg-elevated text-ink-soft shadow-ios hover:text-ink"
        >
          +
        </button>
      </div>
    </div>
  );
}