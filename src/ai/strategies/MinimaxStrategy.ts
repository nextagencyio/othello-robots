import { CellState, type Position } from '../../core/constants';
import type { Board } from '../../game/Board';
import { getValidMoves, applyMove } from '../../game/MoveValidator';
import { evaluate } from '../evaluation';
import type { AIStrategy } from '../AIPlayer';

export class MinimaxStrategy implements AIStrategy {
  private maxDepth: number;

  constructor(depth: number = 5) {
    this.maxDepth = depth;
  }

  pickMove(board: Board, player: CellState): Position {
    const moves = getValidMoves(board, player);
    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      const { newBoard } = applyMove(board, move.row, move.col, player);
      const score = this.minimax(
        newBoard,
        this.maxDepth - 1,
        -Infinity,
        Infinity,
        false,
        player
      );
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiPlayer: CellState
  ): number {
    const currentPlayer = isMaximizing
      ? aiPlayer
      : (aiPlayer === CellState.Black ? CellState.White : CellState.Black);

    const moves = getValidMoves(board, currentPlayer);

    if (depth === 0 || moves.length === 0) {
      // If current player has no moves, check if opponent does
      if (moves.length === 0) {
        const opponentPlayer = currentPlayer === CellState.Black
          ? CellState.White
          : CellState.Black;
        const opponentMoves = getValidMoves(board, opponentPlayer);
        if (opponentMoves.length === 0) {
          // Game over - return terminal evaluation
          const counts = board.countPieces();
          const aiCount = aiPlayer === CellState.Black ? counts.black : counts.white;
          const humanCount = aiPlayer === CellState.Black ? counts.white : counts.black;
          if (aiCount > humanCount) return 10000;
          if (aiCount < humanCount) return -10000;
          return 0;
        }
        // Pass: opponent plays next but polarity stays the same for minimax
        return this.minimax(board, depth - 1, alpha, beta, !isMaximizing, aiPlayer);
      }
      return evaluate(board, aiPlayer);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const { newBoard } = applyMove(board, move.row, move.col, currentPlayer);
        const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const { newBoard } = applyMove(board, move.row, move.col, currentPlayer);
        const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}
