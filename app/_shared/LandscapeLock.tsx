'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Forza orientamento landscape per la route in cui è montato.
 *
 * Tre tentativi in cascata:
 * 1. screen.orientation.lock('landscape') — funziona su Chrome Android se
 *    il documento è in fullscreen. Su iOS Safari non esiste, ignorato.
 * 2. Rilevamento via dimensioni window: se siamo su un dispositivo "piccolo"
 *    (lato corto < 800px) e portrait, mostra overlay "ruota il telefono".
 *    L'overlay sparisce automaticamente quando l'utente ruota.
 * 3. Su desktop (lato corto >= 800px) non interviene: l'utente può ridurre
 *    la finestra come vuole.
 */
export default function LandscapeLock() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const shortSide = Math.min(w, h);
      const isMobile = shortSide < 800;
      const isPortrait = h > w;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);

    // Tentativo lock orientation (Chrome Android in fullscreen).
    // Fallisce silenziosamente su iOS, Firefox, contesti non-fullscreen.
    const orientation = (screen as Screen & { orientation?: ScreenOrientation & { lock?: (o: string) => Promise<void> } }).orientation;
    if (orientation && typeof orientation.lock === 'function') {
      orientation.lock('landscape').catch(() => {
        // Lock non disponibile in questo contesto, contiamo sull'overlay
      });
    }

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
      // Sblocca quando si esce dalla route Pongo
      if (orientation && typeof (orientation as ScreenOrientation & { unlock?: () => void }).unlock === 'function') {
        try {
          (orientation as ScreenOrientation & { unlock: () => void }).unlock();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isPortraitMobile) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center text-white p-6 text-center"
      role="dialog"
      aria-live="polite"
    >
      <motion.svg
        viewBox="0 0 24 36"
        className="w-24 h-32 mb-8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: [0, 0, -90, -90, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          times: [0, 0.15, 0.45, 0.85, 1],
          ease: 'easeInOut',
        }}
      >
        <rect x={3} y={2} width={18} height={32} rx={3} />
        <line x1={10} y1={30} x2={14} y2={30} strokeWidth={2.5} />
      </motion.svg>
      <div className="text-2xl font-extrabold mb-2">Gira il telefono</div>
      <div className="text-sm text-white/80 max-w-xs">
        Pongo si gioca in orizzontale per esplorare meglio la mappa del mondo
      </div>
    </div>
  );
}
