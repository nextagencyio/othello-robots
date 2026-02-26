export const BOARD_SIZE = 8;
export const CELL_SIZE = 0.95;
export const CELL_HEIGHT = 0.1;
export const CELL_GAP = 0.05;
export const DISC_RADIUS = 0.38;
export const DISC_HEIGHT = 0.08;
export const DISC_SEGMENTS = 32;

export const BOARD_OFFSET = (BOARD_SIZE - 1) / 2; // 3.5

export const COLORS = {
  black: 0x1a1a2e,
  white: 0xe8e8e8,
  blackEdge: 0x2a2a4e,
  whiteEdge: 0xcccccc,
} as const;

export const TIMING = {
  placementDuration: 250,
  flipDuration: 400,
  flipStagger: 60,
  aiThinkingDelay: 500,
  aiThinkingDelayVariance: 300,
} as const;

export enum CellState {
  Empty = 0,
  Black = 1,
  White = 2,
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export interface Position {
  row: number;
  col: number;
}
