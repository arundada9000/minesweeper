/**
 * Score strip: mine counter, status (color-coded restart), and run clock.
 * Counters stay tabular so digits do not jitter; values come from the engine.
 */

import { useGame } from "@/game/useGameStore";
import { getMode } from "@/engine/modes";
import { formatClock } from "../ui/primitives";
import { ClockIcon, MineIcon, RestartIcon, UndoIcon } from "../ui/icons";

const PHASE_TINT: Record<string, string> = {
  ready: "text-ink-soft",
  playing: "text-accent",
  paused: "text-amber",
  won: "text-green",
  lost: "text-red",
  idle: "text-ink-muted",
};

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
    <div className="mx-5 flex items-stretch gap-1">
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
            <span className={`font-mono text-lg font-bold tabular ${clockLow ? "text-red" : "text-ink"}`}>{formatClock(countdown ? remaining : time)}</span>
            <ClockIcon size={15} className={clockLow ? "text-red" : "text-ink-muted"} />
          </div>
        )}
      </div>

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
  );
}