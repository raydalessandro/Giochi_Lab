'use client';

import { motion } from 'framer-motion';
import type { Atom } from '../_data/atoms';

interface AtomBallProps {
  atom: Atom;
  size?: number;
  /** Quante manine sono libere (pulsanti) — null = mostra tutte come libere (palette) */
  freeHands?: number | null;
  /** Se true, l'atomo "vibra" perché instabile/cerca legami */
  hungry?: boolean;
  /** Glow per indicare drop target valido */
  glowing?: boolean;
}

/**
 * L'atomo è una pallina colorata con N piccoli "ganci" che spuntano.
 * Quando ha manine libere, queste pulsano lente (visivamente: "ha fame").
 * Quando tutte le manine sono prese, l'atomo è tranquillo, brilla.
 *
 * Questo è IL componente didattico chiave: rende visibile la valenza
 * come fame visiva. Concetto che un bambino di 5 anni capisce in 10 secondi.
 */
export default function AtomBall({
  atom,
  size = 72,
  freeHands = null,
  hungry = false,
  glowing = false,
}: AtomBallProps) {
  const effectiveFreeHands = freeHands ?? atom.hands;
  const occupiedHands = atom.hands - effectiveFreeHands;

  // Posizioni delle manine attorno alla pallina (equidistanti)
  const handPositions = Array.from({ length: atom.hands }, (_, i) => {
    const angle = (i / atom.hands) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      isFree: i >= occupiedHands,
    };
  });

  return (
    <motion.div
      className="relative inline-block"
      style={{ width: size, height: size }}
      animate={
        hungry
          ? { scale: [1, 1.04, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 1.4, repeat: hungry ? Infinity : 0, ease: 'easeInOut' }}
    >
      {/* Manine — disegnate come piccoli ganci che escono dal centro */}
      {handPositions.map((h, i) => {
        const handLength = size * 0.32;
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: size * 0.18,
              height: size * 0.18,
              backgroundColor: h.isFree ? atom.color : '#94a3b8',
              border: `2px solid ${h.isFree ? '#fff' : '#cbd5e1'}`,
              transformOrigin: 'center',
              x: h.x * handLength - (size * 0.09),
              y: h.y * handLength - (size * 0.09),
              opacity: h.isFree ? 1 : 0.7,
            }}
            animate={
              h.isFree && hungry
                ? {
                    scale: [1, 1.4, 1],
                    opacity: [1, 0.6, 1],
                  }
                : { scale: 1, opacity: h.isFree ? 1 : 0.7 }
            }
            transition={{
              duration: 1,
              repeat: h.isFree && hungry ? Infinity : 0,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        );
      })}

      {/* Corpo dell'atomo */}
      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center font-extrabold shadow-lg"
        style={{
          backgroundColor: atom.color,
          color: atom.textColor,
          fontSize: size * 0.42,
          boxShadow: glowing
            ? `0 0 24px 4px ${atom.color}, 0 8px 16px rgba(0,0,0,0.2)`
            : '0 4px 12px rgba(0,0,0,0.2)',
          border: '3px solid rgba(255,255,255,0.7)',
        }}
        animate={
          glowing
            ? { scale: [1, 1.08, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.8, repeat: glowing ? Infinity : 0 }}
      >
        {atom.symbol}
      </motion.div>
    </motion.div>
  );
}
