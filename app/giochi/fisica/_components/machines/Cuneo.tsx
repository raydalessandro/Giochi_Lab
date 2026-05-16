'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceMeter from '../ui/ForceMeter';
import ConceptCard from '../ui/ConceptCard';
import { wedgeForceNeeded, forceLevel } from '../../_lib/physics';

interface CuneoProps {
  onBack: () => void;
}

const MAX_FORCE_KID = 12;
const LOG_RESISTANCE = 40;

export default function Cuneo({ onBack }: CuneoProps) {
  const [thickness, setThickness] = useState(20); // 5-40
  const [length, setLength] = useState(80);       // 40-160
  const [striking, setStriking] = useState(false);
  const [progress, setProgress] = useState(0);    // 0-1 penetrazione del cuneo
  const [showConcept, setShowConcept] = useState(true);
  const [solved, setSolved] = useState(false);

  const forceNeeded = wedgeForceNeeded(LOG_RESISTANCE, thickness, length);
  const level5 = forceLevel(forceNeeded, MAX_FORCE_KID);
  const canStrike = forceNeeded <= MAX_FORCE_KID;

  useEffect(() => {
    setProgress(0);
    setSolved(false);
  }, [thickness, length]);

  useEffect(() => {
    if (!striking || !canStrike || solved) return;
    const speed = Math.max(0.01, (MAX_FORCE_KID - forceNeeded) / MAX_FORCE_KID * 0.04);
    const interval = setInterval(() => {
      setProgress((p) => {
        const np = Math.min(1, p + speed);
        if (np >= 1) setSolved(true);
        return np;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [striking, canStrike, forceNeeded, solved]);

  const SVG_W = 700;
  const SVG_H = 400;
  // Tronco
  const logX = 150;
  const logY = 200;
  const logW = 400;
  const logH = 80;
  // Cuneo
  const wedgeY = logY + logH / 2 - 50 + progress * 30;
  const splitWidth = progress * thickness * 2;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-green-100 to-amber-100">
      <header className="flex justify-between items-center px-4 py-3 bg-white/40 backdrop-blur">
        <button onClick={onBack} className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95">
          ← Indietro
        </button>
        <h2 className="text-lg font-extrabold text-purple-900">🪓 Il Cuneo</h2>
        <button onClick={() => setShowConcept(true)} className="bg-white/90 w-9 h-9 rounded-full text-purple-700 font-bold shadow active:scale-95">?</button>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Tronco */}
            <rect x={logX} y={logY} width={(logW - splitWidth) / 2} height={logH} fill="#92400e" stroke="#78350f" strokeWidth="3" rx="6" />
            <rect x={logX + (logW + splitWidth) / 2} y={logY} width={(logW - splitWidth) / 2} height={logH} fill="#92400e" stroke="#78350f" strokeWidth="3" rx="6" />

            {/* Cuneo */}
            <motion.polygon
              points={`${SVG_W / 2 - thickness},${wedgeY} ${SVG_W / 2 + thickness},${wedgeY} ${SVG_W / 2},${wedgeY + length}`}
              fill="#64748b"
              stroke="#1e293b"
              strokeWidth="2"
              animate={{ y: 0 }}
            />

            {/* Etichette */}
            <text x={SVG_W / 2} y={wedgeY - 10} textAnchor="middle" fontSize="14" fontWeight="900" fill="#1e293b">
              spessore: {thickness}, lungo: {length}
            </text>
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 rounded-2xl p-3 shadow">
            <ForceMeter level={level5} />
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
            <motion.button
              className={`px-12 py-4 rounded-full font-extrabold text-white shadow-xl ${canStrike ? 'bg-green-500' : 'bg-red-400'}`}
              whileTap={{ scale: 0.95 }}
              onPointerDown={() => setStriking(true)}
              onPointerUp={() => setStriking(false)}
              onPointerLeave={() => setStriking(false)}
              style={{ touchAction: 'none' }}
            >
              {striking ? '🔨 BATTO!' : '✋ Tieni premuto per battere'}
            </motion.button>
          </div>
        </div>

        <div className="bg-white/90 px-4 py-3 backdrop-blur space-y-2">
          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1">Spessore del cuneo</label>
            <input type="range" min={5} max={40} value={thickness} onChange={(e) => setThickness(parseInt(e.target.value))} className="w-full accent-purple-600" />
            <div className="flex justify-between text-[10px] text-gray-600 font-bold"><span>← Sottile (facile)</span><span>Spesso (durissimo) →</span></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1">Lunghezza del cuneo</label>
            <input type="range" min={40} max={160} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full accent-purple-600" />
            <div className="flex justify-between text-[10px] text-gray-600 font-bold"><span>← Corto (durissimo)</span><span>Lungo (facile) →</span></div>
          </div>
        </div>
      </main>

      <ConceptCard
        show={showConcept}
        emoji="🪓"
        title="Il Cuneo"
        concept="Il cuneo è un piano inclinato ribaltato! Più è sottile e lungo, meno forza serve per spaccare le cose. Per questo i coltelli affilati tagliano bene e quelli spuntati no!"
        realWorld={[
          { emoji: '🔪', text: 'Coltelli, asce, forbici' },
          { emoji: '🦷', text: 'I tuoi denti davanti (incisivi) sono cunei!' },
          { emoji: '⛓️', text: 'I chiodi sono cunei lunghi' },
        ]}
        onClose={() => setShowConcept(false)}
      />

      <AnimatePresence>
        {solved && (
          <motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              <div className="text-5xl text-center">🪵💥</div>
              <div className="text-lg font-extrabold text-center text-purple-900 mt-2">Tronco spaccato!</div>
              <button onClick={() => { setSolved(false); setProgress(0); }} className="w-full mt-4 py-2 bg-purple-500 text-white font-bold rounded-full text-sm">Riprova</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
