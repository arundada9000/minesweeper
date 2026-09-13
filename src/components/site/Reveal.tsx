"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Entrance reveal. Fades and rises its children once into view. Honors the
 * OS reduced-motion setting by skipping motion entirely (stable, readable).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  onMount = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  onMount?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  const transition = { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const };
  if (onMount) {
    return (
      <motion.div className={className} initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={transition}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}