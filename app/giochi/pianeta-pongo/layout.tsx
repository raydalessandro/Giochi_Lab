import LandscapeLock from '@/app/_shared/LandscapeLock';

/**
 * Layout per tutto il gioco Pianeta di Pongo (mappa + scene continente).
 * Monta LandscapeLock una sola volta: vale per /giochi/pianeta-pongo e
 * per ogni /giochi/pianeta-pongo/[continent].
 */
export default function PongoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandscapeLock />
      {children}
    </>
  );
}
