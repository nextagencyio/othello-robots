import type { Screen } from '../UIManager';
import { Difficulty } from '../../core/constants';

export class DifficultyScreen implements Screen {
  private element: HTMLElement | null = null;
  private onSelect: (difficulty: Difficulty) => void;
  private onBack: () => void;

  constructor(onSelect: (difficulty: Difficulty) => void, onBack: () => void) {
    this.onSelect = onSelect;
    this.onBack = onBack;
  }

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'screen';
    this.element.style.background = 'radial-gradient(ellipse at center, rgba(10,10,26,0.95) 0%, rgba(10,10,26,1) 100%)';

    this.element.innerHTML = `
      <button class="back-btn" id="back-btn">&larr; Back</button>
      <div class="section-label">Select Difficulty</div>
      <div class="difficulty-grid">
        <button class="difficulty-btn easy" data-diff="easy">
          <span class="diff-label">EASY</span>
          <span class="diff-desc">Random moves</span>
        </button>
        <button class="difficulty-btn medium" data-diff="medium">
          <span class="diff-label">MEDIUM</span>
          <span class="diff-desc">Thinks a little</span>
        </button>
        <button class="difficulty-btn hard" data-diff="hard">
          <span class="diff-label">HARD</span>
          <span class="diff-desc">Thinks a lot</span>
        </button>
      </div>
    `;

    container.appendChild(this.element);

    this.element.style.opacity = '0';
    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
    });

    this.element.querySelectorAll('.difficulty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const diff = (btn as HTMLElement).dataset.diff as Difficulty;
        this.onSelect(diff);
      });
    });

    this.element.querySelector('#back-btn')!.addEventListener('click', () => {
      this.onBack();
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
