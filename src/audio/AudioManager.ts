export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3;
  }

  getContext(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  getMasterGain(): GainNode {
    if (!this.masterGain) this.init();
    return this.masterGain!;
  }

  setVolume(v: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }
}
