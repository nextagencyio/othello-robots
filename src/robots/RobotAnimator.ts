import type { RobotAnimState } from './Robot';
import { defaultAnimState } from './Robot';

export class RobotAnimator {
  private state: RobotAnimState = defaultAnimState();
  private personality: 'cheerful' | 'grumpy' | 'hyper' | 'sleepy';

  // Idle blink state
  private nextBlinkTime: number;
  private blinkTimer = 0;
  private isBlinking = false;
  private blinkDuration = 0.15;

  // Eye gaze state
  private gazeTargetX = 0;
  private gazeTargetY = 0;
  private nextGazeTime: number;

  // Reaction state
  private reaction: 'none' | 'happy' | 'sad' | 'victory' = 'none';
  private reactionTimer = 0;
  private reactionDuration = 0;

  // Mouth chatter state
  private chatterTimer = 0;
  private isChatterOpen = false;

  constructor(personality: 'cheerful' | 'grumpy' | 'hyper' | 'sleepy') {
    this.personality = personality;
    this.nextBlinkTime = 1.5 + Math.random() * 3;
    this.nextGazeTime = 0.5 + Math.random() * 2;
  }

  getState(): RobotAnimState {
    return this.state;
  }

  update(elapsed: number, delta: number): RobotAnimState {
    const s = this.state;

    // ====== Idle Behaviors ======

    // Blink
    if (!this.isBlinking && elapsed > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkTimer = 0;
      this.blinkDuration = 0.1 + Math.random() * 0.06;
      if (this.personality === 'sleepy') {
        this.blinkDuration = 0.2 + Math.random() * 0.1;
        this.nextBlinkTime = elapsed + 1.5 + Math.random() * 2;
      } else {
        this.nextBlinkTime = elapsed + 2 + Math.random() * 4;
      }
    }
    if (this.isBlinking) {
      this.blinkTimer += delta;
      const t = this.blinkTimer / this.blinkDuration;
      if (t < 0.5) {
        s.blinkAmount = t * 2;
      } else if (t < 1) {
        s.blinkAmount = (1 - t) * 2;
      } else {
        s.blinkAmount = 0;
        this.isBlinking = false;
      }
    }

    // Eye gaze
    if (elapsed > this.nextGazeTime) {
      this.gazeTargetX = (Math.random() - 0.5) * 1.6;
      this.gazeTargetY = (Math.random() - 0.5) * 0.8;
      if (this.personality === 'hyper') {
        this.nextGazeTime = elapsed + 0.5 + Math.random() * 1;
      } else if (this.personality === 'sleepy') {
        this.nextGazeTime = elapsed + 3 + Math.random() * 4;
      } else {
        this.nextGazeTime = elapsed + 1.5 + Math.random() * 3;
      }
    }
    const gazeSpeed = this.personality === 'hyper' ? 6 : this.personality === 'sleepy' ? 1.5 : 3;
    s.eyeGazeX += (this.gazeTargetX - s.eyeGazeX) * delta * gazeSpeed;
    s.eyeGazeY += (this.gazeTargetY - s.eyeGazeY) * delta * gazeSpeed;

    // Arm sway
    const armSpeed = this.personality === 'hyper' ? 3.5 :
                     this.personality === 'sleepy' ? 0.5 :
                     this.personality === 'grumpy' ? 0.8 : 1.5;
    const armAmount = this.personality === 'hyper' ? 0.25 :
                      this.personality === 'sleepy' ? 0.05 :
                      this.personality === 'grumpy' ? 0.08 : 0.15;
    s.leftArmAngle = Math.sin(elapsed * armSpeed) * armAmount;
    s.rightArmAngle = Math.sin(elapsed * armSpeed + Math.PI * 0.5) * armAmount;

    // Body squash (subtle breathing)
    const breathSpeed = this.personality === 'hyper' ? 4 :
                        this.personality === 'sleepy' ? 0.6 :
                        this.personality === 'grumpy' ? 1.2 : 2;
    s.bodySquash = Math.sin(elapsed * breathSpeed) * 0.03;

    // Head tilt (idle sway)
    const tiltSpeed = this.personality === 'hyper' ? 2.5 :
                      this.personality === 'sleepy' ? 0.3 :
                      this.personality === 'grumpy' ? 0.6 : 1;
    s.headTilt = Math.sin(elapsed * tiltSpeed + 0.7) * 0.04;

    // Accessory phase
    const accessorySpeed = this.personality === 'hyper' ? 8 :
                           this.personality === 'sleepy' ? 1 :
                           this.personality === 'grumpy' ? 2 : 3;
    s.accessoryPhase = elapsed * accessorySpeed;

    // Mouth idle behavior
    if (this.personality === 'sleepy') {
      s.mouthOpen = Math.max(0, Math.sin(elapsed * 0.6) * 0.12);
    } else if (this.personality === 'hyper') {
      s.mouthOpen = 0.08 + Math.sin(elapsed * 6) * 0.04;
    } else {
      s.mouthOpen = 0;
    }

    // Chatter override
    if (this.chatterTimer > 0) {
      this.chatterTimer -= delta;
      this.isChatterOpen = !this.isChatterOpen;
      s.mouthOpen = this.isChatterOpen ? 0.5 + Math.random() * 0.3 : 0.1;
      if (this.chatterTimer <= 0) {
        s.mouthOpen = 0;
      }
    }

    // ====== Reactions override idle ======
    if (this.reaction !== 'none') {
      this.reactionTimer -= delta;
      const progress = 1 - (this.reactionTimer / this.reactionDuration);

      switch (this.reaction) {
        case 'happy': {
          const bounce = Math.sin(progress * Math.PI * 4) * (1 - progress);
          s.bodySquash = bounce * 0.2;
          s.leftArmAngle = -0.6 * (1 - progress);
          s.rightArmAngle = 0.6 * (1 - progress);
          s.mouthOpen = 0.5 * (1 - progress);
          s.eyeGazeY = -0.3;
          break;
        }
        case 'sad': {
          const droopAmt = Math.sin(progress * Math.PI);
          s.bodySquash = 0.1 * droopAmt;
          s.leftArmAngle = 0.3 * droopAmt;
          s.rightArmAngle = -0.3 * droopAmt;
          s.headTilt = -0.08 * droopAmt;
          s.eyeGazeY = 0.5;
          s.blinkAmount = droopAmt * 0.4;
          break;
        }
        case 'victory': {
          const bounce = Math.abs(Math.sin(progress * Math.PI * 6)) * (1 - progress * 0.5);
          s.bodySquash = bounce * 0.25;
          s.leftArmAngle = -0.9 + Math.sin(progress * Math.PI * 8) * 0.3;
          s.rightArmAngle = 0.9 - Math.sin(progress * Math.PI * 8) * 0.3;
          s.mouthOpen = 0.8 * (1 - progress * 0.5);
          s.headTilt = Math.sin(progress * Math.PI * 6) * 0.15;
          s.eyeGazeX = Math.sin(progress * Math.PI * 4) * 0.5;
          break;
        }
      }

      if (this.reactionTimer <= 0) {
        this.reaction = 'none';
      }
    }

    return s;
  }

  triggerHappy(): void {
    this.reaction = 'happy';
    this.reactionDuration = 0.8;
    this.reactionTimer = 0.8;
  }

  triggerSad(): void {
    this.reaction = 'sad';
    this.reactionDuration = 0.6;
    this.reactionTimer = 0.6;
  }

  triggerVictory(): void {
    this.reaction = 'victory';
    this.reactionDuration = 2.0;
    this.reactionTimer = 2.0;
  }

  /** Make the mouth open/close rapidly for a duration (when robot chatters). */
  triggerChatter(duration: number = 0.4): void {
    this.chatterTimer = duration;
  }
}
