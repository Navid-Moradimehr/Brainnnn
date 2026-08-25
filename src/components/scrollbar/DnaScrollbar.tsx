"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

/**
 * DnaScrollbar — an overlay scrollbar whose thumb is a 3D DNA double helix.
 *
 * - The helix is RIGID inside the thumb: the whole DNA travels up/down the
 *   track with navigation (no internal phase travel, so it never "separates")
 * - 3D look: over/under strand weave, cylindrical tube shading with specular
 *   highlights, drop shadow on a glassy capsule, two-tone base-pair rungs
 * - Thumb height scales with visible/total ratio (min 64px)
 * - Drag thumb, click track to page, wheel over the bar, full keyboard support
 *
 * Why custom: CSS ::-webkit-scrollbar styling cannot render thumb content,
 * and overlay-scrollbar libraries don't expose custom thumb rendering.
 */

interface Metrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

interface Props {
  /** Scroll container ref; omit for window/document scrolling. */
  target?: React.RefObject<HTMLElement | null>;
  /** Positioning classes, e.g. "absolute inset-y-0 right-0" or "fixed right-0 inset-y-0 z-50". */
  className?: string;
  /** Track width in px. */
  thickness?: number;
  /** Accessible label. */
  label?: string;
  /** id of the scrollable region this bar controls. */
  controls?: string;
}

const MIN_THUMB = 64;
const WAVELENGTH = 26;
const AMP = 4;
/** radians of twist per scrolled pixel — the helix rotates as you navigate */
const TWIST_PER_PX = 0.05;

export function DnaScrollbar({ target, className, thickness = 20, label = "DNA scrollbar", controls }: Props) {
  const [metrics, setMetrics] = useState<Metrics>({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  const [boxH, setBoxH] = useState(0);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const raf = useRef(0);
  const hostCleanup = useRef<(() => void) | null>(null);

  const getEl = useCallback((): HTMLElement | null => {
    if (target) return target.current;
    return document.documentElement;
  }, [target]);

  const read = useCallback((): Metrics => {
    const el = getEl();
    if (!el) return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
    return {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    };
  }, [getEl]);

  const schedule = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setMetrics(read()));
  }, [read]);

  useEffect(() => {
    const el = getEl();
    schedule();
    // the root scroller fires scroll events on window/document, not documentElement
    const onScroll = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    el?.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => schedule());
    if (el && !target) ro.observe(document.body);
    else if (el) {
      ro.observe(el);
      // content growth changes scrollHeight without resizing the container
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      el?.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf.current);
      hostCleanup.current?.();
    };
  }, [getEl, schedule, target]);

  // host measurement via callback ref — avoids the null-render deadlock
  const hostNode = useRef<HTMLDivElement | null>(null);
  const hostRef = useCallback((node: HTMLDivElement | null) => {
    hostNode.current = node;
    hostCleanup.current?.();
    if (!node) return;
    setBoxH(node.clientHeight);
    const hro = new ResizeObserver(() => setBoxH(node.clientHeight));
    hro.observe(node);
    hostCleanup.current = () => hro.disconnect();
  }, []);

  const scrollable = metrics.scrollHeight > metrics.clientHeight + 4;
  const trackH = Math.max(0, (boxH || metrics.clientHeight || 320) - 8);
  const ratio = metrics.scrollHeight > 0 ? metrics.clientHeight / metrics.scrollHeight : 1;
  const thumbH = Math.max(MIN_THUMB, Math.min(trackH, ratio * trackH));
  const maxScroll = Math.max(1, metrics.scrollHeight - metrics.clientHeight);
  const maxThumbY = Math.max(0, trackH - thumbH);
  const thumbY = Math.min(maxThumbY, (metrics.scrollTop / maxScroll) * maxThumbY);

  const setScroll = useCallback(
    (top: number) => {
      const el = getEl();
      if (!el) return;
      el.scrollTop = top;
    },
    [getEl],
  );

  const onThumbPointerDown = (e: ReactPointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: metrics.scrollTop };
    e.preventDefault();
  };
  const onThumbPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.startY;
    const k = maxScroll / Math.max(1, maxThumbY);
    setScroll(drag.current.startScroll + dy * k);
  };
  const endDrag = () => (drag.current = null);

  const onTrackPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as Element).closest("[data-dna-thumb]")) return;
    const rect = hostNode.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = (e.clientY - rect.top) / Math.max(1, rect.height);
    setScroll(frac * metrics.scrollHeight - metrics.clientHeight / 2);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    const step = metrics.clientHeight * 0.85;
    if (e.key === "ArrowDown") setScroll(metrics.scrollTop + 48);
    else if (e.key === "ArrowUp") setScroll(metrics.scrollTop - 48);
    else if (e.key === "PageDown") setScroll(metrics.scrollTop + step);
    else if (e.key === "PageUp") setScroll(metrics.scrollTop - step);
    else if (e.key === "Home") setScroll(0);
    else if (e.key === "End") setScroll(maxScroll);
    else return;
    e.preventDefault();
  };

  const onWheel = (e: React.WheelEvent) => {
    const el = getEl();
    if (!el) return;
    el.scrollTop += e.deltaY;
  };

  if (!scrollable) return null;

  /* ── 3D helix geometry ──
     The DNA travels with the thumb AND twists as you scroll: the phase
     advances with scrollTop, rotating the helix around its axis. */
  const twist = metrics.scrollTop * TWIST_PER_PX;
  const cx = thickness / 2;
  const capW = thickness - 4;
  const capH = thumbH;
  const strandOffset = (y: number) => -AMP * Math.cos((2 * Math.PI * y) / WAVELENGTH - twist);

  // sample strands; split into front/back segments at crossings for the weave
  const segA: Array<{ front: boolean; d: string }> = [];
  const segB: Array<{ front: boolean; d: string }> = [];
  const rungs: Array<{ y: number; xa: number; xb: number; len: number }> = [];
  {
    let curA = "";
    let curB = "";
    let frontA = true;
    for (let y = 0; y <= capH + 0.01; y += 2) {
      const off = strandOffset(y);
      const depth = Math.sin((2 * Math.PI * y) / WAVELENGTH - twist);
      const fa = depth >= 0;
      const pA = `${(cx + off).toFixed(2)},${y.toFixed(2)}`;
      const pB = `${(cx - off).toFixed(2)},${y.toFixed(2)}`;
      if (fa !== frontA) {
        if (curA) segA.push({ front: frontA, d: curA });
        if (curB) segB.push({ front: !frontA, d: curB });
        curA = `M ${pA}`;
        curB = `M ${pB}`;
        frontA = fa;
      } else {
        curA += curA ? ` L ${pA}` : `M ${pA}`;
        curB += curB ? ` L ${pB}` : `M ${pB}`;
      }
      // base-pair ladder: a rung at EVERY step — rungs shorten to nothing at
      // crossings instead of popping in/out, so the twist reads continuously
      if (y >= 3 && y <= capH - 3 && y % 4 === 0) {
        rungs.push({ y, xa: cx + off, xb: cx - off, len: Math.abs(off) / AMP });
      }
    }
    if (curA) segA.push({ front: frontA, d: curA });
    if (curB) segB.push({ front: !frontA, d: curB });
  }

    const strandStroke = (front: boolean) => ({
    shadow: "var(--dna-shadow)",
    base: front ? "var(--dna-a)" : "var(--dna-b)",
    hi: front ? "var(--dna-hi-a)" : "var(--dna-hi-b)",
  });

  return (
    <div
      ref={hostRef}
      role="presentation"
      className={`select-none touch-none ${className ?? ""}`}
      style={{ width: thickness }}
      onPointerDown={onTrackPointerDown}
      onWheel={onWheel}
    >
      <svg width={thickness} height={boxH} className="block overflow-visible">
        <defs>
          {/* glassy capsule */}
          <linearGradient id={`cap-${thickness}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--dna-cap-hi)" />
            <stop offset="45%" stopColor="var(--dna-cap-mid)" />
            <stop offset="100%" stopColor="var(--dna-cap-lo)" />
          </linearGradient>
          <clipPath id={`clip-${thickness}`}>
            <rect x={1.5} y={0} width={capW} height={capH} rx={capW / 2} />
          </clipPath>
        </defs>

        {/* track groove */}
        <line x1={cx} y1={4} x2={cx} y2={trackH + 4} stroke="var(--dna-track)" strokeWidth={2} strokeLinecap="round" />
        {Array.from({ length: Math.floor(trackH / 28) }, (_, i) => (
          <line key={i} x1={cx - 2.5} x2={cx + 2.5} y1={8 + i * 28} y2={8 + i * 28} stroke="var(--dna-track)" strokeWidth={1} />
        ))}

        <g transform={`translate(2 ${4 + thumbY})`}>
          {/* soft shadow under the whole capsule */}
          <rect x={1.5} y={1.5} width={capW} height={capH} rx={capW / 2} fill="var(--dna-shadow)" opacity={0.55} />
          {/* glassy capsule body */}
          <rect x={1.5} y={0} width={capW} height={capH} rx={capW / 2} fill={`url(#cap-${thickness})`} stroke="var(--dna-thumb-border)" strokeWidth={1} />

          <g clipPath={`url(#clip-${thickness})`}>
            {/* strand shadows on the glass */}
            {[...segA, ...segB].map((s, i) => (
              <path key={`sh${i}`} d={s.d} fill="none" stroke="var(--dna-shadow)" strokeWidth={3.4} strokeLinecap="round" transform="translate(0.6 1.1)" opacity={0.5} />
            ))}

            {/* back strands (weave: drawn beneath rungs) */}
            {segA.filter((s) => !s.front).map((s, i) => (
              <path key={`ab${i}`} d={s.d} fill="none" stroke={strandStroke(false).base} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
            ))}
            {segB.filter((s) => !s.front).map((s, i) => (
              <path key={`bb${i}`} d={s.d} fill="none" stroke={strandStroke(true).base} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
            ))}

            {/* base-pair ladder — continuous, two-tone pairs, depth-faded */}
            {rungs.map((r, i) => {
              if (r.len < 0.12) return null;
              const mid = (r.xa + r.xb) / 2;
              const depth = 0.4 + 0.6 * r.len;
              return (
                <g key={`r${i}`} opacity={depth}>
                  <line x1={r.xa} y1={r.y} x2={mid} y2={r.y} stroke="var(--dna-rung-a)" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={mid} y1={r.y} x2={r.xb} y2={r.y} stroke="var(--dna-rung-b)" strokeWidth={1.5} strokeLinecap="round" />
                  {r.len > 0.55 && (
                    <>
                      <circle cx={r.xa} cy={r.y} r={1.2} fill="var(--dna-rung-a)" />
                      <circle cx={r.xb} cy={r.y} r={1.2} fill="var(--dna-rung-b)" />
                    </>
                  )}
                </g>
              );
            })}

            {/* front strands with cylindrical shading */}
            {segA.filter((s) => s.front).map((s, i) => (
              <g key={`af${i}`}>
                <path d={s.d} fill="none" stroke="var(--dna-a)" strokeWidth={2.8} strokeLinecap="round" />
                <path d={s.d} fill="none" stroke="var(--dna-hi-a)" strokeWidth={0.9} strokeLinecap="round" transform="translate(-0.55 -0.55)" opacity={0.9} />
              </g>
            ))}
            {segB.filter((s) => s.front).map((s, i) => (
              <g key={`bf${i}`}>
                <path d={s.d} fill="none" stroke="var(--dna-b)" strokeWidth={2.8} strokeLinecap="round" />
                <path d={s.d} fill="none" stroke="var(--dna-hi-b)" strokeWidth={0.9} strokeLinecap="round" transform="translate(-0.55 -0.55)" opacity={0.9} />
              </g>
            ))}
          </g>

          {/* capsule top glass highlight */}
          <rect x={2.6} y={1.2} width={capW - 2.2} height={Math.min(5, capH / 3)} rx={2.4} fill="var(--dna-cap-hi)" opacity={0.5} />
        </g>
      </svg>

      {/* keyboard/drag surface glued to the visible helix */}
      <div
        data-dna-thumb
        role="scrollbar"
        aria-orientation="vertical"
        aria-label={label}
        aria-controls={controls}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, Math.round((metrics.scrollTop / maxScroll) * 100))}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onThumbPointerDown}
        onPointerMove={onThumbPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute cursor-grab rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          top: 4 + thumbY,
          left: 0,
          right: 0,
          height: thumbH,
          touchAction: "none",
        }}
      />
    </div>
  );
}
