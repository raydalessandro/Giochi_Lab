// Figure scopribili — ognuna con una "carta scoperta" che mostra la forma
// in natura (cross-reference con il Laboratorio).

export interface ShapeInfo {
  id: string;
  emoji: string;
  childName: string;
  realName: string;
  fact: string;
  natureExamples: { emoji: string; label: string }[];
  // Eventuale collegamento diretto a molecola del Laboratorio
  moleculeRef?: { emoji: string; name: string };
}

export const SHAPES: ShapeInfo[] = [
  {
    id: 'triangle_equilateral',
    emoji: '🔺',
    childName: 'Triangolo perfetto',
    realName: 'Triangolo equilatero',
    fact: 'Tutti e tre i lati sono uguali. È la forma più solida che esista!',
    natureExamples: [
      { emoji: '⛰️', label: 'Montagne' },
      { emoji: '🍕', label: 'Spicchio di pizza' },
      { emoji: '🎵', label: 'Triangolo musicale' },
    ],
  },
  {
    id: 'triangle_right',
    emoji: '📐',
    childName: 'Triangolo a squadra',
    realName: 'Triangolo rettangolo',
    fact: 'Ha un angolo "dritto" come un libro aperto. Pitagora lo amava!',
    natureExamples: [
      { emoji: '📏', label: 'Squadra di scuola' },
      { emoji: '⛵', label: 'Vela di barca' },
      { emoji: '🪜', label: 'Scala appoggiata' },
    ],
  },
  {
    id: 'triangle_isosceles',
    emoji: '🔼',
    childName: 'Triangolo con due gemelli',
    realName: 'Triangolo isoscele',
    fact: 'Due lati sono uguali, uno è diverso. Come un tetto di casetta!',
    natureExamples: [
      { emoji: '🏠', label: 'Tetto' },
      { emoji: '🎄', label: 'Albero di Natale' },
    ],
  },
  {
    id: 'triangle_scalene',
    emoji: '◣',
    childName: 'Triangolo storto',
    realName: 'Triangolo scaleno',
    fact: 'Tutti i lati diversi. Ognuno fa quello che vuole!',
    natureExamples: [
      { emoji: '🗻', label: 'Sasso' },
    ],
  },
  {
    id: 'quadrilateral_rhombus',
    emoji: '🔷',
    childName: 'Diamante',
    realName: 'Rombo',
    fact: 'Quattro lati uguali. È come un quadrato che si è coricato!',
    natureExamples: [
      { emoji: '💎', label: 'Diamante' },
      { emoji: '🪁', label: 'Aquilone' },
    ],
  },
  {
    id: 'quadrilateral_rectangle',
    emoji: '🟦',
    childName: 'Rettangolo',
    realName: 'Rettangolo',
    fact: "I lati opposti sono uguali. È la forma dei libri, dei tablet, delle porte!",
    natureExamples: [
      { emoji: '📚', label: 'Libro' },
      { emoji: '🚪', label: 'Porta' },
      { emoji: '📱', label: 'Telefono' },
    ],
  },
  {
    id: 'quadrilateral_generic',
    emoji: '🔶',
    childName: 'Quadrilatero',
    realName: 'Quadrilatero',
    fact: 'Quattro lati, ognuno fa quello che vuole. Una forma libera!',
    natureExamples: [
      { emoji: '🧩', label: 'Pezzo di puzzle' },
    ],
  },
  {
    id: 'pentagon',
    emoji: '⬟',
    childName: 'Pentagono',
    realName: 'Pentagono',
    fact: 'Cinque lati! Come una stella senza le punte. Strano: non riesce a piastrellare il pavimento!',
    natureExamples: [
      { emoji: '⚽', label: 'Pallone' },
      { emoji: '🌸', label: 'Fiore di pesco' },
    ],
  },
  {
    id: 'hexagon',
    emoji: '⬢',
    childName: 'Esagono',
    realName: 'Esagono',
    fact: "Sei lati. Le api lo amano! Costruiscono il nido tutto a esagoni perché non sprecano spazio.",
    natureExamples: [
      { emoji: '🐝', label: 'Favo delle api' },
      { emoji: '❄️', label: 'Fiocchi di neve' },
    ],
    moleculeRef: { emoji: '💎', name: 'Cristalli di carbonio (grafite)' },
  },
];

export function getShape(id: string): ShapeInfo | null {
  return SHAPES.find((s) => s.id === id) ?? null;
}
