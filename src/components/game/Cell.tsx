/**
 * A single minesweeper cell. State is read straight from the engine through a
 * per-cell signature so only the affected cells re-render after a move.
 */

import { memo, type ReactNode } from "react";
import { FlagIcon, QuestionIcon, MineIcon, CloseIcon } from "../ui/icons";
import { useGame } from "@/game/useGameStore";
import { useSettings } from "@/game/useSettingsStore";
import { playSound, haptic } from "@/game/sound";
import { getMode } from "@/engine/modes";
import { useCellGestures } from "./useCellGestures";

const NUM_COLOR: Record<number, string> = {
  1: "text-num-1",
  2: "text-num-2",
  3: "text-num-3",
  4: "text-num-4",
  5: "text-num-5",
  6: "text-num-6",
  7: "text-num-7",
  8: "text-num-8",
};

interface CellProps {
  index: number;
  cols: number;
  isNew: boolean;
  revealOrder: number;
  isCursor: boolean;
  /** Tier of the active teaching hint this cell belongs to, if any. */
  hintRole?: "action" | "clue" | "area";
}

export const Cell = memo(function Cell({ index, cols, isNew, revealOrder, isCursor, hintRole }: CellProps) {
  // Subscribe to a signature of this cell only; unrelated cells stay inert.
  useGame((s) => {
    const c = s.engine.cells[index];
    return `${c?.state ?? "x"}:${c?.revealedAt ?? 0}:${c?.wrongFlag ?? false}`;
  });
  const cell = useGame.getState().engine.cells[index];
  const longPressMs = useSettings.getState().longPressDelayMs;
  const train = getMode(useGame.getState().mode).train === true;

  const state = cell?.state ?? "hidden";
  const revealed = state === "revealed";
  const flagged = state === "flagged";
  const questioned = state === "questioned";
  const exploded = state === "exploded";
  const isMine = cell?.isMine ?? false;
  const number = cell?.adjacentMineCount ?? 0;
  const wrongFlag = cell?.wrongFlag ?? false;

  const row = Math.floor(index / cols);
  const col2 = index % cols;
  const parity = (row + col2) % 2 === 0;

  const canReveal = !revealed && !flagged && !exploded;
  const canUnflag = flagged;
  const canChord = revealed && number > 0;

  const { pressed, bind } = useCellGestures(
    { canReveal, canUnflag, canChord },
    {
      reveal: () => {
        playSound("reveal");
        haptic("tap");
        useGame.getState().reveal(index);
      },
      flag: () => {
        playSound("flag");
        haptic("flag");
        useGame.getState().cycleFlag(index);
      },
      unflag: () => {
        playSound("flag");
        haptic("flag");
        useGame.getState().unflag(index);
      },
      chord: () => {
        playSound("chord");
        haptic("chord");
        useGame.getState().chord(index);
      },
    },
    longPressMs
  );

  let content: ReactNode = null;
  let surfaceClass: string;
  let label = `Cell ${index + 1}`;

  if (isMine && exploded) {
    surfaceClass = "bg-danger-soft";
    content = <MineIcon className="cell-boom text-mine" />;
    label = "Mine";
  } else if (isMine && revealed) {
    surfaceClass = "bg-cell-revealed-2";
    content = <MineIcon className="text-mine" />;
    label = "Mine";
  } else if (flagged) {
    surfaceClass = wrongFlag ? "bg-cell-revealed" : "bg-cell";
    content = (
      <span className={`relative flex items-center justify-center ${wrongFlag ? "" : "flag-plant"}`}>
        <FlagIcon className="text-flag" />
        {wrongFlag && <CloseIcon className="absolute size-2 text-danger" />}
      </span>
    );
    label = wrongFlag ? "Wrong flag" : "Flagged";
  } else if (questioned) {
    surfaceClass = "bg-cell";
    content = <QuestionIcon className="q-in text-ink-muted" />;
    label = "Unknown";
  } else if (revealed) {
    surfaceClass = parity ? "bg-cell-revealed" : "bg-cell-revealed-2";
    if (number > 0) {
      content = <span className={NUM_COLOR[number]}>{number}</span>;
      label = `${number} adjacent mines`;
    }
  } else {
    surfaceClass = "bg-cell";
    if (train && isMine) {
      content = <MineIcon className="opacity-40 text-mine" />;
      label = "Mine";
    } else if (train && number > 0) {
      content = (
        <span className={`${NUM_COLOR[number]} opacity-40`}>{number}</span>
      );
      label = `${number} adjacent mines`;
    }
  }

  // Hidden cells get a pressed affordance; revealed cells stay flat.
  const pressedClass = !revealed && !exploded && pressed ? "bg-cell-pressed" : "";
  const liveClass = !revealed && !exploded ? "cell-live" : "";
  const hintClass = hintRole === "action" ? "hint-action" : hintRole === "clue" ? "hint-clue" : hintRole === "area" ? "hint-area" : "";

  return (
    <button
      type="button"
      aria-label={label}
      className={`cell-surface ${surfaceClass} ${pressedClass} ${liveClass} no-select ${revealed && number > 0 ? "cursor-pointer" : ""} ${isNew ? "cell-new" : ""} ${
        wrongFlag ? "cell-shake" : ""
      } ${hintClass} ${isCursor ? "cursor-cell ring-2 ring-accent-strong/70" : ""}`}
      style={isNew ? { animationDelay: `${Math.min(10, revealOrder) * 14}ms` } : undefined}
      {...bind}
    >
      {content}
    </button>
  );
});