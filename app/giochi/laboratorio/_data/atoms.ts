// Atomi e molecole — fascia 5-7
//
// Filosofia: il bambino non deve memorizzare formule.
// Deve scoprire le REGOLE di combinazione (manine/valenza).
// Le molecole sono ricompensa visiva, non obiettivo da indovinare.

export type AtomId = 'H' | 'O' | 'C' | 'N' | 'Na' | 'Cl';

export interface Atom {
  id: AtomId;
  symbol: string;       // simbolo "vero" (H, O, C...)
  name: string;         // nome per il bambino
  color: string;        // colore principale (convenzione CPK semplificata)
  textColor: string;    // colore testo sopra
  hands: number;        // numero di legami possibili (valenza semplificata)
  rarity: 'common' | 'special'; // per layout barra
}

export const ATOMS: Atom[] = [
  {
    id: 'H',
    symbol: 'H',
    name: 'Idrogeno',
    color: '#f8fafc',
    textColor: '#1e293b',
    hands: 1,
    rarity: 'common',
  },
  {
    id: 'O',
    symbol: 'O',
    name: 'Ossigeno',
    color: '#ef4444',
    textColor: '#fff',
    hands: 2,
    rarity: 'common',
  },
  {
    id: 'C',
    symbol: 'C',
    name: 'Carbonio',
    color: '#1f2937',
    textColor: '#fff',
    hands: 4,
    rarity: 'common',
  },
  {
    id: 'N',
    symbol: 'N',
    name: 'Azoto',
    color: '#3b82f6',
    textColor: '#fff',
    hands: 3,
    rarity: 'common',
  },
  {
    id: 'Na',
    symbol: 'Na',
    name: 'Sodio',
    color: '#a855f7',
    textColor: '#fff',
    hands: 1,
    rarity: 'special',
  },
  {
    id: 'Cl',
    symbol: 'Cl',
    name: 'Cloro',
    color: '#84cc16',
    textColor: '#fff',
    hands: 1,
    rarity: 'special',
  },
];

export function getAtom(id: AtomId): Atom {
  const a = ATOMS.find((x) => x.id === id);
  if (!a) throw new Error(`Atom ${id} not found`);
  return a;
}

// === MOLECOLE ===
// Una molecola è definita da:
// - un "fingerprint" (conteggio degli atomi, ordinato canonicamente)
// - cosa succede quando viene scoperta (emoji, animazione, nome bambino)
// - forma geometrica associata (cross-reference con il gioco di geometria!)

export type GeometricShape =
  | 'lineare'
  | 'angolata'      // V-shape, tipo acqua
  | 'piramidale'    // tetraedrica
  | 'triangolare'   // planare
  | 'cubica';       // cristallo

export interface Molecule {
  id: string;
  composition: Partial<Record<AtomId, number>>; // {H: 2, O: 1}
  emoji: string;
  childName: string;       // nome semplice per il bambino
  realName: string;        // nome vero, mostrato a chi sa leggere
  description: string;     // cosa fa nel mondo
  shape: GeometricShape;
  shapeNote: string;       // collegamento con la geometria
  behavior: 'falls' | 'rises' | 'sparkles' | 'crystallizes' | 'burns' | 'fizzes';
}

export const MOLECULES: Molecule[] = [
  {
    id: 'water',
    composition: { H: 2, O: 1 },
    emoji: '💧',
    childName: 'Acqua',
    realName: 'H₂O',
    description: 'Bagna! Cade come pioggia.',
    shape: 'angolata',
    shapeNote: 'Forma a V, come una bocca aperta',
    behavior: 'falls',
  },
  {
    id: 'co2',
    composition: { C: 1, O: 2 },
    emoji: '💨',
    childName: 'Aria che esci',
    realName: 'CO₂',
    description: "Quando soffi, esce questa! Le piante la mangiano.",
    shape: 'lineare',
    shapeNote: 'Diritta come un bastoncino',
    behavior: 'rises',
  },
  {
    id: 'o2',
    composition: { O: 2 },
    emoji: '🌬️',
    childName: 'Aria che respiri',
    realName: 'O₂',
    description: 'È quello che ti tiene vivo!',
    shape: 'lineare',
    shapeNote: 'Due ossigeni che si tengono per mano',
    behavior: 'sparkles',
  },
  {
    id: 'h2',
    composition: { H: 2 },
    emoji: '🎈',
    childName: 'Palloncino',
    realName: 'H₂',
    description: 'Vola via leggero leggero!',
    shape: 'lineare',
    shapeNote: 'Il più piccolo possibile',
    behavior: 'rises',
  },
  {
    id: 'methane',
    composition: { C: 1, H: 4 },
    emoji: '🔥',
    childName: 'Fiamma',
    realName: 'CH₄ (metano)',
    description: 'Brucia! È quello che fa accendere i fornelli.',
    shape: 'piramidale',
    shapeNote: 'Forma di piramide, come una tenda',
    behavior: 'burns',
  },
  {
    id: 'ammonia',
    composition: { N: 1, H: 3 },
    emoji: '🧴',
    childName: 'Puzzino',
    realName: 'NH₃ (ammoniaca)',
    description: "Profuma come i detersivi. Pizzica il naso!",
    shape: 'piramidale',
    shapeNote: 'Piramide con tre lati, tipo trottola',
    behavior: 'fizzes',
  },
  {
    id: 'salt',
    composition: { Na: 1, Cl: 1 },
    emoji: '🧂',
    childName: 'Sale',
    realName: 'NaCl',
    description: 'Il sale che metti nella pasta!',
    shape: 'cubica',
    shapeNote: 'Si dispone a cubetti, come i mattoncini Lego',
    behavior: 'crystallizes',
  },
  {
    id: 'hydrogen_peroxide',
    composition: { H: 2, O: 2 },
    emoji: '🫧',
    childName: 'Acqua frizzante',
    realName: 'H₂O₂',
    description: "L'acqua ossigenata, fa le bollicine!",
    shape: 'angolata',
    shapeNote: 'Come due V incollate',
    behavior: 'fizzes',
  },
];

/**
 * Trova la molecola corrispondente a una composizione (se esiste).
 * La verifica è esatta: stessi atomi, stesse quantità.
 */
export function findMolecule(composition: Partial<Record<AtomId, number>>): Molecule | null {
  for (const mol of MOLECULES) {
    if (compositionsMatch(mol.composition, composition)) return mol;
  }
  return null;
}

function compositionsMatch(
  a: Partial<Record<AtomId, number>>,
  b: Partial<Record<AtomId, number>>
): boolean {
  const keysA = Object.keys(a) as AtomId[];
  const keysB = Object.keys(b) as AtomId[];
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}
