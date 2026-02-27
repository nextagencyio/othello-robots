import type { Screen } from '../UIManager';

interface TutorialStep {
  title: string;
  text: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

// Mini-board drawing helpers
const CELL = 32;

function drawMiniBoard(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  rows: number, cols: number,
  highlights?: { r: number; c: number; color: string }[]
) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * CELL;
      const y = oy + r * CELL;
      const isLight = (r + c) % 2 === 0;
      ctx.fillStyle = isLight ? '#2d8b4e' : '#256b3b';
      ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = '#1a5c30';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, CELL, CELL);
    }
  }
  // Draw highlights
  if (highlights) {
    for (const h of highlights) {
      const x = ox + h.c * CELL;
      const y = oy + h.r * CELL;
      ctx.fillStyle = h.color;
      ctx.fillRect(x, y, CELL, CELL);
    }
  }
}

function drawDisc(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  r: number, c: number,
  color: 'black' | 'white'
) {
  const cx = ox + c * CELL + CELL / 2;
  const cy = oy + r * CELL + CELL / 2;
  ctx.fillStyle = color === 'black' ? '#1a1a2e' : '#e8e8e8';
  ctx.beginPath();
  ctx.arc(cx, cy, CELL * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color === 'black' ? '#3a3a5e' : '#ccc';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string
) {
  const headLen = 8;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
}

// ===== Tutorial steps =====

const STEPS: TutorialStep[] = [
  // Step 1: Welcome & Objective
  {
    title: 'Welcome, Human!',
    text: 'In Othello, you compete against a robot opponent on an 8x8 board. Place dark discs to capture the robot\'s light discs. Whoever has more discs when the board is full wins!',
    draw(ctx, w, h) {
      const ox = (w - 8 * CELL) / 2;
      const oy = (h - 8 * CELL) / 2;
      drawMiniBoard(ctx, ox, oy, 8, 8);
      // Draw some scattered pieces to show a mid-game board
      const pieces: [number, number, 'black' | 'white'][] = [
        [2, 3, 'black'], [2, 4, 'black'], [2, 5, 'white'],
        [3, 2, 'black'], [3, 3, 'black'], [3, 4, 'black'], [3, 5, 'white'],
        [4, 2, 'white'], [4, 3, 'white'], [4, 4, 'black'], [4, 5, 'black'],
        [5, 3, 'white'], [5, 4, 'white'], [5, 5, 'white'],
        [3, 6, 'black'],
      ];
      for (const [r, c, col] of pieces) {
        drawDisc(ctx, ox, oy, r, c, col);
      }
      // Score labels
      ctx.font = 'bold 14px Bangers, sans-serif';
      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'left';
      ctx.fillText('You: 8', ox, oy - 10);
      ctx.fillStyle = '#ff6b35';
      ctx.textAlign = 'right';
      ctx.fillText('Robot: 7', ox + 8 * CELL, oy - 10);
    },
  },

  // Step 2: Starting Position
  {
    title: 'The Starting Board',
    text: 'Every game begins with 4 discs in the center: 2 dark (yours) and 2 light (the robot\'s), placed diagonally. Dark always moves first.',
    draw(ctx, w, h) {
      const ox = (w - 8 * CELL) / 2;
      const oy = (h - 8 * CELL) / 2;
      drawMiniBoard(ctx, ox, oy, 8, 8);
      // Starting position
      drawDisc(ctx, ox, oy, 3, 3, 'white');
      drawDisc(ctx, ox, oy, 3, 4, 'black');
      drawDisc(ctx, ox, oy, 4, 3, 'black');
      drawDisc(ctx, ox, oy, 4, 4, 'white');
      // Highlight center
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 3 * CELL - 2, oy + 3 * CELL - 2, CELL * 2 + 4, CELL * 2 + 4);
      // Label
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'center';
      ctx.fillText('Starting position', ox + 4 * CELL, oy + 8 * CELL + 18);
    },
  },

  // Step 3: How to place a disc
  {
    title: 'Making a Move',
    text: 'Place your disc so it "sandwiches" one or more of the robot\'s discs between your new disc and another of yours. The sandwiched discs flip to your color!',
    draw(ctx, w, h) {
      const ox = (w - 5 * CELL) / 2;
      const oy = (h - 3 * CELL) / 2 - 10;
      // Before
      ctx.font = 'bold 13px Bangers, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'center';
      ctx.fillText('Before', ox + 2.5 * CELL, oy - 12);
      drawMiniBoard(ctx, ox, oy, 1, 5);
      drawDisc(ctx, ox, oy, 0, 0, 'black');
      drawDisc(ctx, ox, oy, 0, 1, 'white');
      drawDisc(ctx, ox, oy, 0, 2, 'white');
      // Empty cell 3 highlighted as valid move
      ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.fillRect(ox + 3 * CELL, oy, CELL, CELL);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 3 * CELL, oy, CELL, CELL);
      // Arrow pointing to placement
      drawArrow(ctx,
        ox + 3 * CELL + CELL / 2, oy - 16,
        ox + 3 * CELL + CELL / 2, oy + 4,
        '#76ff03'
      );
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillStyle = '#76ff03';
      ctx.fillText('Place here', ox + 3 * CELL + CELL / 2, oy - 20);

      // After
      const oy2 = oy + CELL + 40;
      ctx.font = 'bold 13px Bangers, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'center';
      ctx.fillText('After', ox + 2.5 * CELL, oy2 - 12);
      drawMiniBoard(ctx, ox, oy2, 1, 5);
      drawDisc(ctx, ox, oy2, 0, 0, 'black');
      drawDisc(ctx, ox, oy2, 0, 1, 'black');  // flipped!
      drawDisc(ctx, ox, oy2, 0, 2, 'black');  // flipped!
      drawDisc(ctx, ox, oy2, 0, 3, 'black');  // newly placed
      // Flip indicators
      ctx.font = '10px Outfit, sans-serif';
      ctx.fillStyle = '#ff6b35';
      ctx.textAlign = 'center';
      ctx.fillText('flipped!', ox + 1.5 * CELL + CELL / 2, oy2 + CELL + 14);
    },
  },

  // Step 4: Multi-directional flipping
  {
    title: 'Flips in All Directions',
    text: 'A single move can flip discs in multiple directions at once \u2014 horizontally, vertically, and diagonally! Look for moves that capture lots of pieces.',
    draw(ctx, w, h) {
      const ox = (w - 5 * CELL) / 2;
      const oy = (h - 5 * CELL) / 2;
      drawMiniBoard(ctx, ox, oy, 5, 5);
      // Center placement spot
      ctx.fillStyle = 'rgba(118, 255, 3, 0.35)';
      ctx.fillRect(ox + 2 * CELL, oy + 2 * CELL, CELL, CELL);
      ctx.strokeStyle = '#76ff03';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 2 * CELL, oy + 2 * CELL, CELL, CELL);
      drawStar(ctx, ox + 2 * CELL + CELL / 2, oy + 2 * CELL + CELL / 2, 8, '#76ff03');

      // Opponent pieces being sandwiched
      // Horizontal right
      drawDisc(ctx, ox, oy, 2, 3, 'white');
      drawDisc(ctx, ox, oy, 2, 4, 'black');
      // Vertical up
      drawDisc(ctx, ox, oy, 1, 2, 'white');
      drawDisc(ctx, ox, oy, 0, 2, 'black');
      // Diagonal down-right
      drawDisc(ctx, ox, oy, 3, 3, 'white');
      drawDisc(ctx, ox, oy, 4, 4, 'black');
      // Vertical down
      drawDisc(ctx, ox, oy, 3, 2, 'white');
      drawDisc(ctx, ox, oy, 4, 2, 'black');

      // Arrows from center outward
      const cx = ox + 2 * CELL + CELL / 2;
      const cy = oy + 2 * CELL + CELL / 2;
      drawArrow(ctx, cx, cy, cx + CELL * 0.8, cy, '#ff6b35');
      drawArrow(ctx, cx, cy, cx, cy - CELL * 0.8, '#ff6b35');
      drawArrow(ctx, cx, cy, cx + CELL * 0.6, cy + CELL * 0.6, '#ff6b35');
      drawArrow(ctx, cx, cy, cx, cy + CELL * 0.8, '#ff6b35');

      // Label
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillStyle = '#ff6b35';
      ctx.textAlign = 'center';
      ctx.fillText('4 directions at once!', ox + 2.5 * CELL, oy + 5 * CELL + 16);
    },
  },

  // Step 5: Valid moves are shown
  {
    title: 'Glowing Hints',
    text: 'Don\'t worry about memorizing the rules \u2014 the board shows your valid moves as glowing dots! Just click on any highlighted cell to play.',
    draw(ctx, w, h) {
      const ox = (w - 8 * CELL) / 2;
      const oy = (h - 8 * CELL) / 2;
      drawMiniBoard(ctx, ox, oy, 8, 8);
      // Starting pieces
      drawDisc(ctx, ox, oy, 3, 3, 'white');
      drawDisc(ctx, ox, oy, 3, 4, 'black');
      drawDisc(ctx, ox, oy, 4, 3, 'black');
      drawDisc(ctx, ox, oy, 4, 4, 'white');
      // Valid move indicators (glowing dots)
      const validMoves = [
        [2, 3], [3, 2], [4, 5], [5, 4],
      ];
      for (const [r, c] of validMoves) {
        const cx = ox + c * CELL + CELL / 2;
        const cy = oy + r * CELL + CELL / 2;
        // Glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, CELL * 0.4);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
        grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Dot
        ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },

  // Step 6: Corner strategy
  {
    title: 'Pro Tip: Corners Rule!',
    text: 'Corners can never be flipped once captured! They\'re the most powerful positions on the board. Try to grab them, and avoid giving your opponent easy access to corners.',
    draw(ctx, w, h) {
      const ox = (w - 8 * CELL) / 2;
      const oy = (h - 8 * CELL) / 2;
      drawMiniBoard(ctx, ox, oy, 8, 8);
      // Highlight corners
      const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
      for (const [r, c] of corners) {
        ctx.fillStyle = 'rgba(118, 255, 3, 0.3)';
        ctx.fillRect(ox + c * CELL, oy + r * CELL, CELL, CELL);
        drawStar(ctx, ox + c * CELL + CELL / 2, oy + r * CELL + CELL / 2, 10, '#76ff03');
      }
      // Danger zones (cells adjacent to corners)
      const danger = [
        [0, 1], [1, 0], [1, 1],
        [0, 6], [1, 7], [1, 6],
        [6, 0], [7, 1], [6, 1],
        [6, 7], [7, 6], [6, 6],
      ];
      for (const [r, c] of danger) {
        ctx.fillStyle = 'rgba(255, 23, 68, 0.25)';
        ctx.fillRect(ox + c * CELL, oy + r * CELL, CELL, CELL);
      }
      // Legend
      ctx.font = '11px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#76ff03';
      ctx.fillText('\u2605 = Great! (corners)', ox, oy + 8 * CELL + 16);
      ctx.fillStyle = '#ff1744';
      ctx.fillText('\u25A0 = Danger! (gives corner access)', ox, oy + 8 * CELL + 32);
    },
  },

  // Step 7: Game end
  {
    title: 'Winning the Game',
    text: 'The game ends when neither player can make a move (usually when the board is full). The player with the most discs wins. Now go show those robots who\'s boss!',
    draw(ctx, w, h) {
      const ox = (w - 8 * CELL) / 2;
      const oy = (h - 8 * CELL) / 2;
      drawMiniBoard(ctx, ox, oy, 8, 8);
      // Draw a near-full board
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          // Create a pattern where black wins
          const isBlack = (r + c * 3 + r * 2) % 3 !== 0;
          drawDisc(ctx, ox, oy, r, c, isBlack ? 'black' : 'white');
        }
      }
      // Victory text
      ctx.font = 'bold 16px Bangers, sans-serif';
      ctx.fillStyle = '#76ff03';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', ox + 4 * CELL, oy - 14);
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Most discs = Victory!', ox + 4 * CELL, oy + 8 * CELL + 18);
    },
  },
];

export class TutorialScreen implements Screen {
  private element: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private currentStep = 0;
  private onDone: () => void;
  private onBack: () => void;

  constructor(onDone: () => void, onBack: () => void) {
    this.onDone = onDone;
    this.onBack = onBack;
  }

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'screen';
    this.element.style.background = 'radial-gradient(ellipse at center, rgba(10,10,26,0.95) 0%, rgba(10,10,26,1) 100%)';

    this.element.innerHTML = `
      <button class="back-btn" id="tut-back-btn">&larr; Back</button>
      <div class="tutorial-container">
        <div class="tutorial-header">
          <div class="tutorial-title" id="tut-title"></div>
          <div class="tutorial-progress" id="tut-progress"></div>
        </div>
        <div class="tutorial-canvas-wrap">
          <canvas id="tut-canvas" width="320" height="320"></canvas>
        </div>
        <div class="tutorial-text" id="tut-text"></div>
        <div class="tutorial-nav">
          <button class="btn btn-secondary tutorial-nav-btn" id="tut-prev">PREV</button>
          <button class="btn btn-primary tutorial-nav-btn" id="tut-next">NEXT</button>
        </div>
      </div>
    `;

    container.appendChild(this.element);
    this.canvas = this.element.querySelector('#tut-canvas') as HTMLCanvasElement;

    // Animate in
    this.element.style.opacity = '0';
    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
    });

    // Event listeners
    this.element.querySelector('#tut-back-btn')!.addEventListener('click', () => {
      this.onBack();
    });
    this.element.querySelector('#tut-prev')!.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.renderStep();
      }
    });
    this.element.querySelector('#tut-next')!.addEventListener('click', () => {
      if (this.currentStep < STEPS.length - 1) {
        this.currentStep++;
        this.renderStep();
      } else {
        this.onDone();
      }
    });

    this.renderStep();
  }

  private renderStep(): void {
    if (!this.element || !this.canvas) return;

    const step = STEPS[this.currentStep];
    const titleEl = this.element.querySelector('#tut-title')!;
    const textEl = this.element.querySelector('#tut-text')!;
    const progressEl = this.element.querySelector('#tut-progress')!;
    const prevBtn = this.element.querySelector('#tut-prev') as HTMLButtonElement;
    const nextBtn = this.element.querySelector('#tut-next') as HTMLButtonElement;

    titleEl.textContent = step.title;
    textEl.textContent = step.text;

    // Progress dots
    let dotsHtml = '';
    for (let i = 0; i < STEPS.length; i++) {
      dotsHtml += `<span class="tut-dot ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'done' : ''}"></span>`;
    }
    progressEl.innerHTML = dotsHtml;

    // Navigation buttons
    prevBtn.style.visibility = this.currentStep === 0 ? 'hidden' : 'visible';
    if (this.currentStep === STEPS.length - 1) {
      nextBtn.textContent = 'PLAY NOW!';
      nextBtn.className = 'btn btn-success tutorial-nav-btn';
    } else {
      nextBtn.textContent = 'NEXT';
      nextBtn.className = 'btn btn-primary tutorial-nav-btn';
    }

    // Draw illustration
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    step.draw(ctx, this.canvas.width, this.canvas.height);
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
    this.canvas = null;
  }
}
