/**
 * Toast primitive: transient confirmation lines at the bottom of the board
 * area. Push via `toast(msg)`. One viewport renders all of them; each toast
 * auto-dismisses and disappears without drama.
 */

import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";

interface ToastItem {
  id: number;
  msg: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (msg: string) => void;
}

let nextToastId = 1;

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (msg) => {
    const id = nextToastId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, msg }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2400);
  },
}));

export function toast(msg: string) {
  useToasts.getState().push(msg);
}

export function ToastViewport() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-toast flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="rounded-full bg-elevated px-4 py-2 text-[13px] font-medium text-ink shadow-pop hairline"
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}