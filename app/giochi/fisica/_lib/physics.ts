// Formule fisiche pure per le macchine semplici.
// Tutto in unità arbitrarie ma proporzionalmente corrette.

/**
 * LEVA: F1 × d1 = F2 × d2
 * Dato un masso di peso `loadWeight` a distanza `loadArm` dal fulcro,
 * calcola la forza necessaria all'altro braccio di lunghezza `effortArm`.
 */
export function leverForceNeeded(
  loadWeight: number,
  loadArm: number,
  effortArm: number
): number {
  if (effortArm <= 0) return Infinity;
  return (loadWeight * loadArm) / effortArm;
}

/**
 * Vantaggio meccanico della leva: quanto la leva "moltiplica" la tua forza.
 * MA > 1 → ti aiuta. MA < 1 → ti penalizza (raro, per velocità).
 */
export function leverAdvantage(loadArm: number, effortArm: number): number {
  if (loadArm <= 0) return Infinity;
  return effortArm / loadArm;
}

/**
 * PIANO INCLINATO: F = W × sin(θ)
 * angle in gradi.
 */
export function rampForceNeeded(weight: number, angleDeg: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return weight * Math.sin(rad);
}

export function rampAdvantage(angleDeg: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  const s = Math.sin(rad);
  if (s <= 0) return Infinity;
  return 1 / s;
}

/**
 * CARRUCOLA: con N corde di sostegno, la forza richiesta è W/N
 * ma devi tirare N volte la corda.
 */
export function pulleyForceNeeded(weight: number, ropeCount: number): number {
  if (ropeCount <= 0) return Infinity;
  return weight / ropeCount;
}

/**
 * CUNEO: F = W × (thickness / length)
 * Più sottile e lungo, meno forza.
 */
export function wedgeForceNeeded(
  resistance: number,
  thickness: number,
  length: number
): number {
  if (length <= 0) return Infinity;
  return resistance * (thickness / length);
}

/**
 * VITE: F = W × (pitch / (2π × radius))
 * pitch = passo della filettatura, radius = raggio della leva di rotazione
 */
export function screwForceNeeded(
  weight: number,
  pitch: number,
  leverRadius: number
): number {
  if (leverRadius <= 0) return Infinity;
  return weight * (pitch / (2 * Math.PI * leverRadius));
}

/**
 * Indicatore qualitativo della forza richiesta, per UI bambini.
 * 0 = nessuna fatica, 5 = impossibile.
 */
export function forceLevel(forceNeeded: number, maxForce: number): number {
  if (forceNeeded <= 0) return 0;
  if (forceNeeded >= maxForce) return 5;
  return Math.min(5, Math.max(0, (forceNeeded / maxForce) * 5));
}
