// Dati continenti: contenuti didattici per la scena di ogni continente.
// I path SVG handcraft del vecchio WorldMap restano per il labelX/labelY
// (li usiamo per posizionare le label sopra la mappa real-world).

export type ContinentId =
  | 'europa'
  | 'africa'
  | 'asia'
  | 'americhe_nord'
  | 'americhe_sud'
  | 'oceania'
  | 'antartide';

export interface Habitat {
  id: string;
  emoji: string;
  name: string;
}

export interface Animal {
  emoji: string;
  name: string;
  sound: string;       // descrizione testuale del verso
  habitatId: string;   // id di un Habitat tra quelli del continente
}

export interface Continent {
  id: ContinentId;
  name: string;
  color: string;        // colore base
  colorHover: string;
  animals: Animal[];
  habitats: Habitat[];  // 3 dropzones per il drag&drop animali→habitat
  food: { emoji: string; name: string };
  fact: string;
  flag: string;
}

export const CONTINENTS: Continent[] = [
  {
    id: 'americhe_nord',
    name: 'Nord America',
    color: '#fb923c',
    colorHover: '#f97316',
    habitats: [
      { id: 'foresta',  emoji: '🌲', name: 'Foresta' },
      { id: 'montagna', emoji: '🏔️', name: 'Montagna' },
      { id: 'prateria', emoji: '🌾', name: 'Prateria' },
    ],
    animals: [
      { emoji: '🦅', name: 'Aquila',      sound: 'krii krii!', habitatId: 'montagna' },
      { emoji: '🐻', name: 'Orso bruno',  sound: 'grrr!',      habitatId: 'foresta' },
      { emoji: '🦬', name: 'Bisonte',     sound: 'muuuf!',     habitatId: 'prateria' },
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
    habitats: [
      { id: 'foresta',  emoji: '🌳', name: 'Foresta' },
      { id: 'fiume',    emoji: '🐊', name: 'Fiume' },
      { id: 'montagna', emoji: '⛰️', name: 'Montagna' },
    ],
    animals: [
      { emoji: '🦜', name: 'Pappagallo', sound: 'squa squa!', habitatId: 'foresta' },
      { emoji: '🐆', name: 'Giaguaro',   sound: 'rrroar!',    habitatId: 'foresta' },
      { emoji: '🦥', name: 'Bradipo',    sound: 'zzz...',     habitatId: 'foresta' },
      { emoji: '🦙', name: 'Lama',       sound: 'beee!',      habitatId: 'montagna' },
      { emoji: '🐊', name: 'Caimano',    sound: 'snap!',      habitatId: 'fiume' },
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
    habitats: [
      { id: 'bosco',    emoji: '🌲', name: 'Bosco' },
      { id: 'montagna', emoji: '🏔️', name: 'Montagna' },
      { id: 'citta',    emoji: '🏙️', name: 'Città' },
    ],
    animals: [
      { emoji: '🦊', name: 'Volpe',      sound: 'yip yip!',     habitatId: 'bosco' },
      { emoji: '🦉', name: 'Gufo',       sound: 'uuuh uuuh!',   habitatId: 'bosco' },
      { emoji: '🐺', name: 'Lupo',       sound: 'auuuuu!',      habitatId: 'bosco' },
      { emoji: '🦌', name: 'Cervo',      sound: 'broaar!',      habitatId: 'montagna' },
      { emoji: '🐦', name: 'Piccione',   sound: 'gru gru!',     habitatId: 'citta' },
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
    habitats: [
      { id: 'savana',  emoji: '🌾', name: 'Savana' },
      { id: 'fiume',   emoji: '🐊', name: 'Fiume' },
      { id: 'foresta', emoji: '🌳', name: 'Foresta' },
    ],
    animals: [
      { emoji: '🦁', name: 'Leone',      sound: 'roooaarr!', habitatId: 'savana' },
      { emoji: '🐘', name: 'Elefante',   sound: 'pruuum!',   habitatId: 'savana' },
      { emoji: '🦒', name: 'Giraffa',    sound: '...',       habitatId: 'savana' },
      { emoji: '🦓', name: 'Zebra',      sound: 'hi hi!',    habitatId: 'savana' },
      { emoji: '🦛', name: 'Ippopotamo', sound: 'snorf!',    habitatId: 'fiume' },
      { emoji: '🦍', name: 'Gorilla',    sound: 'uhuh!',     habitatId: 'foresta' },
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
    habitats: [
      { id: 'bambu',    emoji: '🎋', name: 'Bambù' },
      { id: 'montagna', emoji: '🏔️', name: 'Montagna' },
      { id: 'tempio',   emoji: '🏯', name: 'Tempio' },
    ],
    animals: [
      { emoji: '🐼', name: 'Panda',    sound: 'mwah!',         habitatId: 'bambu' },
      { emoji: '🐯', name: 'Tigre',    sound: 'GRRR!',         habitatId: 'bambu' },
      { emoji: '🐵', name: 'Scimmia',  sound: 'uh uh ah ah!',  habitatId: 'tempio' },
      { emoji: '🐪', name: 'Cammello', sound: 'bruff!',        habitatId: 'montagna' },
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
    habitats: [
      { id: 'outback',   emoji: '🪨', name: 'Outback' },
      { id: 'eucalipto', emoji: '🌳', name: 'Eucalipto' },
      { id: 'spiaggia',  emoji: '🏝️', name: 'Spiaggia' },
    ],
    animals: [
      { emoji: '🦘', name: 'Canguro',         sound: 'boing boing!', habitatId: 'outback' },
      { emoji: '🐨', name: 'Koala',           sound: 'zzz...',       habitatId: 'eucalipto' },
      { emoji: '🦎', name: 'Lucertola',       sound: '...',          habitatId: 'outback' },
      { emoji: '🐠', name: 'Pesce tropicale', sound: 'blub blub!',   habitatId: 'spiaggia' },
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
    habitats: [
      { id: 'ghiaccio', emoji: '🧊', name: 'Ghiaccio' },
      { id: 'mare',     emoji: '🌊', name: 'Mare' },
      { id: 'iceberg',  emoji: '🗻', name: 'Iceberg' },
    ],
    animals: [
      { emoji: '🐧', name: 'Pinguino', sound: 'kwek kwek!', habitatId: 'ghiaccio' },
      { emoji: '🦭', name: 'Foca',     sound: 'arf arf!',   habitatId: 'iceberg' },
      { emoji: '🐳', name: 'Balena',   sound: 'wooooosh!',  habitatId: 'mare' },
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

export function isContinentId(s: string): s is ContinentId {
  return CONTINENTS.some((c) => c.id === s);
}
