'use client';

import { useState } from 'react';
import type { ContinentId } from '../_data/continents';

export type ContinentPaths = {
  continent: ContinentId;
  paths: string[];
};

// I path SVG vengono pre-calcolati server-side dalla page.tsx (d3-geo
// proietta il topojson Natural Earth una volta sola al build).
// Il client riceve solo le stringhe `d`, niente librerie d3 nel bundle.

const COLORS: Record<ContinentId, { base: string; hover: string }> = {
  americhe_nord: { base: '#fb923c', hover: '#f97316' },
  americhe_sud:  { base: '#facc15', hover: '#eab308' },
  europa:        { base: '#a78bfa', hover: '#8b5cf6' },
  africa:        { base: '#fbbf24', hover: '#f59e0b' },
  asia:          { base: '#f87171', hover: '#ef4444' },
  oceania:       { base: '#4ade80', hover: '#22c55e' },
  antartide:     { base: '#bae6fd', hover: '#7dd3fc' },
};

type Props = {
  mapPaths: ContinentPaths[];
  exploredContinents: ContinentId[];
  onContinentClick: (id: ContinentId) => void;
};

export default function WorldMapReal({ mapPaths, exploredContinents, onContinentClick }: Props) {
  const [hover, setHover] = useState<ContinentId | null>(null);
  const explored = new Set(exploredContinents);

  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-full block"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mappa del mondo. Tocca un continente per esplorarlo."
    >
      <defs>
        <linearGradient id="sea-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1000} height={500} fill="url(#sea-gradient)" />

      {mapPaths.map(({ continent, paths }) => {
        const isHover = hover === continent;
        const isExplored = explored.has(continent);
        const color = isHover ? COLORS[continent].hover : COLORS[continent].base;

        return (
          <g
            key={continent}
            onPointerEnter={() => setHover(continent)}
            onPointerLeave={() => setHover(null)}
            onClick={() => onContinentClick(continent)}
            style={{
              cursor: 'pointer',
              transition: 'filter 200ms ease',
              filter: isHover
                ? 'brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.35))'
                : isExplored
                ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                : 'none',
            }}
          >
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={color}
                stroke="#0f172a"
                strokeWidth={0.4}
                opacity={isHover ? 1 : isExplored ? 0.95 : 0.88}
              />
            ))}
            {isExplored && (
              <CheckMark continent={continent} paths={paths} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Pallino "✓" su un punto rappresentativo del continente esplorato. */
function CheckMark({ continent, paths }: { continent: ContinentId; paths: string[] }) {
  // Posizione approssimativa hardcoded per continente (in viewBox 1000x500
  // dopo proiezione geoEqualEarth con scale 170, translate [500,250]).
  // Calcolata empiricamente per essere sul "centro visivo" del continente.
  const POSITIONS: Record<ContinentId, { x: number; y: number }> = {
    americhe_nord: { x: 230, y: 175 },
    americhe_sud:  { x: 320, y: 340 },
    europa:        { x: 510, y: 165 },
    africa:        { x: 540, y: 290 },
    asia:          { x: 720, y: 180 },
    oceania:       { x: 820, y: 360 },
    antartide:     { x: 500, y: 470 },
  };
  const pos = POSITIONS[continent];
  if (!pos || paths.length === 0) return null;
  return (
    <g pointerEvents="none">
      <circle cx={pos.x} cy={pos.y} r={11} fill="white" opacity={0.95} />
      <text
        x={pos.x}
        y={pos.y + 4}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="#16a34a"
      >
        ✓
      </text>
    </g>
  );
}
