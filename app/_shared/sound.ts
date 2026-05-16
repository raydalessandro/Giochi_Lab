'use client';

// Suoni sintetici via Web Audio API — zero asset, zero dipendenze.
// La preferenza on/off è letta da localStorage ad ogni chiamata.
// AudioContext è creato pigramente alla prima play (gli AudioContext
// richiedono un user gesture per partire, e le play sono sempre dentro
// handler di click/tap, quindi siamo sicuri).

const KEY = 'giochi-lab:sound';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

function beep(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delayMs = 0
): void {
  if (!isEnabled()) return;
  const c = getCtx();
  if (!c) return;

  const start = c.currentTime + delayMs / 1000;
  const end = start + durationMs / 1000;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

export function playTap(): void {
  beep(700, 50, 'sine', 0.08);
}

export function playSelect(): void {
  beep(520, 80, 'triangle', 0.1);
  beep(780, 80, 'triangle', 0.08, 50);
}

export function playSnap(): void {
  beep(420, 50, 'square', 0.06);
  beep(640, 70, 'square', 0.07, 40);
}

export function playSuccess(): void {
  beep(523, 140, 'triangle', 0.12);
  beep(659, 140, 'triangle', 0.12, 120);
  beep(784, 220, 'triangle', 0.13, 240);
}

export function playDiscovery(): void {
  beep(440, 110, 'sine', 0.1);
  beep(660, 110, 'sine', 0.1, 110);
  beep(880, 260, 'triangle', 0.13, 220);
}

export function playReject(): void {
  beep(220, 90, 'sawtooth', 0.06);
  beep(180, 100, 'sawtooth', 0.06, 90);
}
