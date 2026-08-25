/**
 * Deterministic geometry helpers for the procedural head phantom.
 * Same seed always yields the same slice, so contours stay registered.
 */

/** Mulberry32 PRNG — tiny, fast, deterministic. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Pt {
  x: number;
  y: number;
}

/** Closed Catmull-Rom spline through points, emitted as cubic beziers. */
export function smoothClosedPath(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d + "Z";
}

/** Ring of points around an ellipse with seeded radial noise. */
export function ellipsePts(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opts: { n?: number; wobble?: number; seed?: number } = {},
): Pt[] {
  const { n = 22, wobble = 0, seed = 1 } = opts;
  const r = rng(seed);
  const phase = r() * Math.PI * 2;
  const noise = Array.from({ length: n }, (_, i) => Math.sin(i * 2.7 + phase) * 0.6 + (r() - 0.5));
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (noise[i] ?? 0) * wobble;
    return { x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k };
  });
}

/** Organic closed blob — used for GTV/lesion and OAR shapes. */
export function blob(
  cx: number,
  cy: number,
  r: number,
  opts: { squash?: number; rotateDeg?: number; wobble?: number; seed?: number; n?: number } = {},
): string {
  const { squash = 1, rotateDeg = 0, wobble = 0.12, seed = 7, n = 16 } = opts;
  const rot = (rotateDeg * Math.PI) / 180;
  const pts = ellipsePts(0, 0, r, r * squash, { n, wobble, seed }).map((p) => ({
    x: cx + p.x * Math.cos(rot) - p.y * Math.sin(rot),
    y: cy + p.x * Math.sin(rot) + p.y * Math.cos(rot),
  }));
  return smoothClosedPath(pts);
}

/** Uniform-ish outward offset of a blob (used for CTV/PTV margins). */
export function expandedBlob(
  cx: number,
  cy: number,
  r: number,
  grow: number,
  opts: Parameters<typeof blob>[3] & { wobble?: number } = {},
): string {
  const { wobble = 0.06, ...rest } = opts;
  return blob(cx, cy, r + grow, { ...rest, wobble });
}
