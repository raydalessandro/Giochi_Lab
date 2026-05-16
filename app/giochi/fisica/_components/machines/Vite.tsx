'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceMeter from '../ui/ForceMeter';
import ConceptCard from '../ui/ConceptCard';
import { screwForceNeeded, forceLevel } from '../../_lib/physics';

interface ViteProps {
  onBack: () => void;
}

const MAX_FORCE_KID = 12;
const CAR_WEIGHT = 800;

export default function Vite({ onBack }: ViteProps) {
  const [pitch, setPitch] = useState(8);         // 2-20: passo della filettatura
  const [leverRadius, setLeverRadius] = useState(60); // 20-120
  const [turning, setTurning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [height, setHeight] = useState(0);       // altezza sollevamento auto
  const [solved, setSolved] = useState(false);
  const [showConcept, setShowConcept] = useState(true);

  const forceNeeded = screwForceNeeded(CAR_WEIGHT, pitch, leverRadius);
  const level5 = forceLevel(forceNeeded, MAX_FORCE_KID);
  const canTurn = forceNeeded <= MAX_FORCE_KID;

  useEffect(() => {
    setHeight(0);
    setRotation(0);
    setSolved(false);
  }, [pitch, leverRadius]);

  useEffect(() => {
    if (!turning || !canTurn || solved) return;
    const speed = Math.max(0.005, (MAX_FORCE_KID - forceNeeded) / MAX_FORCE_KID * 0.02);
    const interval = setInterval(() => {
      setRotation((r) => r + 6);
      setHeight((h) => {
        const nh = Math.min(1, h + speed);
        if (nh >= 1) setSolved(true);
        return nh;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [turning, canTurn, forceNeeded, solved]);

  const SVG_W = 700;
  const SVG_H = 400;
  const groundY = 340;
  const carY = groundY - 30 - height * 100;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-200 to-stone-100">
      <header className="flex justify-between items-center px-4 py-3 bg-white/40 backdrop-blur">
        <button onClick={onBack} className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95">← Indietro</button>
        <h2 className="text-lg font-extrabold text-purple-900">🔩 La Vite</h2>
        <button onClick={() => setShowConcept(true)} className="bg-white/90 w-9 h-9 rounded-full text-purple-700 font-bold shadow active:scale-95">?</button>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x="0" y={groundY} width={SVG_W} height={SVG_H - groundY} fill="#92400e" opacity="0.3" />
            <line x1="0" y1={groundY} x2={SVG_W} y2={groundY} stroke="#78350f" strokeWidth="3" />

            {/* Martinetto base */}
            <rect x={SVG_W / 2 - 40} y={groundY - 30} width="80" height="30" fill="#475569" stroke="#1e293b" strokeWidth="3" rx="4" />
            {/* Filettatura visibile */}
            <line x1={SVG_W / 2} y1={groundY - 30} x2={SVG_W / 2} y2={carY + 10} stroke="#64748b" strokeWidth="14" strokeLinecap="round" />
            {/* Helix decorativo */}
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={i}
                cx={SVG_W / 2}
                cy={groundY - 40 - i * 12}
                rx="9"
                ry="3"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
            ))}

            {/* Auto sollevata */}
            <motion.text x={SVG_W / 2} y={carY} textAnchor="middle" fontSize="60" animate={{ y: carY }}>🚗</motion.text>

            {/* Manovella */}
            <motion.g
              animate={{ rotate: rotation }}
              style={{ transformOrigin: `${SVG_W / 2 + 100}px ${groundY - 20}px` }}
            >
              <line
                x1={SVG_W / 2 + 100}
                y1={groundY - 20}
                x2={SVG_W / 2 + 100 + leverRadius}
                y2={groundY - 20}
                stroke="#854d0e"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx={SVG_W / 2 + 100 + leverRadius} cy={groundY - 20} r="10" fill="#facc15" stroke="#854d0e" strokeWidth="2" />
            </motion.g>
            <line x1={SVG_W / 2 + 40} y1={groundY - 20} x2={SVG_W / 2 + 100} y2={groundY - 20} stroke="#475569" strokeWidth="3" />
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 rounded-2xl p-3 shadow"><ForceMeter level={level5} /></div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
            <motion.button
              className={`px-12 py-4 rounded-full font-extrabold text-white shadow-xl ${canTurn ? 'bg-green-500' : 'bg-red-400'}`}
              whileTap={{ scale: 0.95 }}
              onPointerDown={() => setTurning(true)}
              onPointerUp={() => setTurning(false)}
              onPointerLeave={() => setTurning(false)}
              style={{ touchAction: 'none' }}
            >
              {turning ? '🔄 GIRO!' : '✋ Tieni premuto per girare'}
            </motion.button>
          </div>
        </div>

        <div className="bg-white/90 px-4 py-3 backdrop-blur space-y-2">
          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1">Passo della vite (quanto sale ad ogni giro)</label>
            <input type="range" min={2} max={20} value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))} className="w-full accent-purple-600" />
            <div className="flex justify-between text-[10px] text-gray-600 font-bold"><span>← Fitto (facile)</span><span>Largo (durissimo) →</span></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1">Lunghezza della manovella</label>
            <input type="range" min={20} max={120} value={leverRadius} onChange={(e) => setLeverRadius(parseInt(e.target.value))} className="w-full accent-purple-600" />
            <div className="flex justify-between text-[10px] text-gray-600 font-bold"><span>← Corta (dura)</span><span>Lunga (facile) →</span></div>
          </div>
        </div>
      </main>

      <ConceptCard
        show={showConcept}
        emoji="🔩"
        title="La Vite"
        concept="Una vite è un piano inclinato avvolto a spirale! Girare una manovella lunga fa fare poca strada alla vite ma con tanta forza. Per questo puoi sollevare un'auto da solo con un martinetto!"
        realWorld={[
          { emoji: '🚗', text: 'Il martinetto per cambiare gli pneumatici' },
          { emoji: '🍾', text: 'I cavatappi' },
          { emoji: '🔧', text: 'Tutte le viti, dappertutto!' },
        ]}
        onClose={() => setShowConcept(false)}
      />

      <AnimatePresence>
        {solved && (
          <motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              <div className="text-5xl text-center">🚗⬆️</div>
              <div className="text-lg font-extrabold text-center text-purple-900 mt-2">Auto sollevata!</div>
              <p className="text-xs text-gray-700 text-center mt-2 max-w-xs">Hai sollevato 800kg con le tue mani!</p>
              <button onClick={() => { setSolved(false); setHeight(0); }} className="w-full mt-4 py-2 bg-purple-500 text-white font-bold rounded-full text-sm">Riprova</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
