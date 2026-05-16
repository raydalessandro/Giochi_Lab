'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceMeter from '../ui/ForceMeter';
import ConceptCard from '../ui/ConceptCard';
import { leverForceNeeded, leverAdvantage, forceLevel } from '../../_lib/physics';

interface LevaProps {
  onBack: () => void;
}

// Livelli progressivi: ogni livello cambia il peso del masso e la lunghezza totale
const LEVELS = [
  { weight: 10, totalLength: 400, label: 'Sasso piccolo', emoji: '🪨' },
  { weight: 30, totalLength: 400, label: 'Masso medio', emoji: '🪨' },
  { weight: 80, totalLength: 500, label: 'Roccia enorme', emoji: '⛰️' },
  { weight: 200, totalLength: 600, label: 'Elefante!', emoji: '🐘' },
];

const MAX_FORCE_KID = 10; // la "forza massima" che un bambino può applicare

export default function Leva({ onBack }: LevaProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [fulcrumPos, setFulcrumPos] = useState(0.5); // 0-1 lungo l'asse della leva
  const [pushing, setPushing] = useState(false);
  const [showConcept, setShowConcept] = useState(true);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [levelSolved, setLevelSolved] = useState(false);

  const level = LEVELS[levelIdx];

  // La leva è lunga `totalLength`. Il masso sta all'estremità sinistra,
  // il bambino spinge l'estremità destra. Il fulcro divide la leva in due bracci:
  // - loadArm = parte sinistra (dal masso al fulcro)
  // - effortArm = parte destra (dal fulcro alla mano del bambino)
  const loadArm = level.totalLength * fulcrumPos;
  const effortArm = level.totalLength * (1 - fulcrumPos);

  const forceNeeded = leverForceNeeded(level.weight, loadArm, effortArm);
  const advantage = leverAdvantage(loadArm, effortArm);
  const level5 = forceLevel(forceNeeded, MAX_FORCE_KID);
  const canLift = forceNeeded <= MAX_FORCE_KID;

  // Quando il bambino "spinge" (tiene premuto), se la forza è sufficiente, il masso si alza
  const [liftPhase, setLiftPhase] = useState<'idle' | 'lifting' | 'lifted'>('idle');

  useEffect(() => {
    if (pushing && canLift && liftPhase === 'idle') {
      setLiftPhase('lifting');
      const t = setTimeout(() => {
        setLiftPhase('lifted');
        if (!completedLevels.has(levelIdx)) {
          setCompletedLevels(new Set([...completedLevels, levelIdx]));
          setLevelSolved(true);
        }
      }, 800);
      return () => clearTimeout(t);
    }
    if (!pushing && liftPhase === 'lifted') {
      // resetta dopo un attimo
      const t = setTimeout(() => setLiftPhase('idle'), 400);
      return () => clearTimeout(t);
    }
  }, [pushing, canLift, liftPhase, levelIdx, completedLevels]);

  // Angolo della leva: a riposo orizzontale, sollevata = ruotata
  const leverAngle = liftPhase === 'lifted' ? -15 : liftPhase === 'lifting' ? -7 : 0;

  // Layout geometrico SVG
  const SVG_W = 700;
  const SVG_H = 400;
  const groundY = 320;
  const leverStart = (SVG_W - level.totalLength) / 2;
  const fulcrumX = leverStart + loadArm;

  // Coordinate degli estremi della leva (ruotata attorno al fulcro)
  function rotatePoint(px: number, py: number, cx: number, cy: number, angDeg: number) {
    const r = (angDeg * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: cx + dx * Math.cos(r) - dy * Math.sin(r),
      y: cy + dx * Math.sin(r) + dy * Math.cos(r),
    };
  }

  const leftEnd = rotatePoint(leverStart, groundY - 20, fulcrumX, groundY - 20, leverAngle);
  const rightEnd = rotatePoint(
    leverStart + level.totalLength,
    groundY - 20,
    fulcrumX,
    groundY - 20,
    leverAngle
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-sky-200 to-amber-100">
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-3 bg-white/40 backdrop-blur">
        <button
          onClick={onBack}
          className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95"
        >
          ← Indietro
        </button>
        <h2 className="text-lg font-extrabold text-purple-900">⚖️ La Leva</h2>
        <button
          onClick={() => setShowConcept(true)}
          className="bg-white/90 w-9 h-9 rounded-full text-purple-700 font-bold shadow active:scale-95"
          aria-label="Aiuto"
        >
          ?
        </button>
      </header>

      {/* SELETTORE LIVELLI */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white/30">
        {LEVELS.map((lv, i) => (
          <button
            key={i}
            onClick={() => {
              setLevelIdx(i);
              setLiftPhase('idle');
              setLevelSolved(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
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

      {/* AREA DI GIOCO */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Terreno */}
            <rect x="0" y={groundY} width={SVG_W} height={SVG_H - groundY} fill="#92400e" opacity="0.3" />
            <line x1="0" y1={groundY} x2={SVG_W} y2={groundY} stroke="#78350f" strokeWidth="3" />

            {/* Fulcro (triangolo) */}
            <motion.polygon
              points={`${fulcrumX - 30},${groundY} ${fulcrumX + 30},${groundY} ${fulcrumX},${groundY - 40}`}
              fill="#7c3aed"
              stroke="#5b21b6"
              strokeWidth="3"
              animate={{ y: 0 }}
            />

            {/* Leva (linea spessa rotata) */}
            <motion.line
              x1={leftEnd.x}
              y1={leftEnd.y}
              x2={rightEnd.x}
              y2={rightEnd.y}
              stroke="#92400e"
              strokeWidth="16"
              strokeLinecap="round"
              animate={{
                x1: leftEnd.x,
                y1: leftEnd.y,
                x2: rightEnd.x,
                y2: rightEnd.y,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 14 }}
            />

            {/* Masso sul braccio sinistro */}
            <motion.text
              x={leftEnd.x}
              y={leftEnd.y - 30}
              textAnchor="middle"
              fontSize="56"
              animate={{
                x: leftEnd.x,
                y: leftEnd.y - 30,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 14 }}
            >
              {level.emoji}
            </motion.text>

            {/* Indicatore "spingi qui" sul braccio destro */}
            {!levelSolved && (
              <motion.g
                animate={{ opacity: pushing ? 0.5 : 1 }}
              >
                <motion.circle
                  cx={rightEnd.x}
                  cy={rightEnd.y - 30}
                  r="20"
                  fill="#facc15"
                  stroke="#854d0e"
                  strokeWidth="3"
                  animate={{ scale: pushing ? 0.9 : [1, 1.15, 1] }}
                  transition={{ duration: 1, repeat: pushing ? 0 : Infinity }}
                />
                <text
                  x={rightEnd.x}
                  y={rightEnd.y - 22}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="900"
                  fill="#854d0e"
                >
                  ✋
                </text>
              </motion.g>
            )}
          </svg>

          {/* HUD overlay: meter forza + advantage */}
          <div className="absolute top-3 left-3 bg-white/95 rounded-2xl p-3 shadow">
            <ForceMeter level={level5} />
          </div>

          <div className="absolute top-3 right-3 bg-white/95 rounded-2xl p-3 shadow text-center">
            <div className="text-[10px] font-bold text-gray-600 uppercase">Vantaggio</div>
            <div className="text-2xl font-extrabold text-purple-700">
              ×{advantage.toFixed(1)}
            </div>
            <div className="text-[10px] text-gray-500">
              {advantage > 1 ? 'La leva ti aiuta!' : 'La leva ti penalizza'}
            </div>
          </div>

          {/* Pulsante "spingi" grande in basso */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-4 flex justify-center">
            <motion.button
              className={`px-12 py-4 rounded-full font-extrabold text-white shadow-xl touch-none ${
                canLift ? 'bg-green-500' : 'bg-red-400'
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

        {/* Slider fulcro */}
        <div className="bg-white/90 px-4 py-3 backdrop-blur">
          <label className="block text-xs font-bold text-purple-900 mb-1">
            👇 Sposta il fulcro (il triangolino viola)
          </label>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.01}
            value={fulcrumPos}
            onChange={(e) => {
              setFulcrumPos(parseFloat(e.target.value));
              setLiftPhase('idle');
            }}
            className="w-full h-3 accent-purple-600"
          />
          <div className="flex justify-between text-[10px] text-gray-600 font-bold mt-1">
            <span>← Vicino al masso</span>
            <span>Lontano dal masso →</span>
          </div>
        </div>
      </main>

      {/* Concept card iniziale + reset */}
      <ConceptCard
        show={showConcept}
        emoji="⚖️"
        title="La Leva"
        concept="Una leva è un bastone su un punto di appoggio (il fulcro). Più sposti il fulcro VICINO al masso pesante, più la leva ti aiuta. Provaci: sposta il triangolino viola e guarda l'indicatore di forza!"
        realWorld={[
          { emoji: '🚪', text: 'Aprire una porta: spingi lontano dai cardini = facile' },
          { emoji: '🥄', text: 'Aprire un barattolo col cucchiaio' },
          { emoji: '🛒', text: 'Il carrello del supermercato' },
        ]}
        onClose={() => setShowConcept(false)}
      />

      {/* Popup vittoria livello */}
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
                Hai sollevato {level.emoji}!
              </div>
              <p className="text-xs text-gray-700 text-center mt-2 max-w-xs">
                La tua forza × {advantage.toFixed(1)} = la forza della leva!
              </p>
              <div className="flex gap-2 mt-4">
                {levelIdx < LEVELS.length - 1 && (
                  <button
                    onClick={() => {
                      setLevelIdx(levelIdx + 1);
                      setLevelSolved(false);
                      setLiftPhase('idle');
                    }}
                    className="flex-1 py-2 bg-purple-500 text-white font-bold rounded-full text-sm"
                  >
                    Prossimo →
                  </button>
                )}
                <button
                  onClick={() => setLevelSolved(false)}
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
