/**
 * Help sheet: the full gesture + keyboard reference, adapted to the active
 * mode so it never promises moves the engine does not allow.
 */

import { Sheet } from "../ui/primitives";
import { CommandIcon, KeyboardIcon, MouseIcon } from "../ui/icons";
import { useGame } from "@/game/useGameStore";
import { getMode } from "@/engine/modes";

function Row({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-ink-soft">{label}</span>
      <kbd className="shrink-0 rounded-md border border-line-strong bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink">{keys}</kbd>
    </div>
  );
}

export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mode = useGame((s) => s.mode);
  const def = getMode(mode);
  const questionAllowed = useGame((s) => s.engine.config.questionMarks);
  const undoLine = def.undoAllowed
    ? "Zen and No Guess let you undo a move after it is made."
    : "Classic, Daily, and Rush do not allow undo.";

  return (
    <Sheet open={open} onClose={onClose} title="How to play">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
            <MouseIcon size={15} /> Mouse
          </h3>
          <div className="divide-y divide-surface-2">
            <Row keys="Left click" label="Reveal a hidden cell" />
            <Row keys="Right click" label="Flag / cycle a cell" />
            <Row keys="Right-click edge" label="Game menu: restart, commands, help, settings" />
            <Row keys="Middle click" label="Clear around a revealed number" />
          </div>
        </section>
        <section>
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
            <KeyboardIcon size={15} /> Keyboard
          </h3>
          <div className="divide-y divide-surface-2">
            <Row keys="Arrows" label="Move the cursor" />
            <Row keys="Space / Enter" label="Reveal the cursor cell" />
            <Row keys="F" label="Flag / cycle the cursor cell" />
            <Row keys="R" label="Restart the board" />
            <Row keys="P / Esc" label="Pause or resume" />
            {def.undoAllowed && <Row keys="Z / U" label="Undo the last move" />}
            {def.hintsAllowed && <Row keys="H" label="Ask the solver for a hint" />}
            <Row keys="Ctrl + K" label="Command palette" />
            <Row keys="?" label="This help sheet" />
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
          <CommandIcon size={15} /> Touch
        </h3>
        <div className="divide-y divide-surface-2">
          <Row keys="Tap" label="Reveal a hidden cell" />
          <Row keys="Hold" label="Flag (or cycle flag state)" />
          <Row keys="Double-tap" label="Clear around a revealed number" />
          {def.hintsAllowed && <Row keys="Hint button" label="Highlight a safe move explained in plain words" />}
        </div>
      </section>

      <div className="mt-5 space-y-2 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed text-ink-soft">
        <p>
          <span className="font-semibold text-ink">{def.name}:</span> {def.description}
        </p>
        <p>{undoLine}</p>
        {def.hintsAllowed && (
          <p>
            Hints never reveal a mine you could not already prove: they point out a forced move near the revealed
            numbers, or a careful guess when nothing is forced. Using one skips the personal record in competitive modes.
          </p>
        )}
        {!questionAllowed && <p>Question marks are disabled for this mode; the flag cycle skips them.</p>}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-muted">
        SweeperMine plays entirely in your browser. Every board, record, and achievement is kept on this device.
      </p>
    </Sheet>
  );
}