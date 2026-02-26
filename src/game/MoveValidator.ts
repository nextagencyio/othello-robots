import { BOARD_SIZE, CellState, type Position } from '../core/constants';
import type { Board } from './Board';

const DIRECTIONS: Position[] = [
  { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
  { row: 0, col: -1 },                        { row: 0, col: 1 },
  { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
];

function opponent(player: CellState): CellState {
  return player === CellState.Black ? CellState.White : CellState.Black;
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getFlippedDiscs(
  board: Board,
  row: number,
  col: number,
  player: CellState
): Position[] {
  if (board.getCell(row, col) !== CellState.Empty) return [];

  const opp = opponent(player);
  const allFlipped: Position[] = [];

  for (const dir of DIRECTIONS) {
    const line: Position[] = [];
    let r = row + dir.row;
    let c = col + dir.col;

    while (inBounds(r, c) && board.getCell(r, c) === opp) {
      line.push({ row: r, col: c });
      r += dir.row;
      c += dir.col;
    }

    if (line.length > 0 && inBounds(r, c) && board.getCell(r, c) === player) {
      allFlipped.push(...line);
    }
  }

  return allFlipped;
}

export function isValidMove(
  board: Board,
  row: number,
  col: number,
  player: CellState
): boolean {
  return getFlippedDiscs(board, row, col, player).length > 0;
}

export function getValidMoves(board: Board, player: CellState): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, r, c, player)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

export function applyMove(
  board: Board,
  row: number,
  col: number,
  player: CellState
): { newBoard: Board; flipped: Position[] } {
  const flipped = getFlippedDiscs(board, row, col, player);
  const newBoard = board.clone();
  newBoard.setCell(row, col, player);
  for (const pos of flipped) {
    newBoard.setCell(pos.row, pos.col, player);
  }
  return { newBoard, flipped };
}
