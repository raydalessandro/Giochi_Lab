'use client';

import { useEffect } from 'react';
import { prefetchAllSounds } from './sound';

/**
 * Avvia il pre-fetch dei sample audio Freesound al mount.
 * Esecuzione una sola volta per session — gli MP3 cachati vengono riusati
 * dalle visite successive senza ulteriori fetch.
 */
export default function SoundPrefetch() {
  useEffect(() => {
    prefetchAllSounds();
  }, []);
  return null;
}
