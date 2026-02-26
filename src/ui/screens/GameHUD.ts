import type { Screen } from '../UIManager';
import { CellState } from '../../core/constants';

export class GameHUD implements Screen {
  private element: HTMLElement | null = null;
  private blackScoreEl: HTMLElement | null = null;
  private whiteScoreEl: HTMLElement | null = null;
  private turnEl: HTMLElement | null = null;
  private onMenu: () => void;
  private robotName: string;

  constructor(onMenu: () => void, robotName: string = 'Robot') {
    this.onMenu = onMenu;
    this.robotName = robotName;
  }

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'hud';

    this.element.innerHTML = `
      <div class="hud-score">
        <div class="score-black">
          <span class="score-disc black"></span>
          <span class="score-label">You</span>
          <span id="score-black-val">2</span>
        </div>
        <div class="score-white">
          <span class="score-disc white"></span>
          <span class="score-label">${this.robotName}</span>
          <span id="score-white-val">2</span>
        </div>
      </div>
      <div class="turn-indicator" id="turn-indicator">Your Turn</div>
      <button class="hud-menu-btn" id="hud-menu-btn">Menu</button>
    `;

    container.appendChild(this.element);
    this.blackScoreEl = this.element.querySelector('#score-black-val');
    this.whiteScoreEl = this.element.querySelector('#score-white-val');
    this.turnEl = this.element.querySelector('#turn-indicator');

    this.element.querySelector('#hud-menu-btn')!.addEventListener('click', () => {
      this.onMenu();
    });
  }

  updateScore(black: number, white: number): void {
    if (this.blackScoreEl) this.blackScoreEl.textContent = String(black);
    if (this.whiteScoreEl) this.whiteScoreEl.textContent = String(white);
  }

  updateTurn(player: CellState): void {
    if (this.turnEl) {
      if (player === CellState.Black) {
        this.turnEl.textContent = 'Your Turn';
        this.turnEl.style.color = '#00e5ff';
      } else {
        this.turnEl.textContent = 'Robot Thinking...';
        this.turnEl.style.color = '#ff6b35';
      }
    }
  }

  hide(): void {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  dispose(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
