'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceMeter from '../ui/ForceMeter';
import ConceptCard from '../ui/ConceptCard';
import { rampForceNeeded, rampAdvantage, forceLevel } from '../../_lib/physics';

interface PianoInclinatoProps {
  onBack: () => void;
}

const LEVELS = [
  { weight: 20, label: 'Cassa', emoji: '📦' },
  { weight: 60, label: 'Casseforte', emoji: '🗄️' },
  { weight: 150, label: 'Pianoforte', emoji: '🎹' },
];

const MAX_FORCE_KID = 15;
const TARGET_HEIGHT = 200; // altezza del "piano" dove arrivare

export default function PianoInclinato({ onBack }: PianoInclinatoProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [angle, setAngle] = useState(45); // gradi
  const [pushing, setPushing] = useState(false);
  const [boxProgress, setBoxProgress] = useState(0); // 0-1 lungo la rampa
  const [showConcept, setShowConcept] = useState(true);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [levelSolved, setLevelSolved] = useState(false);

  const level = LEVELS[levelIdx];
  const forceNeeded = rampForceNeeded(level.weight, angle);
  const advantage = rampAdvantage(angle);
  const level5 = forceLevel(forceNeeded, MAX_FORCE_KID);
  const canPush = forceNeeded <= MAX_FORCE_KID;

  // Velocità: più la forza richiesta è bassa, più si va veloci (paradosso del lavoro: percorso più lungo)
  useEffect(() => {
    if (!pushing || !canPush || levelSolved) return;
    const speed = Math.max(0.005, (MAX_FORCE_KID - forceNeeded) / MAX_FORCE_KID * 0.025);
    const interval = setInterval(() => {
      setBoxProgress((p) => {
        const np = Math.min(1, p + speed);
        if (np >= 1 && !levelSolved) {
          setLevelSolved(true);
          if (!completedLevels.has(levelIdx)) {
            setCompletedLevels(new Set([...completedLevels, levelIdx]));
          }
        }
        return np;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [pushing, canPush, forceNeeded, levelSolved, completedLevels, levelIdx]);

  // Reset progress when angle or level changes
  useEffect(() => {
    setBoxProgress(0);
    setLevelSolved(false);
  }, [angle, levelIdx]);

  // Geometria SVG
  const SVG_W = 700;
  const SVG_H = 400;
  const groundY = 350;

  // Calcola la rampa: altezza fissa TARGET_HEIGHT, base = altezza/tan(angle)
  const rad = (angle * Math.PI) / 180;
  const rampBase = TARGET_HEIGHT / Math.tan(rad);
  const rampStartX = 100;
  const rampTopX = rampStartX + rampBase;
  const rampTopY = groundY - TARGET_HEIGHT;
  const rampLength = TARGET_HEIGHT / Math.sin(rad);

  // Posizione della cassa lungo la rampa
  const boxX = rampStartX + rampBase * boxProgress;
  const boxY = groundY - TARGET_HEIGHT * boxProgress;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-sky-200 to-amber-100">
      <header className="flex justify-between items-center px-4 py-3 bg-white/40 backdrop-blur">
        <button
          onClick={onBack}
          className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95"
        >
          ← Indietro
        </button>
        <h2 className="text-lg font-extrabold text-purple-900">📐 Il Piano Inclinato</h2>
        <button
          onClick={() => setShowConcept(true)}
          className="bg-white/90 w-9 h-9 rounded-full text-purple-700 font-bold shadow active:scale-95"
        >
          ?
        </button>
      </header>

      {/* Selettore livelli */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white/30">
        {LEVELS.map((lv, i) => (
          <button
            key={i}
            onClick={() => setLevelIdx(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              i === levelIdx
                ? 'bg-purple-500 text-white shadow'
                : completedLevels.has(i)
                ? 'bg-green-100 text-green-700 border-2 border-green-400'
                : 'bg-white/70 text-gray-700'
            }`}
          >
            {completedLevels.has(i) && '✓ '}
            {lv.emoji} {lv.weight}kg
          </button>
        ))}
      </div>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Terreno */}
            <rect x="0" y={groundY} width={SVG_W} height={SVG_H - groundY} fill="#92400e" opacity="0.3" />
            <line x1="0" y1={groundY} x2={SVG_W} y2={groundY} stroke="#78350f" strokeWidth="3" />

            {/* Piano superiore (dove la cassa deve arrivare) */}
            <rect x={rampTopX} y={rampTopY - 8} width={SVG_W - rampTopX} height="8" fill="#16a34a" />
            <line x1={rampTopX} y1={rampTopY} x2={SVG_W} y2={rampTopY} stroke="#15803d" strokeWidth="2" />
            <text x={rampTopX + 50} y={rampTopY - 14} fontSize="20">🏁</text>

            {/* Rampa: triangolo */}
            <polygon
              points={`${rampStartX},${groundY} ${rampTopX},${groundY} ${rampTopX},${rampTopY}`}
              fill="#a16207"
              stroke="#78350f"
              strokeWidth="3"
            />

            {/* Cross-ref con geometria: mostra angolo */}
            <text x={rampTopX - 30} y={groundY - 15} fontSize="14" fontWeight="900" fill="#fff">
              {angle}°
            </text>

            {/* Cassa */}
            <motion.text
              animate={{ x: boxX, y: boxY - 10 }}
              transition={{ type: 'tween', duration: 0.03 }}
              textAnchor="middle"
              fontSize="44"
            >
              {level.emoji}
            </motion.text>
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 rounded-2xl p-3 shadow">
            <ForceMeter level={level5} />
          </div>

          <div className="absolute top-3 right-3 bg-white/95 rounded-2xl p-3 shadow text-center">
            <div className="text-[10px] font-bold text-gray-600 uppercase">Vantaggio</div>
            <div className="text-2xl font-extrabold text-purple-700">×{advantage.toFixed(1)}</div>
            <div className="text-[10px] text-gray-500">{angle < 30 ? 'Rampa dolce' : angle < 60 ? 'Media' : 'Ripida!'}</div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
            <motion.button
              className={`px-12 py-4 rounded-full font-extrabold text-white shadow-xl touch-none ${
                canPush ? 'bg-green-500' : 'bg-red-400'
              }`}
              whileTap={{ scale: 0.95 }}
              onPointerDown={() => setPushing(true)}
              onPointerUp={() => setPushing(false)}
              onPointerLeave={() => setPushing(false)}
              onTouchStart={() => setPushing(true)}
              onTouchEnd={() => setPushing(false)}
              style={{ touchAction: 'none' }}
            >
              {pushing ? '💪 SPINGO!' : '✋ Tieni premuto per spingere'}
            </motion.button>
          </div>
        </div>

        <div className="bg-white/90 px-4 py-3 backdrop-blur">
          <label className="block text-xs font-bold text-purple-900 mb-1">
            👇 Cambia l'inclinazione della rampa
          </label>
          <input
            type="range"
            min={10}
            max={75}
            step={1}
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full h-3 accent-purple-600"
          />
          <div className="flex justify-between text-[10px] text-gray-600 font-bold mt-1">
            <span>← Dolce (più facile, più lungo)</span>
            <span>Ripida (più dura, più corto) →</span>
          </div>
        </div>
      </main>

      <ConceptCard
        show={showConcept}
        emoji="📐"
        title="Il Piano Inclinato"
        concept="Una rampa fa tantissimo lavoro per te! Una rampa dolce (poco inclinata) richiede poca forza ma percorso lungo. Una rampa ripida richiede tanta forza ma è più corta. La quantità di lavoro totale è uguale: la rampa lo spalma!"
        realWorld={[
          { emoji: '🛴', text: 'Le rampe per disabili' },
          { emoji: '🚂', text: 'Le strade di montagna a tornanti' },
          { emoji: '✂️', text: 'Anche le forbici sono fatte di piani inclinati!' },
        ]}
        onClose={() => setShowConcept(false)}
      />

      <AnimatePresence>
        {levelSolved && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-5 shadow-2xl pointer-events-auto"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <div className="text-5xl text-center">🎉</div>
              <div className="text-lg font-extrabold text-center text-purple-900 mt-2">
                {level.emoji} è arrivato in cima!
              </div>
              <p className="text-xs text-gray-700 text-center mt-2 max-w-xs">
                Con la rampa a {angle}° hai usato {Math.round(forceNeeded)} di forza invece di {level.weight}!
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
                  onClick={() => {
                    setLevelSolved(false);
                    setBoxProgress(0);
                  }}
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
