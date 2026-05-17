'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import type { Continent, Animal } from '../../_data/continents';
import type { PexelsPhoto } from '../../_lib/pexels';
import { usePongoState } from '../../_lib/pongo-state';
import SoundToggle from '@/app/_shared/SoundToggle';
import { playSnap, playReject, playDiscovery, playTap } from '@/app/_shared/sound';

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
  const [showInfo, setShowInfo] = useState(false);

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

  const habitatRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      {/* === TOP BAR (sottile, ~44px) === */}
      <header className="flex items-center justify-between px-3 h-11 bg-white/40 backdrop-blur shrink-0 border-b border-white/40 z-10">
        <Link
          href="/giochi/pianeta-pongo"
          aria-label="Torna alla mappa"
          onClick={() => playTap()}
          className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-base font-bold text-slate-700 shadow hover:bg-white"
        >
          ←
        </Link>
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
          <span className="text-lg sm:text-xl">{continent.flag}</span>
          {continent.name}
        </h1>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playTap();
              setShowInfo(true);
            }}
            aria-label="Curiosità"
            className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-base font-bold text-slate-700 shadow"
          >
            ⓘ
          </button>
          <SoundToggle className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-base shadow" />
          <div className="bg-white/95 px-2.5 h-9 rounded-full text-yellow-500 font-bold text-sm shadow flex items-center gap-1">
            {state.stars}
            <span>⭐</span>
          </div>
        </div>
      </header>

      {/* === HINT BAR (1 riga, sparisce a completato) === */}
      {!allMatched && (
        <div className="px-3 py-1 text-center text-[11px] sm:text-xs font-semibold text-slate-800 bg-white/25 shrink-0">
          Trascina ogni animale al suo habitat
        </div>
      )}

      {/* === AREA GIOCO: habitats sinistra, palette destra === */}
      <main className="flex-1 flex flex-row gap-2 p-2 overflow-hidden min-h-0">
        {/* Habitats grandi */}
        <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
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
                className="bg-white/35 backdrop-blur rounded-2xl border-2 border-white/80 border-dashed flex flex-col p-2 min-h-0 overflow-hidden"
              >
                <div className="flex items-center justify-center gap-1.5 shrink-0">
                  <span className="text-lg sm:text-xl">{habitat.emoji}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {habitat.name}
                  </span>
                </div>
                <div className="flex-1 flex flex-wrap items-center justify-center gap-1.5 content-center min-h-0 mt-1">
                  <AnimatePresence>
                    {animalsHere.map((a) => (
                      <motion.div
                        key={a.emoji}
                        layout
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                      >
                        <AnimalAvatar
                          animal={a}
                          photo={animalPhotos[a.name] ?? null}
                          size="sm"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Palette laterale stretta */}
        <aside className="w-28 sm:w-36 md:w-44 shrink-0 bg-white/35 backdrop-blur rounded-2xl border border-white/60 p-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-800 uppercase text-center mb-1.5 tracking-wider">
            Animali
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {animals.filter((a) => !matchedSet.has(a.emoji)).map((animal) => (
              <DraggableAnimal
                key={animal.emoji}
                animal={animal}
                photo={animalPhotos[animal.name] ?? null}
                onDrop={(info) => handleDrop(animal, info)}
              />
            ))}
          </div>
          {allMatched && (
            <div className="text-[10px] text-slate-700 font-semibold text-center mt-2">
              Tutti a casa ✨
            </div>
          )}
        </aside>
      </main>

      {/* === FOOTER MINI === */}
      <footer className="flex items-center justify-between px-3 h-7 bg-white/25 text-[10px] text-slate-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{continent.food.emoji}</span>
          <span className="font-semibold">{continent.food.name}</span>
        </div>
        {photographers.length > 0 && (
          <div className="truncate ml-2">
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
            {photographers.slice(0, 2).join(', ')}
            {photographers.length > 2 ? ` +${photographers.length - 2}` : ''}
          </div>
        )}
      </footer>

      {/* === INFO MODAL (fact) === */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfo(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 text-center"
            >
              <div className="text-4xl mb-2">{continent.flag}</div>
              <div className="font-extrabold text-xl text-slate-900 mb-2">{continent.name}</div>
              <div className="text-sm text-slate-700 leading-relaxed mb-4">{continent.fact}</div>
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setShowInfo(false);
                }}
                className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm shadow hover:bg-slate-800"
              >
                Capito!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === CELEBRATION OVERLAY === */}
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
  size = 'md',
}: {
  animal: Animal;
  photo: PexelsPhoto | null;
  size?: 'sm' | 'md';
}) {
  // sm = nelle habitat dropzone (compatto)
  // md = nella palette laterale (più grande, area drag)
  const dim = size === 'md'
    ? 'w-12 h-12 sm:w-14 sm:h-14'
    : 'w-10 h-10 sm:w-11 sm:h-11';
  const emojiSize = size === 'md' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl';
  const labelSize = size === 'md' ? 'text-[10px] sm:text-[11px]' : 'text-[9px] sm:text-[10px]';

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${dim} rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-white/60 flex items-center justify-center`}
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
      <div className={`${labelSize} font-bold text-slate-900 mt-0.5 text-center max-w-[64px] truncate leading-tight`}>
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
      whileDrag={{ scale: 1.4, zIndex: 50, cursor: 'grabbing' }}
      whileTap={{ scale: 1.1 }}
      animate={!dragging ? { y: [0, -3, 0] } : { y: 0 }}
      transition={
        !dragging
          ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.15 }
      }
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        onDrop(info);
      }}
      className="cursor-grab select-none flex justify-center"
      style={{ touchAction: 'none' }}
      aria-label={`Animale: ${animal.name}`}
    >
      <AnimalAvatar animal={animal} photo={photo} size="md" />
    </motion.div>
  );
}
