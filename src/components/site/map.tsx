/**
 * Minefield map motif components. Reusable cell wells, contour terrain, and
 * number glyphs drawn from the same runtime tokens as the game board, so the
 * landing page reads as a cleared field, not a generic marketing template.
 */

import type { ReactNode } from "react";
import { FlagIcon, MineIcon } from "@/components/ui/icons";

/** Revealed number glyph colors: index 1-8 -> Tailwind token utilities. */
export const CELL_NUM_COLORS = [
  "",
  "text-num-1",
  "text-num-2",
  "text-num-3",
  "text-num-4",
  "text-num-5",
  "text-num-6",
  "text-num-7",
  "text-num-8",
];

export type CellValue = number | "" | "F" | "X";

/** A single revealed cell well: a number, a flag, a mine, or clear ground. */
export function CellWell({ value, size = "md", className = "" }: { value: CellValue; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "size-14 text-xl" : size === "sm" ? "size-8 text-[13px]" : "size-10 text-base";
  const font = size === "lg" ? "[font-weight:800]" : "[font-weight:700]";
  let body: ReactNode = null;

  if (value === "F") {
    body = <FlagIcon size={size === "lg" ? 22 : size === "sm" ? 14 : 17} className="text-flag" />;
  } else if (value === "X") {
    body = <MineIcon size={size === "lg" ? 22 : size === "sm" ? 14 : 17} className="text-mine" />;
  } else if (typeof value === "number" && value > 0) {
    body = <span className={`${font} tabular leading-none`}>{value}</span>;
  }

  const color = typeof value === "number" && value > 0 ? CELL_NUM_COLORS[value] : "text-ink";
  return (
    <div
      aria-hidden
      className={`${box} grid shrink-0 place-items-center rounded-[6px] border border-line/70 bg-cell-revealed ${color} ${className}`}
    >
      {body}
    </div>
  );
}

/** Topographic contour lines as faint terrain behind a section. */
export function ContourField({ className = "", size = 760 }: { className?: string; size?: number }) {
  const rings = [0.18, 0.34, 0.5, 0.66, 0.8, 0.94];
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 size-full text-line ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={50}
          cy={50}
          r={50 * r}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.3}
          opacity={0.5 - i * 0.06}
        />
      ))}
      <circle cx={50} cy={50} r={2} fill="currentColor" opacity={0.6} />
    </svg>
  );
}

type Row = Array<number | "">;

/** A rendered, fully cleared board. Content is decorative (aria-hidden). */
export function ClearedBoard({
  rows,
  className = "",
}: {
  rows: Row[];
  className?: string;
}) {
  return (
    <div aria-hidden className={`grid gap-px ${className}`} style={{ gridTemplateColumns: `repeat(${rows[0].length}, 1fr)` }}>
      {rows.flatMap((row, y) =>
        row.map((value, x) => {
          const empty = value === "";
          return (
            <div
              key={`${y}-${x}`}
              className={`grid aspect-square place-items-center rounded-[3px] border border-line/40 bg-cell-revealed text-[11px] ${
                empty ? "text-transparent" : CELL_NUM_COLORS[value as number]
              } ${empty ? "" : "font-bold"}`}
            >
              {empty ? "·" : value}
            </div>
          );
        })
      )}
    </div>
  );
}

/** Small legend chip used in the hero pane. */
export function MapLegend() {
  return (
    <div aria-hidden className="flex flex-wrap items-center gap-x-5 gap-y-2 text-2xs text-ink-muted">
      <span className="flex items-center gap-1.5">
        <FlagIcon size={12} className="text-flag" />
        A mine you marked
      </span>
      <span className="flex items-center gap-1.5">
        <span className="grid size-4 place-items-center rounded-[3px] border border-line bg-cell-revealed text-[10px] font-bold text-num-1">2</span>
        Two mines beside it
      </span>
      <span className="flex items-center gap-1.5">
        <span className="grid size-4 place-items-center rounded-[3px] border border-line bg-cell-revealed text-transparent">·</span>
        Clear ground
      </span>
    </div>
  );
}