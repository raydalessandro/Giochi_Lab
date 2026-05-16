'use client';

import { motion } from 'framer-motion';
import { CONTINENTS, type ContinentId } from '../_data/continents';

interface WorldMapProps {
  highlightedId: ContinentId | null;
  targetId: ContinentId | null;     // continente che lampeggia durante missione
  hoverTargetId: ContinentId | null; // continente sotto il dito durante drag
  onContinentClick: (id: ContinentId) => void;
  /** Setta ref dell'SVG per calcolare hit-test in coordinate SVG */
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export default function WorldMap({
  highlightedId,
  targetId,
  hoverTargetId,
  onContinentClick,
  svgRef,
}: WorldMapProps) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 500"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Oceano di sfondo con onde decorative */}
      <defs>
        <pattern
          id="waves"
          x="0"
          y="0"
          width="40"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 10 Q 10 0 20 10 T 40 10"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            fill="none"
          />
        </pattern>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="1000" height="500" fill="url(#waves)" />

      {CONTINENTS.map((c) => {
        const isHighlighted = highlightedId === c.id;
        const isTarget = targetId === c.id;
        const isHover = hoverTargetId === c.id;

        return (
          <motion.g
            key={c.id}
            initial={false}
            animate={
              isTarget
                ? {
                    scale: [1, 1.04, 1],
                  }
                : {
                    scale: isHighlighted || isHover ? 1.05 : 1,
                  }
            }
            transition={
              isTarget
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : { type: 'spring', stiffness: 300, damping: 20 }
            }
            style={{ transformOrigin: `${c.labelX}px ${c.labelY}px` }}
          >
            <motion.path
              d={c.path}
              fill={isHover ? c.colorHover : c.color}
              stroke="#fff"
              strokeWidth={isHighlighted || isHover ? 4 : 2.5}
              strokeLinejoin="round"
              filter={isTarget || isHover ? 'url(#glow)' : undefined}
              onClick={() => onContinentClick(c.id)}
              style={{ cursor: 'pointer' }}
              data-continent-id={c.id}
            />
            {/* Bandierina simbolica */}
            <text
              x={c.labelX}
              y={c.labelY - 6}
              textAnchor="middle"
              fontSize="32"
              pointerEvents="none"
            >
              {c.flag}
            </text>
            {/* Nome continente */}
            <text
              x={c.labelX}
              y={c.labelY + 22}
              textAnchor="middle"
              fontSize="18"
              fontWeight="800"
              fill="#1e3a8a"
              stroke="#fff"
              strokeWidth="3"
              paintOrder="stroke"
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {c.name}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
