/**
 * Full-board overlays: Continue prompt (saved runs), Pause, and Win/Loss.
 * Overlays dim only the board so the HUD and controls stay reachable.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useReducedMotion, type Variants } from "motion/react";
import { Button, formatClock } from "../ui/primitives";
import { CheckIcon, ClockIcon, CrownIcon, MineIcon, SparkleIcon } from "../ui/icons";

function Overlay({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="absolute inset-0 z-overlay flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="w-full max-w-sm rounded-3xl bg-elevated p-6 shadow-ios-lg hairline"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function timeAgo(timestamp: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/* ------------------------------ ContinueOverlay ---------------------------- */

export function ContinueOverlay({
  savedAt,
  label,
  onContinue,
  onNewGame,
}: {
  savedAt: number;
  label: string;
  onContinue: () => void;
  onNewGame: () => void;
}) {
  return (
    <Overlay>
      <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <ClockIcon size={26} />
      </div>
      <h2 className="mb-1 text-xl font-semibold tracking-tight text-ink">Welcome back</h2>
      <p className="mb-5 text-sm text-ink-muted">
        {label} from {timeAgo(savedAt)} ago. Pick up right where you left off?
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={onContinue}>Continue game</Button>
        <Button variant="ghost" onClick={onNewGame}>Start a new board</Button>
      </div>
    </Overlay>
  );
}

/* ------------------------------- PauseOverlay ------------------------------ */

export function PauseOverlay({
  reason,
  onResume,
  onRestart,
  onQuit,
}: {
  reason: string | null;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  return (
    <Overlay>
      <h2 className="mb-1 text-xl font-semibold tracking-tight text-ink">Paused</h2>
      <p className="mb-5 text-sm text-ink-muted">
        {reason ?? "The clock has stopped. Take your time, the board is saved."}
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={onResume}>Resume</Button>
        <Button variant="secondary" onClick={onRestart}>Restart</Button>
        <Button variant="ghost" onClick={onQuit}>Quit to a fresh board</Button>
      </div>
    </Overlay>
  );
}

/* ------------------------------- ResultOverlay ----------------------------- */

function CountUp({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduced]);
  return <span ref={ref} className={className} />;
}

const revealStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
};
const revealItem: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 30 } },
};
const badgePop: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -14 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 480, damping: 20 } },
};

export type ResultStats = "standard" | "rush" | "zen";

export function ResultOverlay({
  won,
  timeMs,
  mines,
  moves,
  stats = "standard",
  cleared,
  score,
  timeUp,
  record,
  unlock,
  onPlayAgain,
  onNewBoard,
  onClose,
}: {
  won: boolean;
  timeMs: number;
  mines: number;
  moves: number;
  stats?: ResultStats;
  cleared?: number;
  score?: number;
  timeUp?: boolean;
  record?: boolean;
  unlock?: string | null;
  onPlayAgain: () => void;
  onNewBoard: () => void;
  onClose: () => void;
}) {
  const title = won ? (stats === "rush" ? "Time beaten" : "Board cleared") : timeUp ? "Out of time" : "Hit a mine";
  const sub = won
    ? stats === "rush"
      ? "The whole field, before the clock ran out."
      : `Every safe cell revealed. Nice thinking.`
    : timeUp
      ? `The countdown won this one.`
      : `Keep your flags honest, then try again.`;

  return (
    <Overlay>
      <motion.div variants={revealStagger} initial="hidden" animate="show">
        <motion.div
          variants={badgePop}
          className={`mb-3 flex size-14 items-center justify-center rounded-full ${won ? "bg-green-soft text-green" : "bg-red-soft text-red"}`}
        >
          {won ? <CheckIcon size={26} /> : <MineIcon size={26} />}
        </motion.div>
        <motion.h2 variants={revealItem} className="mb-1 text-xl font-semibold tracking-tight text-ink">
          {title}
        </motion.h2>
        <motion.p variants={revealItem} className="mb-5 text-sm text-ink-muted">
          {sub}
        </motion.p>

        {stats === "rush" ? (
          <motion.div variants={revealItem} className="mb-5 grid grid-cols-3 gap-2 text-center">
            <Stat label="Score" value={<CountUp value={score ?? 0} />} />
            <Stat label="Time" value={formatClock(timeMs)} />
            <Stat label="Cleared" value={<CountUp value={cleared ?? 0} />} />
          </motion.div>
        ) : stats === "zen" ? (
          <motion.div variants={revealItem} className="mb-5 grid grid-cols-2 gap-2 text-center">
            <Stat label="Mines" value={<CountUp value={mines} />} />
            <Stat label="Moves" value={<CountUp value={moves} />} />
          </motion.div>
        ) : (
          <motion.div variants={revealItem} className="mb-5 grid grid-cols-3 gap-2 text-center">
            <Stat label="Time" value={formatClock(timeMs)} />
            <Stat label="Mines" value={<CountUp value={mines} />} />
            <Stat label="Moves" value={<CountUp value={moves} />} />
          </motion.div>
        )}

        {(record || unlock) && (
          <motion.div variants={revealItem} className="mb-5 flex flex-col gap-1.5">
            {record && (
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-gold-soft px-3 py-2 text-sm font-medium text-gold">
                <CrownIcon size={15} />
                New personal best
              </div>
            )}
            {unlock && (
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-accent-soft px-3 py-2 text-sm font-medium text-accent-strong">
                <SparkleIcon size={15} />
                Achievement: {unlock}
              </div>
            )}
          </motion.div>
        )}

        <motion.div variants={revealItem} className="flex flex-col gap-2">
          <Button onClick={onPlayAgain}>{won ? "Play again" : "Try again"}</Button>
          <Button variant="secondary" onClick={onNewBoard}>New board</Button>
          <Button variant="ghost" onClick={onClose}>Inspect the board</Button>
        </motion.div>
      </motion.div>
    </Overlay>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-2 px-2 py-3">
      <div className="font-mono text-lg font-bold tabular text-ink">{value}</div>
      <div className="text-2xs uppercase tracking-wide text-ink-muted">{label}</div>
    </div>
  );
}