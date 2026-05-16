'use client';

import { useEffect, useReducer, useRef, type Dispatch, type Reducer } from 'react';

type Codec<S> = {
  stringify: (state: S) => string;
  parse: (raw: string) => S;
};

const HYDRATE = '__giochi_lab_hydrate__';

type HydrateAction<S> = { type: typeof HYDRATE; state: S };

/**
 * useReducer con persistenza su localStorage.
 * - Lo stato iniziale è sempre `initial` (SSR-safe, no hydration mismatch).
 * - Dopo il mount, se c'è uno stato salvato lo carica via action interna HYDRATE.
 * - Ogni cambio di stato successivo viene salvato.
 *
 * `codec` permette di shapare cosa salvare (es. solo i campi "progresso", senza
 * mission/celebration attivi) e di gestire tipi non-JSON come Set.
 */
export function usePersistedReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  initial: S,
  codec: Codec<S>
): [S, Dispatch<A>] {
  const wrapped: Reducer<S, A | HydrateAction<S>> = (state, action) => {
    if ((action as HydrateAction<S>).type === HYDRATE) {
      return (action as HydrateAction<S>).state;
    }
    return reducer(state, action as A);
  };

  const [state, dispatch] = useReducer(wrapped, initial);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const restored = codec.parse(raw);
        (dispatch as Dispatch<HydrateAction<S>>)({ type: HYDRATE, state: restored });
      }
    } catch {
      // localStorage non disponibile o JSON malformato — ignora, parte dal default
    }
    hydrated.current = true;
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, codec.stringify(state));
    } catch {
      // quota piena o storage disabilitato — ignora
    }
  }, [state, key, codec]);

  return [state, dispatch as Dispatch<A>];
}
