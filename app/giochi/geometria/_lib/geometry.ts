// Logica specifica per la geometria: segmenti come grafo, rilevamento di
// poligoni chiusi (cicli), classificazione di figure note.
//
// Architettura:
// - Un SEGMENT ha due estremità (endpoints) A e B con coordinate.
// - Quando un endpoint si avvicina a un endpoint di un altro segmento sotto
//   SNAP_DISTANCE → si fondono in un VERTICE condiviso (rappresentato come
//   medesime coordinate).
// - Quando i segmenti formano un ciclo chiuso (ogni vertice ha grado ≥ 2)
//   → emerge un POLIGONO.

export type SegmentLength = 'short' | 'medium' | 'long';

export const SEGMENT_PIXELS: Record<SegmentLength, number> = {
  short: 60,   // "3"
  medium: 80,  // "4"
  long: 100,   // "5"
};

export const SEGMENT_NUMERIC: Record<SegmentLength, number> = {
  short: 3,
  medium: 4,
  long: 5,
};

export const SEGMENT_COLORS: Record<SegmentLength, string> = {
  short: '#22c55e',   // verde
  medium: '#3b82f6',  // blu
  long: '#a855f7',    // viola
};

export interface Endpoint {
  x: number;
  y: number;
}

export interface Segment {
  instanceId: string;
  length: SegmentLength;
  a: Endpoint;
  b: Endpoint;
  /** instanceId dei segmenti con cui condivide il vertice A */
  bondsA: string[];
  /** instanceId dei segmenti con cui condivide il vertice B */
  bondsB: string[];
}

export const SNAP_DISTANCE = 28;

let _seg = 0;
export function newSegmentId(): string {
  _seg += 1;
  return `seg${Date.now().toString(36)}${_seg}`;
}

/**
 * Crea un nuovo segmento orizzontale alle coordinate (cx, cy).
 */
export function createSegment(length: SegmentLength, cx: number, cy: number): Segment {
  const len = SEGMENT_PIXELS[length];
  return {
    instanceId: newSegmentId(),
    length,
    a: { x: cx - len / 2, y: cy },
    b: { x: cx + len / 2, y: cy },
    bondsA: [],
    bondsB: [],
  };
}

/**
 * Cerca un endpoint vicino a (x,y) tra i segmenti esistenti, escluso il segmento corrente.
 * Ritorna il segmento+endpoint trovato, o null.
 */
export function findNearbyEndpoint(
  segments: Segment[],
  excludeId: string,
  x: number,
  y: number
): { segmentId: string; which: 'a' | 'b' } | null {
  let best: { segmentId: string; which: 'a' | 'b'; dist: number } | null = null;
  for (const s of segments) {
    if (s.instanceId === excludeId) continue;
    const dA = Math.hypot(s.a.x - x, s.a.y - y);
    const dB = Math.hypot(s.b.x - x, s.b.y - y);
    if (dA < SNAP_DISTANCE && (!best || dA < best.dist)) {
      best = { segmentId: s.instanceId, which: 'a', dist: dA };
    }
    if (dB < SNAP_DISTANCE && (!best || dB < best.dist)) {
      best = { segmentId: s.instanceId, which: 'b', dist: dB };
    }
  }
  return best ? { segmentId: best.segmentId, which: best.which } : null;
}

/**
 * Rileva poligoni chiusi nel grafo di segmenti.
 * Strategia: costruisci un grafo dove i nodi sono "cluster di endpoint vicini"
 * (vertici) e gli archi sono i segmenti. Trova i cicli.
 *
 * Per semplicità e per la fascia 5-7, supporta fino a 6 segmenti chiusi in ciclo singolo.
 */
export interface PolygonDetection {
  segmentIds: string[];      // segmenti che compongono il poligono, in ordine
  vertices: Endpoint[];       // vertici in ordine
  sideLengths: SegmentLength[]; // lunghezze in ordine
}

export function detectClosedPolygon(segments: Segment[]): PolygonDetection | null {
  if (segments.length < 3) return null;

  // Costruisci grafo: ogni segmento è un edge che connette i suoi due endpoints
  // (rappresentati da vertex-id stabile basato su clustering posizionale).
  const vertexMap = new Map<string, number>(); // chiave posizionale → id vertice
  const segEdges: Array<{ id: string; v1: number; v2: number; length: SegmentLength }> = [];

  function getVertexId(p: Endpoint): number {
    // Cluster per coordinate arrotondate (SNAP_DISTANCE/2 di granularità)
    const cellSize = SNAP_DISTANCE;
    const cx = Math.round(p.x / cellSize);
    const cy = Math.round(p.y / cellSize);
    // Verifica nelle celle adiacenti per robustezza
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        if (vertexMap.has(key)) return vertexMap.get(key)!;
      }
    }
    const newId = vertexMap.size;
    vertexMap.set(`${cx},${cy}`, newId);
    return newId;
  }

  // Prima passata: assegna vertex-id a tutti gli endpoint
  for (const s of segments) {
    const v1 = getVertexId(s.a);
    const v2 = getVertexId(s.b);
    if (v1 === v2) continue; // segmento degenere
    segEdges.push({ id: s.instanceId, v1, v2, length: s.length });
  }

  // Costruisci adiacenza
  const adj = new Map<number, Array<{ to: number; edgeId: string; length: SegmentLength }>>();
  for (const e of segEdges) {
    if (!adj.has(e.v1)) adj.set(e.v1, []);
    if (!adj.has(e.v2)) adj.set(e.v2, []);
    adj.get(e.v1)!.push({ to: e.v2, edgeId: e.id, length: e.length });
    adj.get(e.v2)!.push({ to: e.v1, edgeId: e.id, length: e.length });
  }

  // Per essere un poligono chiuso: ogni vertice deve avere grado esattamente 2,
  // e tutti i segmenti devono essere in un unico ciclo connesso.
  if (segEdges.length < 3) return null;
  for (const [_, neighbors] of adj) {
    if (neighbors.length !== 2) return null;
  }
  if (adj.size !== segEdges.length) return null; // |V| = |E| per ciclo singolo

  // Traversa il ciclo partendo dal primo vertice
  const startV = adj.keys().next().value;
  if (startV === undefined) return null;
  const visitedEdges = new Set<string>();
  const orderedSegIds: string[] = [];
  const orderedLengths: SegmentLength[] = [];
  const orderedVertices: number[] = [startV];

  let current = startV;
  while (true) {
    const neighbors = adj.get(current)!;
    const next = neighbors.find((n) => !visitedEdges.has(n.edgeId));
    if (!next) break;
    visitedEdges.add(next.edgeId);
    orderedSegIds.push(next.edgeId);
    orderedLengths.push(next.length);
    if (next.to === startV) break;
    orderedVertices.push(next.to);
    current = next.to;
  }

  if (visitedEdges.size !== segEdges.length) return null; // grafo non connesso

  // Ricostruisci coordinate dei vertici nell'ordine del ciclo
  const vertexToCoord = new Map<number, Endpoint>();
  for (const s of segments) {
    const v1 = getVertexId(s.a);
    const v2 = getVertexId(s.b);
    if (!vertexToCoord.has(v1)) vertexToCoord.set(v1, s.a);
    if (!vertexToCoord.has(v2)) vertexToCoord.set(v2, s.b);
  }
  const vertices: Endpoint[] = orderedVertices
    .map((v) => vertexToCoord.get(v))
    .filter((p): p is Endpoint => !!p);

  return {
    segmentIds: orderedSegIds,
    vertices,
    sideLengths: orderedLengths,
  };
}

/**
 * Classifica un poligono rilevato in una "figura nota" se possibile.
 */
export function classifyPolygon(detection: PolygonDetection): string | null {
  const n = detection.sideLengths.length;
  const counts: Record<SegmentLength, number> = { short: 0, medium: 0, long: 0 };
  for (const l of detection.sideLengths) counts[l]++;

  // Triangoli
  if (n === 3) {
    // Equilatero: tutti uguali
    if (counts.short === 3 || counts.medium === 3 || counts.long === 3) {
      return 'triangle_equilateral';
    }
    // Triangolo rettangolo 3-4-5 (Pitagora!)
    if (counts.short === 1 && counts.medium === 1 && counts.long === 1) {
      return 'triangle_right'; // approssimazione: i lati 3/4/5 forniscono un triangolo, è "Pitagora" se sono visivamente perpendicolari
    }
    // Isoscele
    if (counts.short === 2 || counts.medium === 2 || counts.long === 2) {
      return 'triangle_isosceles';
    }
    return 'triangle_scalene';
  }

  // Quadrilateri
  if (n === 4) {
    if (counts.short === 4 || counts.medium === 4 || counts.long === 4) {
      return 'quadrilateral_rhombus'; // 4 lati uguali — rombo (o quadrato, dipende dagli angoli)
    }
    if (counts.short === 2 && counts.long === 2) return 'quadrilateral_rectangle';
    if (counts.short === 2 && counts.medium === 2) return 'quadrilateral_rectangle';
    if (counts.medium === 2 && counts.long === 2) return 'quadrilateral_rectangle';
    return 'quadrilateral_generic';
  }

  // Pentagoni / Esagoni
  if (n === 5) return 'pentagon';
  if (n === 6) return 'hexagon';

  return null;
}

/**
 * Calcola il centroide di un poligono (media dei vertici).
 */
export function polygonCentroid(vertices: Endpoint[]): Endpoint {
  const sum = vertices.reduce(
    (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / vertices.length, y: sum.y / vertices.length };
}
