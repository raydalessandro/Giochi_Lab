'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceMeter from '../ui/ForceMeter';
import ConceptCard from '../ui/ConceptCard';
import { pulleyForceNeeded, forceLevel } from '../../_lib/physics';

interface CarrucolaProps {
  onBack: () => void;
}

const LEVELS = [
  { weight: 15, label: 'Secchio', emoji: '🪣' },
  { weight: 40, label: 'Bandiera grande', emoji: '🏁' },
  { weight: 100, label: 'Pianoforte', emoji: '🎹' },
];

const MAX_FORCE_KID = 12;

export default function Carrucola({ onBack }: CarrucolaProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [ropeCount, setRopeCount] = useState(1); // 1, 2, 3 carrucole (corde di sostegno)
  const [pulling, setPulling] = useState(false);
  const [lift, setLift] = useState(0); // 0-1 altezza sollevamento del peso
  const [showConcept, setShowConcept] = useState(true);
  const [solved, setSolved] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const level = LEVELS[levelIdx];
  const forceNeeded = pulleyForceNeeded(level.weight, ropeCount);
  const level5 = forceLevel(forceNeeded, MAX_FORCE_KID);
  const canPull = forceNeeded <= MAX_FORCE_KID;
  const advantage = ropeCount;

  useEffect(() => {
    setLift(0);
    setSolved(false);
  }, [levelIdx, ropeCount]);

  useEffect(() => {
    if (!pulling || !canPull || solved) return;
    // Velocità: più carrucole = sollevamento più lento (più corda da tirare)
    const speed = 0.012 / ropeCount;
    const interval = setInterval(() => {
      setLift((l) => {
        const nl = Math.min(1, l + speed);
        if (nl >= 1 && !solved) {
          setSolved(true);
          if (!completed.has(levelIdx)) {
            setCompleted(new Set([...completed, levelIdx]));
          }
        }
        return nl;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [pulling, canPull, ropeCount, solved, completed, levelIdx]);

  const SVG_W = 700;
  const SVG_H = 450;
  const ceilingY = 60;
  const groundY = 400;
  const weightStartY = groundY - 50;
  const weightY = weightStartY - (weightStartY - 130) * lift;

  // Carrucole: equidistanti in alto
  const pulleyXs = Array.from({ length: ropeCount }, (_, i) =>
    SVG_W / 2 - ((ropeCount - 1) * 60) / 2 + i * 60
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-sky-200 to-stone-100">
      <header className="flex justify-between items-center px-4 py-3 bg-white/40 backdrop-blur">
        <button
          onClick={onBack}
          className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95"
        >
          ← Indietro
        </button>
        <h2 className="text-lg font-extrabold text-purple-900">⚙️ La Carrucola</h2>
        <button
          onClick={() => setShowConcept(true)}
          className="bg-white/90 w-9 h-9 rounded-full text-purple-700 font-bold shadow active:scale-95"
        >
          ?
        </button>
      </header>

      <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white/30">
        {LEVELS.map((lv, i) => (
          <button
            key={i}
            onClick={() => setLevelIdx(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              i === levelIdx ? 'bg-purple-500 text-white shadow'
              : completed.has(i) ? 'bg-green-100 text-green-700 border-2 border-green-400'
              : 'bg-white/70 text-gray-700'
            }`}
          >
            {completed.has(i) && '✓ '}{lv.emoji} {lv.weight}kg
          </button>
        ))}
      </div>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Soffitto */}
            <rect x="0" y={ceilingY - 20} width={SVG_W} height="20" fill="#78716c" />
            <line x1="0" y1={ceilingY} x2={SVG_W} y2={ceilingY} stroke="#44403c" strokeWidth="3" />

            {/* Terreno */}
            <rect x="0" y={groundY} width={SVG_W} height={SVG_H - groundY} fill="#92400e" opacity="0.3" />
            <line x1="0" y1={groundY} x2={SVG_W} y2={groundY} stroke="#78350f" strokeWidth="3" />

            {/* Carrucole */}
            {pulleyXs.map((px, i) => (
              <g key={i}>
                <circle cx={px} cy={ceilingY + 20} r="18" fill="#7c3aed" stroke="#5b21b6" strokeWidth="3" />
                <circle cx={px} cy={ceilingY + 20} r="6" fill="#5b21b6" />
              </g>
            ))}

            {/* Corde di sostegno (dalla carrucola al peso) */}
            {pulleyXs.map((px, i) => (
              <motion.line
                key={i}
                x1={px}
                y1={ceilingY + 38}
                x2={SVG_W / 2}
                y2={weightY}
                stroke="#854d0e"
                strokeWidth="3"
                animate={{ y2: weightY }}
              />
            ))}

            {/* Corda finale tirata dal bambino: dalla carrucola più a destra in giù */}
            <motion.line
              x1={pulleyXs[pulleyXs.length - 1] + 18}
              y1={ceilingY + 20}
              x2={pulleyXs[pulleyXs.length - 1] + 18}
              y2={pulling ? 380 : 340}
              stroke="#854d0e"
              strokeWidth="3"
              animate={{ y2: pulling ? 380 : 340 }}
            />

            {/* Mano */}
            <motion.text
              x={pulleyXs[pulleyXs.length - 1] + 18}
              y={pulling ? 395 : 355}
              textAnchor="middle"
              fontSize="36"
              animate={{ y: pulling ? 395 : 355 }}
            >
              ✋
            </motion.text>

            {/* Peso */}
            <motion.text
              x={SVG_W / 2}
              y={weightY + 14}
              textAnchor="middle"
              fontSize="56"
              animate={{ y: weightY + 14 }}
            >
              {level.emoji}
            </motion.text>

            {/* Target */}
            <text x={SVG_W / 2} y={130} textAnchor="middle" fontSize="24">🎯</text>
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 rounded-2xl p-3 shadow">
            <ForceMeter level={level5} />
          </div>

          <div className="absolute top-3 right-3 bg-white/95 rounded-2xl p-3 shadow text-center">
            <div className="text-[10px] font-bold text-gray-600 uppercase">Vantaggio</div>
            <div className="text-2xl font-extrabold text-purple-700">×{advantage}</div>
            <div className="text-[10px] text-gray-500">{ropeCount} {ropeCount === 1 ? 'corda' : 'corde'}</div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
            <motion.button
              className={`px-12 py-4 rounded-full font-extrabold text-white shadow-xl touch-none ${
                canPull ? 'bg-green-500' : 'bg-red-400'
              }`}
              whileTap={{ scale: 0.95 }}
              onPointerDown={() => setPulling(true)}
              onPointerUp={() => setPulling(false)}
              onPointerLeave={() => setPulling(false)}
              onTouchStart={() => setPulling(true)}
              onTouchEnd={() => setPulling(false)}
              style={{ touchAction: 'none' }}
            >
              {pulling ? '💪 TIRO!' : '✋ Tieni premuto per tirare'}
            </motion.button>
          </div>
        </div>

        <div className="bg-white/90 px-4 py-3 backdrop-blur">
          <label className="block text-xs font-bold text-purple-900 mb-1">
            👇 Quante carrucole usi?
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setRopeCount(n)}
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  ropeCount === n ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {n} {n === 1 ? 'carrucola' : 'carrucole'}
              </button>
            ))}
          </div>
        </div>
      </main>

      <ConceptCard
        show={showConcept}
        emoji="⚙️"
        title="La Carrucola"
        concept="Con una sola carrucola tiri quanto pesa. Con DUE carrucole tiri solo la metà! Con TRE solo un terzo! Ma attenzione: devi tirare tanta corda quanto più carrucole hai. Magia? No, è un trucco geniale!"
        realWorld={[
          { emoji: '🏁', text: 'L\'asta della bandiera' },
          { emoji: '🏗️', text: 'Le gru dei cantieri' },
          { emoji: '🛗', text: 'Gli ascensori' },
        ]}
        onClose={() => setShowConcept(false)}
      />

      <AnimatePresence>
        {solved && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto"
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            >
              <div className="text-5xl text-center">🎉</div>
              <div className="text-lg font-extrabold text-center text-purple-900 mt-2">
                {level.emoji} sollevato!
              </div>
              <p className="text-xs text-gray-700 text-center mt-2 max-w-xs">
                Con {ropeCount} {ropeCount === 1 ? 'carrucola' : 'carrucole'} hai usato solo {Math.round(forceNeeded)} di forza!
              </p>
              <div className="flex gap-2 mt-4">
                {levelIdx < LEVELS.length - 1 && (
                  <button
                    onClick={() => setLevelIdx(levelIdx + 1)}
                    className="flex-1 py-2 bg-purple-500 text-white font-bold rounded-full text-sm"
                  >
                    Prossimo →
                  </button>
                )}
                <button
                  onClick={() => { setSolved(false); setLift(0); }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-full text-sm"
                >
                  Riprova
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
