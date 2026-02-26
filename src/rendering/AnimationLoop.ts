export type UpdateCallback = (delta: number, elapsed: number) => void;

export class AnimationLoop {
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private callbacks: UpdateCallback[] = [];
  private rafId = 0;

  addCallback(cb: UpdateCallback): void {
    this.callbacks.push(cb);
  }

  removeCallback(cb: UpdateCallback): void {
    const idx = this.callbacks.indexOf(cb);
    if (idx !== -1) this.callbacks.splice(idx, 1);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = now;
    this.elapsed += delta;

    for (const cb of this.callbacks) {
      cb(delta, this.elapsed);
    }
  };

  getElapsed(): number {
    return this.elapsed;
  }
}
