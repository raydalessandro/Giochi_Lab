'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface CelebrationProps {
  show: boolean;
  message?: string;
}

const CONFETTI_EMOJI = ['🎉', '⭐', '🌟', '✨', '🎊', '💫'];

export default function Celebration({ show, message = 'Bravo!' }: CelebrationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti */}
          {Array.from({ length: 16 }).map((_, i) => {
            const emoji = CONFETTI_EMOJI[i % CONFETTI_EMOJI.length];
            const angle = (i / 16) * Math.PI * 2;
            const dx = Math.cos(angle) * 200;
            const dy = Math.sin(angle) * 200;
            return (
              <motion.span
                key={i}
                className="absolute text-4xl"
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{
                  x: dx,
                  y: dy,
                  scale: [0, 1.2, 1, 0.8],
                  rotate: 360,
                }}
                transition={{
                  duration: 1.4,
                  delay: i * 0.03,
                  ease: 'easeOut',
                }}
              >
                {emoji}
              </motion.span>
            );
          })}

          {/* Messaggio centrale */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.3, 1], rotate: [-20, 5, 0] }}
            transition={{ duration: 0.7, ease: 'backOut' }}
            className="text-6xl font-extrabold text-yellow-400 drop-shadow-lg"
            style={{
              textShadow:
                '0 0 20px rgba(255,200,0,0.8), 3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff',
            }}
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
