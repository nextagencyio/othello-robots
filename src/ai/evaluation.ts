import { BOARD_SIZE, CellState } from '../core/constants';
import type { Board } from '../game/Board';
import { getValidMoves } from '../game/MoveValidator';
import { POSITION_WEIGHTS } from './weights';

const CORNERS: [number, number][] = [[0, 0], [0, 7], [7, 0], [7, 7]];

export function evaluate(board: Board, aiPlayer: CellState): number {
  const humanPlayer = aiPlayer === CellState.Black ? CellState.White : CellState.Black;
  const counts = board.countPieces();
  const totalPieces = counts.black + counts.white;
  const aiCount = aiPlayer === CellState.Black ? counts.black : counts.white;
  const humanCount = aiPlayer === CellState.Black ? counts.white : counts.black;

  // 1. Corner occupancy (very important)
  let cornerScore = 0;
  for (const [r, c] of CORNERS) {
    const cell = board.getCell(r, c);
    if (cell === aiPlayer) cornerScore += 25;
    else if (cell === humanPlayer) cornerScore -= 25;
  }

  // 2. Mobility (number of legal moves)
  const aiMoves = getValidMoves(board, aiPlayer).length;
  const humanMoves = getValidMoves(board, humanPlayer).length;
  let mobilityScore = 0;
  if (aiMoves + humanMoves > 0) {
    mobilityScore = 100 * (aiMoves - humanMoves) / (aiMoves + humanMoves);
  }

  // 3. Positional weight score
  let positionalScore = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board.getCell(r, c);
      if (cell === aiPlayer) positionalScore += POSITION_WEIGHTS[r][c];
      else if (cell === humanPlayer) positionalScore -= POSITION_WEIGHTS[r][c];
    }
  }

  // 4. Disc difference (matters more in endgame)
  let discScore = 0;
  if (aiCount + humanCount > 0) {
    discScore = 100 * (aiCount - humanCount) / (aiCount + humanCount);
  }

  // Weight factors - mobility matters more early, disc count matters late
  const gameProgress = totalPieces / 64;
  const mobilityWeight = 5 * (1 - gameProgress);
  const discWeight = 5 * gameProgress;

  return cornerScore * 10 + mobilityScore * mobilityWeight +
    positionalScore * 0.5 + discScore * discWeight;
}
