'use client';

import { motion } from 'framer-motion';
import { useDrag } from '../_hooks/useDrag';
import { getAtom } from '../_data/atoms';
import AtomBall from './AtomBall';
import type { PieceInstance } from '../_lib/composition';

interface StageAtomProps {
  instance: PieceInstance;
  onMove: (instanceId: string, x: number, y: number) => void;
  onDragEnd: (instanceId: string, x: number, y: number) => void;
}

/**
 * Atomo già presente nell'area di gioco, trascinabile per riposizionamento.
 * Mostra le manine libere come pulsanti (hungry).
 */
export default function StageAtom({ instance, onMove, onDragEnd }: StageAtomProps) {
  const atom = getAtom(instance.pieceId as Parameters<typeof getAtom>[0]);

  const { x, y, isDragging, startDrag } = useDrag(instance.x, instance.y, {
    onDragMove: (nx, ny) => onMove(instance.instanceId, nx, ny),
    onDragEnd: (nx, ny) => onDragEnd(instance.instanceId, nx, ny),
  });

  const hungry = instance.freeSlots > 0;

  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: x,
        top: y,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      animate={{ scale: isDragging ? 1.15 : 1 }}
      transition={{ duration: 0.15 }}
      onPointerDown={startDrag}
      onTouchStart={startDrag}
    >
      <AtomBall atom={atom} size={72} hungry={hungry} freeHands={instance.freeSlots} />
    </motion.div>
  );
}
