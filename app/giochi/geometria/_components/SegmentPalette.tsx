'use client';

import { motion } from 'framer-motion';
import {
  SEGMENT_COLORS,
  SEGMENT_NUMERIC,
  SEGMENT_PIXELS,
  type SegmentLength,
} from '../_lib/geometry';

interface SegmentPaletteProps {
  onSpawn: (length: SegmentLength) => void;
}

const LENGTHS: SegmentLength[] = ['short', 'medium', 'long'];
const LABELS: Record<SegmentLength, string> = {
  short: 'Corto',
  medium: 'Medio',
  long: 'Lungo',
};

export default function SegmentPalette({ onSpawn }: SegmentPaletteProps) {
  return (
    <div className="bg-white/95 backdrop-blur border-t-2 border-blue-100 px-3 py-3">
      <div className="flex justify-center items-end gap-4">
        {LENGTHS.map((len) => {
          const color = SEGMENT_COLORS[len];
          const px = SEGMENT_PIXELS[len];
          const num = SEGMENT_NUMERIC[len];
          return (
            <motion.button
              key={len}
              whileTap={{ scale: 0.92 }}
              onPointerDown={() => onSpawn(len)}
              className="flex flex-col items-center bg-transparent border-none cursor-pointer touch-none p-1"
              aria-label={`Aggiungi segmento ${LABELS[len]}`}
            >
              <div
                style={{
                  width: px * 0.7,
                  height: 12,
                  background: color,
                  borderRadius: 6,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                className="flex items-center justify-center"
              >
                <span className="text-white text-xs font-extrabold">{num}</span>
              </div>
              <span className="text-[11px] font-bold text-gray-700 mt-1">
                {LABELS[len]}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-gray-500 mt-2 font-medium">
        Tocca per aggiungere. Avvicina i pallini per unire i lati! 🔗
      </p>
    </div>
  );
}
