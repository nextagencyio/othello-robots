import { CellState, BOARD_SIZE, type Position } from '../../core/constants';
import type { Board } from '../../game/Board';
import { getValidMoves } from '../../game/MoveValidator';
import type { AIStrategy } from '../AIPlayer';

export class MinimaxStrategy implements AIStrategy {
  private maxDepth: number;

  constructor(depth: number = 4) {
    this.maxDepth = depth;
  }

  pickMove(board: Board, player: CellState): Position {
    const moves = getValidMoves(board, player);
    if (moves.length === 1) return moves[0];

    // Order moves to improve alpha-beta pruning (corners first, edges next)
    const orderedMoves = this.orderMoves(moves);

    let bestScore = -Infinity;
    let bestMove = orderedMoves[0];

    for (const move of orderedMoves) {
      const newCells = this.applyMoveFlat(board.cells, move.row, move.col, player);
      const score = this.minimax(
        newCells,
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

  private orderMoves(moves: Position[]): Position[] {
    return moves.slice().sort((a, b) => {
      const scoreA = this.moveOrderScore(a.row, a.col);
      const scoreB = this.moveOrderScore(b.row, b.col);
      return scoreB - scoreA;
    });
  }

  private moveOrderScore(row: number, col: number): number {
    // Corners are best, edges are good, X-squares are bad
    const isCorner = (row === 0 || row === 7) && (col === 0 || col === 7);
    if (isCorner) return 100;
    const isXSquare = (row === 1 || row === 6) && (col === 1 || col === 6);
    if (isXSquare) return -50;
    const isEdge = row === 0 || row === 7 || col === 0 || col === 7;
    if (isEdge) return 10;
    return 0;
  }

  // Flat array board operations to avoid object allocation
  private applyMoveFlat(cells: CellState[][], row: number, col: number, player: CellState): CellState[][] {
    const newCells: CellState[][] = new Array(BOARD_SIZE);
    for (let r = 0; r < BOARD_SIZE; r++) {
      newCells[r] = cells[r].slice();
    }
    newCells[row][col] = player;

    const opponent = player === CellState.Black ? CellState.White : CellState.Black;
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      const toFlip: [number, number][] = [];
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newCells[r][c] === opponent) {
        toFlip.push([r, c]);
        r += dr;
        c += dc;
      }
      if (toFlip.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newCells[r][c] === player) {
        for (const [fr, fc] of toFlip) {
          newCells[fr][fc] = player;
        }
      }
    }

    return newCells;
  }

  private getValidMovesFast(cells: CellState[][], player: CellState): Position[] {
    const moves: Position[] = [];
    const opponent = player === CellState.Black ? CellState.White : CellState.Black;
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (cells[row][col] !== CellState.Empty) continue;

        for (const [dr, dc] of dirs) {
          let r = row + dr;
          let c = col + dc;
          let found = false;
          while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && cells[r][c] === opponent) {
            r += dr;
            c += dc;
            found = true;
          }
          if (found && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && cells[r][c] === player) {
            moves.push({ row, col });
            break;
          }
        }
      }
    }
    return moves;
  }

  private evaluateFast(cells: CellState[][], aiPlayer: CellState): number {
    const humanPlayer = aiPlayer === CellState.Black ? CellState.White : CellState.Black;
    let aiCount = 0;
    let humanCount = 0;
    let positionalScore = 0;
    let cornerScore = 0;

    // Combined loop for counts and positional scoring
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = cells[r][c];
        if (cell === aiPlayer) {
          aiCount++;
          positionalScore += POSITION_WEIGHTS[r][c];
        } else if (cell === humanPlayer) {
          humanCount++;
          positionalScore -= POSITION_WEIGHTS[r][c];
        }
      }
    }

    // Corner score
    const corners: [number, number][] = [[0,0],[0,7],[7,0],[7,7]];
    for (const [r, c] of corners) {
      if (cells[r][c] === aiPlayer) cornerScore += 25;
      else if (cells[r][c] === humanPlayer) cornerScore -= 25;
    }

    // Mobility
    const aiMoves = this.getValidMovesFast(cells, aiPlayer).length;
    const humanMoves = this.getValidMovesFast(cells, humanPlayer).length;
    let mobilityScore = 0;
    if (aiMoves + humanMoves > 0) {
      mobilityScore = 100 * (aiMoves - humanMoves) / (aiMoves + humanMoves);
    }

    // Disc difference
    let discScore = 0;
    const total = aiCount + humanCount;
    if (total > 0) {
      discScore = 100 * (aiCount - humanCount) / total;
    }

    const gameProgress = total / 64;
    const mobilityWeight = 5 * (1 - gameProgress);
    const discWeight = 5 * gameProgress;

    return cornerScore * 10 + mobilityScore * mobilityWeight +
      positionalScore * 0.5 + discScore * discWeight;
  }

  private minimax(
    cells: CellState[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiPlayer: CellState
  ): number {
    const currentPlayer = isMaximizing
      ? aiPlayer
      : (aiPlayer === CellState.Black ? CellState.White : CellState.Black);

    const moves = this.getValidMovesFast(cells, currentPlayer);

    if (depth === 0) {
      return this.evaluateFast(cells, aiPlayer);
    }

    if (moves.length === 0) {
      const opponentPlayer = currentPlayer === CellState.Black
        ? CellState.White
        : CellState.Black;
      const opponentMoves = this.getValidMovesFast(cells, opponentPlayer);
      if (opponentMoves.length === 0) {
        // Game over - terminal evaluation
        let aiCount = 0;
        let humanCount = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (cells[r][c] === aiPlayer) aiCount++;
            else if (cells[r][c] !== CellState.Empty) humanCount++;
          }
        }
        if (aiCount > humanCount) return 10000;
        if (aiCount < humanCount) return -10000;
        return 0;
      }
      // Pass to opponent
      return this.minimax(cells, depth - 1, alpha, beta, !isMaximizing, aiPlayer);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newCells = this.applyMoveFlat(cells, move.row, move.col, currentPlayer);
        const evalScore = this.minimax(newCells, depth - 1, alpha, beta, false, aiPlayer);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newCells = this.applyMoveFlat(cells, move.row, move.col, currentPlayer);
        const evalScore = this.minimax(newCells, depth - 1, alpha, beta, true, aiPlayer);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}

// Inline position weights to avoid import in hot path
const POSITION_WEIGHTS = [
  [100, -20, 10,  5,  5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [ 10,  -2,  5,  1,  1,  5,  -2,  10],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [ 10,  -2,  5,  1,  1,  5,  -2,  10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10,  5,  5, 10, -20, 100],
];
