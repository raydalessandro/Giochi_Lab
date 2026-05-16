'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface DragState {
  isDragging: boolean;
  x: number;
  y: number;
}

interface UseDragOptions {
  onDragEnd?: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
}

/**
 * Drag unificato touch + pointer, riusabile.
 * Stessa firma usata anche da Pongo: hook condivisibile tra giochi.
 */
export function useDrag(initialX: number, initialY: number, opts: UseDragOptions = {}) {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    x: initialX,
    y: initialY,
  });

  const offsetRef = useRef({ dx: 0, dy: 0 });
  const onDragEndRef = useRef(opts.onDragEnd);
  const onDragMoveRef = useRef(opts.onDragMove);
  onDragEndRef.current = opts.onDragEnd;
  onDragMoveRef.current = opts.onDragMove;

  useEffect(() => {
    setState({ isDragging: false, x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setState((s) => {
      offsetRef.current = { dx: clientX - s.x, dy: clientY - s.y };
      return { ...s, isDragging: true };
    });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    setState((s) => {
      if (!s.isDragging) return s;
      const nx = clientX - offsetRef.current.dx;
      const ny = clientY - offsetRef.current.dy;
      onDragMoveRef.current?.(nx, ny);
      return { ...s, x: nx, y: ny };
    });
  }, []);

  const handleEnd = useCallback(() => {
    setState((s) => {
      if (!s.isDragging) return s;
      onDragEndRef.current?.(s.x, s.y);
      return { ...s, isDragging: false };
    });
  }, []);

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

  return { ...state, startDrag, setPosition: (x: number, y: number) => setState((s) => ({ ...s, x, y })) };
}
