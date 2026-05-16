'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { Continent } from '../_data/continents';

interface ContinentInfoProps {
  continent: Continent | null;
  onClose: () => void;
}

export default function ContinentInfo({ continent, onClose }: ContinentInfoProps) {
  const [tappedAnimal, setTappedAnimal] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {continent && (
        <motion.div
          key={continent.id}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '110%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="absolute bottom-4 left-4 right-4 bg-white/97 rounded-3xl p-5 shadow-2xl z-20"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center"
            aria-label="Chiudi"
          >
            ×
          </button>

          <div
            className="text-2xl font-extrabold text-center mb-1"
            style={{ color: continent.color }}
          >
            {continent.flag} {continent.name}
          </div>

          <p className="text-center text-sm text-gray-600 mb-4 px-4">
            {continent.fact}
          </p>

          <div className="flex justify-around flex-wrap gap-2 mb-3">
            {continent.animals.map((a) => (
              <button
                key={a.emoji}
                onClick={() => {
                  setTappedAnimal(a.emoji);
                  setTimeout(() => setTappedAnimal(null), 1500);
                }}
                className="flex flex-col items-center p-2 rounded-2xl active:bg-yellow-100 transition min-w-[60px]"
              >
                <motion.span
                  animate={
                    tappedAnimal === a.emoji
                      ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.6 }}
                  className="text-5xl leading-none"
                >
                  {a.emoji}
                </motion.span>
                <span className="text-xs text-gray-700 font-semibold mt-1">
                  {a.name}
                </span>
                <AnimatePresence>
                  {tappedAnimal === a.emoji && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: -10 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-xs font-bold text-orange-500 pointer-events-none"
                    >
                      {a.sound}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-3xl">{continent.food.emoji}</span>
            <span className="text-sm font-semibold text-gray-700">
              Si mangia: <strong>{continent.food.name}</strong>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
