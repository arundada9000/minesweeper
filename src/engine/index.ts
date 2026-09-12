/**
 * Public engine API. The UI layer imports from "@engine" only.
 */

export {
  GameEngine,
  BoardConfigError,
  type RevealResult,
  type EngineState,
} from "./game";
export type { Board, BoardConfig, Cell, CellState, GamePhase, ModeDefinition, ModeId, Seed } from "./types";
export type { GridTopology, GridTopologyId } from "./topology";
export { squareTopology, cylinderTopology, topologies, getTopology } from "./topology";
export {
  generateBoard,
  deserializeBoard,
  validateConfig,
  validateDimensions,
  validateMineCount,
  neighborCells,
  MIN_DIMENSION,
  MAX_DIMENSION,
  MAX_CELLS,
  MAX_MINE_RATIO,
} from "./board";
export {
  revealCell,
  floodReveal,
  chordTargets,
  chordReveal,
  cycleFlag,
  type FloodResult,
} from "./actions";
export {
  createRng,
  mulberry32,
  hashSeed,
  randomSeed,
  puzzleId,
  shuffle,
  type Rng,
} from "./rng";
export {
  CLASSIC_PRESETS,
  CUSTOM_DEFAULTS,
  getPreset,
  clampCustom,
  type ClassicPreset,
  type ClassicPresetId,
} from "./presets";
export {
  MODES,
  MODE_LIST,
  getMode,
} from "./modes";
export {
  deduce,
  boardIsLogical,
  generateNoGuessBoard,
  type Deduction,
  type NoGuessOptions,
} from "./solver";
export {
  computeMetrics,
  type BoardMetrics,
} from "./metrics";