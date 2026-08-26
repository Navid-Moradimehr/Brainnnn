import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

/**
 * DoseIsolines — Remotion composition: isodose contours blooming outward
 * from a target with a quiet scan sweep. Used on the Generate screen.
 * Purely illustrative geometry; no clinical data implied.
 */
const LEVELS = [
  { r: 18, color: "#ff5c49" },
  { r: 30, color: "#ff8a4d" },
  { r: 44, color: "#e8d24a" },
  { r: 60, color: "#43d0b0" },
  { r: 78, color: "#3aa6d8" },
];

export const doseBloomMeta = {
  durationInFrames: 210,
  fps: 30,
  width: 640,
  height: 400,
};

function blobPath(cx: number, cy: number, r: number, seed: number, t: number): string {
  // deterministic organic blob
  let d = "";
  const n = 14;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob =
      Math.sin(a * 3 + seed) * 0.07 +
      Math.sin(a * 7 + seed * 2) * 0.04;
    pts.push([cx + Math.cos(a) * r * (1 + wob), cy + Math.sin(a) * r * (0.92 + wob)]);
  }
  d = `M ${pts[0][0]} ${pts[0][1]} `;
  for (let i = 1; i <= n; i++) {
    const [x, y] = pts[i % n];
    d += `L ${x} ${y} `;
  }
  void t;
  return d + "Z";
}

export function DoseIsolines({ tag }: { tag?: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#05070b" }}>
      <svg viewBox="0 0 320 200" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="db-glow" cx="52%" cy="47%" r="45%">
            <stop offset="0%" stopColor="rgba(255,138,77,0.16)" />
            <stop offset="100%" stopColor="rgba(5,7,11,0)" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#05070b" />
        {/* faint grid */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={200} stroke="rgba(139,148,167,0.08)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={320} y2={i * 40} stroke="rgba(139,148,167,0.08)" strokeWidth="0.5" />
        ))}

        <circle cx="166" cy="94" r="90" fill="url(#db-glow)" />

        {LEVELS.map(({ r, color }, idx) => {
          const appearAt = idx * (durationInFrames / (LEVELS.length + 2));
          const local = Math.max(0, Math.min(1, (progress - appearAt / durationInFrames) * (LEVELS.length + 2)));
          if (local <= 0) return null;
          const scale = 0.4 + 0.6 * easeOut(local);
          return (
            <path
              key={r}
              d={blobPath(166, 94, r * scale, idx + 1, progress)}
              fill="none"
              stroke={color}
              strokeWidth={idx === 0 ? 1.6 : 1}
              strokeDasharray={idx === 1 ? "5 3" : undefined}
              opacity={easeOut(local)}
            />
          );
        })}

        {/* scan line */}
        <rect
          x={0}
          y={interpolate(frame % 140, [0, 140], [8, 196])}
          width={320}
          height={1.2}
          fill="rgba(31,196,174,0.55)"
        />

        <text x="12" y="188" fill="#8b94a7" fontSize="9" fontFamily="monospace">
          {tag ?? "RESEARCH CANDIDATE · ACHIEVABLE DOSE FORECAST"}
        </text>
      </svg>
    </AbsoluteFill>
  );
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
