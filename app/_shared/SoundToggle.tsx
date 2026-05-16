'use client';

import { useEffect, useState } from 'react';

const KEY = 'giochi-lab:sound';

function read(): boolean {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

type Props = {
  className?: string;
};

export default function SoundToggle({ className = '' }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEnabled(read());
    setHydrated(true);
    // sincronizza tra tab/window
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setEnabled(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem(KEY, String(next));
    } catch {
      // storage non disponibile — ignora
    }
  };

  // placeholder durante SSR per evitare flash icona sbagliata
  if (!hydrated) {
    return <span className={className} aria-hidden style={{ display: 'inline-block' }} />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Disattiva audio' : 'Attiva audio'}
      aria-pressed={enabled}
      className={className}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
