'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface DragState {
  isDragging: boolean;
  x: number;
  y: number;
  startX: number;
  startY: number;
}

interface UseDragOptions {
  onDragEnd?: (x: number, y: number) => void;
}

/**
 * Hook unificato per drag touch + mouse.
 * Pensato per emoji-animale trascinabile sulla mappa.
 * Mobile-first: usa pointer events dove possibile.
 */
export function useDrag(initialX: number, initialY: number, opts: UseDragOptions = {}) {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    x: initialX,
    y: initialY,
    startX: initialX,
    startY: initialY,
  });

  const offsetRef = useRef({ dx: 0, dy: 0 });
  const onDragEndRef = useRef(opts.onDragEnd);
  onDragEndRef.current = opts.onDragEnd;

  // Reset quando cambiano le coordinate iniziali (nuova missione)
  useEffect(() => {
    setState({
      isDragging: false,
      x: initialX,
      y: initialY,
      startX: initialX,
      startY: initialY,
    });
  }, [initialX, initialY]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    offsetRef.current = {
      dx: clientX - state.x,
      dy: clientY - state.y,
    };
    setState((s) => ({ ...s, isDragging: true }));
  }, [state.x, state.y]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    setState((s) => {
      if (!s.isDragging) return s;
      return {
        ...s,
        x: clientX - offsetRef.current.dx,
        y: clientY - offsetRef.current.dy,
      };
    });
  }, []);

  const handleEnd = useCallback(() => {
    setState((s) => {
      if (!s.isDragging) return s;
      onDragEndRef.current?.(s.x, s.y);
      return { ...s, isDragging: false };
    });
  }, []);

  // Listeners globali per move/end (così non perdi il drag se esci dall'elemento)
  useEffect(() => {
    if (!state.isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };
    const onPointerUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [state.isDragging, handleMove, handleEnd]);

  const startDrag = useCallback((e: React.PointerEvent | React.TouchEvent) => {
    if ('touches' in e) {
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    } else {
      handleStart(e.clientX, e.clientY);
    }
  }, [handleStart]);

  const reset = useCallback(() => {
    setState({
      isDragging: false,
      x: initialX,
      y: initialY,
      startX: initialX,
      startY: initialY,
    });
  }, [initialX, initialY]);

  return { ...state, startDrag, reset };
}
