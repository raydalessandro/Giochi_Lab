'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Molecule } from '../_data/atoms';

interface DiscoveryPopupProps {
  molecule: Molecule | null;
  isNew: boolean;        // mai scoperta prima → wow grande, altrimenti più discreto
  onClose: () => void;
}

/**
 * Popup di scoperta: appare quando una molecola completa si forma.
 * Diversi livelli di "wow" se è nuova vs già vista.
 *
 * Cross-reference con geometria: mostra la forma geometrica.
 */
export default function DiscoveryPopup({ molecule, isNew, onClose }: DiscoveryPopupProps) {
  return (
    <AnimatePresence>
      {molecule && (
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
                className="text-center text-yellow-500 font-extrabold text-xl mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: 2 }}
              >
                ✨ Nuova scoperta! ✨
              </motion.div>
            )}

            <motion.div
              className="text-8xl text-center my-3"
              animate={
                isNew
                  ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }
                  : { scale: [1, 1.1, 1] }
              }
              transition={{ duration: 1.2 }}
            >
              {molecule.emoji}
            </motion.div>

            <div className="text-center">
              <div className="text-2xl font-extrabold text-blue-900">
                {molecule.childName}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-1">
                {molecule.realName}
              </div>
            </div>

            <p className="text-center text-sm text-gray-700 my-4 leading-snug">
              {molecule.description}
            </p>

            {/* Cross-reference con geometria */}
            <div className="bg-blue-50 rounded-2xl p-3 mt-3 flex items-center gap-3">
              <div className="text-2xl">📐</div>
              <div className="flex-1">
                <div className="text-[11px] text-blue-700 font-bold uppercase">
                  Forma in natura
                </div>
                <div className="text-sm text-gray-800 font-semibold">
                  {molecule.shapeNote}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-blue-500 text-white font-bold rounded-full shadow active:scale-95 transition"
            >
              Continua a giocare!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
