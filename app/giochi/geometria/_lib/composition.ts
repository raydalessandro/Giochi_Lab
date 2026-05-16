// Libreria condivisa con il Laboratorio (chimica) e con i futuri giochi.
//
// È IDENTICA al file laboratorio/_lib/composition.ts — lo scopo è didattico:
// il bambino impara che giocando a giochi diversi sta usando LA STESSA grammatica
// (mattoncini con identità, regole di legame, soglia di stabilità, emergenza).
//
// Quando monterai i 4 giochi insieme, valuta di spostare questo file in
// `app/_shared/composition.ts` e importarlo da entrambi.

export type PieceId = string;

export interface PieceInstance {
  instanceId: string;
  pieceId: PieceId;
  x: number;
  y: number;
  freeSlots: number;
  bonds: string[];
  // Estensione per geometria: ogni pezzo può avere rotazione e dati custom
  rotation?: number;
  meta?: Record<string, unknown>;
}

export interface CompositionStatus {
  totalFreeSlots: number;
  isStable: boolean;
  isOvercommitted: boolean;
  pieceCount: number;
}

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

export function fingerprint(pieces: PieceInstance[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of pieces) {
    counts[p.pieceId] = (counts[p.pieceId] ?? 0) + 1;
  }
  return counts;
}

let _counter = 0;
export function newInstanceId(): string {
  _counter += 1;
  return `g${Date.now().toString(36)}${_counter}`;
}
