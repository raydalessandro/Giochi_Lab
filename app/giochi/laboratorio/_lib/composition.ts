// Sistema di "regole di composizione" condiviso tra Laboratorio e Geometria.
//
// Astrazione EAR: ogni gioco è un sistema in cui MATTONCINI con IDENTITÀ (Δ)
// si combinano secondo REGOLE (⇄) e producono ENTITÀ EMERGENTI (⟳) quando
// si supera una SOGLIA di stabilità (P3).
//
// Questo modulo definisce le primitive condivise. I due giochi le concretizzano
// con dati diversi ma la "grammatica" è la stessa — è il punto di tutto il
// progetto: insegnare ai bambini un META-PATTERN, non due materie isolate.

export type PieceId = string;

export interface PieceInstance {
  instanceId: string;   // identificativo unico nello stage
  pieceId: PieceId;     // tipo (es: 'H', oppure 'triangle_equilateral')
  x: number;
  y: number;
  /** "manine" residue / vertici liberi / lati liberi — concetto generalizzato */
  freeSlots: number;
  /** legami stabiliti con altre istanze */
  bonds: string[];      // instanceId di partner
}

export interface CompositionStatus {
  totalFreeSlots: number;
  isStable: boolean;            // tutte le manine occupate
  isOvercommitted: boolean;     // qualche pezzo ha troppi legami (errore di stato)
  pieceCount: number;
}

/**
 * Calcola lo stato di composizione dato un insieme di pezzi attivi.
 * Stable ⟺ ogni pezzo ha freeSlots === 0 ⟺ K ≥ K_crit.
 */
export function computeStatus(pieces: PieceInstance[]): CompositionStatus {
  let totalFree = 0;
  let over = false;
  for (const p of pieces) {
    if (p.freeSlots < 0) over = true;
    totalFree += p.freeSlots;
  }
  return {
    totalFreeSlots: totalFree,
    isStable: pieces.length > 0 && totalFree === 0 && !over,
    isOvercommitted: over,
    pieceCount: pieces.length,
  };
}

/**
 * Costruisce un fingerprint di composizione (es: {H:2, O:1}).
 * Usato per cercare la molecola risultante.
 */
export function fingerprint(pieces: PieceInstance[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of pieces) {
    counts[p.pieceId] = (counts[p.pieceId] ?? 0) + 1;
  }
  return counts;
}

/**
 * Genera un instanceId univoco e leggero (no uuid lib).
 */
let _counter = 0;
export function newInstanceId(): string {
  _counter += 1;
  return `i${Date.now().toString(36)}${_counter}`;
}
