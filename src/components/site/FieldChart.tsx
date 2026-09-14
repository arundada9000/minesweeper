"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { CELL_NUM_COLORS } from "./map";

type Row = Array<number | "">;

const COL_LETTERS = "ABCDEFGHIJKLMNOP";

const NEIGHBOR_LABELS: Record<number, string> = {
  1: "1 NEIGHBOR",
  2: "2 NEIGHBORS",
  3: "3 NEIGHBORS",
  4: "4 NEIGHBORS",
  5: "5 NEIGHBORS",
  6: "6 NEIGHBORS",
  7: "7 NEIGHBORS",
  8: "8 NEIGHBORS",
};

function delayFor(col: number, row: number) {
  return Math.min(900, (col + row) * 26 + row * 4);
}

/**
 * The interactive, breathing cleared-field map. Shows a readout and lifts
 * cells on hover; a soft beam sweeps the board at idle. Honors reduced
 * motion entirely via the global media block.
 */
export function FieldChart({ rows }: { rows: Row[] }) {
  const reduced = useReducedMotion();
  const cols = rows[0]?.length ?? 16;
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const idleMid = "40 MINES / CLEARED";
  const idleRight = "3BV 78";

  let midText = idleMid;
  let rightText = idleRight;
  if (hoverCell) {
    midText = `READ ${COL_LETTERS[hoverCell.x] ?? "?"}${hoverCell.y + 1}`;
    const v = rows[hoverCell.y]?.[hoverCell.x];
    rightText = v === "" ? "CLEAR GROUND" : (NEIGHBOR_LABELS[v as number] ?? String(v));
  }

  return (
    <div
      className="relative rounded-2xl border border-line/70 bg-surface/70 p-4 shadow-ios-lg backdrop-blur-sm"
      onMouseLeave={() => setHoverCell(null)}
    >
      {/* Header readout */}
      <div className="relative mb-3 flex items-center justify-between text-2xs font-mono text-ink-muted">
        <span className="w-[9ch]">FIELD {cols}x{rows.length}</span>
        <span className="w-[16ch] text-center tabular transition-colors duration-150">{midText}</span>
        <span className="w-[11ch] text-right tabular transition-colors duration-150">{rightText}</span>
      </div>

      {/* Board + sweep beam */}
      <div className="relative overflow-hidden rounded-lg">
        {!reduced && (
          <div
            aria-hidden
            className="board-sweep pointer-events-none absolute inset-0"
          />
        )}

        <div
          aria-hidden
          className="relative grid gap-px"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {rows.flatMap((row, y) =>
            row.map((value, x) => {
              const empty = value === "";
              const active = hoverCell?.x === x && hoverCell?.y === y;
              const dimmed = hoverCell !== null && !active;
              return (
                <div
                  key={`${y}-${x}`}
                  style={reduced ? undefined : { animationDelay: `${delayFor(x, y)}ms` }}
                  onMouseEnter={() => setHoverCell({ x, y })}
                  className={[
                    "grid aspect-square place-items-center rounded-[3px] border border-line/40 bg-cell-revealed text-[11px]",
                    "transition-[transform,opacity,border-color,box-shadow] duration-150 ease-touch",
                    reduced ? "" : "cell-peek",
                    empty ? "text-transparent" : CELL_NUM_COLORS[value as number],
                    empty ? "" : "font-bold",
                    active ? "z-10 scale-110 border-accent/70 shadow-pop" : "",
                    dimmed ? "opacity-50" : "",
                  ].join(" ")}
                >
                  {empty ? (
                    "·"
                  ) : (
                    <span
                      className={reduced ? "" : "board-num"}
                      style={reduced ? undefined : { animationDelay: `${((x * 7 + y * 13) % 60) / 10}s` }}
                    >
                      {value}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer legend */}
      <div className="mt-3 flex items-center gap-x-5 gap-y-1 text-2xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-1.5 rounded-full bg-flag" />
          Marked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-[2px] bg-accent" />
          Neighbors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-1.5 rounded-full bg-line" />
          Clear
        </span>
      </div>
    </div>
  );
}
