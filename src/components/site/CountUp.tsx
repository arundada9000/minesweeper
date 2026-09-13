"use client";

import { useEffect, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/**
 * Counts from zero to `value` the first time it scrolls into view.
 * Reduced motion jumps straight to the final number.
 */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return (
    <span ref={ref} className={`tabular font-mono ${className}`}>
      {display}
    </span>
  );
}