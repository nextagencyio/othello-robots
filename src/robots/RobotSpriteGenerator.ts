import type { Robot, RobotAnimState } from './Robot';
import { defaultAnimState } from './Robot';

// ============ Constants ============

const SPRITE_SIZE = 256;
export const ANIM_W = 256;
export const ANIM_H = 300;

type RGB = { r: number; g: number; b: number };

// ============ Color Utilities ============

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 200, g: 200, b: 200 };
}

function darken(color: RGB, factor: number): RGB {
  return {
    r: Math.floor(Math.min(255, color.r * factor)),
    g: Math.floor(Math.min(255, color.g * factor)),
    b: Math.floor(Math.min(255, color.b * factor)),
  };
}

function toCSS(c: RGB): string {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.3, y + size * 0.3);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.fill();
}

// ============================================================
// STATIC PREVIEW FUNCTIONS (for robot selection cards)
// ============================================================

function drawClanky(ctx: CanvasRenderingContext2D, color: RGB) {
  const dark = darken(color, 0.6);
  const light = darken(color, 1.2);

  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 55);
  ctx.lineTo(128, 30);
  ctx.lineTo(140, 15);
  ctx.stroke();
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(140, 15, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(color);
  ctx.fillRect(68, 55, 120, 100);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(68, 55, 120, 8);
  ctx.fillRect(68, 55, 8, 100);

  ctx.fillStyle = toCSS(light);
  ctx.fillRect(78, 55, 100, 60);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(88, 70, 80, 30);

  ctx.fillStyle = '#ff4444';
  ctx.save();
  ctx.translate(108, 80);
  ctx.rotate(-0.2);
  ctx.fillRect(-8, -4, 16, 8);
  ctx.restore();
  ctx.save();
  ctx.translate(148, 80);
  ctx.rotate(0.2);
  ctx.fillRect(-8, -4, 16, 8);
  ctx.restore();

  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(108, 95);
  ctx.lineTo(118, 90);
  ctx.lineTo(128, 95);
  ctx.lineTo(138, 90);
  ctx.lineTo(148, 95);
  ctx.stroke();

  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(48, 80, 20, 50);
  ctx.fillRect(188, 80, 20, 50);
  ctx.fillStyle = '#888';
  ctx.fillRect(48, 125, 8, 15);
  ctx.fillRect(60, 125, 8, 15);
  ctx.fillRect(188, 125, 8, 15);
  ctx.fillRect(200, 125, 8, 15);

  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(85, 155, 25, 45);
  ctx.fillRect(145, 155, 25, 45);
  ctx.fillStyle = '#888';
  ctx.fillRect(75, 195, 40, 12);
  ctx.fillRect(140, 195, 40, 12);

  ctx.fillStyle = '#aaa';
  for (const [x, y] of [[78, 120], [178, 120], [78, 145], [178, 145]]) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
  ctx.fillRect(100, 130, 20, 15);
  ctx.fillRect(155, 100, 15, 20);
}

function drawSparks(ctx: CanvasRenderingContext2D, color: RGB) {
  const dark = darken(color, 0.7);

  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.moveTo(128, 35);
  ctx.lineTo(135, 20);
  ctx.lineTo(130, 22);
  ctx.lineTo(133, 8);
  ctx.lineTo(125, 25);
  ctx.lineTo(131, 23);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(128, 120, 55, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(115, 100, 20, 25, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.arc(128, 65, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(128, 72, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(115, 68, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(141, 68, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(112, 65, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(138, 65, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(128, 75, 15, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.strokeStyle = toCSS(dark);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(75, 110);
  ctx.quadraticCurveTo(50, 120, 45, 140);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(181, 110);
  ctx.quadraticCurveTo(206, 120, 211, 140);
  ctx.stroke();
  ctx.fillStyle = toCSS(dark);
  ctx.beginPath();
  ctx.arc(45, 143, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(211, 143, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(108, 175, 14, 25);
  ctx.fillRect(134, 175, 14, 25);
  ctx.beginPath();
  ctx.ellipse(115, 200, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(141, 200, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffeb3b';
  for (const [x, y] of [[55, 95], [200, 90], [70, 155], [185, 160]]) {
    drawSparkle(ctx, x, y, 5);
  }
}

function drawBoltz(ctx: CanvasRenderingContext2D, color: RGB) {
  const dark = darken(color, 0.7);

  ctx.fillStyle = '#888';
  ctx.fillRect(126, 18, 4, 15);
  ctx.save();
  ctx.translate(128, 15);
  ctx.fillStyle = toCSS(color);
  ctx.rotate(0.3);
  ctx.fillRect(-18, -3, 36, 6);
  ctx.rotate(Math.PI / 2);
  ctx.fillRect(-18, -3, 36, 6);
  ctx.restore();

  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.moveTo(128, 35);
  ctx.lineTo(85, 95);
  ctx.lineTo(171, 95);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.moveTo(128, 55);
  ctx.lineTo(100, 88);
  ctx.lineTo(156, 88);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#76ff03';
  ctx.beginPath();
  ctx.arc(115, 76, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(141, 76, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(117, 75, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(143, 75, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(color);
  ctx.fillRect(88, 95, 80, 65);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(93, 100, 70, 5);
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(128, 127, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(128, 127, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(dark);
  ctx.save();
  ctx.translate(88, 100);
  ctx.rotate(0.3);
  ctx.fillRect(-35, -5, 35, 10);
  ctx.restore();
  ctx.save();
  ctx.translate(168, 100);
  ctx.rotate(-0.3);
  ctx.fillRect(0, -5, 35, 10);
  ctx.restore();

  ctx.strokeStyle = toCSS(dark);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(108, 160);
  ctx.lineTo(100, 175);
  ctx.lineTo(116, 185);
  ctx.lineTo(100, 195);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(148, 160);
  ctx.lineTo(156, 175);
  ctx.lineTo(140, 185);
  ctx.lineTo(156, 195);
  ctx.stroke();

  ctx.fillStyle = toCSS(color);
  ctx.fillRect(88, 192, 24, 12);
  ctx.fillRect(144, 192, 24, 12);
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.moveTo(92, 204);
  ctx.lineTo(100, 215);
  ctx.lineTo(108, 204);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(148, 204);
  ctx.lineTo(156, 215);
  ctx.lineTo(164, 204);
  ctx.fill();

  ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.3)`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const y = 60 + i * 40;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(50, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(206, y);
    ctx.lineTo(226, y);
    ctx.stroke();
  }
}

function drawGizmo(ctx: CanvasRenderingContext2D, color: RGB) {
  const dark = darken(color, 0.7);

  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.ellipse(185, 55, 20, 15, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aaa';
  ctx.beginPath();
  ctx.ellipse(185, 55, 14, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(170, 58);
  ctx.lineTo(155, 70);
  ctx.stroke();

  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(128, 75, 42, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(128, 80, 32, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(color);
  ctx.fillRect(102, 70, 22, 10);
  ctx.fillRect(132, 70, 22, 10);
  ctx.fillStyle = '#e040fb';
  ctx.beginPath();
  ctx.arc(113, 80, 8, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(143, 80, 8, 0, Math.PI);
  ctx.fill();

  ctx.strokeStyle = '#e040fb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(128, 92, 8, 0.3, Math.PI - 0.3);
  ctx.stroke();

  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(128, 140, 50, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = toCSS(dark);
  ctx.beginPath();
  ctx.ellipse(128, 145, 30, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(224, 64, 251, 0.3)';
  ctx.beginPath();
  ctx.arc(128, 145, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = toCSS(color);
  ctx.save();
  ctx.translate(80, 130);
  ctx.rotate(0.5);
  ctx.fillRect(-25, -6, 25, 12);
  ctx.restore();
  ctx.save();
  ctx.translate(176, 130);
  ctx.rotate(-0.5);
  ctx.fillRect(0, -6, 25, 12);
  ctx.restore();

  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(105, 185, 16, 18);
  ctx.fillRect(135, 185, 16, 18);
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(113, 203, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(143, 203, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(224, 64, 251, 0.5)';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Z', 175, 40);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('z', 190, 28);
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('z', 200, 18);
}

const DRAW_FUNCTIONS: Record<string, (ctx: CanvasRenderingContext2D, color: RGB) => void> = {
  clanky: drawClanky,
  sparks: drawSparks,
  boltz: drawBoltz,
  gizmo: drawGizmo,
};

export function generateRobotSprite(robot: Robot): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  const color = hexToRgb(robot.primaryColor);
  const drawFn = DRAW_FUNCTIONS[robot.id];
  if (drawFn) drawFn(ctx, color);
  return canvas;
}

export function generateRobotPreview(robot: Robot, width: number, height: number): HTMLCanvasElement {
  const fullSprite = generateRobotSprite(robot);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(fullSprite, 0, 0, SPRITE_SIZE, SPRITE_SIZE, 0, 0, width, height);
  return canvas;
}

// ============================================================
// ANIMATED GAME DISPLAY FUNCTIONS
// ============================================================

function drawClankyAnim(ctx: CanvasRenderingContext2D, color: RGB, s: RobotAnimState) {
  const cx = 128;
  const dark = darken(color, 0.6);
  const light = darken(color, 1.2);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, 282, 48, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body squash
  ctx.save();
  ctx.translate(cx, 185);
  ctx.scale(1 + s.bodySquash * 0.15, 1 - s.bodySquash * 0.1);
  ctx.translate(-cx, -185);

  // Legs
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(98, 218, 24, 42);
  ctx.fillRect(134, 218, 24, 42);
  ctx.fillStyle = '#888';
  ctx.fillRect(88, 256, 40, 12);
  ctx.fillRect(128, 256, 40, 12);

  // Body (boxy)
  ctx.fillStyle = toCSS(color);
  ctx.fillRect(76, 118, 104, 100);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(76, 118, 104, 8);
  ctx.fillRect(76, 118, 8, 100);

  // Rivets
  ctx.fillStyle = '#aaa';
  for (const [x, y] of [[86, 182], [170, 182], [86, 208], [170, 208]]) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rust patches
  ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
  ctx.fillRect(112, 188, 18, 14);
  ctx.fillRect(155, 158, 14, 18);

  // Left Arm
  ctx.save();
  ctx.translate(76, 135);
  ctx.rotate(s.leftArmAngle);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(-22, -5, 22, 52);
  ctx.fillStyle = '#888';
  ctx.fillRect(-20, 42, 8, 14);
  ctx.fillRect(-10, 42, 8, 14);
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(180, 135);
  ctx.rotate(s.rightArmAngle);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(0, -5, 22, 52);
  ctx.fillStyle = '#888';
  ctx.fillRect(2, 42, 8, 14);
  ctx.fillRect(12, 42, 8, 14);
  ctx.restore();

  // Head (with tilt)
  ctx.save();
  ctx.translate(cx, 118);
  ctx.rotate(s.headTilt);
  ctx.translate(-cx, -118);

  // Antenna with wobble
  const wobble = Math.sin(s.accessoryPhase * 3) * 0.15;
  ctx.save();
  ctx.translate(cx, 58);
  ctx.rotate(wobble);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -20);
  ctx.lineTo(12, -33);
  ctx.stroke();
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(12, -33, 6, 0, Math.PI * 2);
  ctx.fill();
  // Antenna glow pulse
  const glowA = 0.3 + Math.sin(s.accessoryPhase * 2) * 0.2;
  ctx.fillStyle = `rgba(255, 68, 68, ${glowA})`;
  ctx.beginPath();
  ctx.arc(12, -33, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head box
  ctx.fillStyle = toCSS(light);
  ctx.fillRect(90, 58, 76, 60);

  // Visor
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(100, 72, 56, 30);

  // Eyes (grumpy rectangles with gaze)
  const gx = s.eyeGazeX * 4;
  const gy = s.eyeGazeY * 3;

  ctx.fillStyle = '#ff4444';
  ctx.save();
  ctx.translate(117 + gx, 84 + gy);
  ctx.rotate(-0.2);
  ctx.fillRect(-7, -3, 14, 7);
  ctx.restore();

  ctx.save();
  ctx.translate(141 + gx, 84 + gy);
  ctx.rotate(0.2);
  ctx.fillRect(-7, -3, 14, 7);
  ctx.restore();

  // Blink (eyelids from top of visor)
  if (s.blinkAmount > 0.01) {
    ctx.fillStyle = toCSS(light);
    const lidH = s.blinkAmount * 15;
    ctx.fillRect(100, 72, 56, lidH);
  }

  // Mouth (zigzag, opens when mouthOpen > 0)
  const mo = s.mouthOpen;
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(113, 99);
  ctx.lineTo(121, 95 - mo * 3);
  ctx.lineTo(cx, 99);
  ctx.lineTo(135, 95 - mo * 3);
  ctx.lineTo(143, 99);
  ctx.stroke();
  if (mo > 0.2) {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(113, 99);
    ctx.lineTo(121, 95 - mo * 3);
    ctx.lineTo(cx, 99);
    ctx.lineTo(135, 95 - mo * 3);
    ctx.lineTo(143, 99);
    ctx.lineTo(135, 103 + mo * 3);
    ctx.lineTo(cx, 100 + mo * 1.5);
    ctx.lineTo(121, 103 + mo * 3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore(); // end head tilt
  ctx.restore(); // end squash
}

function drawSparksAnim(ctx: CanvasRenderingContext2D, color: RGB, s: RobotAnimState) {
  const cx = 128;
  const dark = darken(color, 0.7);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, 275, 42, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body squash
  ctx.save();
  ctx.translate(cx, 170);
  ctx.scale(1 + s.bodySquash * 0.15, 1 - s.bodySquash * 0.1);
  ctx.translate(-cx, -170);

  // Legs
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(108, 212, 14, 24);
  ctx.fillRect(134, 212, 14, 24);
  ctx.beginPath();
  ctx.ellipse(115, 238, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(141, 238, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (round)
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(cx, 158, 54, 58, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(112, 138, 18, 22, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Left Arm (noodle)
  ctx.save();
  ctx.translate(74, 142);
  ctx.rotate(s.leftArmAngle);
  ctx.strokeStyle = toCSS(dark);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-18, 18, -22, 38);
  ctx.stroke();
  ctx.fillStyle = toCSS(dark);
  ctx.beginPath();
  ctx.arc(-22, 41, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(182, 142);
  ctx.rotate(s.rightArmAngle);
  ctx.strokeStyle = toCSS(dark);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(18, 18, 22, 38);
  ctx.stroke();
  ctx.fillStyle = toCSS(dark);
  ctx.beginPath();
  ctx.arc(22, 41, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head (with tilt)
  ctx.save();
  ctx.translate(cx, 100);
  ctx.rotate(s.headTilt);
  ctx.translate(-cx, -100);

  // Lightning bolt antenna
  ctx.save();
  ctx.translate(cx, 30);
  ctx.rotate(Math.sin(s.accessoryPhase * 2) * 0.1);
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(7, -10);
  ctx.lineTo(2, -8);
  ctx.lineTo(5, -22);
  ctx.lineTo(-3, -5);
  ctx.lineTo(3, -7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Head circle
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.arc(cx, 68, 38, 0, Math.PI * 2);
  ctx.fill();

  // Face plate
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(cx, 75, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes with gaze
  const gx = s.eyeGazeX * 5;
  const gy = s.eyeGazeY * 3;

  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(115, 71, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(141, 71, 9, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(115 + gx * 0.5, 71 + gy * 0.5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(141 + gx * 0.5, 71 + gy * 0.5, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(112 + gx * 0.3, 68 + gy * 0.3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(138 + gx * 0.3, 68 + gy * 0.3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Blink
  if (s.blinkAmount > 0.01) {
    ctx.fillStyle = toCSS(color);
    for (const ex of [115, 141]) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, 71, 10, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillRect(ex - 12, 71 - 12, 24, s.blinkAmount * 24);
      ctx.restore();
    }
  }

  // Mouth (smile that opens)
  if (s.mouthOpen < 0.15) {
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, 80, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, 82, 10, 3 + s.mouthOpen * 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore(); // end head tilt

  // Sparkle particles (animated)
  ctx.fillStyle = '#ffeb3b';
  const sparkT = s.accessoryPhase;
  for (let i = 0; i < 4; i++) {
    const angle = sparkT * 0.5 + i * Math.PI * 0.5;
    const dist = 62 + Math.sin(sparkT + i) * 10;
    const sx = cx + Math.cos(angle) * dist;
    const sy = 125 + Math.sin(angle) * dist * 0.7;
    const size = 3 + Math.sin(sparkT * 2 + i * 1.5) * 2;
    if (size > 1.5) drawSparkle(ctx, sx, sy, size);
  }

  ctx.restore(); // end squash
}

function drawBoltzAnim(ctx: CanvasRenderingContext2D, color: RGB, s: RobotAnimState) {
  const cx = 128;
  const dark = darken(color, 0.7);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, 272, 38, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body squash
  ctx.save();
  ctx.translate(cx, 165);
  ctx.scale(1 + s.bodySquash * 0.2, 1 - s.bodySquash * 0.15);
  ctx.translate(-cx, -165);

  // Rocket feet flames (animated)
  const flameFlicker = Math.sin(s.accessoryPhase * 15) * 3;
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.moveTo(92, 248);
  ctx.lineTo(100, 261 + flameFlicker);
  ctx.lineTo(108, 248);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(148, 248);
  ctx.lineTo(156, 261 + flameFlicker);
  ctx.lineTo(164, 248);
  ctx.fill();
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.moveTo(96, 248);
  ctx.lineTo(100, 254 + flameFlicker * 0.5);
  ctx.lineTo(104, 248);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(152, 248);
  ctx.lineTo(156, 254 + flameFlicker * 0.5);
  ctx.lineTo(160, 248);
  ctx.fill();

  // Spring legs
  ctx.strokeStyle = toCSS(dark);
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(108, 205);
  ctx.lineTo(100, 218);
  ctx.lineTo(116, 228);
  ctx.lineTo(100, 238);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(148, 205);
  ctx.lineTo(156, 218);
  ctx.lineTo(140, 228);
  ctx.lineTo(156, 238);
  ctx.stroke();

  // Rocket shoes
  ctx.fillStyle = toCSS(color);
  ctx.fillRect(88, 236, 24, 12);
  ctx.fillRect(144, 236, 24, 12);

  // Body (compact)
  ctx.fillStyle = toCSS(color);
  ctx.fillRect(90, 128, 76, 77);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(95, 133, 66, 5);

  // Power core (pulsing)
  const coreGlow = 0.2 + Math.sin(s.accessoryPhase * 4) * 0.15;
  ctx.fillStyle = `rgba(255, 235, 59, ${coreGlow})`;
  ctx.beginPath();
  ctx.arc(cx, 168, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(cx, 168, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, 168, 5, 0, Math.PI * 2);
  ctx.fill();

  // Left Arm (angular)
  ctx.save();
  ctx.translate(90, 138);
  ctx.rotate(s.leftArmAngle + 0.3);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(-34, -5, 34, 10);
  // Hand
  ctx.fillStyle = toCSS(color);
  ctx.fillRect(-38, -7, 8, 14);
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(166, 138);
  ctx.rotate(s.rightArmAngle - 0.3);
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(0, -5, 34, 10);
  ctx.fillStyle = toCSS(color);
  ctx.fillRect(30, -7, 8, 14);
  ctx.restore();

  // Head (with tilt)
  ctx.save();
  ctx.translate(cx, 128);
  ctx.rotate(s.headTilt);
  ctx.translate(-cx, -128);

  // Propeller (spinning!)
  ctx.save();
  ctx.translate(cx, 45);
  ctx.fillStyle = '#888';
  ctx.fillRect(-2, 0, 4, 14);
  ctx.rotate(s.accessoryPhase);
  ctx.fillStyle = toCSS(color);
  ctx.fillRect(-20, -3, 40, 6);
  ctx.rotate(Math.PI / 2);
  ctx.fillRect(-20, -3, 40, 6);
  ctx.restore();

  // Triangular head
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.moveTo(cx, 58);
  ctx.lineTo(90, 128);
  ctx.lineTo(166, 128);
  ctx.closePath();
  ctx.fill();

  // Face visor
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.moveTo(cx, 78);
  ctx.lineTo(102, 121);
  ctx.lineTo(154, 121);
  ctx.closePath();
  ctx.fill();

  // Eyes (manic, different sizes, with gaze)
  const gx = s.eyeGazeX * 5;
  const gy = s.eyeGazeY * 3;

  ctx.fillStyle = '#76ff03';
  ctx.beginPath();
  ctx.arc(116, 103, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(140, 103, 7, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(118 + gx * 0.5, 102 + gy * 0.5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(142 + gx * 0.4, 102 + gy * 0.4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Blink
  if (s.blinkAmount > 0.01) {
    ctx.fillStyle = toCSS(color);
    ctx.save();
    ctx.beginPath();
    ctx.arc(116, 103, 11, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillRect(105, 92, 22, s.blinkAmount * 22);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(140, 103, 8, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillRect(132, 95, 16, s.blinkAmount * 16);
    ctx.restore();
  }

  // Mouth (manic grin)
  const mo = s.mouthOpen;
  ctx.strokeStyle = '#76ff03';
  ctx.lineWidth = 2;
  if (mo < 0.15) {
    ctx.beginPath();
    ctx.arc(cx, 113, 8, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(cx, 114, 8, 3 + mo * 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore(); // end head tilt

  // Speed lines (animated)
  const linePhase = s.accessoryPhase;
  ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.25)`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const y = 85 + i * 38;
    const offset = ((linePhase * 30 + i * 20) % 60) - 30;
    ctx.beginPath();
    ctx.moveTo(22 + offset, y);
    ctx.lineTo(42 + offset, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(214 - offset, y);
    ctx.lineTo(234 - offset, y);
    ctx.stroke();
  }

  ctx.restore(); // end squash
}

function drawGizmoAnim(ctx: CanvasRenderingContext2D, color: RGB, s: RobotAnimState) {
  const cx = 128;
  const dark = darken(color, 0.7);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, 278, 46, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body squash
  ctx.save();
  ctx.translate(cx, 180);
  ctx.scale(1 + s.bodySquash * 0.12, 1 - s.bodySquash * 0.08);
  ctx.translate(-cx, -180);

  // Legs
  ctx.fillStyle = toCSS(dark);
  ctx.fillRect(105, 242, 16, 18);
  ctx.fillRect(135, 242, 16, 18);
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(113, 262, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(143, 262, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (oval, pudgy)
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(cx, 190, 52, 56, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = toCSS(dark);
  ctx.beginPath();
  ctx.ellipse(cx, 195, 30, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  // Power indicator (pulsing)
  const glowA = 0.2 + Math.sin(s.accessoryPhase * 0.5) * 0.15;
  ctx.fillStyle = `rgba(224, 64, 251, ${glowA})`;
  ctx.beginPath();
  ctx.arc(cx, 195, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(224, 64, 251, ${glowA + 0.15})`;
  ctx.beginPath();
  ctx.arc(cx, 195, 5, 0, Math.PI * 2);
  ctx.fill();

  // Left Arm (stubby, elliptical)
  ctx.save();
  ctx.translate(76, 180);
  ctx.rotate(s.leftArmAngle + 0.4);
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(-10, 12, 8, 14, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(180, 180);
  ctx.rotate(s.rightArmAngle - 0.4);
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(10, 12, 8, 14, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head (with tilt)
  ctx.save();
  ctx.translate(cx, 125);
  ctx.rotate(s.headTilt);
  ctx.translate(-cx, -125);

  // Satellite dish (wobbling)
  const dishWobble = Math.sin(s.accessoryPhase * 1.5) * 0.1;
  ctx.save();
  ctx.translate(178, 60);
  ctx.rotate(dishWobble);
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 15, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aaa';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Signal dot
  const sigA = 0.3 + Math.sin(s.accessoryPhase * 3) * 0.3;
  ctx.fillStyle = `rgba(224, 64, 251, ${sigA})`;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-15, 3);
  ctx.lineTo(-28, 14);
  ctx.stroke();
  ctx.restore();

  // Head oval
  ctx.fillStyle = toCSS(color);
  ctx.beginPath();
  ctx.ellipse(cx, 87, 42, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(cx, 92, 32, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (sleepy, with gaze)
  const gx = s.eyeGazeX * 3;
  const gy = s.eyeGazeY * 2;

  ctx.fillStyle = '#e040fb';
  ctx.beginPath();
  ctx.arc(113, 90, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(143, 90, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(113 + gx * 0.4, 90 + gy * 0.4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(143 + gx * 0.4, 90 + gy * 0.4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Heavy eyelids (Gizmo is always sleepy, blink makes them droop more)
  const baseLid = 0.45;
  const lidAmount = Math.min(1, baseLid + s.blinkAmount * 0.55);
  ctx.fillStyle = toCSS(color);
  for (const ex of [113, 143]) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, 90, 9, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillRect(ex - 10, 90 - 10, 20, lidAmount * 14);
    ctx.restore();
  }

  // Mouth
  const mo = s.mouthOpen;
  ctx.strokeStyle = '#e040fb';
  ctx.lineWidth = 2;
  if (mo < 0.1) {
    ctx.beginPath();
    ctx.arc(cx, 101, 7, 0.3, Math.PI - 0.3);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(cx, 102, 5, 2 + mo * 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e040fb';
    ctx.stroke();
  }

  ctx.restore(); // end head tilt

  // Floating Z's (animated)
  const zPhase = s.accessoryPhase;
  const zBaseX = 178;
  const zBaseY = 50;
  for (let i = 0; i < 3; i++) {
    const offset = ((zPhase * 0.4 + i * 0.8) % 3) / 3;
    const zx = zBaseX + offset * 28;
    const zy = zBaseY - offset * 32;
    const size = 16 - i * 4;
    const alpha = 0.55 - offset * 0.4;
    ctx.fillStyle = `rgba(224, 64, 251, ${alpha})`;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.fillText('Z', zx, zy);
  }

  ctx.restore(); // end squash
}

// ============ Animated Dispatch ============

const ANIM_DRAW_FUNCTIONS: Record<string, (ctx: CanvasRenderingContext2D, color: RGB, s: RobotAnimState) => void> = {
  clanky: drawClankyAnim,
  sparks: drawSparksAnim,
  boltz: drawBoltzAnim,
  gizmo: drawGizmoAnim,
};

/** Draw a robot frame with animation state onto a canvas context. Canvas should be ANIM_W x ANIM_H. */
export function drawRobotFrame(ctx: CanvasRenderingContext2D, robot: Robot, state: RobotAnimState): void {
  ctx.clearRect(0, 0, ANIM_W, ANIM_H);
  const color = hexToRgb(robot.primaryColor);
  const drawFn = ANIM_DRAW_FUNCTIONS[robot.id];
  if (drawFn) drawFn(ctx, color, state);
}

/** Generate a static animated preview (for use outside game loop). */
export function generateAnimatedPreview(robot: Robot, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = ANIM_W;
  canvas.height = ANIM_H;
  const ctx = canvas.getContext('2d')!;
  drawRobotFrame(ctx, robot, defaultAnimState());
  // Scale to requested size
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const outCtx = out.getContext('2d')!;
  outCtx.drawImage(canvas, 0, 0, ANIM_W, ANIM_H, 0, 0, width, height);
  return out;
}
