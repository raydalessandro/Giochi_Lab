'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  SEGMENT_COLORS,
  SEGMENT_NUMERIC,
  SEGMENT_PIXELS,
  type Segment as SegmentData,
} from '../_lib/geometry';

interface StageSegmentProps {
  segment: SegmentData;
  isHungryA: boolean;   // endpoint A libero?
  isHungryB: boolean;   // endpoint B libero?
  /** Endpoint glow se sotto snap-target */
  snapTargetEndpoint: 'a' | 'b' | null;
  onDragMove: (id: string, newA: { x: number; y: number }, newB: { x: number; y: number }, draggingEndpoint: 'a' | 'b' | 'body') => void;
  onDragEnd: (id: string, draggingEndpoint: 'a' | 'b' | 'body') => void;
}

/**
 * Un segmento ha tre "manopole" di drag:
 *  - corpo centrale (sposta tutto il segmento)
 *  - endpoint A (allunga/ruota tenendo fermo B)
 *  - endpoint B (allunga/ruota tenendo fermo A)
 *
 * Per la fascia 5-7 il corpo è la manopola principale.
 * Gli endpoint si usano per "collegare" il segmento a un altro vertice esistente.
 */
export default function StageSegment({
  segment,
  isHungryA,
  isHungryB,
  snapTargetEndpoint,
  onDragMove,
  onDragEnd,
}: StageSegmentProps) {
  const draggingRef = useRef<'a' | 'b' | 'body' | null>(null);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
  const [, force] = useState(0);

  const color = SEGMENT_COLORS[segment.length];
  const numeric = SEGMENT_NUMERIC[segment.length];

  // Calcolo midpoint e angolo per disegnare il segmento come rettangolo ruotato
  const midX = (segment.a.x + segment.b.x) / 2;
  const midY = (segment.a.y + segment.b.y) / 2;
  const dx = segment.b.x - segment.a.x;
  const dy = segment.b.y - segment.a.y;
  const length = Math.hypot(dx, dy);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  function startDrag(
    e: React.PointerEvent | React.TouchEvent,
    which: 'a' | 'b' | 'body'
  ) {
    const point = 'touches' in e ? e.touches[0] : (e as React.PointerEvent);
    const clientX = point.clientX;
    const clientY = point.clientY;
    draggingRef.current = which;

    if (which === 'body') {
      dragOffsetRef.current = { dx: clientX - midX, dy: clientY - midY };
    } else if (which === 'a') {
      dragOffsetRef.current = { dx: clientX - segment.a.x, dy: clientY - segment.a.y };
    } else {
      dragOffsetRef.current = { dx: clientX - segment.b.x, dy: clientY - segment.b.y };
    }
    force((n) => n + 1);
  }

  useEffect(() => {
    function handleMove(clientX: number, clientY: number) {
      const which = draggingRef.current;
      if (!which) return;
      const { dx: ox, dy: oy } = dragOffsetRef.current;

      if (which === 'body') {
        const newMidX = clientX - ox;
        const newMidY = clientY - oy;
        const offsetX = newMidX - midX;
        const offsetY = newMidY - midY;
        onDragMove(
          segment.instanceId,
          { x: segment.a.x + offsetX, y: segment.a.y + offsetY },
          { x: segment.b.x + offsetX, y: segment.b.y + offsetY },
          'body'
        );
      } else if (which === 'a') {
        // Endpoint A si sposta. La lunghezza è fissa, quindi ricalcoliamo B mantenendo
        // la lunghezza originale del segmento, oppure liberamente?
        // Scelta didattica: la lunghezza è FISSA (corto/medio/lungo). L'utente sposta l'endpoint A
        // e B segue ruotando attorno al pivot opposto (B fisso) NO — invertito:
        // se l'utente trascina A, B resta dov'è e A si avvicina a B mantenendo solo direzione fissa?
        // Più semplice e intuitivo: l'utente trascina UN endpoint, l'altro resta ancorato,
        // il segmento ruota mantenendo la sua lunghezza fissa.
        const fixedB = segment.b;
        const newAx = clientX - ox;
        const newAy = clientY - oy;
        // Calcola direzione da B verso (newAx, newAy), poi posiziona A a distanza fissa
        const ddx = newAx - fixedB.x;
        const ddy = newAy - fixedB.y;
        const d = Math.hypot(ddx, ddy) || 1;
        const targetLen = SEGMENT_PIXELS[segment.length];
        const finalA = {
          x: fixedB.x + (ddx / d) * targetLen,
          y: fixedB.y + (ddy / d) * targetLen,
        };
        onDragMove(segment.instanceId, finalA, fixedB, 'a');
      } else {
        // 'b'
        const fixedA = segment.a;
        const newBx = clientX - ox;
        const newBy = clientY - oy;
        const ddx = newBx - fixedA.x;
        const ddy = newBy - fixedA.y;
        const d = Math.hypot(ddx, ddy) || 1;
        const targetLen = SEGMENT_PIXELS[segment.length];
        const finalB = {
          x: fixedA.x + (ddx / d) * targetLen,
          y: fixedA.y + (ddy / d) * targetLen,
        };
        onDragMove(segment.instanceId, fixedA, finalB, 'b');
      }
    }

    function handleUp() {
      if (draggingRef.current) {
        onDragEnd(segment.instanceId, draggingRef.current);
        draggingRef.current = null;
        force((n) => n + 1);
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      if (!draggingRef.current) return;
      e.preventDefault();
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [segment, midX, midY, onDragMove, onDragEnd]);

  const isDragging = draggingRef.current !== null;
  const thickness = 14;

  return (
    <>
      {/* Corpo del segmento (rettangolo ruotato) */}
      <motion.div
        className="absolute"
        style={{
          left: midX - length / 2,
          top: midY - thickness / 2,
          width: length,
          height: thickness,
          background: color,
          borderRadius: thickness / 2,
          transform: `rotate(${angleDeg}deg)`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
          cursor: 'grab',
          touchAction: 'none',
          zIndex: 5,
        }}
        animate={{ scale: isDragging && draggingRef.current === 'body' ? 1.08 : 1 }}
        onPointerDown={(e) => startDrag(e, 'body')}
        onTouchStart={(e) => startDrag(e, 'body')}
      >
        {/* Numero al centro (3/4/5) */}
        <div
          className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-sm pointer-events-none"
          style={{ transform: `rotate(${-angleDeg}deg)` }}
        >
          {numeric}
        </div>
      </motion.div>

      {/* Endpoint A */}
      <Endpoint
        x={segment.a.x}
        y={segment.a.y}
        hungry={isHungryA}
        glowing={snapTargetEndpoint === 'a'}
        color={color}
        onDown={(e) => startDrag(e, 'a')}
      />

      {/* Endpoint B */}
      <Endpoint
        x={segment.b.x}
        y={segment.b.y}
        hungry={isHungryB}
        glowing={snapTargetEndpoint === 'b'}
        color={color}
        onDown={(e) => startDrag(e, 'b')}
      />
    </>
  );
}

interface EndpointProps {
  x: number;
  y: number;
  hungry: boolean;
  glowing: boolean;
  color: string;
  onDown: (e: React.PointerEvent | React.TouchEvent) => void;
}

function Endpoint({ x, y, hungry, glowing, color, onDown }: EndpointProps) {
  const size = 22;
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        background: hungry ? color : '#94a3b8',
        border: '3px solid white',
        boxShadow: glowing
          ? `0 0 20px 6px ${color}`
          : '0 2px 6px rgba(0,0,0,0.3)',
        cursor: 'grab',
        touchAction: 'none',
        zIndex: 10,
      }}
      animate={
        hungry
          ? { scale: [1, 1.4, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 1, repeat: hungry ? Infinity : 0 }}
      onPointerDown={onDown}
      onTouchStart={onDown}
    />
  );
}
