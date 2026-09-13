"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpIcon } from "@/components/ui/icons";

const R = 21;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Back-to-top cell. A round button whose border ring fills in as you scroll
 * down the page (the same progress the game shows as a clear meter), then
 * scrolls back to the top. Only appears once the page is meaningfully
 * scrollable, and asks the OS about reduced motion before animating.
 */
export function BackToTop() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setVisible(window.scrollY > 320 && max > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <motion.div
      className="fixed z-header"
      style={{
        right: "max(1.25rem, env(safe-area-inset-right))",
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
      initial={false}
      animate={visible ? { opacity: 1, scale: 1, pointerEvents: "auto" } : { opacity: 0, scale: 0.85, pointerEvents: "none" }}
      transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={goToTop}
        aria-label="Back to top"
        className="press glass relative grid size-12 place-items-center rounded-full border border-line/70 text-ink shadow-ios focus-visible:outline-none"
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
          <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeWidth={2} className="text-line-strong opacity-50" />
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="text-accent"
          />
        </svg>
        <ArrowUpIcon size={18} className="relative" />
      </button>
    </motion.div>
  );
}