import { Difficulty, CellState, type Position } from '../core/constants';
import type { Board } from '../game/Board';
import { RandomStrategy } from './strategies/RandomStrategy';
import { GreedyStrategy } from './strategies/GreedyStrategy';
import { MinimaxStrategy } from './strategies/MinimaxStrategy';

export interface AIStrategy {
  pickMove(board: Board, player: CellState): Position;
}

export class AIPlayer {
  private strategy: AIStrategy;

  constructor(difficulty: Difficulty) {
    switch (difficulty) {
      case Difficulty.Easy:
        this.strategy = new RandomStrategy();
        break;
      case Difficulty.Medium:
        this.strategy = new GreedyStrategy();
        break;
      case Difficulty.Hard:
        this.strategy = new MinimaxStrategy(5);
        break;
    }
  }

  pickMove(board: Board, player: CellState): Position {
    return this.strategy.pickMove(board, player);
  }
}
