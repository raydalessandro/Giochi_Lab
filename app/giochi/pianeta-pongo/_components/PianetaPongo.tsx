'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WorldMap from './WorldMap';
import ContinentInfo from './ContinentInfo';
import Celebration from './Celebration';
import {
  CONTINENTS,
  getContinent,
  type Continent,
  type ContinentId,
} from '../_data/continents';
import { generateMission, type Mission } from '../_data/missions';
import { useDrag } from '../_hooks/useDragDrop';
import { usePersistedReducer } from '@/app/_shared/usePersistedReducer';
import SoundToggle from '@/app/_shared/SoundToggle';
import { playTap, playDiscovery, playReject } from '@/app/_shared/sound';

// === STATO ===
type GameMode = 'explore' | 'mission';

interface GameState {
  mode: GameMode;
  selectedContinent: ContinentId | null;
  mission: Mission | null;
  stars: number;
  celebrating: boolean;
  celebrationMessage: string;
  exploredContinents: Set<ContinentId>;
}

type GameAction =
  | { type: 'SELECT_CONTINENT'; id: ContinentId }
  | { type: 'CLOSE_INFO' }
  | { type: 'START_MISSION'; mission: Mission }
  | { type: 'MISSION_SUCCESS' }
  | { type: 'MISSION_RETRY' }
  | { type: 'STOP_CELEBRATION' };

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_CONTINENT': {
      const explored = new Set(state.exploredContinents);
      const isFirstTime = !explored.has(action.id);
      explored.add(action.id);
      return {
        ...state,
        selectedContinent: action.id,
        exploredContinents: explored,
        // +1 stella per ogni continente nuovo scoperto
        stars: isFirstTime ? state.stars + 1 : state.stars,
      };
    }
    case 'CLOSE_INFO':
      return { ...state, selectedContinent: null };
    case 'START_MISSION':
      return {
        ...state,
        mode: 'mission',
        mission: action.mission,
        selectedContinent: null,
      };
    case 'MISSION_SUCCESS':
      return {
        ...state,
        stars: state.stars + 2,
        celebrating: true,
        celebrationMessage: 'Bravo! 🎉',
      };
    case 'MISSION_RETRY':
      return { ...state, mission: state.mission }; // animale torna alla base, mission resta
    case 'STOP_CELEBRATION':
      return {
        ...state,
        celebrating: false,
        mode: 'explore',
        mission: null,
      };
    default:
      return state;
  }
}

const INITIAL_STATE: GameState = {
  mode: 'explore',
  selectedContinent: null,
  mission: null,
  stars: 0,
  celebrating: false,
  celebrationMessage: '',
  exploredContinents: new Set(),
};

// === PERSISTENZA ===
// Persiste solo il progresso (stelle + continenti esplorati).
// Mission attiva, celebration, selezione corrente sono volatili.
const PONGO_CODEC = {
  stringify: (s: GameState) =>
    JSON.stringify({
      stars: s.stars,
      exploredContinents: Array.from(s.exploredContinents),
    }),
  parse: (raw: string): GameState => {
    const data = JSON.parse(raw) as { stars?: number; exploredContinents?: ContinentId[] };
    return {
      ...INITIAL_STATE,
      stars: data.stars ?? 0,
      exploredContinents: new Set(data.exploredContinents ?? []),
    };
  },
};

// === COMPONENT ===
export default function PianetaPongo() {
  const [state, dispatch] = usePersistedReducer(
    'giochi-lab:pongo',
    reducer,
    INITIAL_STATE,
    PONGO_CODEC
  );
  const [hoverTargetId, setHoverTargetId] = useState<ContinentId | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animalHomePos = useRef({ x: 0, y: 0 });

  // Triggera una missione random ogni 3 continenti esplorati (sopra K_crit ;)
  useEffect(() => {
    if (
      state.mode === 'explore' &&
      state.exploredContinents.size >= 3 &&
      state.exploredContinents.size % 3 === 0 &&
      !state.mission &&
      !state.selectedContinent
    ) {
      const timer = setTimeout(() => {
        dispatch({ type: 'START_MISSION', mission: generateMission() });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.exploredContinents.size, state.mode, state.mission, state.selectedContinent]);

  // Stop celebration dopo 1.6s
  useEffect(() => {
    if (state.celebrating) {
      const t = setTimeout(() => dispatch({ type: 'STOP_CELEBRATION' }), 1600);
      return () => clearTimeout(t);
    }
  }, [state.celebrating]);

  // Posizione "home" dell'animale durante la missione (bordo basso centrale)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      animalHomePos.current = {
        x: window.innerWidth / 2 - 30,
        y: window.innerHeight - 130,
      };
    }
  }, [state.mission]);

  const handleContinentClick = useCallback((id: ContinentId) => {
    if (state.mode === 'mission') return; // disabilita click su mappa durante missione
    playTap();
    dispatch({ type: 'SELECT_CONTINENT', id });
  }, [state.mode]);

  // Hit-test: trasforma coord schermo → coord SVG → trova continente sotto
  const findContinentAt = useCallback((screenX: number, screenY: number): ContinentId | null => {
    const svg = svgRef.current;
    if (!svg) return null;

    const pt = svg.createSVGPoint();
    pt.x = screenX;
    pt.y = screenY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const svgPt = pt.matrixTransform(ctm.inverse());

    // elementFromPoint funziona in coord schermo, più affidabile
    const el = document.elementFromPoint(screenX, screenY);
    if (el && el instanceof SVGPathElement) {
      const id = el.getAttribute('data-continent-id');
      if (id) return id as ContinentId;
    }
    // Fallback: bounding box hit test sui path
    for (const c of CONTINENTS) {
      const path = svg.querySelector<SVGPathElement>(`path[data-continent-id="${c.id}"]`);
      if (!path) continue;
      const bbox = path.getBBox();
      if (
        svgPt.x >= bbox.x &&
        svgPt.x <= bbox.x + bbox.width &&
        svgPt.y >= bbox.y &&
        svgPt.y <= bbox.y + bbox.height
      ) {
        return c.id;
      }
    }
    return null;
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #87ceeb 0%, #4a90e2 100%)',
        touchAction: 'manipulation',
      }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-3 bg-white/20 backdrop-blur z-10">
        <h1 className="text-xl font-extrabold text-white drop-shadow">
          🌍 Pianeta di Pongo
        </h1>
        <div className="flex items-center gap-2">
          <SoundToggle className="bg-white/95 w-10 h-10 rounded-full shadow flex items-center justify-center text-lg" />
          <div className="bg-white/95 px-4 py-1.5 rounded-full text-yellow-500 font-bold text-lg shadow flex items-center gap-1">
            {state.stars} <span>⭐</span>
          </div>
        </div>
      </header>

      {/* HINT iniziale */}
      <AnimatePresence>
        {state.exploredContinents.size === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 bg-white/90 rounded-2xl px-4 py-2 text-center text-sm font-semibold text-blue-900 shadow"
          >
            👆 Tocca un continente per scoprirlo!
          </motion.div>
        )}
      </AnimatePresence>

      {/* MISSION BAR */}
      <AnimatePresence>
        {state.mode === 'mission' && state.mission && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-2 bg-white/95 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg z-15"
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-3xl"
            >
              {state.mission.animal.emoji}
            </motion.span>
            <p className="flex-1 text-sm font-semibold text-gray-800 leading-tight">
              {state.mission.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAPPA */}
      <main className="flex-1 relative">
        <WorldMap
          highlightedId={state.selectedContinent}
          targetId={null /* niente "spoiler" del continente giusto durante missione */}
          hoverTargetId={hoverTargetId}
          onContinentClick={handleContinentClick}
          svgRef={svgRef}
        />

        {/* ANIMALE TRASCINABILE durante missione */}
        {state.mode === 'mission' && state.mission && (
          <DraggableAnimal
            key={state.mission.animal.emoji + state.mission.correctContinent.id}
            mission={state.mission}
            findContinentAt={findContinentAt}
            onHover={setHoverTargetId}
            onDrop={(continentId) => {
              if (continentId === state.mission?.correctContinent.id) {
                setHoverTargetId(null);
                playDiscovery();
                dispatch({ type: 'MISSION_SUCCESS' });
              } else {
                playReject();
                // rimbalza indietro (gestito internamente dal componente con reset)
              }
            }}
          />
        )}

        <ContinentInfo
          continent={
            state.selectedContinent ? getContinent(state.selectedContinent) : null
          }
          onClose={() => dispatch({ type: 'CLOSE_INFO' })}
        />

        <Celebration show={state.celebrating} message={state.celebrationMessage} />
      </main>
    </div>
  );
}

// === ANIMALE TRASCINABILE ===
interface DraggableAnimalProps {
  mission: Mission;
  findContinentAt: (x: number, y: number) => ContinentId | null;
  onHover: (id: ContinentId | null) => void;
  onDrop: (continentId: ContinentId | null) => void;
}

function DraggableAnimal({
  mission,
  findContinentAt,
  onHover,
  onDrop,
}: DraggableAnimalProps) {
  // Home position: centro-basso dello schermo
  const [home, setHome] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 0;
    const h = typeof window !== 'undefined' ? window.innerHeight : 0;
    setHome({ x: w / 2 - 30, y: h - 140 });
  }, []);

  const { x, y, isDragging, startDrag, reset } = useDrag(home.x, home.y, {
    onDragEnd: (endX, endY) => {
      const hit = findContinentAt(endX + 30, endY + 30); // +30 per centro emoji
      if (hit === mission.correctContinent.id) {
        onDrop(hit);
      } else {
        onDrop(null);
        // rimbalza a casa
        setTimeout(() => reset(), 50);
      }
    },
  });

  // Aggiorna hover durante drag
  useEffect(() => {
    if (!isDragging) {
      onHover(null);
      return;
    }
    const id = findContinentAt(x + 30, y + 30);
    onHover(id);
  }, [x, y, isDragging, findContinentAt, onHover]);

  return (
    <motion.div
      className="absolute z-30"
      style={{
        left: x,
        top: y,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      animate={
        !isDragging
          ? {
              scale: [1, 1.1, 1],
            }
          : { scale: 1.25 }
      }
      transition={
        !isDragging
          ? { duration: 1.5, repeat: Infinity }
          : { duration: 0.15 }
      }
      onPointerDown={startDrag}
      onTouchStart={startDrag}
    >
      <span
        className="text-6xl block"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
          userSelect: 'none',
        }}
      >
        {mission.animal.emoji}
      </span>
    </motion.div>
  );
}
