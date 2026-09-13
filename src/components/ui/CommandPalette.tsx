/**
 * Command palette primitive: type-ahead launcher for game actions.
 * Opened with Ctrl/Cmd+K. Arrows move the selection, Enter runs it,
 * Escape closes. Commands come from the host screen so they stay real.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface Command {
  id: string;
  group: string;
  label: string;
  keywords?: string;
  icon?: ReactNode;
  onRun: () => void;
}

export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      window.setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? commands.filter((c) => (c.label + " " + (c.keywords ?? "") + " " + c.group).toLowerCase().includes(q))
      : commands;
  }, [commands, query]);

  const groups = useMemo(() => {
    const out: { group: string; items: Command[] }[] = [];
    for (const c of filtered) {
      const g = out.find((g) => g.group === c.group);
      if (g) g.items.push(c);
      else out.push({ group: c.group, items: [c] });
    }
    return out;
  }, [filtered]);

  const flat = filtered;

  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  const run = (c: Command) => {
    onClose();
    c.onRun();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-palette">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="absolute inset-0 bg-scrim"
            onPointerDown={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-1/2 top-[12%] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl bg-elevated shadow-ios-lg hairline"
          >
            <div className="flex items-center gap-2.5 border-b border-surface-2 px-4 py-3.5">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => (c + 1) % Math.max(1, flat.length));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => (c - 1 + Math.max(1, flat.length)) % Math.max(1, flat.length));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const c = flat[cursor];
                    if (c) run(c);
                  }
                }}
                placeholder="Type a command"
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
              />
              <kbd className="rounded-md border border-line-strong px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">esc</kbd>
            </div>
            <div className="max-h-[46vh] overflow-y-auto p-2">
              {flat.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-ink-muted">Nothing matches.</p>
              ) : (
                groups.map((g) => (
                  <div key={g.group} className="mb-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{g.group}</p>
                    {g.items.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => run(c)}
                        onMouseEnter={() => setCursor(flat.indexOf(c))}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                          cursor === flat.indexOf(c) ? "bg-surface-2 text-ink" : "text-ink-soft"
                        }`}
                      >
                        <span className="flex size-5 items-center justify-center text-ink-soft">{c.icon}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}