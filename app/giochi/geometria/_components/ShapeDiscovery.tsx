'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ShapeInfo } from '../_data/shapes';

interface ShapeDiscoveryProps {
  shape: ShapeInfo | null;
  isNew: boolean;
  /** Se true, mostra il bonus "Pitagora" */
  pythagorasBonus?: boolean;
  onClose: () => void;
}

export default function ShapeDiscovery({
  shape,
  isNew,
  pythagorasBonus,
  onClose,
}: ShapeDiscoveryProps) {
  return (
    <AnimatePresence>
      {shape && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full"
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isNew && (
              <motion.div
                className="text-center text-purple-600 font-extrabold text-xl mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: 2 }}
              >
                ✨ Nuova forma! ✨
              </motion.div>
            )}

            <motion.div
              className="text-8xl text-center my-3"
              animate={
                isNew
                  ? { rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }
                  : { scale: [1, 1.1, 1] }
              }
              transition={{ duration: 1.2 }}
            >
              {shape.emoji}
            </motion.div>

            <div className="text-center">
              <div className="text-2xl font-extrabold text-blue-900">
                {shape.childName}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {shape.realName}
              </div>
            </div>

            <p className="text-center text-sm text-gray-700 my-4 leading-snug">
              {shape.fact}
            </p>

            {/* Bonus Pitagora */}
            {pythagorasBonus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-3 mb-3 border-2 border-orange-300"
              >
                <div className="text-center text-orange-700 font-extrabold text-sm">
                  🏆 Hai scoperto il triangolo di Pitagora!
                </div>
                <div className="text-[11px] text-orange-900 text-center mt-1">
                  3 + 4 + 5 = il triangolo più famoso della storia
                </div>
              </motion.div>
            )}

            {/* In natura */}
            <div className="bg-green-50 rounded-2xl p-3 mt-3">
              <div className="text-[11px] text-green-700 font-bold uppercase mb-2">
                Lo trovi in natura come...
              </div>
              <div className="flex justify-around flex-wrap gap-2">
                {shape.natureExamples.map((ex) => (
                  <div key={ex.label} className="flex flex-col items-center">
                    <span className="text-3xl">{ex.emoji}</span>
                    <span className="text-[10px] text-gray-700 font-semibold">
                      {ex.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-ref Laboratorio */}
            {shape.moleculeRef && (
              <div className="bg-yellow-50 rounded-2xl p-3 mt-3 flex items-center gap-3">
                <div className="text-3xl">🧪</div>
                <div className="flex-1">
                  <div className="text-[11px] text-yellow-700 font-bold uppercase">
                    Dal Laboratorio
                  </div>
                  <div className="text-sm text-gray-800 font-semibold">
                    {shape.moleculeRef.emoji} {shape.moleculeRef.name}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-blue-500 text-white font-bold rounded-full shadow active:scale-95 transition"
            >
              Continua a costruire!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
