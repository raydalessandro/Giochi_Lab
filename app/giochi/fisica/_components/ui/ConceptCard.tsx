'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface ConceptCardProps {
  show: boolean;
  emoji: string;
  title: string;
  concept: string;          // spiegazione del meccanismo
  realWorld: { emoji: string; text: string }[];
  onClose: () => void;
}

export default function ConceptCard({
  show,
  emoji,
  title,
  concept,
  realWorld,
  onClose,
}: ConceptCardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
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
            <div className="text-7xl text-center mb-3">{emoji}</div>
            <div className="text-2xl font-extrabold text-center text-purple-900">
              {title}
            </div>
            <p className="text-center text-sm text-gray-700 mt-4 leading-snug">
              {concept}
            </p>

            <div className="bg-amber-50 rounded-2xl p-3 mt-4">
              <div className="text-[11px] text-amber-700 font-bold uppercase mb-2">
                Lo usi anche...
              </div>
              <div className="space-y-1.5">
                {realWorld.map((rw, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-2xl">{rw.emoji}</span>
                    <span className="text-xs text-gray-800 font-semibold flex-1">
                      {rw.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-purple-500 text-white font-bold rounded-full shadow active:scale-95"
            >
              Ho capito, gioco!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
