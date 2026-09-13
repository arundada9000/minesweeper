/**
 * Context menu primitive: a small positioned menu for mouse users.
 * State lives in a store so any cell can open one menu globally and a single
 * layer renders it. Closes on backdrop press, Escape, or menu item selection.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  dangerous?: boolean;
}

interface ContextMenuState {
  menu: { x: number; y: number; items: MenuItem[] } | null;
  open: (x: number, y: number, items: MenuItem[]) => void;
  close: () => void;
}

export const useContextMenu = create<ContextMenuState>((set) => ({
  menu: null,
  open: (x, y, items) => set({ menu: { x, y, items } }),
  close: () => set({ menu: null }),
}));

export function ContextMenuLayer() {
  const menu = useContextMenu((s) => s.menu);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useContextMenu.getState().close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const x = menu ? Math.min(menu.x, Math.max(8, (typeof window !== "undefined" ? window.innerWidth : 400) - 208)) : 0;
  const y = menu ? Math.min(menu.y, Math.max(8, (typeof window !== "undefined" ? window.innerHeight : 600) - 48 * menu.items.length - 16)) : 0;

  return (
    <AnimatePresence>
      {menu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-context"
            onPointerDown={() => useContextMenu.getState().close()}
          />
          <motion.div
            ref={panelRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -2 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            style={{ left: x, top: y }}
            className="fixed z-context min-w-52 rounded-2xl bg-elevated p-1.5 shadow-ios-lg hairline"
          >
            {menu.items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  useContextMenu.getState().close();
                }}
                className={`press flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                  item.dangerous ? "text-red" : "text-ink"
                }`}
              >
                <span className={`flex size-5 items-center justify-center ${item.dangerous ? "text-red" : "text-ink-soft"}`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}