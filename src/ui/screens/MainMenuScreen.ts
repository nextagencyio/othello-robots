import type { Screen } from '../UIManager';

export class MainMenuScreen implements Screen {
  private element: HTMLElement | null = null;
  private onPlay: () => void;
  private onTutorial: () => void;

  constructor(onPlay: () => void, onTutorial: () => void) {
    this.onPlay = onPlay;
    this.onTutorial = onTutorial;
  }

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'screen';
    this.element.style.background = 'radial-gradient(ellipse at center, rgba(10,10,26,0.95) 0%, rgba(10,10,26,1) 100%)';

    this.element.innerHTML = `
      <div class="title">OTHELLO</div>
      <div class="subtitle">ROBOTS</div>
      <div class="menu-buttons">
        <button class="btn btn-primary" id="play-btn">PLAY</button>
        <button class="btn btn-secondary" id="tutorial-btn">HOW TO PLAY</button>
      </div>
    `;

    container.appendChild(this.element);

    // Animate in
    this.element.style.opacity = '0';
    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
    });

    this.element.querySelector('#play-btn')!.addEventListener('click', () => {
      this.onPlay();
    });
    this.element.querySelector('#tutorial-btn')!.addEventListener('click', () => {
      this.onTutorial();
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
