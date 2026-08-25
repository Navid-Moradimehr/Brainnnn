"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Quiet geometric illustration of a VMAT dual-arc delivery concept.
 * SVG + CSS animation, honours prefers-reduced-motion.
 */
export function BeamArc() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 220 120" className="mt-3 w-full" role="img" aria-label="Dual arc gantry schematic">
      {/* body / target */}
      <ellipse cx="110" cy="78" rx="34" ry="26" fill="none" stroke="#2a3444" strokeWidth="1" />
      <circle cx="110" cy="74" r="7" fill="rgba(31,196,174,0.18)" stroke="#1fc4ae" strokeWidth="1" />

      {/* arc sweeps */}
      {[0, 1].map((i) => (
        <g key={i} transform={reduce ? undefined : `translate(0 ${i * -0})`}>
          <path
            d={`M ${38 + i * 6} 88 A ${72 + i * 6} ${64 + i * 5} 0 0 1 ${182 - i * 6} 88`}
            fill="none"
            stroke={i === 0 ? "#1fc4ae" : "#56c2e8"}
            strokeWidth="1.1"
            strokeDasharray="3 4"
            opacity="0.75"
            style={
              reduce
                ? undefined
                : { animation: `dash${i === 0 ? "" : "2"} 7s linear infinite` }
            }
          />
        </g>
      ))}

      {/* gantry heads */}
      <g>
        <rect x="96" y="14" width="28" height="12" rx="2" fill="#171e29" stroke="#2a3444" />
        <line x1="110" y1="26" x2="110" y2="67" stroke="#2a3444" strokeDasharray="2 3" />
        <style>{`
          @keyframes dash { to { stroke-dashoffset: -70; } }
          @keyframes dash2 { to { stroke-dashoffset: 70; } }
        `}</style>
      </g>

      {/* iso marker */}
      <line x1="103" y1="74" x2="117" y2="74" stroke="#e9edf3" strokeWidth="0.6" opacity="0.7" />
      <line x1="110" y1="67" x2="110" y2="81" stroke="#e9edf3" strokeWidth="0.6" opacity="0.7" />
    </svg>
  );
}
