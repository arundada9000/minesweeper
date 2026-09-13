/**
 * Renders the engine's cells on a grid. Cell size is computed from the real
 * available area (ResizeObserver) with an absolute floor so large boards never
 * collapse into squinty targets; extra space yields small boards that simply
 * overflow the scroll window, per the design rules.
 *
 * Pan and zoom (game-logic §45): the board sits in an explicitly sized wrapper
 * so scaling it grows the scrollable area instead of shrinking the page. Zoom
 * is driven by ctrl/trackpad wheel (desktop) and two-finger pinch (touch);
 * panning is native scroll plus a grab-to-pan drag on the board background.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGame } from "@/game/useGameStore";
import { playSound, haptic } from "@/game/sound";
import { Cell } from "./Cell";
import { pointerDownOnBoard, pointerLeftBoard } from "./boardZoom";

const MIN_CELL = 34;
const MAX_CELL = 76;
const PADDING = 16;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function gapFor(cell: number): number {
  if (cell < 26) return 1;
  if (cell < 46) return 2;
  if (cell < 78) return 3;
  return 4;
}

export function BoardGrid({ cursor }: { cursor: number | null }) {
  const { cols, rows, version, lastReveal, hint } = useGame(
    useShallow((s) => ({
      cols: s.cols,
      rows: s.rows,
      version: s.boardVersion,
      lastReveal: s.lastReveal,
      hint: s.hint,
    }))
  );
  const engine = useGame.getState().engine;
  const cells = engine.cells;

  const hintAction = useMemo(() => new Set(hint?.actionCells ?? []), [hint]);
  const hintClue = useMemo(() => new Set(hint?.clueCells ?? []), [hint]);
  const hintArea = useMemo(() => new Set(hint?.areaCells ?? []), [hint]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cell: 44, gap: 3 });

  const [zoom, setZoom] = useState(MIN_ZOOM);
  const zoomRef = useRef(MIN_ZOOM);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef({ active: false, startDist: 0, startZoom: MIN_ZOOM });
  const panRef = useRef({ active: false, lastX: 0, lastY: 0, id: -1 });

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const applyZoom = (mx: number, my: number, old: number, next: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const contentX = (el.scrollLeft + mx) / old;
    const contentY = (el.scrollTop + my) / old;
    zoomRef.current = next;
    setZoom(next);
    requestAnimationFrame(() => {
      el.scrollLeft = contentX * next - mx;
      el.scrollTop = contentY * next - my;
    });
  };

  const endPan = (el: HTMLDivElement) => {
    const id = panRef.current.id;
    panRef.current.active = false;
    panRef.current.id = -1;
    el.classList.remove("board-panning");
    if (id !== -1 && el.hasPointerCapture(id)) el.releasePointerCapture(id);
  };

  const onScrollerPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerDownOnBoard();
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      if (pinchRef.current.active) return;
      const pts = [...pointersRef.current.values()];
      const [p1, p2] = pts;
      pinchRef.current = {
        active: true,
        startDist: Math.max(1, Math.hypot(p2.x - p1.x, p2.y - p1.y)),
        startZoom: zoomRef.current,
      };
      if (panRef.current.active) endPan(e.currentTarget);
      return;
    }

    // Grab-to-pan: a mouse drag that starts on the board background scrolls.
    if (e.button === 0 && e.pointerType === "mouse" && e.target === e.currentTarget) {
      panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, id: e.pointerId };
      e.currentTarget.classList.add("board-panning");
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const onScrollerPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const entry = pointersRef.current.get(e.pointerId);
    if (entry) {
      entry.x = e.clientX;
      entry.y = e.clientY;
    }

    if (panRef.current.active && e.pointerId === panRef.current.id) {
      const el = e.currentTarget;
      el.scrollLeft -= e.clientX - panRef.current.lastX;
      el.scrollTop -= e.clientY - panRef.current.lastY;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
      return;
    }

    if (!pinchRef.current.active) return;
    const [p1, p2] = [...pointersRef.current.values()];
    if (!p1 || !p2 || pinchRef.current.startDist <= 0) return;
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const next = clampZoom(pinchRef.current.startZoom * (dist / pinchRef.current.startDist));
    const el = scrollerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = (p1.x + p2.x) / 2 - rect.left;
    const my = (p1.y + p2.y) / 2 - rect.top;
    const old = zoomRef.current;
    if (Math.abs(next - old) > 0.001) applyZoom(mx, my, old, next);
  };

  const onScrollerPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerLeftBoard();
    pointersRef.current.delete(e.pointerId);
    if (pinchRef.current.active && pointersRef.current.size < 2) pinchRef.current.active = false;
    if (panRef.current.active && e.pointerId === panRef.current.id) endPan(e.currentTarget);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Ctrl/trackpad-pinch wheel only; a plain wheel keeps native scrolling.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const old = zoomRef.current;
      const next = clampZoom(old * Math.exp(-e.deltaY * 0.002));
      if (Math.abs(next - old) < 0.001) return;
      applyZoom(mx, my, old, next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // A new board starts at 1x.
  useEffect(() => {
    zoomRef.current = MIN_ZOOM;
    setZoom(MIN_ZOOM);
    pinchRef.current.active = false;
    pointersRef.current.clear();
  }, [cols, rows, version]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - PADDING * 2;
      const h = el.clientHeight - PADDING * 2;
      for (let cell = MAX_CELL; cell >= MIN_CELL; cell--) {
        const gap = gapFor(cell);
        const fitsW = cols * cell + (cols - 1) * gap <= w;
        const fitsH = rows * cell + (rows - 1) * gap <= h;
        if (fitsW && fitsH) {
          setDims({ cell, gap });
          return;
        }
      }
      setDims({ cell: MIN_CELL, gap: gapFor(MIN_CELL) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols, rows]);

  if (!cells.length) {
    // Pre-first-click board: a tappable trace of the grid. Each entry starts
    // the abandoned-board flow: the engine generates the board and opens at
    // the tapped cell on the very first reveal.
    return (
      <div ref={scrollerRef} className="mines-scroll h-full w-full overflow-auto rounded-2xl">
        <div className="flex min-h-full w-full flex-col">
        <div
          className="mines-grid m-auto p-4"
          style={{ "--mines-cols": cols, "--mines-rows": rows, "--cell-w": `${dims.cell}px`, "--cell-gap": `${dims.gap}px`, "--cell-radius": "var(--radius-sm)" } as CSSProperties}
        >
          {Array.from({ length: cols * rows }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Start here (cell ${i + 1})`}
              onClick={() => {
                playSound("reveal");
                haptic("tap");
                useGame.getState().reveal(i);
              }}
              className="cell-surface cell-live no-select bg-cell/60"
            />
          ))}
        </div>
        <p className="m-auto mb-4 w-fit rounded-full bg-elevated/80 px-3 py-1 text-sm text-ink-muted backdrop-blur-sm">
          Tap any cell to start
        </p>
        </div>
      </div>
    );
  }

  const boardW = cols * dims.cell + (cols - 1) * dims.gap + PADDING * 2;
  const boardH = rows * dims.cell + (rows - 1) * dims.gap + PADDING * 2;

  return (
    <div
      ref={scrollerRef}
      className={`mines-scroll h-full w-full overflow-auto rounded-2xl${zoom > MIN_ZOOM ? " board-grab" : ""}`}
      style={{ touchAction: "pan-x pan-y" }}
      onPointerDown={onScrollerPointerDown}
      onPointerMove={onScrollerPointerMove}
      onPointerUp={onScrollerPointerEnd}
      onPointerCancel={onScrollerPointerEnd}
    >
      <div className="flex min-h-full w-full flex-col">
        <div className="m-auto flex-shrink-0" style={{ width: boardW * zoom, height: boardH * zoom }}>
          <div
            className="mines-grid p-4"
            style={
              {
                "--mines-cols": cols,
                "--mines-rows": rows,
                "--cell-w": `${dims.cell}px`,
                "--cell-gap": `${dims.gap}px`,
                "--cell-radius": "var(--radius-sm)",
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              } as CSSProperties
            }
          >
            {cells.map((cell, i) => (
              <Cell
                key={cell.index}
                index={cell.index}
                cols={cols}
                isNew={lastReveal.includes(cell.index)}
                revealOrder={lastReveal.indexOf(cell.index)}
                isCursor={cursor === cell.index}
                hintRole={hintAction.has(cell.index) ? "action" : hintClue.has(cell.index) ? "clue" : hintArea.has(cell.index) ? "area" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}