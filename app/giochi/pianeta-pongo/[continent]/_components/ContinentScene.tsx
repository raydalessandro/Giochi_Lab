'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import type { Continent, Animal } from '../../_data/continents';
import type { PexelsPhoto } from '../../_lib/pexels';
import { usePongoState } from '../../_lib/pongo-state';
import SoundToggle from '@/app/_shared/SoundToggle';
import { playSnap, playReject, playDiscovery, playTap } from '@/app/_shared/sound';

// Map name → photo (o null se la fetch non ha dato risultati / non ci sono
// searchQuery configurate per quel continente).
export type AnimalPhotos = Record<string, PexelsPhoto | null>;

// === SFONDI PER CONTINENTE ===
const BACKGROUNDS: Record<string, string> = {
  americhe_nord: 'linear-gradient(180deg, #fed7aa 0%, #fb923c 100%)',
  americhe_sud:  'linear-gradient(180deg, #fef3c7 0%, #facc15 100%)',
  europa:        'linear-gradient(180deg, #ede9fe 0%, #a78bfa 100%)',
  africa:        'linear-gradient(180deg, #fef3c7 0%, #fbbf24 100%)',
  asia:          'linear-gradient(180deg, #fecaca 0%, #f87171 100%)',
  oceania:       'linear-gradient(180deg, #bbf7d0 0%, #4ade80 100%)',
  antartide:     'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
};

type Props = {
  continent: Continent;
  animalPhotos: AnimalPhotos;
};

export default function ContinentScene({ continent, animalPhotos }: Props) {
  const { state, hydrated, match, completeBonus } = usePongoState();

  const matchedList = state.matched[continent.id] ?? [];
  const matchedSet = new Set(matchedList);
  const animals = continent.animals;
  const allMatched = matchedList.length === animals.length;
  const bonusAlreadyGiven = !!state.bonused[continent.id];

  const [celebrate, setCelebrate] = useState(false);

  // Trigger bonus quando si completa la prima volta
  useEffect(() => {
    if (allMatched && !bonusAlreadyGiven && hydrated) {
      const t = setTimeout(() => {
        playDiscovery();
        completeBonus(continent.id);
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2400);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [allMatched, bonusAlreadyGiven, hydrated, continent.id, completeBonus]);

  // Refs delle 3 dropzone (uno per habitat)
  const habitatRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /** Trova quale habitat il punto (x,y in coord client) sta sopra. */
  function findHabitatAt(x: number, y: number): string | null {
    for (const h of continent.habitats) {
      const el = habitatRefs.current[h.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return h.id;
      }
    }
    return null;
  }

  function handleDrop(animal: Animal, info: PanInfo) {
    const hit = findHabitatAt(info.point.x, info.point.y);
    if (!hit) {
      playReject();
      return;
    }
    if (hit === animal.habitatId) {
      playSnap();
      match(continent.id, animal.emoji);
    } else {
      playReject();
    }
  }

  // Tutte le foto dei fotografi mostrati nella scena, per attribution Pexels
  const photographers = Array.from(
    new Set(
      animals
        .map((a) => animalPhotos[a.name])
        .filter((p): p is PexelsPhoto => p !== null)
        .map((p) => p.photographer)
    )
  );

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden"
      style={{ background: BACKGROUNDS[continent.id] }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-2 bg-white/30 backdrop-blur z-10 shrink-0">
        <Link
          href="/giochi/pianeta-pongo"
          aria-label="Torna alla mappa"
          onClick={() => playTap()}
          className="bg-white/95 w-10 h-10 rounded-full shadow flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-white"
        >
          ←
        </Link>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">{continent.flag}</span>
          {continent.name}
        </h1>
        <div className="flex items-center gap-2">
          <SoundToggle className="bg-white/95 w-10 h-10 rounded-full shadow flex items-center justify-center text-lg" />
          <div className="bg-white/95 px-3 py-1.5 rounded-full text-yellow-500 font-bold shadow flex items-center gap-1">
            {state.stars} <span>⭐</span>
          </div>
        </div>
      </header>

      {/* FACT + FOOD + MISSIONE HINT */}
      <section className="px-4 py-2 flex flex-wrap gap-2 items-center justify-center shrink-0">
        <div className="bg-white/90 rounded-2xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 shadow max-w-md">
          {continent.fact}
        </div>
        <div className="bg-white/90 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow">
          <span className="text-xl">{continent.food.emoji}</span>
          <span className="font-semibold text-slate-800 text-xs sm:text-sm">{continent.food.name}</span>
        </div>
        <div className="bg-white/95 rounded-2xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 shadow">
          {allMatched ? '🎉 Tutti a casa!' : 'Trascina ogni animale al suo habitat'}
        </div>
      </section>

      {/* AREA GIOCO: habitats sopra, animali sotto */}
      <main className="flex-1 flex flex-col px-3 sm:px-4 py-2 gap-2 sm:gap-3 overflow-hidden">
        {/* HABITATS (drop zones) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1 min-h-0">
          {continent.habitats.map((habitat) => {
            const animalsHere = animals.filter(
              (a) => a.habitatId === habitat.id && matchedSet.has(a.emoji)
            );
            return (
              <div
                key={habitat.id}
                ref={(el) => {
                  habitatRefs.current[habitat.id] = el;
                }}
                className="bg-white/40 backdrop-blur rounded-3xl border-2 border-white/80 border-dashed flex flex-col items-center justify-start p-2 sm:p-3 min-h-0 overflow-hidden"
              >
                <div className="text-2xl sm:text-3xl">{habitat.emoji}</div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {habitat.name}
                </div>
                <div className="flex-1 flex flex-wrap items-center justify-center gap-2 mt-2 min-h-0 content-center">
                  <AnimatePresence>
                    {animalsHere.map((a) => (
                      <motion.div
                        key={a.emoji}
                        layout
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                      >
                        <AnimalAvatar animal={a} photo={animalPhotos[a.name] ?? null} size="sm" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* PALETTE ANIMALI DA TRASCINARE */}
        <div className="bg-white/30 backdrop-blur rounded-3xl border border-white/60 px-3 py-2 sm:py-3 shrink-0">
          <div className="flex flex-wrap gap-3 sm:gap-5 justify-center items-center min-h-[80px]">
            {animals.filter((a) => !matchedSet.has(a.emoji)).map((animal) => (
              <DraggableAnimal
                key={animal.emoji}
                animal={animal}
                photo={animalPhotos[animal.name] ?? null}
                onDrop={(info) => handleDrop(animal, info)}
              />
            ))}
            {animals.every((a) => matchedSet.has(a.emoji)) && (
              <div className="text-sm text-slate-700 font-semibold">
                Tutti a casa ✨
              </div>
            )}
          </div>
        </div>

        {/* ATTRIBUTION PEXELS (richiesta dai loro TOS) */}
        {photographers.length > 0 && (
          <div className="text-[10px] text-slate-700/80 text-center pb-1">
            Foto da{' '}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              Pexels
            </a>
            {' · '}
            {photographers.join(', ')}
          </div>
        )}
      </main>

      {/* CELEBRATION OVERLAY */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              className="bg-white rounded-3xl shadow-2xl px-8 py-6 text-center"
            >
              <div className="text-5xl mb-2">🎉</div>
              <div className="font-extrabold text-2xl text-slate-900">Bravo!</div>
              <div className="text-sm text-slate-700 mt-1">+5 stelle bonus</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === ANIMAL AVATAR (foto tonda + nome, fallback emoji) ===
function AnimalAvatar({
  animal,
  photo,
  size = 'lg',
}: {
  animal: Animal;
  photo: PexelsPhoto | null;
  size?: 'sm' | 'lg';
}) {
  const dim = size === 'lg' ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-14 h-14 sm:w-16 sm:h-16';
  const emojiSize = size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl';
  const labelSize = size === 'lg' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs';

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${dim} rounded-full overflow-hidden border-4 border-white shadow-xl bg-white/60 flex items-center justify-center`}
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.alt}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span className={emojiSize} aria-hidden>
            {animal.emoji}
          </span>
        )}
      </div>
      <div className={`${labelSize} font-bold text-slate-900 mt-1 text-center max-w-[90px] truncate`}>
        {animal.name}
      </div>
    </div>
  );
}

// === ANIMALE DRAGGABLE ===
function DraggableAnimal({
  animal,
  photo,
  onDrop,
}: {
  animal: Animal;
  photo: PexelsPhoto | null;
  onDrop: (info: PanInfo) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragElastic={0.6}
      whileDrag={{ scale: 1.25, zIndex: 50, cursor: 'grabbing' }}
      whileTap={{ scale: 1.05 }}
      animate={!dragging ? { y: [0, -4, 0] } : { y: 0 }}
      transition={!dragging ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        onDrop(info);
      }}
      className="cursor-grab select-none"
      style={{ touchAction: 'none' }}
      aria-label={`Animale: ${animal.name}`}
    >
      <AnimalAvatar animal={animal} photo={photo} size="lg" />
    </motion.div>
  );
}
