import type { Plane } from "@/context/ViewerContext";
import { blob, expandedBlob, ellipsePts, smoothClosedPath } from "./geometry";

/**
 * Procedural head phantom — synthetic, clearly abstract anatomy that
 * contours and dose overlays stay registered to across planes/slices.
 */

export const VIEW = 200; // square viewBox units (~260 mm FOV)

export interface SliceGeometry {
  /** soft-edge factor 0..1 — how "inside the head" this slice is */
  presence: number;
  background: {
    skullOuter: string;
    skullInner: string;
    brain: string;
    ventricles: string[];
  };
  lesion?: string;
  lesionCentroid?: { x: number; y: number };
  contours: Array<{ structureId: string; path: string }>;
  isolines: Array<{ levelGy: number; path: string }>;
}

interface PlaneCfg {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  lesion: { x: number; y: number; r: number };
  lesionWindow: [number, number]; // t-range where target exists
  brainstem: { x: number; y: number; rx: number; ry: number };
  chiasm: { x: number; y: number };
  eyeGapX: number;
  eyeY: number;
}

const CFG: Record<Plane, PlaneCfg> = {
  axial: {
    cx: 100, cy: 104, rx: 64, ry: 74,
    lesion: { x: 121, y: 76, r: 15 },
    lesionWindow: [0.3, 0.62],
    brainstem: { x: 100, y: 148, rx: 13, ry: 17 },
    chiasm: { x: 88, y: 138 },
    eyeGapX: 30,
    eyeY: 152,
  },
  coronal: {
    cx: 100, cy: 96, rx: 70, ry: 66,
    lesion: { x: 126, y: 84, r: 14 },
    lesionWindow: [0.34, 0.66],
    brainstem: { x: 100, y: 132, rx: 12, ry: 20 },
    chiasm: { x: 100, y: 146 },
    eyeGapX: 26,
    eyeY: 150,
  },
  sagittal: {
    cx: 100, cy: 98, rx: 72, ry: 68,
    lesion: { x: 118, y: 70, r: 13 },
    lesionWindow: [0.36, 0.6],
    brainstem: { x: 96, y: 134, rx: 11, ry: 19 },
    chiasm: { x: 116, y: 142 },
    eyeGapX: 0, // eyes not shown in sagittal midline slices
    eyeY: 150,
  },
};

/** soft 0..1 window with smooth edges */
function inWindow(t: number, [a, b]: [number, number]): number {
  if (t <= a || t >= b) return 0;
  const edge = Math.min(b - a, 0.16);
  return Math.min(1, Math.min((t - a) / edge, (b - t) / edge));
}

export function getSliceGeometry(plane: Plane, sliceIndex: number): SliceGeometry {
  const total = plane === "axial" ? 96 : plane === "coronal" ? 88 : 84;
  const t = sliceIndex / (total - 1);
  const c = CFG[plane];
  const seedBase = plane === "axial" ? 101 : plane === "coronal" ? 202 : 303;

  // Head presence fades near stack ends.
  const presence = inWindow(t, [0.02, 0.98]);

  // ── skull + brain ─────────────────────────────────────────
  const shrink = 0.82 + 0.18 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.02) / 0.96)));
  const rx = c.rx * shrink;
  const ry = c.ry * shrink;
  const skullOuter = smoothClosedPath(ellipsePts(c.cx, c.cy, rx, ry, { n: 24, wobble: 0.03, seed: seedBase }));
  const skullInner = smoothClosedPath(ellipsePts(c.cx, c.cy, rx - 5.5, ry - 5.5, { n: 24, wobble: 0.03, seed: seedBase }));
  const brain = smoothClosedPath(ellipsePts(c.cx, c.cy, rx - 7.5, ry - 7.5, { n: 26, wobble: 0.045, seed: seedBase + 9 }));

  // ── ventricles (visible near centre slices) ────────────────
  const vPres = inWindow(t, [0.32, 0.68]);
  const ventricles =
    vPres > 0
      ? [
          blob(c.cx - 10, c.cy - 4, 7 * vPres + 2, { squash: 2.1, rotateDeg: 18, wobble: 0.22, seed: seedBase + 21 }),
          blob(c.cx + 10, c.cy - 4, 7 * vPres + 2, { squash: 2.1, rotateDeg: -18, wobble: 0.22, seed: seedBase + 22 }),
        ]
      : [];

  // ── lesion / GTV ──────────────────────────────────────────
  const lPres = inWindow(t, c.lesionWindow);
  const lesionR = c.lesion.r * lPres;
  const lesion =
    lPres > 0
      ? blob(c.lesion.x, c.lesion.y, lesionR, { squash: 0.88, rotateDeg: -24, wobble: 0.16, seed: seedBase + 31 })
      : undefined;

  const contours: SliceGeometry["contours"] = [];
  if (lesion && lPres > 0.05) {
    contours.push({ structureId: "gtv", path: lesion });
    contours.push({
      structureId: "ctv",
      path: expandedBlob(c.lesion.x, c.lesion.y, c.lesion.r * lPres, 5, {
        squash: 0.9, rotateDeg: -20, seed: seedBase + 32, n: 26, wobble: 0.05,
      }),
    });
    contours.push({
      structureId: "ptv",
      path: expandedBlob(c.lesion.x, c.lesion.y, c.lesion.r * lPres, 8.2, {
        squash: 0.91, rotateDeg: -16, seed: seedBase + 33, n: 30, wobble: 0.035,
      }),
    });
  }

  // ── OARs ──────────────────────────────────────────────────
  const bsPres = inWindow(t, [0.4, 0.9]);
  if (bsPres > 0.05) {
    contours.push({
      structureId: "brainstem",
      path: blob(c.brainstem.x, c.brainstem.y, 1 + (bsPres * Math.min(c.brainstem.rx, c.brainstem.ry)), {
        squash: c.brainstem.ry / c.brainstem.rx,
        rotateDeg: plane === "sagittal" ? -14 : 0,
        wobble: 0.1,
        seed: seedBase + 41,
      }),
    });
  }
  const chPres = inWindow(t, [0.58, 0.86]);
  if (chPres > 0.05) {
    contours.push({
      structureId: "chiasm",
      path: blob(c.chiasm.x, c.chiasm.y, 1 + 3.6 * chPres, {
        squash: 0.62, wobble: 0.14, seed: seedBase + 42,
      }),
    });
  }
  const nervePres = inWindow(t, [0.5, 0.8]);
  if (nervePres > 0.05 && c.eyeGapX > 0) {
    for (const side of [-1, 1]) {
      const x = c.cx + side * c.eyeGapX * 0.72;
      contours.push({
        structureId: side < 0 ? "nerve-l" : "nerve-r",
        path: blob(x, (c.chiasm.y + c.eyeY) / 2, 1 + 2.2 * nervePres, {
          squash: 2.6, rotateDeg: side * 24, wobble: 0.18, seed: seedBase + (side < 0 ? 43 : 44),
        }),
      });
    }
  }
  const eyePres = inWindow(t, [0.62, 0.92]);
  if (eyePres > 0.05 && c.eyeGapX > 0) {
    for (const side of [-1, 1]) {
      const x = c.cx + side * c.eyeGapX;
      contours.push({
        structureId: side < 0 ? "eye-l" : "eye-r",
        path: blob(x, c.eyeY, 2 + 7.5 * eyePres, { squash: 0.94, wobble: 0.08, seed: seedBase + (side < 0 ? 45 : 46) }),
      });
      contours.push({
        structureId: side < 0 ? "lens-l" : "lens-r",
        path: blob(x + side * 2.4, c.eyeY - 1.5, 0.8 + 2.3 * eyePres, { squash: 0.7, wobble: 0.1, seed: seedBase + (side < 0 ? 47 : 48) }),
      });
    }
  }

  // ── dose isolines (conformal shells around the PTV) ───────
  const isolines: SliceGeometry["isolines"] = [];
  if (lesion && lPres > 0.05) {
    const shells: Array<[number, number, number]> = [
      // [levelGy, radiusGrow, wobble]
      [60, 2.2, 0.06],
      [57, 8.4, 0.05],
      [54, 13.5, 0.07],
      [45, 20, 0.09],
      [30, 28, 0.11],
    ];
    for (const [levelGy, grow, wob] of shells) {
      isolines.push({
        levelGy,
        path: expandedBlob(c.lesion.x, c.lesion.y, c.lesion.r * lPres, grow, {
          squash: 0.92,
          rotateDeg: -14 - levelGy * 0.3,
          seed: seedBase + 60 + levelGy,
          wobble: wob,
          n: 30,
        }),
      });
    }
  }

  return {
    presence,
    background: { skullOuter, skullInner, brain, ventricles },
    lesion,
    lesionCentroid: lesion ? c.lesion : undefined,
    contours,
    isolines,
  };
}
