import { AudioManager } from './AudioManager';

export class SoundSynth {
  constructor(private audio: AudioManager) {}

  playPlace(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Short "clack" - noise burst through bandpass
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    source.connect(filter).connect(gain).connect(this.audio.getMasterGain());
    source.start(now);
    source.stop(now + 0.06);
  }

  playFlip(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Rising "bwip" - square wave with frequency sweep
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain).connect(this.audio.getMasterGain());
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playRobotChatter(pitch: number = 1.0): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Two-tone beep-boop
    const baseFreq = 300 * pitch;
    const tones = [
      { freq: baseFreq, start: 0, dur: 0.08 },
      { freq: baseFreq * 1.5, start: 0.1, dur: 0.08 },
      { freq: baseFreq * 0.8, start: 0.22, dur: 0.06 },
    ];

    for (const tone of tones) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = tone.freq + (Math.random() - 0.5) * 50;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + tone.start);
      gain.gain.linearRampToValueAtTime(0.15, now + tone.start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);

      osc.connect(gain).connect(this.audio.getMasterGain());
      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.dur + 0.01);
    }
  }

  playVictory(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain).connect(this.audio.getMasterGain());
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  playDefeat(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Descending "wah-wah"
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);

    // Tremolo via LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    lfoGain.connect(gain.gain);
    osc.connect(gain).connect(this.audio.getMasterGain());

    lfo.start(now);
    osc.start(now);
    osc.stop(now + 0.85);
    lfo.stop(now + 0.85);
  }

  playDraw(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Neutral chord that resolves ambiguously
    const notes = [330, 392, 440]; // E4, G4, A4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + i * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain).connect(this.audio.getMasterGain());
      osc.start(start);
      osc.stop(start + 0.65);
    });
  }

  playMenuClick(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Short sine "pip"
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 660;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain).connect(this.audio.getMasterGain());
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBuzz(): void {
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;

    // Low buzzer
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 80;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain).connect(this.audio.getMasterGain());
    osc.start(now);
    osc.stop(now + 0.18);
  }
}
