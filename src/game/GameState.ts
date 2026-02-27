import { CellState, type Position } from '../core/constants';
import { Board } from './Board';
import { getValidMoves, getFlippedDiscs } from './MoveValidator';

export interface MoveResult {
  placed: Position;
  flipped: Position[];
}

export class GameState {
  board: Board;
  currentPlayer: CellState;
  gameOver: boolean;
  winner: CellState | null;
  consecutivePasses: number;

  constructor() {
    this.board = new Board();
    this.currentPlayer = CellState.Black; // Black always goes first
    this.gameOver = false;
    this.winner = null;
    this.consecutivePasses = 0;
  }

  getValidMovesForCurrent(): Position[] {
    return getValidMoves(this.board, this.currentPlayer);
  }

  makeMove(row: number, col: number): MoveResult | null {
    if (this.gameOver) return null;

    const flipped = getFlippedDiscs(this.board, row, col, this.currentPlayer);
    if (flipped.length === 0) return null;

    this.board.setCell(row, col, this.currentPlayer);
    for (const pos of flipped) {
      this.board.setCell(pos.row, pos.col, this.currentPlayer);
    }

    this.consecutivePasses = 0;
    const result: MoveResult = { placed: { row, col }, flipped };

    this.switchTurn();
    return result;
  }

  passTurn(): boolean {
    if (this.gameOver) return false;
    if (this.getValidMovesForCurrent().length > 0) return false;

    this.consecutivePasses++;
    if (this.consecutivePasses >= 2) {
      this.endGame();
      return true;
    }

    this.switchTurn();
    return true;
  }

  private switchTurn(): void {
    this.currentPlayer =
      this.currentPlayer === CellState.Black ? CellState.White : CellState.Black;

    // Check if next player has moves
    if (this.getValidMovesForCurrent().length === 0) {
      this.consecutivePasses++;
      if (this.consecutivePasses >= 2) {
        this.endGame();
        return;
      }
      // Pass back to previous player
      this.currentPlayer =
        this.currentPlayer === CellState.Black ? CellState.White : CellState.Black;

      // If they also have no moves, game is over
      if (this.getValidMovesForCurrent().length === 0) {
        this.consecutivePasses++;
        this.endGame();
      }
    } else {
      this.consecutivePasses = 0;
    }
  }

  private endGame(): void {
    this.gameOver = true;
    const counts = this.board.countPieces();
    if (counts.black > counts.white) {
      this.winner = CellState.Black;
    } else if (counts.white > counts.black) {
      this.winner = CellState.White;
    } else {
      this.winner = null; // draw
    }
  }

  isBoardFull(): boolean {
    const counts = this.board.countPieces();
    return counts.empty === 0;
  }
}
