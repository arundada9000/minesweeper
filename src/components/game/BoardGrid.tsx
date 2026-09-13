/**
 * Renders the engine's cells on a grid. Cell size is computed from the real
 * available area (ResizeObserver) with an absolute floor so large boards never
 * collapse into squinty targets; extra space yields small boards that simply
 * overflow the scroll window, per the design rules.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGame } from "@/game/useGameStore";
import { playSound, haptic } from "@/game/sound";
import { Cell } from "./Cell";

const MIN_CELL = 34;
const MAX_CELL = 76;
const PADDING = 16;

function gapFor(cell: number): number {
  if (cell < 26) return 1;
  if (cell < 46) return 2;
  if (cell < 78) return 3;
  return 4;
}

export function BoardGrid({ cursor }: { cursor: number | null }) {
  const { cols, rows, version, lastReveal } = useGame(
    useShallow((s) => ({ cols: s.cols, rows: s.rows, version: s.boardVersion, lastReveal: s.lastReveal }))
  );
  const engine = useGame.getState().engine;
  const cells = engine.cells;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cell: 44, gap: 3 });

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
        <div
          className="mines-grid mx-auto p-4"
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
        <p className="mx-auto mt-1 w-fit rounded-full bg-elevated/80 px-3 py-1 text-sm text-ink-muted backdrop-blur-sm">
          Tap any cell to start
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollerRef} className="mines-scroll h-full w-full overflow-auto rounded-2xl">
      <div
        className="mines-grid mx-auto p-4"
        style={{ "--mines-cols": cols, "--mines-rows": rows, "--cell-w": `${dims.cell}px`, "--cell-gap": `${dims.gap}px`, "--cell-radius": "var(--radius-sm)" } as CSSProperties}
      >
        {cells.map((cell, i) => (
          <Cell key={cell.index} index={cell.index} cols={cols} isNew={lastReveal.includes(cell.index)} revealOrder={lastReveal.indexOf(cell.index)} isCursor={cursor === cell.index} />
        ))}
      </div>
    </div>
  );
}