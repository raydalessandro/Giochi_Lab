'use client';

import { motion } from 'framer-motion';
import { ATOMS, type Atom, type AtomId } from '../_data/atoms';
import AtomBall from './AtomBall';

interface AtomPaletteProps {
  onSpawn: (atomId: AtomId, x: number, y: number) => void;
}

/**
 * Barra in basso con gli atomi disponibili.
 * Tappare/trascinare uno spawn-a una nuova istanza nell'area di gioco.
 * Per semplicità iniziale: tap = spawn al centro dell'area.
 * Drag dal palette è gestito a livello superiore (vedi Laboratorio).
 */
export default function AtomPalette({ onSpawn }: AtomPaletteProps) {
  return (
    <div className="bg-white/90 backdrop-blur border-t-2 border-blue-100 px-3 py-3">
      <div className="flex justify-center items-center gap-3 flex-wrap">
        {ATOMS.map((atom) => (
          <PaletteAtom key={atom.id} atom={atom} onSpawn={onSpawn} />
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-500 mt-2 font-medium">
        Trascina gli atomi nell'area! Le palline con i puntini cercano amici 👋
      </p>
    </div>
  );
}

interface PaletteAtomProps {
  atom: Atom;
  onSpawn: (atomId: AtomId, x: number, y: number) => void;
}

function PaletteAtom({ atom, onSpawn }: PaletteAtomProps) {
  // Gestione "tap to spawn": al pointer-down, spawna istanza all'area di gioco
  // (calcolo della posizione gestito dal parent).
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onPointerDown={(e) => {
        // Passa coordinate del tap come hint
        onSpawn(atom.id, e.clientX, e.clientY);
      }}
      className="flex flex-col items-center p-1 rounded-2xl bg-transparent border-none cursor-pointer touch-none"
      aria-label={`Aggiungi ${atom.name}`}
    >
      <AtomBall atom={atom} size={56} hungry={false} />
      <span className="text-[10px] font-bold text-gray-700 mt-1">{atom.hands} ✋</span>
    </motion.button>
  );
}
