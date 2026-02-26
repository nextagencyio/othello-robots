export interface Robot {
  id: string;
  name: string;
  tagline: string;
  primaryColor: string;
  primaryHex: number;
  voicePitch: number;
  personality: 'cheerful' | 'grumpy' | 'hyper' | 'sleepy';
}

// Animation state passed to draw functions each frame
export interface RobotAnimState {
  leftArmAngle: number;   // radians, 0 = resting
  rightArmAngle: number;
  eyeGazeX: number;       // -1 to 1
  eyeGazeY: number;       // -1 to 1
  blinkAmount: number;    // 0 = open, 1 = closed
  mouthOpen: number;      // 0 = closed, 1 = open
  bodySquash: number;     // 0 = normal, >0 = squash, <0 = stretch
  headTilt: number;       // radians
  accessoryPhase: number; // generic phase for propeller spin, antenna wiggle, etc.
}

export function defaultAnimState(): RobotAnimState {
  return {
    leftArmAngle: 0,
    rightArmAngle: 0,
    eyeGazeX: 0,
    eyeGazeY: 0,
    blinkAmount: 0,
    mouthOpen: 0,
    bodySquash: 0,
    headTilt: 0,
    accessoryPhase: 0,
  };
}
