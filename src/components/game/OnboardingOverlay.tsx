/**
 * First-run onboarding: a short, dismissible tour of the three core gestures
 * so new players are never dropped onto a lone board. Dismissal is persisted
 * in settings; the overlay remounts fresh each visit until finished.
 */

"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/game/useSettingsStore";
import { playSound, haptic } from "@/game/sound";
import { Button } from "../ui/primitives";
import { GridIcon, FlagIcon, SparkleIcon, GraduationIcon, CloseIcon } from "../ui/icons";

interface Step {
  icon: ComponentType<{ size?: number }>;
  title: string;
  body: string;
}

const STEPS: readonly Step[] = [
  {
    icon: GridIcon,
    title: "Tap to reveal",
    body: "Mines hide under the cells. A tap opens a cell, and a number tells you how many mines touch it.",
  },
  {
    icon: FlagIcon,
    title: "Hold to flag",
    body: "Think a mine is here? Hold a cell to plant a flag. Tap the flag again to lift it.",
  },
  {
    icon: SparkleIcon,
    title: "Double-tap to clear",
    body: "When a number is surrounded by exactly that many flags, double-tap it to safely open the rest.",
  },
  {
    icon: GraduationIcon,
    title: "Numbers are your teachers",
    body: "Practice mode keeps every mine and number visible, so you can learn the patterns at your own pace.",
  },
];

export function OnboardingOverlay() {
  const onboarded = useSettings((s) => s.onboarded);
  const [step, setStep] = useState(0);

  if (onboarded) return null;

  const last = step === STEPS.length - 1;
  const current = STEPS[step];
  const StepIcon = current.icon;

  const finish = () => {
    playSound("confirm");
    haptic("tap");
    useSettings.getState().completeOnboarding();
  };

  const next = () => {
    playSound("click");
    haptic("tap");
    if (last) finish();
    else setStep((s) => s + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-modal flex items-center justify-center p-5"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="relative w-full max-w-sm rounded-3xl bg-elevated p-6 shadow-ios-lg hairline"
      >
        <button
          type="button"
          aria-label="Skip introduction"
          onClick={finish}
          className="press no-select absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
        >
          <CloseIcon size={16} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <div className="mb-4 mt-1 flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
              <StepIcon size={26} />
            </div>
            <h2 className="mb-1.5 text-xl font-semibold tracking-tight text-ink">{current.title}</h2>
            <p className="mb-5 min-h-14 text-sm leading-relaxed text-ink-muted">{current.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mb-5 flex items-center gap-2" role="tablist" aria-label="Introduction steps">
          {STEPS.map((_, i) => (
            <div
              key={i}
              role="tab"
              aria-selected={i === step}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? "bg-accent" : "bg-track"}`}
            />
          ))}
        </div>

        <Button className="w-full" onClick={next}>
          {last ? "Start playing" : "Next"}
        </Button>
        <p className="mt-3 text-center text-2xs text-ink-muted">
          Step {step + 1} of {STEPS.length}
        </p>
      </motion.div>
    </motion.div>
  );
}