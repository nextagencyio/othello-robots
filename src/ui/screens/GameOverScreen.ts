import type { Screen } from '../UIManager';
import { CellState } from '../../core/constants';

export class GameOverScreen implements Screen {
  private element: HTMLElement | null = null;

  constructor(
    private winner: CellState | null,
    private blackScore: number,
    private whiteScore: number,
    private onPlayAgain: () => void,
    private onMainMenu: () => void
  ) {}

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'screen game-over-overlay';

    let resultText: string;
    let resultClass: string;

    if (this.winner === CellState.Black) {
      resultText = 'YOU WIN!';
      resultClass = 'win';
    } else if (this.winner === CellState.White) {
      resultText = 'YOU LOSE!';
      resultClass = 'lose';
    } else {
      resultText = "IT'S A DRAW!";
      resultClass = 'draw';
    }

    this.element.innerHTML = `
      <div class="game-over-text ${resultClass}">${resultText}</div>
      <div class="game-over-score">${this.blackScore} - ${this.whiteScore}</div>
      <div class="game-over-buttons">
        <button class="btn btn-primary" id="play-again-btn">Play Again</button>
        <button class="btn btn-secondary" id="main-menu-btn">Main Menu</button>
      </div>
    `;

    container.appendChild(this.element);

    this.element.style.opacity = '0';
    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
    });

    this.element.querySelector('#play-again-btn')!.addEventListener('click', () => {
      this.onPlayAgain();
    });

    this.element.querySelector('#main-menu-btn')!.addEventListener('click', () => {
      this.onMainMenu();
    });
  }

  hide(): void {
    if (this.element) {
      this.element.classList.add('hidden');
    }
  }

  dispose(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
