'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import WorldMapReal, { type ContinentPaths } from './WorldMapReal';
import { usePongoState } from '../_lib/pongo-state';
import SoundToggle from '@/app/_shared/SoundToggle';
import { playTap } from '@/app/_shared/sound';
import type { ContinentId } from '../_data/continents';

type Props = {
  mapPaths: ContinentPaths[];
};

export default function PianetaPongo({ mapPaths }: Props) {
  const router = useRouter();
  const { state, visit } = usePongoState();

  const handleContinentClick = (id: ContinentId) => {
    playTap();
    visit(id);
    // Piccola attesa per far suonare il tap prima della navigation
    setTimeout(() => router.push(`/giochi/pianeta-pongo/${id}`), 100);
  };

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0c4a6e 100%)',
      }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-3 bg-white/10 backdrop-blur z-10">
        <Link
          href="/"
          aria-label="Torna alla home"
          className="bg-white/95 w-10 h-10 rounded-full shadow flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-white"
        >
          ←
        </Link>
        <h1 className="text-xl font-extrabold text-white drop-shadow">
          🌍 Pianeta di Pongo
        </h1>
        <div className="flex items-center gap-2">
          <SoundToggle className="bg-white/95 w-10 h-10 rounded-full shadow flex items-center justify-center text-lg" />
          <div className="bg-white/95 px-3 py-1.5 rounded-full text-yellow-500 font-bold text-lg shadow flex items-center gap-1">
            {state.stars} <span>⭐</span>
          </div>
        </div>
      </header>

      {/* HINT iniziale */}
      {state.exploredContinents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 bg-white/95 rounded-2xl px-4 py-2 text-center text-sm font-semibold text-blue-900 shadow"
        >
          👆 Tocca un continente per esplorarlo!
        </motion.div>
      )}

      {/* MAPPA */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-5xl aspect-[2/1]">
          <WorldMapReal
            mapPaths={mapPaths}
            exploredContinents={state.exploredContinents}
            onContinentClick={handleContinentClick}
          />
        </div>
      </main>

      {/* PROGRESSO */}
      <footer className="px-4 py-2 bg-white/10 backdrop-blur text-center text-xs text-white/80">
        {state.exploredContinents.length}/7 continenti scoperti
      </footer>
    </div>
  );
}
