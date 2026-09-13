/**
 * Teaching-first hint system for live boards.
 *
 * Hints never leak a mine position that the board itself does not already
 * prove: the recommended move is always backed by a forced deduction from the
 * revealed numbers (via the same solver used for No Guess), or by an explicit
 * best-guess pick when nothing is forced. Returns the fullest picture so the
 * UI can tier it into area, clue, conclusion, and action.
 */

import { getTopology } from "./topology";
import { deduce } from "./solver";
import type { Board, BoardConfig } from "./types";

export type HintAction = "reveal" | "flag";

export interface HintResult {
  /** What the player should do on the recommended cells. */
  action: HintAction;
  /** The cells the hint recommends acting on, math-safe to apply. */
  actionCells: number[];
  /** Revealed numbers that justify the recommendation (the clue). */
  clueCells: number[];
  /** The frontier neighborhood involved in the reasoning (the area). */
  areaCells: number[];
  /** One-sentence conclusion with the number spelled out. */
  explanation: string;
  /** "deduce" = certain from the revealed numbers; "guess" = best pick. */
  level: "deduce" | "guess";
}

export function findHint(board: Board, config: BoardConfig): HintResult | null {
  const { topology: topoId, questionMarks } = config;
  const { width, height } = board;
  const topo = getTopology(topoId);
  const area = new Set<number>();
  let frontier: number[] = [];

  for (let i = 0; i < width * height; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.state !== "revealed" || cell.adjacentMineCount === 0) continue;
    for (const n of topo.neighbors(width, height, i)) {
      const st = board.cells[n].state;
      if (st === "hidden" || st === "questioned") {
        if (!area.has(n)) {
          area.add(n);
          frontier.push(n);
        }
      }
    }
  }
  if (frontier.length === 0) return null;

  // Level 1..4: find the clearest one-number deduction first.
  interface Candidate {
    action: HintAction;
    actionCells: number[];
    clueCells: number[];
    explanation: string;
    size: number;
  }
  const candidates: Candidate[] = [];

  for (let i = 0; i < width * height; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.state !== "revealed" || cell.adjacentMineCount === 0) continue;
    let flagged = 0;
    const hidden: number[] = [];
    for (const n of topo.neighbors(width, height, i)) {
      const nc = board.cells[n];
      if (nc.state === "flagged") flagged++;
      else if (nc.state === "hidden" || nc.state === "questioned") hidden.push(n);
    }
    const remaining = cell.adjacentMineCount - flagged;
    hidden.sort((a, b) => a - b);
    const hs = hidden.length === 1 ? "neighbour" : "neighbours";

    if (remaining === 0 && hidden.length > 0) {
      candidates.push({
        action: "reveal",
        actionCells: hidden,
        clueCells: [i],
        explanation: `This ${cell.adjacentMineCount} already has ${numbered(flagged, "flag")} beside it and needs ${numbered(remaining, "mine")}, so the ${hidden.length} hidden ${hs} are all safe.`,
        size: hidden.length,
      });
    } else if (remaining === hidden.length && hidden.length > 0) {
      candidates.push({
        action: "flag",
        actionCells: hidden,
        clueCells: [i],
        explanation: `This ${cell.adjacentMineCount} needs ${remaining} more ${numbered(remaining, "mine")} and has exactly ${hidden.length} hidden ${hs}, so each one is a mine.`,
        size: hidden.length,
      });
    }
  }
  candidates.sort((a, b) => a.size - b.size);
  if (candidates.length > 0) {
    const c = candidates[0];
    return {
      action: c.action,
      actionCells: c.actionCells,
      clueCells: c.clueCells,
      areaCells: [...area],
      explanation: c.explanation,
      level: "deduce",
    };
  }

  // Nothing trivially forced: fall back to the full solver (subset logic and
  // exact enumeration), which can still pin certain cells.
  const d = deduce(board, config);
  if (d.forcedSafe.length > 0 || d.forcedMines.length > 0) {
    const forced = d.forcedSafe.length > 0 ? d.forcedSafe : d.forcedMines;
    const action: HintAction = d.forcedSafe.length > 0 ? "reveal" : "flag";
    const sorted = [...forced].sort((a, b) => a - b);
    let explanation: string;
    if (questionMarks) {
      explanation =
        action === "reveal"
          ? "The revealed numbers nearby force a conclusion: a hidden cell here is safe for sure."
          : "The revealed numbers nearby force a conclusion: a hidden cell here is a mine for sure.";
    } else {
      explanation = "The revealed numbers nearby force a conclusion about these cells.";
    }
    return {
      action,
      actionCells: sorted,
      clueCells: [],
      areaCells: [...area],
      explanation,
      level: "deduce",
    };
  }

  // No forced move. Recommend the quietest guess: the frontier cell touching
  // the fewest revealed numbers is the least watched and the least risky.
  const risk = new Map<number, number>();
  for (let i = 0; i < width * height; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.state !== "revealed" || cell.adjacentMineCount === 0) continue;
    for (const n of topo.neighbors(width, height, i)) {
      const st = board.cells[n].state;
      if (st === "hidden" || st === "questioned") {
        risk.set(n, (risk.get(n) ?? 0) + 1);
      }
    }
  }
  const pick = frontier
    .map((i) => ({ i, risk: risk.get(i) ?? 0 }))
    .sort((a, b) => a.risk - b.risk || a.i - b.i)[0];
  if (!pick) return null;

  return {
    action: "reveal",
    actionCells: [pick.i],
    clueCells: [],
    areaCells: [...area],
    explanation: "No cell is forced yet. This one touches the fewest clues, so it is a reasonable guess.",
    level: "guess",
  };
}

function numbered(n: number, noun: string): string {
  return `${n} ${n === 1 ? noun : `${noun}s`}`;
}