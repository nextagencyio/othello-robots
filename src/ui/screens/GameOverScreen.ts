import type { Screen } from '../UIManager';
import { CellState } from '../../core/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  gravity: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle' | 'star';
}

const WIN_COLORS = ['#76ff03', '#00e5ff', '#ffeb3b', '#ff6b35', '#e040fb', '#fff'];
const LOSE_COLORS = ['#ff1744', '#b71c1c', '#880e4f', '#4a148c'];
const DRAW_COLORS = ['#ff6b35', '#ffab00', '#00e5ff', '#7c4dff'];

export class GameOverScreen implements Screen {
  private element: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private particles: Particle[] = [];
  private animFrame = 0;
  private startTime = 0;

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
      <canvas class="celebration-canvas" id="celebration-canvas"></canvas>
      <div class="game-over-content">
        <div class="game-over-text ${resultClass}" id="go-text">${resultText}</div>
        <div class="game-over-score" id="go-score">${this.blackScore} - ${this.whiteScore}</div>
        <div class="game-over-buttons" id="go-buttons">
          <button class="btn btn-primary" id="play-again-btn">Play Again</button>
          <button class="btn btn-secondary" id="main-menu-btn">Main Menu</button>
        </div>
      </div>
    `;

    container.appendChild(this.element);
    this.canvas = this.element.querySelector('#celebration-canvas') as HTMLCanvasElement;

    // Size canvas to viewport
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Animate in with staggered reveals
    this.element.style.opacity = '0';
    const textEl = this.element.querySelector('#go-text') as HTMLElement;
    const scoreEl = this.element.querySelector('#go-score') as HTMLElement;
    const buttonsEl = this.element.querySelector('#go-buttons') as HTMLElement;

    textEl.style.opacity = '0';
    textEl.style.transform = 'scale(0.3) translateY(30px)';
    textEl.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    scoreEl.style.opacity = '0';
    scoreEl.style.transform = 'translateY(20px)';
    scoreEl.style.transition = 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s';
    buttonsEl.style.opacity = '0';
    buttonsEl.style.transform = 'translateY(20px)';
    buttonsEl.style.transition = 'opacity 0.4s ease 0.6s, transform 0.4s ease 0.6s';

    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
      requestAnimationFrame(() => {
        textEl.style.opacity = '1';
        textEl.style.transform = 'scale(1) translateY(0)';
        scoreEl.style.opacity = '1';
        scoreEl.style.transform = 'translateY(0)';
        buttonsEl.style.opacity = '1';
        buttonsEl.style.transform = 'translateY(0)';
      });
    });

    // Launch celebration particles
    this.startTime = performance.now();
    if (this.winner === CellState.Black) {
      this.launchConfetti(WIN_COLORS, 120);
    } else if (this.winner === CellState.White) {
      this.launchFallingParticles(LOSE_COLORS, 40);
    } else {
      this.launchConfetti(DRAW_COLORS, 60);
    }
    this.animate();

    // Event listeners
    this.element.querySelector('#play-again-btn')!.addEventListener('click', () => {
      this.onPlayAgain();
    });
    this.element.querySelector('#main-menu-btn')!.addEventListener('click', () => {
      this.onMainMenu();
    });
  }

  private launchConfetti(colors: string[], count: number): void {
    const w = this.canvas!.width;
    const h = this.canvas!.height;

    // Initial burst from center
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h * 0.35 + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.08 + Math.random() * 0.04,
        life: 0,
        maxLife: 120 + Math.random() * 80,
        shape: ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
      });
    }

    // Side cannons
    for (let side = 0; side < 2; side++) {
      const originX = side === 0 ? w * 0.1 : w * 0.9;
      const dirX = side === 0 ? 1 : -1;
      for (let i = 0; i < count / 3; i++) {
        this.particles.push({
          x: originX,
          y: h * 0.7,
          vx: dirX * (2 + Math.random() * 5),
          vy: -(4 + Math.random() * 6),
          size: 3 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.4,
          gravity: 0.1 + Math.random() * 0.04,
          life: 0,
          maxLife: 100 + Math.random() * 60,
          shape: ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
        });
      }
    }
  }

  private launchFallingParticles(colors: string[], count: number): void {
    const w = this.canvas!.width;
    // Slow drifting particles for lose/draw
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        gravity: 0,
        life: 0,
        maxLife: 200 + Math.random() * 100,
        shape: 'circle',
      });
    }
  }

  private animate = (): void => {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const elapsed = performance.now() - this.startTime;

    // Spawn additional confetti bursts for wins
    if (this.winner === CellState.Black && elapsed < 3000 && Math.random() < 0.15) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.particles.push({
          x: Math.random() * w,
          y: h * 0.2 + Math.random() * h * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 3 + Math.random() * 6,
          color: WIN_COLORS[Math.floor(Math.random() * WIN_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
          gravity: 0.07,
          life: 0,
          maxLife: 100 + Math.random() * 60,
          shape: ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
        });
      }
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.995;
      p.rotation += p.rotSpeed;

      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Star
        this.drawStar(ctx, 0, 0, p.size / 2);
      }
      ctx.restore();
    }

    this.animFrame = requestAnimationFrame(this.animate);
  };

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();
  }

  hide(): void {
    if (this.element) {
      this.element.classList.add('hidden');
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.animFrame);
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.canvas = null;
    this.particles = [];
  }
}
