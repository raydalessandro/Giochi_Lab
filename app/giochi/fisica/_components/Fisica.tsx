'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Leva from './machines/Leva';
import PianoInclinato from './machines/PianoInclinato';
import Carrucola from './machines/Carrucola';
import Cuneo from './machines/Cuneo';
import Vite from './machines/Vite';
import RuotaAsse from './machines/RuotaAsse';
import SoundToggle from '@/app/_shared/SoundToggle';
import { playSelect } from '@/app/_shared/sound';

type MachineId = 'leva' | 'piano' | 'carrucola' | 'cuneo' | 'vite' | 'ruota' | null;

interface MachineInfo {
  id: Exclude<MachineId, null>;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}

const MACHINES: MachineInfo[] = [
  { id: 'leva',      emoji: '⚖️', title: 'La Leva',           subtitle: 'Sposta un masso con un bastone', color: 'bg-blue-100' },
  { id: 'piano',     emoji: '📐', title: 'Il Piano Inclinato', subtitle: 'Spingi sulla rampa',             color: 'bg-green-100' },
  { id: 'carrucola', emoji: '⚙️', title: 'La Carrucola',       subtitle: 'Tira giù per sollevare!',        color: 'bg-yellow-100' },
  { id: 'cuneo',     emoji: '🪓', title: 'Il Cuneo',           subtitle: 'Spacca il tronco!',              color: 'bg-amber-100' },
  { id: 'vite',      emoji: '🔩', title: 'La Vite',            subtitle: "Solleva un'auto da solo",        color: 'bg-slate-100' },
  { id: 'ruota',     emoji: '🛞', title: 'La Ruota',           subtitle: 'Con o senza?',                   color: 'bg-orange-100' },
];

export default function Fisica() {
  const [active, setActive] = useState<MachineId>(null);

  function back() {
    setActive(null);
  }

  return (
    <div
      className="w-screen h-screen overflow-hidden select-none"
      style={{ touchAction: 'manipulation' }}
    >
      <AnimatePresence mode="wait">
        {active === null && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col"
            style={{
              background:
                'radial-gradient(ellipse at top, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)',
            }}
          >
            <header className="px-4 py-4 bg-white/30 backdrop-blur relative">
              <SoundToggle className="absolute top-3 right-3 bg-white/95 w-9 h-9 rounded-full shadow flex items-center justify-center text-base" />
              <h1 className="text-2xl font-extrabold text-pink-900 text-center">
                🔧 Le Macchine Semplici
              </h1>
              <p className="text-center text-xs text-pink-800 mt-1 font-semibold">
                Sei trucchi per dare super-forza alle tue mani
              </p>
            </header>

            <main className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
              {MACHINES.map((m) => (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playSelect();
                    setActive(m.id);
                  }}
                  className={`${m.color} rounded-3xl p-4 shadow-lg border-2 border-white text-left active:shadow-md transition`}
                >
                  <div className="text-5xl">{m.emoji}</div>
                  <div className="font-extrabold text-purple-900 mt-2 text-sm">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-gray-700 mt-1 font-semibold">
                    {m.subtitle}
                  </div>
                </motion.button>
              ))}
            </main>

            <footer className="px-4 py-3 bg-white/30 backdrop-blur text-center text-[11px] text-pink-900 font-semibold">
              💡 Le macchine semplici ti danno super-forza. Provale tutte!
            </footer>
          </motion.div>
        )}

        {active === 'leva' && (
          <motion.div key="leva" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="w-full h-full">
            <Leva onBack={back} />
          </motion.div>
        )}
        {active === 'piano' && (
          <motion.div key="piano" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="w-full h-full">
            <PianoInclinato onBack={back} />
          </motion.div>
        )}
        {active === 'carrucola' && (
          <motion.div key="carrucola" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="w-full h-full">
            <Carrucola onBack={back} />
          </motion.div>
        )}
        {active === 'cuneo' && (
          <motion.div key="cuneo" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="w-full h-full">
            <Cuneo onBack={back} />
          </motion.div>
        )}
        {active === 'vite' && (
          <motion.div key="vite" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="w-full h-full">
            <Vite onBack={back} />
          </motion.div>
        )}
        {active === 'ruota' && (
          <motion.div key="ruota" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="w-full h-full">
            <RuotaAsse onBack={back} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
