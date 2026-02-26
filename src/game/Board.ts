import { BOARD_SIZE, CellState } from '../core/constants';

export class Board {
  cells: CellState[][];

  constructor() {
    this.cells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      this.cells[r] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        this.cells[r][c] = CellState.Empty;
      }
    }
    // Standard Othello starting position
    const mid = BOARD_SIZE / 2;
    this.cells[mid - 1][mid - 1] = CellState.White;
    this.cells[mid - 1][mid] = CellState.Black;
    this.cells[mid][mid - 1] = CellState.Black;
    this.cells[mid][mid] = CellState.White;
  }

  clone(): Board {
    const copy = new Board();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        copy.cells[r][c] = this.cells[r][c];
      }
    }
    return copy;
  }

  getCell(row: number, col: number): CellState {
    return this.cells[row][col];
  }

  setCell(row: number, col: number, state: CellState): void {
    this.cells[row][col] = state;
  }

  countPieces(): { black: number; white: number; empty: number } {
    let black = 0;
    let white = 0;
    let empty = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        switch (this.cells[r][c]) {
          case CellState.Black: black++; break;
          case CellState.White: white++; break;
          default: empty++; break;
        }
      }
    }
    return { black, white, empty };
  }
}
