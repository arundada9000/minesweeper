/**
 * Board metrics: 3BV and related difficulty indicators.
 *
 * 3BV (Bechtel's Board Benchmark Value) is the minimum number of clicks
 * needed to clear a board assuming no mistakes: one click for each
 * connected zero-region, plus one for every numbered cell that is not
 * adjacent to any zero cell.
 */

import { getTopology, type GridTopologyId } from "./topology";
import type { Board } from "./types";

export interface BoardMetrics {
  /** Minimum clicks to clear this board, by its mine layout alone. */
  threeBV: number;
  /** Number of independent opening regions. */
  openings: number;
}

export function computeMetrics(board: Board, topologyId: GridTopologyId = "square"): BoardMetrics {
  const { width, height } = board;
  const topo = getTopology(topologyId);
  const total = width * height;
  const visited = new Uint8Array(total);

  let openings = 0;

  // Connected components of zero cells (each is one opening region).
  for (let i = 0; i < total; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.adjacentMineCount !== 0 || visited[i]) continue;
    openings++;
    const queue = [i];
    visited[i] = 1;
    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      for (const n of topo.neighbors(width, height, idx)) {
        const neighbor = board.cells[n];
        if (!neighbor.isMine && neighbor.adjacentMineCount === 0 && !visited[n]) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // Numbered cells with no zero neighbor need their own click.
  let isolatedNumbers = 0;
  for (let i = 0; i < total; i++) {
    const cell = board.cells[i];
    if (cell.isMine || cell.adjacentMineCount === 0 || visited[i]) continue;
    let touchesOpening = false;
    for (const n of topo.neighbors(width, height, i)) {
      const neighbor = board.cells[n];
      if (!neighbor.isMine && neighbor.adjacentMineCount === 0) {
        touchesOpening = true;
        break;
      }
    }
    if (!touchesOpening) isolatedNumbers++;
  }

  return { threeBV: openings + isolatedNumbers, openings };
}