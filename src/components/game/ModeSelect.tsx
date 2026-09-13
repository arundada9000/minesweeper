/**
 * New game picker: mode list and, for Classic, difficulty + custom sizing.
 * Boards and difficulty values come from the engine presets, never the UI.
 */

import { useMemo, useState } from "react";
import { Sheet, SegmentedControl, Button, type SegmentedOption } from "../ui/primitives";
import { GridIcon, SparkleIcon, CalendarIcon, ZapIcon, LeafIcon, ClockIcon } from "../ui/icons";
import { CLASSIC_PRESETS, clampCustom, getPreset, type ClassicPresetId, type CustomBoardSpec } from "@/engine/presets";
import { MODE_LIST } from "@/engine/modes";
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
  onStart: (preset: ClassicPresetId, custom: CustomBoardSpec) => void;
}

export function ModeSelect({ open, onClose, onStart }: ModeSelectProps) {
  const [preset, setPreset] = useState<ClassicPresetId>("beginner");
  const [custom, setCustom] = useState<CustomBoardSpec>({ width: 16, height: 16, mineCount: 40 });

  const classicOptions = useMemo<readonly SegmentedOption<ClassicPresetId>[]>(
    () =>
      CLASSIC_PRESETS.map((p) => ({
        label: p.name,
        value: p.id,
        hint: `${p.width} x ${p.height}, ${p.mineCount} mines`,
      })).concat({ label: "Custom", value: "custom", hint: "Set your own board" })
    ,
    []
  );

  const currentPreset = preset === "custom" ? null : getPreset(preset);

  const start = () => {
    playSound("confirm");
    haptic("tap");
    onStart(preset, preset === "custom" ? clampCustom(custom) : custom);
  };

  const setDim = (key: "width" | "height", v: number) => {
    setCustom((prev) => clampCustom({ ...prev, [key]: v }));
  };

  return (
    <Sheet open={open} onClose={onClose} title="New game">
      <div className="mb-4 flex flex-col gap-2">
        {MODE_LIST.map((mode) => {
          const disabled = mode.id !== "classic";
          const Icon = MODE_ICONS[mode.id];
          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              aria-label={disabled ? `${mode.name}: coming soon` : mode.name}
              onClick={() => playSound("click")}
              className={`press no-select flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-left transition-colors ${
                disabled ? "opacity-55" : "hover:bg-surface-hover"
              }`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-md font-semibold text-ink">
                  {mode.name}
                  {disabled && (
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-medium text-ink-muted">Soon</span>
                  )}
                </span>
                <span className="block truncate text-xs text-ink-muted">{mode.description}</span>
              </span>
              {mode.id === "classic" && <span className="text-ink-muted"><ClockIcon size={16} /></span>}
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-wide text-ink-muted">Difficulty</span>
          {currentPreset && (
            <span className="text-xs tabular text-ink-muted">
              {currentPreset.width} x {currentPreset.height} / {currentPreset.mineCount}
            </span>
          )}
        </div>
        <SegmentedControl<ClassicPresetId>
          ariaLabel="Difficulty"
          options={classicOptions}
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
          <Stepper label="Mines" value={custom.mineCount} min={1} max={Math.floor((custom.width * custom.height) * 0.85)} step={1} onChange={(v) => setCustom((prev) => clampCustom({ ...prev, mineCount: v }))} />
        </div>
      )}

      <Button className="w-full" onClick={start}>
        <GridIcon size={18} />
        Start board
      </Button>
    </Sheet>
  );
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