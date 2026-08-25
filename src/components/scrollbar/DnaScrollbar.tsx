"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useReducedMotion } from "framer-motion";

/**
 * DnaScrollbar — an overlay scrollbar whose thumb is a DNA double helix.
 *
 * - Thumb height scales with visible/total ratio (min 56px)
 * - The helix phase advances with scrollTop, so the strands rotate/travel
 *   as the user moves through the page
 * - Drag thumb, click track to page, wheel over the bar, full keyboard support
 *
 * Why custom: CSS ::-webkit-scrollbar styling cannot animate thumb content
 * with scroll position, and overlay-scrollbar libraries don't expose custom
 * thumb rendering. A small SVG component (no dependency) gives exact control.
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
  /** Track width in px (thumb is thickness-4 wide). */
  thickness?: number;
  /** Accessible label / aria-controls target id. */
  label?: string;
}

const MIN_THUMB = 56;
const WAVELENGTH = 26;
const AMP = 3;
const PHASE_PER_PX = 0.045;

export function DnaScrollbar({ target, className, thickness = 16, label = "Content scrollbar" }: Props) {
  const [metrics, setMetrics] = useState<Metrics>({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  const [boxH, setBoxH] = useState(0);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const raf = useRef(0);
  const hostCleanup = useRef<(() => void) | null>(null);
  const reduce = useReducedMotion();

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

  // scroll + resize observation
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
    else if (el) ro.observe(el);
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

  // host measurement via callback ref — attaches the observer as soon as the
  // node exists, avoiding the null-render deadlock
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

  // hide the native page scrollbar while the helix bar is mounted
  useEffect(() => {
    if (target) return;
    document.documentElement.classList.add("dna-page");
    return () => document.documentElement.classList.remove("dna-page");
  }, [target]);

  const scrollable = metrics.scrollHeight > metrics.clientHeight + 4;
  // boxH is measured after the host mounts; fall back so the host can mount
  // and be measured (its height comes from CSS positioning, not content)
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

  const phase = reduce ? 0 : metrics.scrollTop * PHASE_PER_PX;
  const cx = thickness / 2 + 1;
  const ptsA: string[] = [];
  const ptsB: string[] = [];
  const rungs: Array<{ y: number; xa: number; xb: number }> = [];
  const step = 3;
  for (let y = 0; y <= thumbH; y += step) {
    const s = Math.sin((2 * Math.PI * y) / WAVELENGTH + phase);
    ptsA.push(`${(cx + AMP * s).toFixed(2)},${y.toFixed(2)}`);
    ptsB.push(`${(cx - AMP * s).toFixed(2)},${y.toFixed(2)}`);
    if (y % Math.round(WAVELENGTH / 4) === 0 && y > 2 && y < thumbH - 2) {
      rungs.push({ y, xa: cx + AMP * s, xb: cx - AMP * s });
    }
  }
  const pathA = `M ${ptsA.join(" L ")}`;
  const pathB = `M ${ptsB.join(" L ")}`;

  return (
    <div
      ref={hostRef}
      role="presentation"
      className={`select-none touch-none ${className ?? ""}`}
      style={{ width: thickness }}
      onPointerDown={onTrackPointerDown}
      onWheel={onWheel}
      aria-hidden={false}
    >
      <svg width={thickness} height={boxH} className="block">
        {/* track */}
        <line
          x1={cx}
          y1={4}
          x2={cx}
          y2={trackH + 4}
          stroke="var(--dna-track)"
          strokeWidth={1}
        />
        {/* ruler ticks */}
        {Array.from({ length: Math.floor(trackH / 24) }, (_, i) => (
          <line
            key={i}
            x1={cx - 2}
            x2={cx + 2}
            y1={8 + i * 24}
            y2={8 + i * 24}
            stroke="var(--dna-track)"
            strokeWidth={1}
          />
        ))}

        <g
          data-dna-thumb
          transform={`translate(1 ${4 + thumbY})`}
          role="scrollbar"
          aria-orientation="vertical"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((metrics.scrollTop / maxScroll) * 100)}
          tabIndex={0}
          onPointerDown={onThumbPointerDown}
          onPointerMove={onThumbPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className="cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          style={{ touchAction: "none" }}
        >
          {/* thumb capsule */}
          <rect
            x={0}
            y={0}
            width={thickness - 2}
            height={thumbH}
            rx={(thickness - 2) / 2}
            fill="var(--dna-thumb-bg)"
            stroke="var(--dna-thumb-border)"
            strokeWidth={1}
          />
          {/* base-pair rungs */}
          {rungs.map((r, i) => (
            <line
              key={`r${i}`}
              x1={r.xa}
              y1={r.y}
              x2={r.xb}
              y2={r.y}
              stroke={i % 2 === 0 ? "var(--dna-rung)" : "var(--dna-track)"}
              strokeWidth={1}
              opacity={0.9}
            />
          ))}
          {/* helix strands */}
          <path d={pathA} fill="none" stroke="var(--dna-a)" strokeWidth={2} strokeLinecap="round" />
          <path d={pathB} fill="none" stroke="var(--dna-b)" strokeWidth={2} strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
