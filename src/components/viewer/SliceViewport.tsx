"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useViewer } from "@/context/ViewerContext";
import { STRUCTURE_COLORS, getStructureColor } from "./structureColors";
import { VIEW, getSliceGeometry } from "@/lib/phantom/anatomy";
import { PLANE_TOTAL_SLICES } from "@/context/ViewerContext";

interface Props {
  modality: "ct" | "mr";
  /** dose overlay variant; omit for plain image view */
  doseVariant?: "candidate" | "reference" | null;
  showContours?: boolean;
  className?: string;
}

const ISO_STYLE: Record<number, { stroke: string; dash?: string }> = {
  60: { stroke: "#ff5c49" },
  57: { stroke: "#ff8a4d", dash: "5 3" },
  54: { stroke: "#e8d24a", dash: "4 3" },
  45: { stroke: "#43d0b0" },
  30: { stroke: "#3aa6d8", dash: "2 4" },
};

export function SliceViewport({
  modality,
  doseVariant = null,
  showContours = true,
  className,
}: Props) {
  const {
    plane,
    sliceIndex,
    visibleIds,
    selectedStructureId,
    washOn,
    washLevel,
    isolinesOn,
    stepSlice,
  } = useViewer();
  const reduce = useReducedMotion();

  const geo = useMemo(
    () => getSliceGeometry(plane, sliceIndex),
    [plane, sliceIndex],
  );

  const total = PLANE_TOTAL_SLICES[plane];
  const ct = modality === "ct";

  return (
    <div
      role="img"
      aria-label={`${modality.toUpperCase()} ${plane} slice ${sliceIndex + 1} of ${total}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); stepSlice(1); }
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); stepSlice(-1); }
      }}
      className={`group relative overflow-hidden rounded-md border border-border bg-[#05070b] outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="h-full w-full">
        <defs>
          <radialGradient id={`vp-bg-${ct ? "ct" : "mr"}`} cx="50%" cy="46%" r="65%">
            <stop offset="0%" stopColor={ct ? "#181d24" : "#10151d"} />
            <stop offset="100%" stopColor="#04060a" />
          </radialGradient>
          <filter id="brain-texture" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={11} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.56  0 0 0 0 0.58  0 0 0 0.35 0" result="tint" />
            <feComposite in="tint" in2="SourceGraphic" operator="in" result="tex" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="tex" />
            </feMerge>
          </filter>
          <clipPath id="brain-clip">
            <path d={geo.background.brain} />
          </clipPath>
        </defs>

        <rect width={VIEW} height={VIEW} fill={`url(#vp-bg-${ct ? "ct" : "mr"})`} />

        {geo.presence > 0 && (
          <>
            {/* scalp/skull outer */}
            <path d={geo.background.skullOuter} fill={ct ? "#b9bcc0" : "#23262e"} opacity={0.92 * geo.presence} />
            {/* diploe */}
            <path d={geo.background.skullInner} fill={ct ? "#151920" : "#191d26"} opacity={0.98 * geo.presence} />
            {/* brain */}
            <g clipPath="url(#brain-clip)">
              <path d={geo.background.brain} fill={ct ? "#3a3f47" : "#565d69"} opacity={geo.presence} filter="url(#brain-texture)" />
              {/* ventricles */}
              {geo.background.ventricles.map((v, i) => (
                <path key={i} d={v} fill={ct ? "#20242c" : "#14171e"} opacity={0.85 * geo.presence} />
              ))}
              {/* lesion shading */}
              {geo.lesion && (
                <path d={geo.lesion} fill={ct ? "#584f52" : "#6b5f66"} opacity={0.9 * geo.presence} />
              )}
            </g>
          </>
        )}

        {/* ── dose wash ── */}
        {doseVariant && geo.isolines.length > 0 && washOn && (
          <g opacity={washLevel * (doseVariant === "reference" ? 0.75 : 1)}>
            {[...geo.isolines].reverse().map(({ levelGy, path }) => (
              <path key={levelGy} d={path} fill={ISO_STYLE[levelGy]?.stroke ?? "#fff"} opacity={levelGy >= 54 ? 0.34 : levelGy >= 45 ? 0.22 : 0.12} />
            ))}
          </g>
        )}

        {/* ── isodose lines ── */}
        {doseVariant && geo.isolines.length > 0 && isolinesOn && (
          <g>
            {geo.isolines.map(({ levelGy, path }) => (
              <path
                key={levelGy}
                d={path}
                fill="none"
                stroke={doseVariant === "reference" && levelGy !== 57 ? "#7c8aa5" : ISO_STYLE[levelGy]?.stroke}
                strokeWidth={levelGy === 60 ? 1.4 : 0.9}
                strokeDasharray={ISO_STYLE[levelGy]?.dash}
                opacity={doseVariant === "reference" && levelGy !== 57 ? 0.5 : 0.95}
              />
            ))}
          </g>
        )}

        {/* ── contours ── */}
        {showContours &&
          geo.contours.map(({ structureId, path }) => {
            const visible = visibleIds.has(structureId);
            if (!visible) return null;
            const color = getStructureColor(structureId);
            const selected = selectedStructureId === structureId;
            return (
              <motion.path
                key={structureId}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={selected ? 2 : 1.1}
                strokeLinejoin="round"
                initial={false}
                animate={{ opacity: selected ? 1 : 0.82 }}
                style={selected ? { filter: "drop-shadow(0 0 3px rgba(255,255,255,0.35))" } : undefined}
              />
            );
          })}

        {/* ── reticle ── */}
        <g stroke="#8b94a7" strokeWidth="0.4" opacity="0.4">
          <line x1={VIEW / 2} y1={8} x2={VIEW / 2} y2={20} />
          <line x1={VIEW / 2} y1={VIEW - 20} x2={VIEW / 2} y2={VIEW - 8} />
          <line x1={8} y1={VIEW / 2} x2={20} y2={VIEW / 2} />
          <line x1={VIEW - 20} y1={VIEW / 2} x2={VIEW - 8} y2={VIEW / 2} />
          <circle cx={VIEW / 2} cy={VIEW / 2} r="1.1" fill="#8b94a7" stroke="none" />
        </g>
      </svg>

      {/* scan-line sweep on slice change */}
      {!reduce && (
        <motion.div
          key={`${plane}-${sliceIndex}`}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px bg-primary/70 shadow-[0_0_12px_2px_rgba(31,196,174,0.45)]"
          initial={{ top: "4%", opacity: 0.9 }}
          animate={{ top: "96%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      {/* HUD overlays */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 font-mono text-[10px] tracking-wider text-foreground/70">
        <div className="flex items-start justify-between">
          <span>{modality.toUpperCase()} · {plane.slice(0, 3).toUpperCase()}</span>
          <span>FOV 260mm</span>
        </div>
        <div className="flex items-end justify-between">
          <span>
            S {String(sliceIndex + 1).padStart(3, "0")}/{total}
          </span>
          <span className="flex gap-1.5">
            {plane === "axial" ? <><i>I</i><b className="not-italic text-foreground">S</b></> : <><b className="not-italic text-foreground">A</b><i>P</i></>}
          </span>
        </div>
      </div>
    </div>
  );
}

export { STRUCTURE_COLORS };
