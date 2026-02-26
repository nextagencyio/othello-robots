import { AudioManager } from './AudioManager';

// Musical constants
const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

// Chord progressions (fun robot-y vibes)
const PROGRESSIONS = [
  // Happy bouncy (C major)
  [['C4', 'E4', 'G4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4']],
  // Mysterious (Am - Dm - G - C)
  [['A3', 'C4', 'E4'], ['D3', 'F3', 'A3'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4']],
  // Playful (C - G - Am - F)
  [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']],
];

// Melody patterns (scale degree offsets relative to chord root)
const MELODY_PATTERNS = [
  [0, 2, 4, 2, 0, -1, 0, 2],
  [4, 2, 0, 2, 4, 4, 4, -1],
  [0, 0, 2, 2, 4, 4, 2, -1],
  [4, 2, 4, 5, 4, 2, 0, -1],
];

// Bass patterns (rhythm: 1 = play, 0 = rest)
const BASS_PATTERNS = [
  [1, 0, 1, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 0, 1, 1, 0, 0, 1],
];

/**
 * Procedural chiptune-style background music using Web Audio API.
 * Generates a looping pattern of chords, melody, and bass.
 */
export class MusicManager {
  private audio: AudioManager;
  private isPlaying = false;
  private nextBeatTime = 0;
  private currentBeat = 0;
  private currentChordIndex = 0;
  private bpm = 120;
  private progression: string[][];
  private melodyPattern: number[];
  private bassPattern: number[];
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;

  // Audio nodes
  private musicGain: GainNode | null = null;

  // Scale notes for melody generation
  private scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'G5'];

  constructor(audio: AudioManager) {
    this.audio = audio;
    // Pick random progression and patterns
    this.progression = PROGRESSIONS[Math.floor(Math.random() * PROGRESSIONS.length)];
    this.melodyPattern = MELODY_PATTERNS[Math.floor(Math.random() * MELODY_PATTERNS.length)];
    this.bassPattern = BASS_PATTERNS[Math.floor(Math.random() * BASS_PATTERNS.length)];
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const ctx = this.audio.getContext();
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.audio.getMasterGain());

    // Fade in
    this.musicGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2);

    this.nextBeatTime = ctx.currentTime + 0.1;
    this.currentBeat = 0;
    this.currentChordIndex = 0;

    // Schedule ahead using a look-ahead scheduler
    this.schedulerInterval = setInterval(() => this.schedule(), 50);
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.musicGain) {
      const ctx = this.audio.getContext();
      this.musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      // Disconnect after fade out
      const gain = this.musicGain;
      setTimeout(() => gain.disconnect(), 1500);
      this.musicGain = null;
    }

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  private schedule(): void {
    if (!this.isPlaying || !this.musicGain) return;

    const ctx = this.audio.getContext();
    const lookAhead = 0.15; // seconds to schedule ahead

    while (this.nextBeatTime < ctx.currentTime + lookAhead) {
      this.playBeat(this.nextBeatTime);
      this.advanceBeat();
    }
  }

  private playBeat(time: number): void {
    const ctx = this.audio.getContext();
    if (!this.musicGain) return;

    const beatInMeasure = this.currentBeat % 8;
    const chord = this.progression[this.currentChordIndex];
    const beatDur = 60 / this.bpm / 2; // eighth notes

    // === Chord pads (every 8 beats = new chord, sustain) ===
    if (beatInMeasure === 0) {
      for (const note of chord) {
        const freq = NOTE_FREQS[note];
        if (!freq) continue;
        this.playTone(ctx, freq, time, beatDur * 7.5, 'triangle', 0.06, this.musicGain);
      }
    }

    // === Bass line ===
    const bassPlay = this.bassPattern[beatInMeasure];
    if (bassPlay) {
      const bassNote = chord[0]; // root note
      const bassFreq = NOTE_FREQS[bassNote];
      if (bassFreq) {
        this.playTone(ctx, bassFreq / 2, time, beatDur * 0.8, 'square', 0.1, this.musicGain);
      }
    }

    // === Melody (on even beats) ===
    if (beatInMeasure % 2 === 0) {
      const melodyIdx = beatInMeasure / 2;
      const degree = this.melodyPattern[melodyIdx % this.melodyPattern.length];
      if (degree >= 0) {
        // Map degree relative to chord root position in scale
        const rootNote = chord[0];
        const rootIdx = this.scale.indexOf(rootNote);
        const noteIdx = Math.max(0, Math.min(this.scale.length - 1, (rootIdx >= 0 ? rootIdx : 3) + degree));
        const melodyNote = this.scale[noteIdx];
        const melodyFreq = NOTE_FREQS[melodyNote];
        if (melodyFreq) {
          this.playTone(ctx, melodyFreq, time, beatDur * 1.5, 'square', 0.08, this.musicGain);
        }
      }
    }

    // === Percussion (hi-hat on every beat, kick on 0,4) ===
    if (beatInMeasure === 0 || beatInMeasure === 4) {
      this.playKick(ctx, time, this.musicGain);
    }
    this.playHiHat(ctx, time, this.musicGain);
  }

  private advanceBeat(): void {
    const beatDur = 60 / this.bpm / 2;
    this.nextBeatTime += beatDur;
    this.currentBeat++;

    // Advance chord every 8 beats (1 measure)
    if (this.currentBeat % 8 === 0) {
      this.currentChordIndex = (this.currentChordIndex + 1) % this.progression.length;

      // Occasionally switch patterns for variety
      if (this.currentChordIndex === 0 && Math.random() < 0.3) {
        this.melodyPattern = MELODY_PATTERNS[Math.floor(Math.random() * MELODY_PATTERNS.length)];
      }
      if (this.currentChordIndex === 0 && Math.random() < 0.2) {
        this.bassPattern = BASS_PATTERNS[Math.floor(Math.random() * BASS_PATTERNS.length)];
      }
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    time: number,
    dur: number,
    type: OscillatorType,
    volume: number,
    dest: AudioNode
  ): void {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  private playKick(ctx: AudioContext, time: number, dest: AudioNode): void {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private playHiHat(ctx: AudioContext, time: number, dest: AudioNode): void {
    const bufferSize = Math.floor(ctx.sampleRate * 0.02);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    source.connect(filter).connect(gain).connect(dest);
    source.start(time);
    source.stop(time + 0.04);
  }
}
