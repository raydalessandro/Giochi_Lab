'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SegmentPalette from './SegmentPalette';
import StageSegment from './StageSegment';
import ShapeDiscovery from './ShapeDiscovery';
import {
  createSegment,
  detectClosedPolygon,
  classifyPolygon,
  findNearbyEndpoint,
  polygonCentroid,
  SNAP_DISTANCE,
  type Endpoint,
  type Segment,
  type SegmentLength,
} from '../_lib/geometry';
import { SHAPES, getShape, type ShapeInfo } from '../_data/shapes';

// === STATE ===
interface State {
  segments: Segment[];
  discoveredIds: Set<string>;
  lastDiscovery: { shape: ShapeInfo; isNew: boolean; pythagoras: boolean } | null;
  showCollection: boolean;
  stars: number;
  /** Segmento attualmente in drag con endpoint candidato a snap */
  dragSnapTarget: { segmentId: string; endpoint: 'a' | 'b' } | null;
}

type Action =
  | { type: 'ADD_SEGMENT'; length: SegmentLength; x: number; y: number }
  | { type: 'UPDATE_SEGMENT'; id: string; a: Endpoint; b: Endpoint }
  | { type: 'SNAP_SEGMENT'; id: string; which: 'a' | 'b'; toPoint: Endpoint; bondPartnerId: string }
  | { type: 'CLEAR' }
  | { type: 'DISCOVER'; shape: ShapeInfo; isNew: boolean; pythagoras: boolean; consumedSegmentIds: string[] }
  | { type: 'CLOSE_DISCOVERY' }
  | { type: 'SET_SNAP_TARGET'; target: State['dragSnapTarget'] }
  | { type: 'TOGGLE_COLLECTION' };

const INITIAL: State = {
  segments: [],
  discoveredIds: new Set(),
  lastDiscovery: null,
  showCollection: false,
  stars: 0,
  dragSnapTarget: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_SEGMENT': {
      const seg = createSegment(action.length, action.x, action.y);
      return { ...state, segments: [...state.segments, seg] };
    }
    case 'UPDATE_SEGMENT': {
      return {
        ...state,
        segments: state.segments.map((s) =>
          s.instanceId === action.id ? { ...s, a: action.a, b: action.b } : s
        ),
      };
    }
    case 'SNAP_SEGMENT': {
      return {
        ...state,
        segments: state.segments.map((s) => {
          if (s.instanceId === action.id) {
            const upd = { ...s };
            if (action.which === 'a') {
              upd.a = action.toPoint;
              if (!upd.bondsA.includes(action.bondPartnerId)) {
                upd.bondsA = [...upd.bondsA, action.bondPartnerId];
              }
            } else {
              upd.b = action.toPoint;
              if (!upd.bondsB.includes(action.bondPartnerId)) {
                upd.bondsB = [...upd.bondsB, action.bondPartnerId];
              }
            }
            return upd;
          }
          // Aggiorna anche il partner
          if (s.instanceId === action.bondPartnerId) {
            const upd = { ...s };
            // Determina quale endpoint del partner è in (action.toPoint)
            const distA = Math.hypot(s.a.x - action.toPoint.x, s.a.y - action.toPoint.y);
            const distB = Math.hypot(s.b.x - action.toPoint.x, s.b.y - action.toPoint.y);
            if (distA <= distB) {
              if (!upd.bondsA.includes(action.id)) upd.bondsA = [...upd.bondsA, action.id];
            } else {
              if (!upd.bondsB.includes(action.id)) upd.bondsB = [...upd.bondsB, action.id];
            }
            return upd;
          }
          return s;
        }),
      };
    }
    case 'CLEAR':
      return { ...state, segments: [] };
    case 'DISCOVER': {
      const newDisc = new Set(state.discoveredIds);
      newDisc.add(action.shape.id);
      return {
        ...state,
        discoveredIds: newDisc,
        lastDiscovery: {
          shape: action.shape,
          isNew: action.isNew,
          pythagoras: action.pythagoras,
        },
        stars: state.stars + (action.isNew ? 3 : 1) + (action.pythagoras ? 5 : 0),
      };
    }
    case 'CLOSE_DISCOVERY':
      return { ...state, lastDiscovery: null, segments: [] };
    case 'SET_SNAP_TARGET':
      return { ...state, dragSnapTarget: action.target };
    case 'TOGGLE_COLLECTION':
      return { ...state, showCollection: !state.showCollection };
    default:
      return state;
  }
}

// === COMPONENT ===
export default function Geometria() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const stageRef = useRef<HTMLDivElement>(null);

  const handleSpawn = useCallback((length: SegmentLength) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = rect.width * 0.3 + Math.random() * rect.width * 0.4;
    const y = rect.height * 0.3 + Math.random() * rect.height * 0.3;
    dispatch({ type: 'ADD_SEGMENT', length, x, y });
  }, []);

  // --- MOVE handler con snap detection live ---
  const handleSegmentMove = useCallback(
    (id: string, newA: Endpoint, newB: Endpoint, draggingEndpoint: 'a' | 'b' | 'body') => {
      dispatch({ type: 'UPDATE_SEGMENT', id, a: newA, b: newB });

      // Snap target preview: solo quando si trascina un endpoint singolo
      if (draggingEndpoint === 'a' || draggingEndpoint === 'b') {
        const point = draggingEndpoint === 'a' ? newA : newB;
        const target = findNearbyEndpoint(state.segments, id, point.x, point.y);
        dispatch({
          type: 'SET_SNAP_TARGET',
          target: target ? { segmentId: id, endpoint: draggingEndpoint } : null,
        });
      } else {
        // Drag del corpo: cerca snap su entrambi gli endpoints
        const tA = findNearbyEndpoint(state.segments, id, newA.x, newA.y);
        const tB = findNearbyEndpoint(state.segments, id, newB.x, newB.y);
        if (tA) {
          dispatch({ type: 'SET_SNAP_TARGET', target: { segmentId: id, endpoint: 'a' } });
        } else if (tB) {
          dispatch({ type: 'SET_SNAP_TARGET', target: { segmentId: id, endpoint: 'b' } });
        } else {
          dispatch({ type: 'SET_SNAP_TARGET', target: null });
        }
      }
    },
    [state.segments]
  );

  // --- END DRAG: applica snap se vicino ---
  const handleSegmentDragEnd = useCallback(
    (id: string, draggingEndpoint: 'a' | 'b' | 'body') => {
      const seg = state.segments.find((s) => s.instanceId === id);
      if (!seg) {
        dispatch({ type: 'SET_SNAP_TARGET', target: null });
        return;
      }

      // Per drag corpo: prova snap su entrambi endpoints; se entrambi snappano, fai il più vicino
      const candidates: { which: 'a' | 'b'; target: ReturnType<typeof findNearbyEndpoint>; point: Endpoint }[] = [];
      if (draggingEndpoint === 'a' || draggingEndpoint === 'body') {
        candidates.push({
          which: 'a',
          target: findNearbyEndpoint(state.segments, id, seg.a.x, seg.a.y),
          point: seg.a,
        });
      }
      if (draggingEndpoint === 'b' || draggingEndpoint === 'body') {
        candidates.push({
          which: 'b',
          target: findNearbyEndpoint(state.segments, id, seg.b.x, seg.b.y),
          point: seg.b,
        });
      }

      const valid = candidates.filter((c) => c.target !== null);
      if (valid.length > 0) {
        const first = valid[0];
        const partner = state.segments.find((s) => s.instanceId === first.target!.segmentId);
        if (partner) {
          const partnerPoint = first.target!.which === 'a' ? partner.a : partner.b;
          dispatch({
            type: 'SNAP_SEGMENT',
            id,
            which: first.which,
            toPoint: partnerPoint,
            bondPartnerId: partner.instanceId,
          });
        }
      }
      dispatch({ type: 'SET_SNAP_TARGET', target: null });
    },
    [state.segments]
  );

  // --- DETECTION POLIGONO CHIUSO ---
  useEffect(() => {
    if (state.lastDiscovery) return;
    if (state.segments.length < 3) return;

    const polygon = detectClosedPolygon(state.segments);
    if (!polygon) return;

    const classId = classifyPolygon(polygon);
    if (!classId) return;

    const shape = getShape(classId);
    if (!shape) return;

    const isNew = !state.discoveredIds.has(shape.id);
    const pythagoras = classId === 'triangle_right'; // 3-4-5

    const t = setTimeout(() => {
      dispatch({
        type: 'DISCOVER',
        shape,
        isNew,
        pythagoras,
        consumedSegmentIds: polygon.segmentIds,
      });
    }, 700);
    return () => clearTimeout(t);
  }, [state.segments, state.discoveredIds, state.lastDiscovery]);

  // --- RENDER ---
  const bondedEndpoints = computeBondedEndpoints(state.segments);

  // Computa eventuale poligono per riempimento "preview" prima della scoperta
  const previewPolygon = state.segments.length >= 3 ? detectClosedPolygon(state.segments) : null;

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(ellipse at top, #ede9fe 0%, #ddd6fe 40%, #c4b5fd 100%)',
        touchAction: 'manipulation',
      }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-3 bg-white/30 backdrop-blur z-10">
        <h1 className="text-xl font-extrabold text-purple-900">
          📐 La Geometria
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_COLLECTION' })}
            className="bg-white/90 px-3 py-1.5 rounded-full text-purple-700 font-bold text-sm shadow active:scale-95"
          >
            📒 {state.discoveredIds.size}/{SHAPES.length}
          </button>
          <div className="bg-white/95 px-3 py-1.5 rounded-full text-yellow-600 font-bold shadow">
            {state.stars} ⭐
          </div>
        </div>
      </header>

      {/* HINT */}
      <AnimatePresence>
        {state.segments.length === 0 && !state.lastDiscovery && !state.showCollection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 bg-white/90 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-purple-900 shadow"
          >
            👇 Scegli i lati in basso e costruisci una figura!
            <br />
            <span className="text-xs text-purple-700 font-normal">
              I pallini si attaccano da soli quando li avvicini 🔗
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE */}
      <main ref={stageRef} className="flex-1 relative overflow-hidden">
        {/* Riempimento poligono se chiuso */}
        {previewPolygon && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
            <motion.polygon
              points={previewPolygon.vertices.map((v) => `${v.x},${v.y}`).join(' ')}
              fill="rgba(168, 85, 247, 0.25)"
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </svg>
        )}

        {/* Segmenti */}
        {state.segments.map((seg) => {
          const hungryA = !bondedEndpoints.has(`${seg.instanceId}|a`);
          const hungryB = !bondedEndpoints.has(`${seg.instanceId}|b`);
          const snapTarget =
            state.dragSnapTarget?.segmentId === seg.instanceId
              ? state.dragSnapTarget.endpoint
              : null;
          return (
            <StageSegment
              key={seg.instanceId}
              segment={seg}
              isHungryA={hungryA}
              isHungryB={hungryB}
              snapTargetEndpoint={snapTarget}
              onDragMove={handleSegmentMove}
              onDragEnd={handleSegmentDragEnd}
            />
          );
        })}

        {/* Status */}
        <StatusBar segments={state.segments} bondedEndpoints={bondedEndpoints} />

        {/* Discovery */}
        <ShapeDiscovery
          shape={state.lastDiscovery?.shape ?? null}
          isNew={state.lastDiscovery?.isNew ?? false}
          pythagorasBonus={state.lastDiscovery?.pythagoras ?? false}
          onClose={() => dispatch({ type: 'CLOSE_DISCOVERY' })}
        />

        {/* Collection */}
        <AnimatePresence>
          {state.showCollection && (
            <CollectionPanel
              discoveredIds={state.discoveredIds}
              onClose={() => dispatch({ type: 'TOGGLE_COLLECTION' })}
            />
          )}
        </AnimatePresence>

        {/* Ricomincia */}
        {state.segments.length > 0 && !state.lastDiscovery && (
          <button
            onClick={() => dispatch({ type: 'CLEAR' })}
            className="absolute top-4 right-4 z-30 bg-white/80 px-3 py-1.5 rounded-full text-xs font-bold text-red-700 shadow active:scale-95"
          >
            🔄 Ricomincia
          </button>
        )}
      </main>

      <SegmentPalette onSpawn={handleSpawn} />
    </div>
  );
}

// === HELPERS ===

function computeBondedEndpoints(segments: Segment[]): Set<string> {
  const bonded = new Set<string>();
  for (const s of segments) {
    if (s.bondsA.length > 0) bonded.add(`${s.instanceId}|a`);
    if (s.bondsB.length > 0) bonded.add(`${s.instanceId}|b`);
  }
  return bonded;
}

function StatusBar({
  segments,
  bondedEndpoints,
}: {
  segments: Segment[];
  bondedEndpoints: Set<string>;
}) {
  if (segments.length === 0) return null;
  const total = segments.length * 2;
  const free = total - bondedEndpoints.size;
  if (free === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold text-purple-700 shadow z-20"
    >
      Pallini liberi: {free} ⚪
    </motion.div>
  );
}

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
        <h2 className="text-lg font-extrabold text-purple-900">📒 Le mie forme</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white text-purple-700 font-bold text-xl"
        >
          ×
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
        {SHAPES.map((sh) => {
          const found = discoveredIds.has(sh.id);
          return (
            <div
              key={sh.id}
              className={`rounded-2xl p-3 text-center transition ${
                found
                  ? 'bg-purple-100 border-2 border-purple-400'
                  : 'bg-gray-100 border-2 border-gray-200 opacity-60'
              }`}
            >
              <div className="text-5xl">{found ? sh.emoji : '❓'}</div>
              <div className="text-sm font-bold mt-1 text-gray-800">
                {found ? sh.childName : '???'}
              </div>
              {found && (
                <div className="text-[10px] text-gray-500 mt-1">{sh.realName}</div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
