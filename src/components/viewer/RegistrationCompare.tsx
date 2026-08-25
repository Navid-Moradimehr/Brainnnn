"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnatomySvg } from "./AnatomySvg";

/**
 * Registration QC control: side-by-side or blended overlay of CT and MR
 * with a slider wipe. Purely visual — the "confidence" figure is mock data.
 */
export function RegistrationCompare({ sliceIndex = 48 }: { sliceIndex?: number }) {
  const [mode, setMode] = useState<"overlay" | "side">("overlay");
  const [wipe, setWipe] = useState(52);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div role="tablist" aria-label="Comparison mode" className="flex rounded-sm border border-border bg-secondary p-0.5">
          {(["overlay", "side"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={
                "rounded-[3px] px-3 py-1 text-xs font-medium capitalize transition-colors " +
                (mode === m ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              {m}
            </button>
          ))}
        </div>
        <span className="num text-[11px] text-muted-foreground">
          CT_PLN · MR_T1c_DEF · slice {sliceIndex + 1}
        </span>
      </div>

      {mode === "overlay" ? (
        <div>
          <div className="relative overflow-hidden rounded-md border border-border bg-[#05070b]">
            <div className="grid grid-cols-1">
              <AnatomySvg plane="axial" sliceIndex={sliceIndex} modality="ct" className="aspect-square w-full" />
            </div>
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
              <AnatomySvg plane="axial" sliceIndex={sliceIndex} modality="mr" className="aspect-square w-full" />
            </div>
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-px bg-primary/80 shadow-[0_0_10px_2px_rgba(31,196,174,0.4)]"
              style={{ left: `${wipe}%` }}
            />
            <span className="absolute left-2 top-2 rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-foreground/85">MR</span>
            <span className="absolute right-2 top-2 rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-foreground/85">CT</span>
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Overlay wipe position</span>
            <input
              type="range"
              min={0}
              max={100}
              value={wipe}
              onChange={(e) => setWipe(Number(e.target.value))}
              className="w-full accent-[#1fc4ae]"
              aria-valuetext={`${wipe}% MR overlay`}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(["ct", "mr"] as const).map((m) => (
            <figure key={m} className="overflow-hidden rounded-md border border-border bg-[#05070b]">
              <AnatomySvg plane="axial" sliceIndex={sliceIndex} modality={m} className="aspect-square w-full" />
              <figcaption className="border-t border-border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {m === "ct" ? "CT_PLN" : "MR_T1c_DEF"}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
