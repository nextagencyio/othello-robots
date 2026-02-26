import type { Robot } from '../robots/Robot';
import { RobotAnimator } from '../robots/RobotAnimator';
import { drawRobotFrame, ANIM_W, ANIM_H } from '../robots/RobotSpriteGenerator';

/**
 * HTML overlay-based robot display. Positions two animated robot canvases
 * at the bottom-left and bottom-right of the screen.
 */
export class RobotDisplay {
  private container: HTMLElement;
  private playerCanvas: HTMLCanvasElement;
  private aiCanvas: HTMLCanvasElement;
  private playerCtx: CanvasRenderingContext2D;
  private aiCtx: CanvasRenderingContext2D;

  playerAnimator: RobotAnimator;
  aiAnimator: RobotAnimator;

  private playerRobot: Robot;
  private aiRobot: Robot;

  constructor(playerRobot: Robot, aiRobot: Robot) {
    this.playerRobot = playerRobot;
    this.aiRobot = aiRobot;

    this.playerAnimator = new RobotAnimator(playerRobot.personality);
    this.aiAnimator = new RobotAnimator(aiRobot.personality);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'robot-display';

    // Player robot canvas (bottom-left)
    this.playerCanvas = document.createElement('canvas');
    this.playerCanvas.width = ANIM_W;
    this.playerCanvas.height = ANIM_H;
    this.playerCanvas.className = 'robot-canvas robot-left';
    this.playerCtx = this.playerCanvas.getContext('2d')!;

    // AI robot canvas (bottom-right)
    this.aiCanvas = document.createElement('canvas');
    this.aiCanvas.width = ANIM_W;
    this.aiCanvas.height = ANIM_H;
    this.aiCanvas.className = 'robot-canvas robot-right';
    this.aiCtx = this.aiCanvas.getContext('2d')!;

    // Name labels
    const playerLabel = document.createElement('div');
    playerLabel.className = 'robot-label robot-label-left';
    playerLabel.textContent = 'You';

    const aiLabel = document.createElement('div');
    aiLabel.className = 'robot-label robot-label-right';
    aiLabel.textContent = aiRobot.name;

    this.container.appendChild(this.playerCanvas);
    this.container.appendChild(this.aiCanvas);
    this.container.appendChild(playerLabel);
    this.container.appendChild(aiLabel);

    document.getElementById('ui-overlay')!.appendChild(this.container);
  }

  update(elapsed: number, delta: number): void {
    const playerState = this.playerAnimator.update(elapsed, delta);
    const aiState = this.aiAnimator.update(elapsed, delta);

    drawRobotFrame(this.playerCtx, this.playerRobot, playerState);
    drawRobotFrame(this.aiCtx, this.aiRobot, aiState);
  }

  dispose(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
