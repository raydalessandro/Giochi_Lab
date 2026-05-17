'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ContinentId } from '../_data/continents';

const KEY = 'giochi-lab:pongo';

export type PongoState = {
  stars: number;
  exploredContinents: ContinentId[];
  /** animali matchati al loro habitat, per continente (emoji) */
  matched: Partial<Record<ContinentId, string[]>>;
  /** continenti per cui il bonus "tutti gli animali a casa" è già stato assegnato */
  bonused: Partial<Record<ContinentId, boolean>>;
};

const DEFAULT: PongoState = {
  stars: 0,
  exploredContinents: [],
  matched: {},
  bonused: {},
};

function load(): PongoState {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const data = JSON.parse(raw);
    return {
      stars: typeof data.stars === 'number' ? data.stars : 0,
      exploredContinents: Array.isArray(data.exploredContinents) ? data.exploredContinents : [],
      matched: data.matched && typeof data.matched === 'object' ? data.matched : {},
      bonused: data.bonused && typeof data.bonused === 'object' ? data.bonused : {},
    };
  } catch {
    return DEFAULT;
  }
}

function save(s: PongoState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // quota piena — ignora
  }
}

/**
 * Stato globale di Pongo: stelle + esplorati + match per continente.
 * Persistito su localStorage. La home Pongo e ciascuna scena continente
 * usano lo stesso hook — gli eventi 'storage' tengono in sync eventuali
 * tab aperte in parallelo.
 */
export function usePongoState() {
  const [state, setState] = useState<PongoState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((updater: (prev: PongoState) => PongoState) => {
    setState((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const visit = useCallback(
    (id: ContinentId) => {
      update((prev) => {
        if (prev.exploredContinents.includes(id)) return prev;
        return {
          ...prev,
          stars: prev.stars + 1,
          exploredContinents: [...prev.exploredContinents, id],
        };
      });
    },
    [update]
  );

  const match = useCallback(
    (cId: ContinentId, animalEmoji: string) => {
      update((prev) => {
        const arr = prev.matched[cId] ?? [];
        if (arr.includes(animalEmoji)) return prev;
        return {
          ...prev,
          stars: prev.stars + 1,
          matched: { ...prev.matched, [cId]: [...arr, animalEmoji] },
        };
      });
    },
    [update]
  );

  const completeBonus = useCallback(
    (cId: ContinentId) => {
      update((prev) => {
        if (prev.bonused?.[cId]) return prev;
        return {
          ...prev,
          stars: prev.stars + 5,
          bonused: { ...prev.bonused, [cId]: true },
        };
      });
    },
    [update]
  );

  return { state, hydrated, visit, match, completeBonus };
}
