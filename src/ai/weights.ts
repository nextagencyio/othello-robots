// Classic Othello positional weight table
// Corners are extremely valuable (can never be flipped)
// Squares adjacent to corners are dangerous (give opponent corner access)
export const POSITION_WEIGHTS: number[][] = [
  [ 100, -20,  10,   5,   5,  10, -20,  100],
  [ -20, -50,  -2,  -2,  -2,  -2, -50,  -20],
  [  10,  -2,   1,   1,   1,   1,  -2,   10],
  [   5,  -2,   1,   0,   0,   1,  -2,    5],
  [   5,  -2,   1,   0,   0,   1,  -2,    5],
  [  10,  -2,   1,   1,   1,   1,  -2,   10],
  [ -20, -50,  -2,  -2,  -2,  -2, -50,  -20],
  [ 100, -20,  10,   5,   5,  10, -20,  100],
];
