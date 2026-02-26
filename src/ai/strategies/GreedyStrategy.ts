import { CellState, type Position } from '../../core/constants';
import type { Board } from '../../game/Board';
import { getValidMoves } from '../../game/MoveValidator';
import { POSITION_WEIGHTS } from '../weights';
import type { AIStrategy } from '../AIPlayer';

export class GreedyStrategy implements AIStrategy {
  pickMove(board: Board, player: CellState): Position {
    const moves = getValidMoves(board, player);
    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      // Add small random factor to avoid being fully predictable
      const score = POSITION_WEIGHTS[move.row][move.col] + Math.random() * 3;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }
}
