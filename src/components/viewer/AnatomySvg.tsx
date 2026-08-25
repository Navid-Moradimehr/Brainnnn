"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { VIEW, getSliceGeometry } from "@/lib/phantom/anatomy";

interface Props {
  plane: "axial" | "coronal" | "sagittal";
  sliceIndex: number;
  modality: "ct" | "mr";
  className?: string;
  children?: (geo: ReturnType<typeof getSliceGeometry>) => ReactNode;
}

/** Presentational slice renderer without viewer state — used by cards/compare. */
export function AnatomySvg({ plane, sliceIndex, modality, className, children }: Props) {
  const geo = useMemo(() => getSliceGeometry(plane, sliceIndex), [plane, sliceIndex]);
  const ct = modality === "ct";

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className={className} role="img" aria-label={`${modality.toUpperCase()} ${plane} preview`}>
      <defs>
        <radialGradient id={`an-bg-${ct ? "ct" : "mr"}`} cx="50%" cy="46%" r="65%">
          <stop offset="0%" stopColor={ct ? "#181d24" : "#10151d"} />
          <stop offset="100%" stopColor="#04060a" />
        </radialGradient>
        <filter id={`an-tex-${ct ? "ct" : "mr"}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={11} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.56  0 0 0 0 0.58  0 0 0 0.35 0" result="tint" />
          <feComposite in="tint" in2="SourceGraphic" operator="in" result="tex" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="tex" />
          </feMerge>
        </filter>
        <clipPath id={`an-clip-${ct ? "ct" : "mr"}`}>
          <path d={geo.background.brain} />
        </clipPath>
      </defs>

      <rect width={VIEW} height={VIEW} fill={`url(#an-bg-${ct ? "ct" : "mr"})`} />
      {geo.presence > 0 && (
        <>
          <path d={geo.background.skullOuter} fill={ct ? "#b9bcc0" : "#23262e"} opacity={0.92 * geo.presence} />
          <path d={geo.background.skullInner} fill={ct ? "#151920" : "#191d26"} opacity={0.98 * geo.presence} />
          <g clipPath={`url(#an-clip-${ct ? "ct" : "mr"})`}>
            <path d={geo.background.brain} fill={ct ? "#3a3f47" : "#565d69"} opacity={geo.presence} filter={`url(#an-tex-${ct ? "ct" : "mr"})`} />
            {geo.background.ventricles.map((v, i) => (
              <path key={i} d={v} fill={ct ? "#20242c" : "#14171e"} opacity={0.85 * geo.presence} />
            ))}
            {geo.lesion && <path d={geo.lesion} fill={ct ? "#584f52" : "#6b5f66"} opacity={0.9 * geo.presence} />}
          </g>
        </>
      )}
      {children?.(geo)}
    </svg>
  );
}
