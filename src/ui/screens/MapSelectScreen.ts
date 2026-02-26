import type { Screen } from '../UIManager';
import type { BoardMap } from '../../maps/BoardMap';
import { ALL_MAPS } from '../../maps/mapRegistry';

/** Render a mini isometric board preview on a canvas. */
function renderMapPreview(map: BoardMap, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bgR = (map.backgroundColor >> 16) & 0xff;
  const bgG = (map.backgroundColor >> 8) & 0xff;
  const bgB = map.backgroundColor & 0xff;
  ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
  ctx.fillRect(0, 0, width, height);

  // Draw isometric board (4x4 simplified)
  const gridSize = 4;
  const cellW = 28;
  const cellH = 14;
  const startX = width / 2;
  const startY = height * 0.3;

  const lightR = (map.cellLightColor >> 16) & 0xff;
  const lightG = (map.cellLightColor >> 8) & 0xff;
  const lightB = map.cellLightColor & 0xff;
  const darkR = (map.cellDarkColor >> 16) & 0xff;
  const darkG = (map.cellDarkColor >> 8) & 0xff;
  const darkB = map.cellDarkColor & 0xff;

  const borderR = (map.borderColor >> 16) & 0xff;
  const borderG = (map.borderColor >> 8) & 0xff;
  const borderB = map.borderColor & 0xff;

  // Border (slightly larger isometric rect)
  const bPad = 4;
  ctx.fillStyle = `rgb(${borderR},${borderG},${borderB})`;
  drawIsometricRect(ctx, startX, startY - bPad, gridSize * cellW + bPad * 2, gridSize * cellH + bPad, cellW, cellH);

  // Draw cells
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isLight = (r + c) % 2 === 0;
      if (isLight) {
        ctx.fillStyle = `rgb(${lightR},${lightG},${lightB})`;
      } else {
        ctx.fillStyle = `rgb(${darkR},${darkG},${darkB})`;
      }

      // Isometric position
      const isoX = startX + (c - r) * (cellW / 2);
      const isoY = startY + (c + r) * (cellH / 2);

      drawIsometricCell(ctx, isoX, isoY, cellW, cellH);
    }
  }

  // Draw a few sample pieces
  const piecePositions = [
    { r: 1, c: 1, color: '#2a2a4e' },
    { r: 1, c: 2, color: '#e8e8e8' },
    { r: 2, c: 1, color: '#e8e8e8' },
    { r: 2, c: 2, color: '#2a2a4e' },
  ];
  for (const p of piecePositions) {
    const isoX = startX + (p.c - p.r) * (cellW / 2);
    const isoY = startY + (p.c + p.r) * (cellH / 2);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(isoX, isoY + 2, cellW * 0.3, cellH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Decorative particles
  const validR = (map.validMoveColor >> 16) & 0xff;
  const validG = (map.validMoveColor >> 8) & 0xff;
  const validB = map.validMoveColor & 0xff;
  ctx.fillStyle = `rgba(${validR},${validG},${validB},0.4)`;
  for (let i = 0; i < 8; i++) {
    const px = Math.random() * width;
    const py = Math.random() * height;
    ctx.beginPath();
    ctx.arc(px, py, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

function drawIsometricCell(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  w: number, h: number
) {
  const hw = w / 2;
  const hh = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fill();
}

function drawIsometricRect(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  _totalW: number, _totalH: number,
  cellW: number, cellH: number
) {
  const n = 4;
  const hw = (n * cellW) / 2 + 6;
  const hh = (n * cellH) / 2 + 4;
  const midY = cy + (n * cellH) / 2;
  ctx.beginPath();
  ctx.moveTo(cx, midY - hh);
  ctx.lineTo(cx + hw, midY);
  ctx.lineTo(cx, midY + hh);
  ctx.lineTo(cx - hw, midY);
  ctx.closePath();
  ctx.fill();
}

export class MapSelectScreen implements Screen {
  private element: HTMLElement | null = null;
  private onSelect: (map: BoardMap) => void;
  private onBack: () => void;

  constructor(onSelect: (map: BoardMap) => void, onBack: () => void) {
    this.onSelect = onSelect;
    this.onBack = onBack;
  }

  show(container: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.className = 'screen';
    this.element.style.background = 'radial-gradient(ellipse at center, rgba(10,10,26,0.95) 0%, rgba(10,10,26,1) 100%)';

    const cardsHtml = ALL_MAPS.map(
      (map) => `
      <div class="map-card" data-map-id="${map.id}">
        <div class="map-card-preview" id="map-preview-${map.id}"></div>
        <div class="map-card-info">
          <div class="map-card-name">${map.name}</div>
          <div class="map-card-desc">${map.description}</div>
        </div>
      </div>
    `
    ).join('');

    this.element.innerHTML = `
      <button class="back-btn" id="back-btn">&larr; Back</button>
      <div class="section-label">Choose Board Theme</div>
      <div class="map-card-grid">${cardsHtml}</div>
    `;

    container.appendChild(this.element);

    // Render canvas previews
    for (const map of ALL_MAPS) {
      const previewEl = this.element.querySelector(`#map-preview-${map.id}`);
      if (previewEl) {
        const canvas = renderMapPreview(map, 200, 130);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.borderRadius = '10px';
        previewEl.appendChild(canvas);
      }
    }

    // Animate in
    this.element.style.opacity = '0';
    requestAnimationFrame(() => {
      if (this.element) this.element.style.opacity = '1';
    });

    // Event listeners
    this.element.querySelectorAll('.map-card').forEach((card) => {
      card.addEventListener('click', () => {
        const mapId = (card as HTMLElement).dataset.mapId;
        const map = ALL_MAPS.find((m) => m.id === mapId);
        if (map) this.onSelect(map);
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
