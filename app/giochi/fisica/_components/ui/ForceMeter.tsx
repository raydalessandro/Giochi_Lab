'use client';

import { motion } from 'framer-motion';

interface ForceMeterProps {
  /** 0-5: livello qualitativo di forza richiesta */
  level: number;
  /** Etichetta sotto al meter */
  label?: string;
}

/**
 * Indicatore di "quanta forza serve". Diviso in 5 segmenti che si accendono
 * progressivamente. Verde (facile) → Giallo (medio) → Rosso (durissimo).
 * Il bambino vede in tempo reale come le sue azioni cambiano lo sforzo.
 */
export default function ForceMeter({ level, label }: ForceMeterProps) {
  const clamped = Math.min(5, Math.max(0, level));
  const segments = [0, 1, 2, 3, 4];

  function colorFor(i: number): string {
    if (i >= clamped) return '#e5e7eb';
    if (i < 2) return '#22c55e';
    if (i < 4) return '#facc15';
    return '#ef4444';
  }

  const impossible = clamped >= 5;
  const easy = clamped < 1;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        {segments.map((i) => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{
              width: 14,
              height: 28,
              background: colorFor(i),
              boxShadow: i < clamped ? `0 0 6px ${colorFor(i)}` : 'none',
            }}
            animate={
              i === Math.floor(clamped) && !impossible
                ? { scale: [1, 1.15, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.6, repeat: i === Math.floor(clamped) ? Infinity : 0 }}
          />
        ))}
      </div>
      <div className="text-[10px] font-bold text-gray-600 uppercase">
        {label ?? 'Forza che serve'}
      </div>
      <div className="text-xs font-extrabold mt-0.5">
        {impossible ? (
          <span className="text-red-600">😰 Impossibile!</span>
        ) : easy ? (
          <span className="text-green-600">😎 Facilissimo!</span>
        ) : clamped < 3 ? (
          <span className="text-yellow-600">💪 Si può fare</span>
        ) : (
          <span className="text-orange-600">😤 Difficile</span>
        )}
      </div>
    </div>
  );
}
