import type { Screen } from '../UIManager';
import type { Robot } from '../../robots/Robot';
import { ROBOTS } from '../../robots/robotRegistry';
import { generateRobotPreview } from '../../robots/RobotSpriteGenerator';

export class RobotSelectScreen implements Screen {
  private element: HTMLElement | null = null;
  private onSelect: (robot: Robot) => void;
  private onBack: () => void;

  constructor(onSelect: (robot: Robot) => void, onBack: () => void) {
    this.onSelect = onSelect;
    this.onBack = onBack;
  }

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'screen';
    this.element.style.background = 'radial-gradient(ellipse at center, rgba(10,10,26,0.95) 0%, rgba(10,10,26,1) 100%)';

    const cardsHtml = ROBOTS.map(
      (robot) => `
      <div class="card" data-robot-id="${robot.id}">
        <div class="robot-preview" id="preview-${robot.id}"></div>
        <div class="card-name" style="color: ${robot.primaryColor}">${robot.name}</div>
        <div class="card-desc">${robot.tagline}</div>
      </div>
    `
    ).join('');

    this.element.innerHTML = `
      <button class="back-btn" id="back-btn">&larr; Back</button>
      <div class="section-label">Choose Your Opponent</div>
      <div class="card-grid">${cardsHtml}</div>
    `;

    container.appendChild(this.element);

    // Generate robot previews
    for (const robot of ROBOTS) {
      const previewContainer = this.element.querySelector(`#preview-${robot.id}`);
      if (previewContainer) {
        const canvas = generateRobotPreview(robot, 100, 120);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        previewContainer.appendChild(canvas);
      }
    }

    // Animate in
    this.element.style.opacity = '0';
    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
    });

    // Event listeners
    this.element.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', () => {
        const robotId = (card as HTMLElement).dataset.robotId;
        const robot = ROBOTS.find((r) => r.id === robotId);
        if (robot) this.onSelect(robot);
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
