// Dati continenti: path SVG semplificati + contenuti didattici
// I path sono disegnati a mano per essere leggibili e simpatici, non geograficamente esatti
// (target età 5-7: riconoscibilità > precisione)

export type ContinentId =
  | 'europa'
  | 'africa'
  | 'asia'
  | 'americhe_nord'
  | 'americhe_sud'
  | 'oceania'
  | 'antartide';

export interface Animal {
  emoji: string;
  name: string;
  sound: string; // descrizione del verso (mostrato come testo, non audio)
}

export interface Continent {
  id: ContinentId;
  name: string;
  color: string;        // colore base tailwind-friendly (hex)
  colorHover: string;
  path: string;         // SVG path
  labelX: number;       // posizione label
  labelY: number;
  animals: Animal[];
  food: { emoji: string; name: string };
  fact: string;         // curiosità da bambino
  flag: string;         // emoji bandiera o simbolo
}

// Le coordinate sono in viewBox 1000x500 — mappa stilizzata "da libro illustrato"
export const CONTINENTS: Continent[] = [
  {
    id: 'americhe_nord',
    name: 'Nord America',
    color: '#fb923c',
    colorHover: '#f97316',
    path: 'M 80 90 Q 90 70 130 65 L 200 60 Q 250 65 280 90 L 290 130 Q 285 160 270 180 L 240 200 Q 200 215 160 210 L 130 200 Q 100 185 85 160 L 75 130 Z',
    labelX: 180,
    labelY: 140,
    animals: [
      { emoji: '🦅', name: "Aquila", sound: 'krii krii!' },
      { emoji: '🐻', name: 'Orso bruno', sound: 'grrr!' },
      { emoji: '🦬', name: 'Bisonte', sound: 'muuuf!' },
    ],
    food: { emoji: '🌽', name: 'Mais' },
    fact: 'Qui ci sono foreste enormi e cascate giganti! 🏞️',
    flag: '🍁',
  },
  {
    id: 'americhe_sud',
    name: 'Sud America',
    color: '#facc15',
    colorHover: '#eab308',
    path: 'M 230 230 Q 250 220 270 230 L 290 260 Q 295 300 285 340 L 270 390 Q 250 420 230 425 L 210 415 Q 195 380 200 340 L 210 290 Q 220 255 230 230 Z',
    labelX: 245,
    labelY: 320,
    animals: [
      { emoji: '🦜', name: 'Pappagallo', sound: 'squa squa!' },
      { emoji: '🐆', name: 'Giaguaro', sound: 'rrroar!' },
      { emoji: '🦥', name: 'Bradipo', sound: 'zzz...' },
    ],
    food: { emoji: '🍌', name: 'Banane' },
    fact: "C'è la foresta più grande del mondo: l'Amazzonia! 🌳",
    flag: '🌴',
  },
  {
    id: 'europa',
    name: 'Europa',
    color: '#a78bfa',
    colorHover: '#8b5cf6',
    path: 'M 430 80 Q 460 70 500 75 L 540 80 Q 570 90 575 110 L 570 140 Q 555 160 525 165 L 480 168 Q 445 165 425 150 L 415 125 Q 418 100 430 80 Z',
    labelX: 495,
    labelY: 120,
    animals: [
      { emoji: '🦊', name: 'Volpe', sound: 'yip yip!' },
      { emoji: '🦉', name: 'Gufo', sound: 'uuuh uuuh!' },
      { emoji: '🐺', name: 'Lupo', sound: 'auuuuu!' },
    ],
    food: { emoji: '🍕', name: 'Pizza' },
    fact: "Qui c'è l'Italia, dove vivi tu! 🇮🇹",
    flag: '🏰',
  },
  {
    id: 'africa',
    name: 'Africa',
    color: '#fbbf24',
    colorHover: '#f59e0b',
    path: 'M 460 200 Q 500 190 540 200 L 575 220 Q 590 260 580 310 L 555 360 Q 525 390 490 395 L 460 385 Q 440 360 435 320 L 440 270 Q 450 230 460 200 Z',
    labelX: 510,
    labelY: 300,
    animals: [
      { emoji: '🦁', name: 'Leone', sound: 'roooaarr!' },
      { emoji: '🐘', name: 'Elefante', sound: 'pruuum!' },
      { emoji: '🦒', name: 'Giraffa', sound: '...' },
      { emoji: '🦓', name: 'Zebra', sound: 'hi hi!' },
    ],
    food: { emoji: '🥭', name: 'Mango' },
    fact: "C'è il deserto del Sahara, grande grande! 🏜️",
    flag: '☀️',
  },
  {
    id: 'asia',
    name: 'Asia',
    color: '#f87171',
    colorHover: '#ef4444',
    path: 'M 590 80 Q 650 65 730 70 L 830 80 Q 880 95 895 130 L 890 180 Q 870 220 820 235 L 750 240 Q 680 235 620 220 L 590 195 Q 575 160 580 125 Z',
    labelX: 740,
    labelY: 150,
    animals: [
      { emoji: '🐼', name: 'Panda', sound: 'mwah!' },
      { emoji: '🐯', name: 'Tigre', sound: 'GRRR!' },
      { emoji: '🐵', name: 'Scimmia', sound: 'uh uh ah ah!' },
    ],
    food: { emoji: '🍜', name: 'Noodles' },
    fact: "Qui c'è la montagna più alta del mondo: l'Everest! ⛰️",
    flag: '🏯',
  },
  {
    id: 'oceania',
    name: 'Oceania',
    color: '#4ade80',
    colorHover: '#22c55e',
    path: 'M 820 290 Q 850 285 880 295 L 895 315 Q 895 335 880 345 L 850 350 Q 820 348 810 335 L 805 315 Q 810 298 820 290 Z',
    labelX: 855,
    labelY: 320,
    animals: [
      { emoji: '🦘', name: 'Canguro', sound: 'boing boing!' },
      { emoji: '🐨', name: 'Koala', sound: 'zzz...' },
      { emoji: '🦎', name: 'Lucertola', sound: '...' },
    ],
    food: { emoji: '🥥', name: 'Cocco' },
    fact: 'Qui ci sono spiagge bellissime e la barriera corallina! 🐠',
    flag: '🏄',
  },
  {
    id: 'antartide',
    name: 'Antartide',
    color: '#bae6fd',
    colorHover: '#7dd3fc',
    path: 'M 200 430 Q 350 420 500 425 L 700 425 Q 800 428 880 440 L 880 470 Q 700 478 500 475 L 300 475 Q 200 470 195 455 Z',
    labelX: 540,
    labelY: 455,
    animals: [
      { emoji: '🐧', name: 'Pinguino', sound: 'kwek kwek!' },
      { emoji: '🦭', name: 'Foca', sound: 'arf arf!' },
      { emoji: '🐳', name: 'Balena', sound: 'wooooosh!' },
    ],
    food: { emoji: '🐟', name: 'Pesce' },
    fact: 'È il posto più freddo della Terra! Tutto ghiaccio! ❄️',
    flag: '❄️',
  },
];

export function getContinent(id: ContinentId): Continent {
  const c = CONTINENTS.find((c) => c.id === id);
  if (!c) throw new Error(`Continent ${id} not found`);
  return c;
}
