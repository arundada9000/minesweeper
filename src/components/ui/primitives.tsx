/**
 * Small, token-driven UI primitives. Everything visual flows through design
 * tokens: no hard-coded hex, sizes, or spacing in components.
 */

import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react";
import { CloseIcon as CloseGlyph } from "./icons";

/* ---------------------------------- Button -------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "soft";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent shadow-ios hover:opacity-90",
  secondary: "bg-surface-2 text-ink hover:bg-surface-hover",
  ghost: "text-ink-soft hover:text-ink hover:bg-surface-2/70",
  danger: "bg-red-soft text-red",
  soft: "bg-accent-soft text-accent-strong",
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className={`press no-select flex items-center justify-center gap-2 rounded-full font-medium tracking-tight ${
        size === "sm" ? "px-4 h-9 text-sm" : "px-6 h-11 text-base"
      } ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* -------------------------------- IconButton ------------------------------- */

interface IconButtonProps extends HTMLMotionProps<"button"> {
  label: string;
  active?: boolean;
}

export function IconButton({ label, active = false, className = "", children, ...rest }: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.1 }}
      aria-label={label}
      title={label}
      className={`press no-select flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink ${
        active ? "bg-surface-2 text-ink" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ----------------------------- SegmentedControl ---------------------------- */

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
  hint?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  ariaLabel,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const id = useId();
  const trackPadding = "0.25rem";
  const count = options.length;
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const pillLeft = `calc(${selectedIndex} * 100% / ${count} + ${trackPadding})`;
  const pillWidth = `calc(100% / ${count} - ${trackPadding} * 2)`;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`no-select relative grid gap-1 rounded-full bg-surface-2 p-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <motion.span
        layout
        layoutId={id}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute inset-y-1 rounded-full bg-elevated shadow-ios"
        style={{ left: pillLeft, width: pillWidth }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={opt.value === value}
          title={opt.hint}
          onClick={() => onChange(opt.value)}
          className={`press no-select relative z-10 h-8 rounded-full text-sm font-medium transition-colors ${
            opt.value === value ? "text-ink" : "text-ink-muted hover:text-ink-soft"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- Switch --------------------------------- */

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`press no-select relative h-7 w-11 rounded-full transition-colors duration-200 ${
        checked ? "bg-accent" : "bg-track"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 32 }}
        className="absolute top-0.5 size-6 rounded-full bg-elevated shadow-ios"
        style={{ left: checked ? "calc(100% - 1.625rem)" : "0.125rem" }}
      />
    </button>
  );
}

/* -------------------------------- Tooltip --------------------------------- */

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-context mb-2 whitespace-nowrap rounded-lg bg-elevated px-2.5 py-1 text-xs font-medium text-ink opacity-0 shadow-pop hairline transition-all duration-fast group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        style={{ transform: "translate(-50%, 0.125rem)" }}
      >
        {label}
      </span>
    </span>
  );
}

/* --------------------------------- Slider --------------------------------- */

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
}

export function Slider({ value, min, max, step, onChange, label }: SliderProps) {
  const trackRef = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));

  const setFromX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
    const snapped = Math.round(raw / step) * step;
    onChange(Math.min(max, Math.max(min, snapped)));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    setFromX(e.clientX);
  };
  useEffect(() => {
    const up = () => setDragging(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  return (
    <button
      ref={trackRef}
      type="button"
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => {
        if (dragging) setFromX(e.clientX);
      }}
      onKeyDown={(e) => {
        const delta = e.key === "ArrowRight" || e.key === "ArrowUp" ? step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step : 0;
        if (delta) {
          e.preventDefault();
          onChange(Math.min(max, Math.max(min, Math.round((value + delta) / step) * step)));
        }
      }}
      className="press no-select relative h-8 w-full touch-none rounded-full outline-none"
    >
      <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-track" />
      <span
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
        style={{ left: "0.25rem", width: `calc((100% - 0.5rem) * ${ratio})` }}
      />
      <span
        className="absolute top-1/2 size-6 -translate-y-1/2 rounded-full bg-elevated shadow-ios ring-1 ring-line-strong"
        style={{ left: `calc(0.25rem + (100% - 0.5rem) * ${ratio})`, transform: "translate(-50%, -50%)" }}
      />
    </button>
  );
}

/* ----------------------------------- Sheet --------------------------------- */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
}

export function Sheet({ open, onClose, title, children, role = "dialog" }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-end justify-center sm:items-center">
          <motion.button
            aria-label="Close overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-scrim"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role={role}
            aria-modal="true"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-t-3xl bg-elevated px-6 pb-safe-bottom pt-4 shadow-ios-lg sm:mb-8 sm:rounded-3xl sm:px-7"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              {title ? (
                <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
              ) : (
                <span />
              )}
              <button
                aria-label="Close"
                onClick={onClose}
                className="press no-select flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
              >
                <CloseGlyph />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Helpers -------------------------------- */

export function formatClock(ms: number): string {
  const totalSeconds = Math.min(5999, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}