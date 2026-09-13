"use client";

import { useReducedMotion } from "motion/react";
import { CELL_NUM_COLORS } from "./map";

type Row = Array<number | "">;

function delayFor(col: number, row: number) {
  return Math.min(900, (col + row) * 26 + row * 4);
}

/**
 * The cleared-field map as a living board: every number pops in one by one
 * like a cascade of reveals. Honors reduced motion by rendering statically.
 */
export function FieldChart({ rows }: { rows: Row[] }) {
  const reduced = useReducedMotion();
  const cols = rows[0]?.length ?? 16;

  return (
    <div
      aria-hidden
      className="grid gap-px"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {rows.flatMap((row, y) =>
        row.map((value, x) => {
          const empty = value === "";
          return (
            <div
              key={`${y}-${x}`}
              style={reduced ? undefined : { animationDelay: `${delayFor(x, y)}ms` }}
              className={`grid aspect-square place-items-center rounded-[3px] border border-line/40 bg-cell-revealed text-[11px] ${
                reduced ? "" : "cell-peek"
              } ${empty ? "text-transparent" : CELL_NUM_COLORS[value as number]} ${
                empty ? "" : "font-bold"
              }`}
            >
              {empty ? "·" : value}
            </div>
          );
        })
      )}
    </div>
  );
}