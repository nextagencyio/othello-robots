import { CellState, type Position } from '../../core/constants';
import type { Board } from '../../game/Board';
import { getValidMoves } from '../../game/MoveValidator';
import type { AIStrategy } from '../AIPlayer';

export class RandomStrategy implements AIStrategy {
  pickMove(board: Board, player: CellState): Position {
    const moves = getValidMoves(board, player);
    return moves[Math.floor(Math.random() * moves.length)];
  }
}
