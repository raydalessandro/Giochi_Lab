'use client';

// Sistema audio a due livelli:
// 1) Tentativo: MP3 reale da Freesound (cercato a runtime via /api/sounds/search,
//    URL cachato in localStorage così il secondo avvio non rifa la fetch).
// 2) Fallback: beep sintetico via Web Audio API (l'implementazione originale).
//
// I 4 giochi chiamano sempre le stesse funzioni (playTap, playSnap, …): il
// refactor è trasparente.

type Cue = 'tap' | 'select' | 'snap' | 'success' | 'discovery' | 'reject';

// Query Freesound per ogni cue + durata massima (per filtrare sample lunghi).
// Cambiando la query si cambia il sound senza toccare altro.
const QUERIES: Record<Cue, { q: string; maxDuration: number; volume: number }> = {
  tap:       { q: 'pop mouth short ui',          maxDuration: 0.6, volume: 0.45 },
  select:    { q: 'ui select beep menu',         maxDuration: 0.8, volume: 0.45 },
  snap:      { q: 'snap click attach',           maxDuration: 0.6, volume: 0.5  },
  success:   { q: 'success chime kids short',    maxDuration: 1.8, volume: 0.55 },
  discovery: { q: 'magic sparkle reveal short',  maxDuration: 2.5, volume: 0.6  },
  reject:    { q: 'wrong soft buzz short',       maxDuration: 1.0, volume: 0.4  },
};

const ENABLED_KEY = 'giochi-lab:sound';
const URL_KEY_PREFIX = 'giochi-lab:sound-url:';

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(ENABLED_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

// ===== LIVELLO 1: AUDIO MP3 (Freesound) =====

const audioCache = new Map<Cue, HTMLAudioElement>();
// Marca per evitare di re-tentare in loop se la fetch fallisce
const failedFetch = new Set<Cue>();

function cachedUrl(cue: Cue): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(URL_KEY_PREFIX + cue);
  } catch {
    return null;
  }
}

function saveUrl(cue: Cue, url: string): void {
  try {
    window.localStorage.setItem(URL_KEY_PREFIX + cue, url);
  } catch {
    // storage piena, ignoriamo — la cache in-memory basta per la sessione
  }
}

function makeAudio(url: string, volume: number): HTMLAudioElement {
  const a = new Audio(url);
  a.preload = 'auto';
  a.volume = volume;
  a.crossOrigin = 'anonymous';
  return a;
}

async function loadCue(cue: Cue): Promise<HTMLAudioElement | null> {
  if (typeof window === 'undefined') return null;
  if (audioCache.has(cue)) return audioCache.get(cue)!;
  if (failedFetch.has(cue)) return null;

  const cfg = QUERIES[cue];

  // 1) localStorage
  let url = cachedUrl(cue);

  // 2) /api/sounds/search
  if (!url) {
    try {
      const params = new URLSearchParams({
        q: cfg.q,
        max_duration: String(cfg.maxDuration),
        page_size: '1',
      });
      const res = await fetch(`/api/sounds/search?${params.toString()}`);
      if (!res.ok) {
        failedFetch.add(cue);
        return null;
      }
      const data = (await res.json()) as { sounds?: { preview_mp3: string }[] };
      const first = data.sounds?.[0];
      if (!first?.preview_mp3) {
        failedFetch.add(cue);
        return null;
      }
      url = first.preview_mp3;
      saveUrl(cue, url);
    } catch {
      failedFetch.add(cue);
      return null;
    }
  }

  const audio = makeAudio(url, cfg.volume);
  audioCache.set(cue, audio);
  return audio;
}

/**
 * Pre-fetch dei suoni per tutti i cue. Idempotente, sicuro chiamarlo molte volte.
 * Va invocato al mount del layout (SoundPrefetch) così quando l'utente tocca
 * il primo bottone il sample è già pronto in memoria.
 */
export function prefetchAllSounds(): void {
  if (typeof window === 'undefined') return;
  (Object.keys(QUERIES) as Cue[]).forEach((cue) => {
    loadCue(cue).catch(() => {
      /* silenzioso: avremo il fallback beep */
    });
  });
}

// ===== LIVELLO 2: BEEP SINTETICI (fallback Web Audio) =====

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
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function beep(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delayMs = 0
): void {
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

const FALLBACKS: Record<Cue, () => void> = {
  tap: () => beep(700, 50, 'sine', 0.08),
  select: () => {
    beep(520, 80, 'triangle', 0.1);
    beep(780, 80, 'triangle', 0.08, 50);
  },
  snap: () => {
    beep(420, 50, 'square', 0.06);
    beep(640, 70, 'square', 0.07, 40);
  },
  success: () => {
    beep(523, 140, 'triangle', 0.12);
    beep(659, 140, 'triangle', 0.12, 120);
    beep(784, 220, 'triangle', 0.13, 240);
  },
  discovery: () => {
    beep(440, 110, 'sine', 0.1);
    beep(660, 110, 'sine', 0.1, 110);
    beep(880, 260, 'triangle', 0.13, 220);
  },
  reject: () => {
    beep(220, 90, 'sawtooth', 0.06);
    beep(180, 100, 'sawtooth', 0.06, 90);
  },
};

// ===== PLAYBACK =====

function play(cue: Cue): void {
  if (!isEnabled()) return;

  // Audio già caricato → usalo
  const cached = audioCache.get(cue);
  if (cached) {
    try {
      cached.currentTime = 0;
      cached.play().catch(() => FALLBACKS[cue]());
    } catch {
      FALLBACKS[cue]();
    }
    return;
  }

  // Non ancora caricato: prova a caricarlo ora ma intanto suona il fallback
  // (la prossima volta sarà già in cache).
  loadCue(cue).catch(() => {});
  FALLBACKS[cue]();
}

export function playTap(): void { play('tap'); }
export function playSelect(): void { play('select'); }
export function playSnap(): void { play('snap'); }
export function playSuccess(): void { play('success'); }
export function playDiscovery(): void { play('discovery'); }
export function playReject(): void { play('reject'); }
