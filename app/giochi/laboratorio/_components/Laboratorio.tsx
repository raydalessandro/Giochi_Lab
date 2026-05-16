'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AtomPalette from './AtomPalette';
import StageAtom from './StageAtom';
import DiscoveryPopup from './DiscoveryPopup';
import {
  ATOMS,
  findMolecule,
  getAtom,
  MOLECULES,
  type AtomId,
  type Molecule,
} from '../_data/atoms';
import {
  computeStatus,
  fingerprint,
  newInstanceId,
  type PieceInstance,
} from '../_lib/composition';
import { usePersistedReducer } from '@/app/_shared/usePersistedReducer';

// === STATE ===
interface State {
  pieces: PieceInstance[];
  discoveredIds: Set<string>;
  lastDiscovery: { molecule: Molecule; isNew: boolean } | null;
  showCollection: boolean;
  stars: number;
}

type Action =
  | { type: 'ADD_PIECE'; pieceId: AtomId; x: number; y: number }
  | { type: 'MOVE_PIECE'; instanceId: string; x: number; y: number }
  | { type: 'BOND'; aId: string; bId: string }
  | { type: 'CLEAR_STAGE' }
  | { type: 'DISCOVER'; molecule: Molecule; isNew: boolean }
  | { type: 'CLOSE_DISCOVERY' }
  | { type: 'TOGGLE_COLLECTION' };

const INITIAL: State = {
  pieces: [],
  discoveredIds: new Set(),
  lastDiscovery: null,
  showCollection: false,
  stars: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_PIECE': {
      const atom = getAtom(action.pieceId);
      const newPiece: PieceInstance = {
        instanceId: newInstanceId(),
        pieceId: action.pieceId,
        x: action.x,
        y: action.y,
        freeSlots: atom.hands,
        bonds: [],
      };
      return { ...state, pieces: [...state.pieces, newPiece] };
    }
    case 'MOVE_PIECE': {
      return {
        ...state,
        pieces: state.pieces.map((p) =>
          p.instanceId === action.instanceId ? { ...p, x: action.x, y: action.y } : p
        ),
      };
    }
    case 'BOND': {
      return {
        ...state,
        pieces: state.pieces.map((p) => {
          if (p.instanceId === action.aId && !p.bonds.includes(action.bId)) {
            return {
              ...p,
              bonds: [...p.bonds, action.bId],
              freeSlots: Math.max(0, p.freeSlots - 1),
            };
          }
          if (p.instanceId === action.bId && !p.bonds.includes(action.aId)) {
            return {
              ...p,
              bonds: [...p.bonds, action.aId],
              freeSlots: Math.max(0, p.freeSlots - 1),
            };
          }
          return p;
        }),
      };
    }
    case 'CLEAR_STAGE':
      return { ...state, pieces: [] };
    case 'DISCOVER': {
      const newDiscovered = new Set(state.discoveredIds);
      newDiscovered.add(action.molecule.id);
      return {
        ...state,
        discoveredIds: newDiscovered,
        lastDiscovery: { molecule: action.molecule, isNew: action.isNew },
        stars: state.stars + (action.isNew ? 3 : 1),
      };
    }
    case 'CLOSE_DISCOVERY':
      return { ...state, lastDiscovery: null, pieces: [] }; // clear stage dopo scoperta
    case 'TOGGLE_COLLECTION':
      return { ...state, showCollection: !state.showCollection };
    default:
      return state;
  }
}

// === COSTANTI ===
const BOND_DISTANCE = 95;        // distanza sotto la quale due atomi si legano
const ATOM_SIZE = 72;            // dimensione dell'AtomBall sullo stage

// === PERSISTENZA ===
// Persiste solo il progresso (stelle + molecole scoperte).
// Stage corrente, popup, pannello collection sono volatili: tornano puliti al refresh.
const LABORATORIO_CODEC = {
  stringify: (s: State) =>
    JSON.stringify({
      stars: s.stars,
      discoveredIds: Array.from(s.discoveredIds),
    }),
  parse: (raw: string): State => {
    const data = JSON.parse(raw) as { stars?: number; discoveredIds?: string[] };
    return {
      ...INITIAL,
      stars: data.stars ?? 0,
      discoveredIds: new Set(data.discoveredIds ?? []),
    };
  },
};

// === COMPONENT ===
export default function Laboratorio() {
  const [state, dispatch] = usePersistedReducer(
    'giochi-lab:laboratorio',
    reducer,
    INITIAL,
    LABORATORIO_CODEC
  );
  const stageRef = useRef<HTMLDivElement>(null);

  // --- ADD ATOM dal palette ---
  const handleSpawn = useCallback((atomId: AtomId) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Spawna in punto random nell'area centrale dello stage
    const x = rect.width * 0.3 + Math.random() * rect.width * 0.4;
    const y = rect.height * 0.3 + Math.random() * rect.height * 0.3;
    dispatch({ type: 'ADD_PIECE', pieceId: atomId, x, y });
  }, []);

  const handleMove = useCallback((instanceId: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_PIECE', instanceId, x, y });
  }, []);

  // --- LEGAMI AUTOMATICI ---
  // Al termine di un drag, controlla se l'atomo si è avvicinato abbastanza
  // a un altro che ha manine libere → crea il legame.
  const handleDragEnd = useCallback((instanceId: string, x: number, y: number) => {
    const me = state.pieces.find((p) => p.instanceId === instanceId);
    if (!me || me.freeSlots === 0) return;

    for (const other of state.pieces) {
      if (other.instanceId === instanceId) continue;
      if (other.freeSlots === 0) continue;
      if (me.bonds.includes(other.instanceId)) continue;

      const dx = (x + ATOM_SIZE / 2) - (other.x + ATOM_SIZE / 2);
      const dy = (y + ATOM_SIZE / 2) - (other.y + ATOM_SIZE / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < BOND_DISTANCE) {
        dispatch({ type: 'BOND', aId: instanceId, bId: other.instanceId });
        // un legame alla volta per drag
        return;
      }
    }
  }, [state.pieces]);

  // --- DETECT MOLECOLA COMPLETA ---
  // Quando tutte le manine sono occupate E ci sono almeno 2 atomi → scoperta!
  useEffect(() => {
    const status = computeStatus(state.pieces);
    if (status.isStable && status.pieceCount >= 2 && !state.lastDiscovery) {
      const fp = fingerprint(state.pieces);
      const molecule = findMolecule(fp);
      if (molecule) {
        const isNew = !state.discoveredIds.has(molecule.id);
        // Piccolo delay per far vedere il momento "click finale"
        const t = setTimeout(() => {
          dispatch({ type: 'DISCOVER', molecule, isNew });
        }, 600);
        return () => clearTimeout(t);
      }
    }
  }, [state.pieces, state.discoveredIds, state.lastDiscovery]);

  // --- LEGAMI VISIBILI (linee tra atomi legati) ---
  const bondLines = computeBondLines(state.pieces);

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(ellipse at top, #fef3c7 0%, #fde68a 40%, #fbbf24 100%)',
        touchAction: 'manipulation',
      }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-3 bg-white/30 backdrop-blur z-10">
        <h1 className="text-xl font-extrabold text-orange-900">
          🧪 Il Laboratorio
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_COLLECTION' })}
            className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95"
          >
            📒 {state.discoveredIds.size}/{MOLECULES.length}
          </button>
          <div className="bg-white/95 px-3 py-1.5 rounded-full text-yellow-600 font-bold shadow">
            {state.stars} ⭐
          </div>
        </div>
      </header>

      {/* HINT */}
      <AnimatePresence>
        {state.pieces.length === 0 && !state.lastDiscovery && !state.showCollection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 bg-white/90 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-orange-900 shadow"
          >
            👇 Tocca un atomo qui sotto per aggiungerlo!
            <br />
            <span className="text-xs text-orange-700 font-normal">
              Avvicinali per farli tenere per mano 🤝
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE — area di gioco */}
      <main
        ref={stageRef}
        className="flex-1 relative overflow-hidden"
      >
        {/* Linee dei legami (SVG sotto gli atomi) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {bondLines.map((line, i) => (
            <motion.line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </svg>

        {/* Atomi sullo stage */}
        {state.pieces.map((piece) => (
          <StageAtom
            key={piece.instanceId}
            instance={piece}
            onMove={handleMove}
            onDragEnd={handleDragEnd}
          />
        ))}

        {/* Status indicator (subtle) */}
        <StatusIndicator pieces={state.pieces} />

        {/* Discovery popup */}
        <DiscoveryPopup
          molecule={state.lastDiscovery?.molecule ?? null}
          isNew={state.lastDiscovery?.isNew ?? false}
          onClose={() => dispatch({ type: 'CLOSE_DISCOVERY' })}
        />

        {/* Collection panel */}
        <AnimatePresence>
          {state.showCollection && (
            <CollectionPanel
              discoveredIds={state.discoveredIds}
              onClose={() => dispatch({ type: 'TOGGLE_COLLECTION' })}
            />
          )}
        </AnimatePresence>

        {/* Pulsante "ricomincia" se ci sono pezzi sullo stage */}
        {state.pieces.length > 0 && !state.lastDiscovery && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_STAGE' })}
            className="absolute top-4 right-4 z-30 bg-white/80 px-3 py-1.5 rounded-full text-xs font-bold text-red-700 shadow active:scale-95"
          >
            🔄 Ricomincia
          </button>
        )}
      </main>

      {/* PALETTE */}
      <AtomPalette onSpawn={handleSpawn} />
    </div>
  );
}

// === HELPERS ===

function computeBondLines(pieces: PieceInstance[]) {
  const seen = new Set<string>();
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const p of pieces) {
    for (const partnerId of p.bonds) {
      const key = [p.instanceId, partnerId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const partner = pieces.find((q) => q.instanceId === partnerId);
      if (!partner) continue;
      lines.push({
        x1: p.x + ATOM_SIZE / 2,
        y1: p.y + ATOM_SIZE / 2,
        x2: partner.x + ATOM_SIZE / 2,
        y2: partner.y + ATOM_SIZE / 2,
      });
    }
  }
  return lines;
}

// === STATUS INDICATOR ===
// Mostra "manine libere totali" come piccolo feedback.
// Quando ≠ 0 e ≥ 2 pezzi: "Mancano X manine!"
// Quando = 0: niente (il popup arriverà).
function StatusIndicator({ pieces }: { pieces: PieceInstance[] }) {
  if (pieces.length === 0) return null;
  const status = computeStatus(pieces);
  if (status.isStable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold text-orange-700 shadow z-20"
    >
      Manine libere: {status.totalFreeSlots} ✋
    </motion.div>
  );
}

// === COLLECTION PANEL ===
function CollectionPanel({
  discoveredIds,
  onClose,
}: {
  discoveredIds: Set<string>;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
    >
      <header className="flex justify-between items-center p-4 bg-purple-100">
        <h2 className="text-lg font-extrabold text-purple-900">📒 Le mie scoperte</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white text-purple-700 font-bold text-xl"
        >
          ×
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
        {MOLECULES.map((mol) => {
          const found = discoveredIds.has(mol.id);
          return (
            <div
              key={mol.id}
              className={`rounded-2xl p-3 text-center transition ${
                found
                  ? 'bg-yellow-100 border-2 border-yellow-400'
                  : 'bg-gray-100 border-2 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-5xl">{found ? mol.emoji : '❓'}</div>
              <div className="text-sm font-bold mt-1 text-gray-800">
                {found ? mol.childName : '???'}
              </div>
              {found && (
                <div className="text-[10px] text-gray-500 mt-1 font-mono">
                  {mol.realName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
