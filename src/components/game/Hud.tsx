/**
 * Score strip: mine counter, status (color-coded restart), and run clock.
 * Counters stay tabular so digits do not jitter; values come from the engine.
 */

import { useGame } from "@/game/useGameStore";
import { getMode } from "@/engine/modes";
import type { GameEngine } from "@/engine/game";
import { formatClock } from "../ui/primitives";
import { ClockIcon, FlagIcon, GridIcon, MineIcon, QuestionIcon, RestartIcon, UndoIcon } from "../ui/icons";

const PHASE_TINT: Record<string, string> = {
  ready: "text-ink-soft",
  playing: "text-accent",
  paused: "text-amber",
  won: "text-green",
  lost: "text-red",
  idle: "text-ink-muted",
};

function MiniRunStats({ engine }: { engine: GameEngine }) {
  const cfg = engine.config;
  const totalCells = cfg.width * cfg.height;
  const safeCells = totalCells - cfg.mineCount;
  const uncovered = engine.revealedSafeCount;
  const left = Math.max(0, safeCells - uncovered);

  return (
    <div role="group" aria-label="Run progress" className="hidden items-stretch gap-1 rounded-2xl bg-surface-2/90 p-1 shadow-ios hairline backdrop-blur-md lg:flex">
      <div className="flex items-center gap-1.5 rounded-xl bg-elevated px-2.5">
        <FlagIcon size={12} className="text-flag" />
        <span className="font-mono text-sm font-bold tabular text-ink">{engine.flagsOnBoard}</span>
        <span className="text-2xs uppercase tracking-wide text-ink-muted">Flags</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-xl bg-elevated px-2.5">
        <GridIcon size={12} className="text-accent" />
        <span className="font-mono text-sm font-bold tabular text-ink">{uncovered}</span>
        <span className="text-2xs uppercase tracking-wide text-ink-muted">Discovered</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-xl bg-elevated px-2.5">
        <QuestionIcon size={12} className="text-ink-soft" />
        <span className="font-mono text-sm font-bold tabular text-ink">{left}</span>
        <span className="text-2xs uppercase tracking-wide text-ink-muted">Left</span>
      </div>
    </div>
  );
}

function RunStats({ engine }: { engine: GameEngine }) {
  const cfg = engine.config;
  const totalCells = cfg.width * cfg.height;
  const safeCells = totalCells - cfg.mineCount;
  const uncovered = engine.revealedSafeCount;
  const left = Math.max(0, safeCells - uncovered);
  const progress = safeCells > 0 ? uncovered / safeCells : 0;

  return (
    <div role="group" aria-label="Run progress" className="grid grid-cols-3 items-stretch gap-1 rounded-2xl bg-surface-2/90 p-1 shadow-ios hairline backdrop-blur-md lg:hidden">
      <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-elevated px-2 py-1.5">
        <div className="flex items-baseline gap-1.5">
          <FlagIcon size={13} className="text-flag" />
          <span className="font-mono text-base font-bold tabular text-ink">{engine.flagsOnBoard}</span>
        </div>
        <span className="text-2xs uppercase tracking-wide text-ink-muted">Flags</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-elevated px-2 py-1.5">
        <div className="flex items-baseline gap-1.5">
          <GridIcon size={13} className="text-accent" />
          <span className="font-mono text-base font-bold tabular text-ink">{uncovered}</span>
        </div>
        <span className="text-2xs uppercase tracking-wide text-ink-muted">Discovered</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-elevated px-2 py-1.5">
        <div className="flex items-baseline gap-1.5">
          <QuestionIcon size={13} className="text-ink-soft" />
          <span className="font-mono text-base font-bold tabular text-ink">{left}</span>
        </div>
        <span className="text-2xs uppercase tracking-wide text-ink-muted">Left</span>
      </div>
      <div className="col-span-3 h-0.5 overflow-hidden rounded-full bg-track" role="presentation">
        <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

export function Hud({ onModeClick, onUndo, onRestart }: { onModeClick: () => void; onUndo: () => void; onRestart: () => void }) {
  useGame((s) => s.clockVersion);
  const engine = useGame.getState().engine;
  const mode = useGame((s) => s.mode);
  const preset = useGame((s) => s.preset);
  const canUndo = useGame((s) => s.engine.phase === "playing");

  const cfg = engine.config;
  const minesLeft = engine.minesLeft;
  const time = engine.elapsedMs;

  const modeDef = getMode(mode);
  const undoAllowed = modeDef.undoAllowed;

  const limit = engine.timeLimitMs;
  const countdown = modeDef.timer === "count-down" && limit != null;
  const remaining = countdown ? Math.max(0, limit - time) : 0;
  const clockLow = countdown && remaining <= 10_000;
  const noTimer = modeDef.timer === "none";
  const modeLabel = mode === "daily" ? "Today" : preset === "custom" ? `${cfg.width}×${cfg.height}` : preset;

  return (
    <div className="mx-5 flex flex-col gap-1.5">
      <div className="flex items-stretch gap-1">
        <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-stretch gap-1 rounded-2xl bg-surface-2/90 p-1 shadow-ios hairline backdrop-blur-md">
        <div className="flex items-center justify-start gap-1.5 rounded-xl bg-elevated px-3" aria-label={`${minesLeft} mines left`}>
          <MineIcon size={15} className="text-accent" />
          <span className="font-mono text-lg font-bold tabular text-ink">{String(minesLeft).padStart(3, "0")}</span>
        </div>

        <div className="flex items-center gap-0.5">
          {undoAllowed && (
            <button
              type="button"
              aria-label="Undo"
              title="Undo (Z)"
              disabled={!canUndo}
              onClick={onUndo}
              className={`press no-select flex size-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-35`}
            >
              <UndoIcon size={19} />
            </button>
          )}
          <button
            type="button"
            aria-label="Restart"
            title="New game (R)"
            onClick={onRestart}
            className={`press no-select flex size-10 items-center justify-center rounded-xl bg-elevated shadow-ios hover:opacity-90 ${PHASE_TINT[engine.phase] ?? "text-accent"}`}
          >
            <RestartIcon size={19} />
          </button>
        </div>

        {noTimer ? (
          <div className="flex items-center justify-end gap-1 rounded-xl bg-elevated px-3" aria-label="No timer">
            <span className="font-mono text-lg font-bold tabular text-ink-muted">Zen</span>
          </div>
        ) : (
          <div className={`flex items-center justify-end gap-1.5 rounded-xl bg-elevated px-3 ${clockLow ? "text-red" : ""}`} aria-label={countdown ? `Time left ${formatClock(remaining)}` : `Time ${formatClock(time)}`}>
            <span className={`font-mono text-lg font-bold tabular ${clockLow ? "pulse-soft text-red" : "text-ink"}`}>{formatClock(countdown ? remaining : time)}</span>
            <ClockIcon size={15} className={clockLow ? "text-red" : "text-ink-muted"} />
          </div>
        )}
      </div>

      <MiniRunStats engine={engine} />

      <button
        type="button"
        onClick={onModeClick}
        className="press no-select flex items-center justify-center gap-1 rounded-2xl bg-surface-2/90 px-3 text-sm text-ink-soft shadow-ios hairline backdrop-blur-md hover:text-ink"
        aria-label="Choose game mode"
      >
        <span className={`size-2 rounded-full bg-current ${PHASE_TINT[engine.phase] ?? "text-ink-muted"}`} />
        <span className="font-medium">{modeLabel}</span>
      </button>
      </div>

      <RunStats engine={engine} />
    </div>
  );
}