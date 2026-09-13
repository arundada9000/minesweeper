/**
 * Teaching hint banner: floats over the top-center of the board and shows the
 * solver's recommendation, what it means, and an Apply button. Applying a hint
 * counts against the run, so competitive modes forfeit the personal record.
 */

import { motion } from "motion/react";
import { Button } from "../ui/primitives";
import { LightbulbIcon, CloseIcon } from "../ui/icons";
import { useGame } from "@/game/useGameStore";
import { getMode } from "@/engine/modes";
import { playSound, haptic } from "@/game/sound";

export function HintBanner() {
  const hint = useGame((s) => s.hint);
  if (!hint) return null;
  const modeDef = getMode(useGame.getState().mode);

  const apply = () => {
    playSound(hint.action === "reveal" ? "reveal" : "flag");
    haptic(hint.action === "reveal" ? "tap" : "flag");
    useGame.getState().applyHint();
  };
  const dismiss = () => {
    playSound("click");
    useGame.getState().clearHint();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="absolute inset-x-4 top-3 z-overlay mx-auto max-w-md rounded-2xl bg-elevated/95 p-3 pl-4 pr-2 shadow-ios-lg hairline backdrop-blur-md"
      role="status"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
          <LightbulbIcon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-ink">{hint.explanation}</p>
          {modeDef.competitive && (
            <p className="mt-0.5 text-2xs uppercase tracking-wide text-ink-muted">
              Using a hint skips the time record
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={apply}>
            {hint.action === "reveal" ? "Show me" : "Flag it"}
          </Button>
          <button
            type="button"
            aria-label="Dismiss hint"
            onClick={dismiss}
            className="flex size-7 items-center justify-center rounded-full bg-surface-2 text-ink-muted"
          >
            <CloseIcon size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}