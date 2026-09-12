/**
 * Grid topology abstraction.
 *
 * All neighbor relationships flow through a topology so the engine never
 * hard-codes "eight neighbors". Future modes (hex, cylinder, triangle)
 * plug in without touching reveal/generation logic.
 */

export type GridTopologyId = "square" | "cylinder";

export interface GridTopology {
  readonly id: GridTopologyId;
  /**
   * Return the neighbor cell indices of `index`, in a stable order,
   * honoring wrap rules for this topology.
   */
  neighbors(width: number, height: number, index: number): readonly number[];
}

/** Classic square grid with a perimeter (no wrap). */
export const squareTopology: GridTopology = {
  id: "square",
  neighbors(width, height, index) {
    const x = index % width;
    const y = Math.floor(index / width);
    const out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        out.push(ny * width + nx);
      }
    }
    return out;
  },
};

/** Square grid where the left and right edges connect (a cylinder). */
export const cylinderTopology: GridTopology = {
  id: "cylinder",
  neighbors(width, height, index) {
    const x = index % width;
    const y = Math.floor(index / width);
    const out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (((x + dx) % width) + width) % width;
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        out.push(ny * width + nx);
      }
    }
    return out;
  },
};

export const topologies: Record<GridTopologyId, GridTopology> = {
  square: squareTopology,
  cylinder: cylinderTopology,
};

export function getTopology(id: GridTopologyId): GridTopology {
  const t = topologies[id];
  if (!t) throw new Error(`Unknown topology: ${id}`);
  return t;
}