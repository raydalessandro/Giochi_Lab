'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceMeter from '../ui/ForceMeter';
import ConceptCard from '../ui/ConceptCard';
import { forceLevel } from '../../_lib/physics';

interface RuotaAsseProps {
  onBack: () => void;
}

const MAX_FORCE_KID = 12;
const CARGO_WEIGHT = 60;

export default function RuotaAsse({ onBack }: RuotaAsseProps) {
  const [hasWheels, setHasWheels] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [position, setPosition] = useState(0); // 0-1 progresso del carrello
  const [showConcept, setShowConcept] = useState(true);
  const [solved, setSolved] = useState(false);

  // Senza ruote: attrito enorme → forza richiesta = peso intero
  // Con ruote: attrito molto basso → forza ~1/10
  const forceNeeded = hasWheels ? CARGO_WEIGHT * 0.1 : CARGO_WEIGHT;
  const level5 = forceLevel(forceNeeded, MAX_FORCE_KID);
  const canPush = forceNeeded <= MAX_FORCE_KID;

  useEffect(() => {
    setPosition(0);
    setSolved(false);
  }, [hasWheels]);

  useEffect(() => {
    if (!pushing || !canPush || solved) return;
    const speed = hasWheels ? 0.018 : 0.003;
    const interval = setInterval(() => {
      setPosition((p) => {
        const np = Math.min(1, p + speed);
        if (np >= 1) setSolved(true);
        return np;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [pushing, canPush, hasWheels, solved]);

  const SVG_W = 700;
  const SVG_H = 350;
  const groundY = 280;
  const cargoX = 80 + position * 480;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-orange-100 to-amber-100">
      <header className="flex justify-between items-center px-4 py-3 bg-white/40 backdrop-blur">
        <button onClick={onBack} className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95">← Indietro</button>
        <h2 className="text-lg font-extrabold text-purple-900">🛞 La Ruota</h2>
        <button onClick={() => setShowConcept(true)} className="bg-white/90 w-9 h-9 rounded-full text-purple-700 font-bold shadow active:scale-95">?</button>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <rect x="0" y={groundY} width={SVG_W} height={SVG_H - groundY} fill="#92400e" opacity="0.3" />
            <line x1="0" y1={groundY} x2={SVG_W} y2={groundY} stroke="#78350f" strokeWidth="3" />

            {/* Target */}
            <text x="610" y={groundY - 10} textAnchor="middle" fontSize="32">🎯</text>

            {/* Cassa */}
            <motion.g animate={{ x: cargoX - 80 }} transition={{ type: 'tween', duration: 0.03 }}>
              <rect x="50" y={groundY - 60} width="80" height="60" fill="#92400e" stroke="#78350f" strokeWidth="3" rx="4" />
              <text x="90" y={groundY - 25} textAnchor="middle" fontSize="28">📦</text>

              {hasWheels && (
                <>
                  <motion.circle
                    cx="65"
                    cy={groundY - 5}
                    r="12"
                    fill="#1e293b"
                    stroke="#0f172a"
                    strokeWidth="2"
                    animate={{ rotate: position * 720 }}
                    style={{ transformOrigin: `65px ${groundY - 5}px` }}
                  />
                  <motion.circle
                    cx="115"
                    cy={groundY - 5}
                    r="12"
                    fill="#1e293b"
                    stroke="#0f172a"
                    strokeWidth="2"
                    animate={{ rotate: position * 720 }}
                    style={{ transformOrigin: `115px ${groundY - 5}px` }}
                  />
                </>
              )}

              {/* Mano */}
              <text x="20" y={groundY - 28} fontSize="32">✋</text>
            </motion.g>

            {/* Tracce di attrito senza ruote */}
            {!hasWheels && position > 0 && (
              <g>
                {Array.from({ length: 5 }).map((_, i) => (
                  <text key={i} x={120 + i * 40 * position} y={groundY + 15} fontSize="20" opacity="0.5">💨</text>
                ))}
              </g>
            )}
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 rounded-2xl p-3 shadow"><ForceMeter level={level5} /></div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
            <motion.button
              className={`px-12 py-4 rounded-full font-extrabold text-white shadow-xl ${canPush ? 'bg-green-500' : 'bg-red-400'}`}
              whileTap={{ scale: 0.95 }}
              onPointerDown={() => setPushing(true)}
              onPointerUp={() => setPushing(false)}
              onPointerLeave={() => setPushing(false)}
              style={{ touchAction: 'none' }}
            >
              {pushing ? '💪 SPINGO!' : '✋ Tieni premuto per spingere'}
            </motion.button>
          </div>
        </div>

        <div className="bg-white/90 px-4 py-3 backdrop-blur">
          <label className="block text-xs font-bold text-purple-900 mb-2 text-center">
            Vuoi mettere le ruote alla cassa?
          </label>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setHasWheels(false)}
              className={`px-4 py-2 rounded-full font-bold text-sm ${!hasWheels ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              📦 Senza ruote
            </button>
            <button
              onClick={() => setHasWheels(true)}
              className={`px-4 py-2 rounded-full font-bold text-sm ${hasWheels ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              🛞 Con ruote
            </button>
          </div>
        </div>
      </main>

      <ConceptCard
        show={showConcept}
        emoji="🛞"
        title="La Ruota e l'Asse"
        concept="L'attrito è la forza che frena le cose che strisciano. La ruota gira invece di strisciare: l'attrito diventa quasi zero! Per questo le ruote sono UNA delle invenzioni più grandi dell'umanità."
        realWorld={[
          { emoji: '🚲', text: 'Biciclette, macchine, treni' },
          { emoji: '🛒', text: 'Tutti i carrelli e le valigie' },
          { emoji: '🛹', text: 'Skateboard, pattini, rollerblade' },
        ]}
        onClose={() => setShowConcept(false)}
      />

      <AnimatePresence>
        {solved && (
          <motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              <div className="text-5xl text-center">🎉</div>
              <div className="text-lg font-extrabold text-center text-purple-900 mt-2">Arrivato a destinazione!</div>
              <p className="text-xs text-gray-700 text-center mt-2 max-w-xs">{hasWheels ? 'Con le ruote è stato facilissimo!' : 'Senza ruote è stata una fatica enorme!'}</p>
              <button onClick={() => { setSolved(false); setPosition(0); }} className="w-full mt-4 py-2 bg-purple-500 text-white font-bold rounded-full text-sm">Riprova</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
