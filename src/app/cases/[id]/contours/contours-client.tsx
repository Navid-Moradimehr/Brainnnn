"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SliceViewport } from "@/components/viewer/SliceViewport";
import { DnaScrollbar } from "@/components/scrollbar/DnaScrollbar";
import { getStructureColor } from "@/components/viewer/structureColors";
import { SafetyGate } from "@/components/primitives/Panel";
import { useCases } from "@/context/CaseContext";
import { useViewer, PLANE_TOTAL_SLICES, type Plane } from "@/context/ViewerContext";
import { cn } from "@/lib/utils";

const PLANES: Plane[] = ["axial", "coronal", "sagittal"];

export function ContoursClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { getCase, approveContours, setActiveCaseId } = useCases();
  const kase = getCase(caseId);
  const viewer = useViewer();
  const {
    plane, setPlane, sliceIndex, stepSlice, setSliceIndex,
    visibleIds, toggleVisible, select, selectedStructureId, showAll, hideAll,
    imageMode, setImageMode,
  } = viewer;
  const listRef = useRef<HTMLDivElement>(null);
  const inspectRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActiveCaseId(caseId), [caseId, setActiveCaseId]);

  if (!kase) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        Case not found. <Link className="text-status-ok underline" href="/">Back to dashboard</Link>
      </div>
    );
  }

  const total = PLANE_TOTAL_SLICES[plane];
  const approved = kase.contoursApproved;
  const targets = kase.structures.filter((s) => s.kind === "target");
  const oars = kase.structures.filter((s) => s.kind === "oar");
  const allIds = kase.structures.map((s) => s.id);

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      {/* viewport toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-2.5">
        <div role="tablist" aria-label="Plane" className="flex rounded-sm border border-border bg-secondary p-0.5">
          {PLANES.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={plane === p}
              onClick={() => setPlane(p)}
              className={cn(
                "rounded-[3px] px-3 py-1 text-xs font-medium capitalize transition-colors",
                plane === p ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        {/* raw vs contours */}
        <div role="tablist" aria-label="Image mode" className="flex rounded-sm border border-border bg-secondary p-0.5">
          {(["raw", "processed"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={imageMode === m}
              onClick={() => setImageMode(m)}
              className={cn(
                "rounded-[3px] px-3 py-1 text-xs font-medium transition-colors",
                imageMode === m ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "raw" ? "Raw image" : "Contours"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => stepSlice(-1)} aria-label="Previous slice">
            −
          </Button>
          <input
            type="range"
            min={0}
            max={total - 1}
            value={Math.min(sliceIndex, total - 1)}
            onChange={(e) => setSliceIndex(Number(e.target.value))}
            className="w-52 accent-[#1fc4ae]"
            aria-label={`Slice position (${sliceIndex + 1}/${total})`}
          />
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => stepSlice(1)} aria-label="Next slice">
            +
          </Button>
          <span className="num w-16 text-[11px] text-muted-foreground">
            {String(Math.min(sliceIndex, total - 1) + 1).padStart(3, "0")}/{total}
          </span>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => showAll(allIds)}>Show all</Button>
          <Button variant="ghost" size="sm" onClick={hideAll}>Hide all</Button>
        </div>
      </div>

      {/* main 3-column workspace */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[240px_1fr_300px]">
        {/* structure list */}
        <aside aria-label="Structures" className="border-r border-border bg-card/60">
          <div className="relative h-full">
            <div ref={listRef} className="dna-scroll h-full overflow-y-auto">
              <div className="p-3 pr-5">
                <StructureGroup title="Targets" structures={targets} />
                <StructureGroup title="Organs at risk" structures={oars} className="mt-5" />
              </div>
            </div>
            <DnaScrollbar target={listRef} className="absolute inset-y-0 right-0.5" label="Structure list" />
          </div>
        </aside>

        {/* viewport */}
        <section aria-label="Imaging viewport" className="flex flex-col p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto aspect-square w-full max-w-[640px]"
          >
            <SliceViewport modality="mr" className="h-full w-full" />
          </motion.div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Simulated T1c MRI · arrow keys scrub slices · click a structure to inspect
          </p>
        </section>

        {/* inspection panel */}
        <aside aria-label="Inspection" className="border-l border-border bg-card/60">
          <div className="relative h-full">
            <div ref={inspectRef} className="dna-scroll h-full overflow-y-auto">
            <div className="space-y-5 p-4 pr-5">
              {selectedStructureId ? (() => {
                const s = kase.structures.find((x) => x.id === selectedStructureId)!;
                const color = getStructureColor(s.id);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                      {s.name}
                    </h3>
                    <dl className="num mt-3 space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between"><dt>Volume</dt><dd>{s.volumeCc.toFixed(1)} cm³</dd></div>
                      <div className="flex justify-between"><dt>Completeness</dt><dd className={s.completenessPct < 100 ? "text-status-warn" : ""}>{s.completenessPct}%</dd></div>
                      <div className="flex justify-between"><dt>Approval</dt><dd>{s.approvedBy ?? "pending"}</dd></div>
                    </dl>
                    <div className="mt-3 h-1 overflow-hidden rounded bg-secondary">
                      <div className="h-full rounded" style={{ width: `${s.completenessPct}%`, background: color }} />
                    </div>
                    {s.note && (
                      <p className="mt-3 rounded-sm border border-warn/25 bg-warn-soft p-2.5 text-xs leading-relaxed text-status-warn">{s.note}</p>
                    )}
                  </motion.div>
                );
              })() : (
                <div className="rounded-md border border-dashed border-border p-4 text-center">
                  <ShieldQuestion className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Select a structure in the list or viewer to inspect contour completeness.
                  </p>
                </div>
              )}

              <div className="rounded-md border border-border bg-secondary/60 p-4">
                <h3 className="text-label text-muted-foreground">Review notes</h3>
                <textarea
                  className="mt-2.5 min-h-24 w-full resize-none rounded-sm border border-input bg-background p-2.5 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Findings for this structure set…"
                  defaultValue={
                    kase.registrationWarnings.length
                      ? "Hold approval until registration QC passes."
                      : "Target volumes consistent with diagnostic MRI. Expansion margins reviewed."
                  }
                  aria-label="Review notes"
                />
              </div>

              <SafetyGate active={!approved}>
                {approved ? (
                  <>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div className="text-[13px] leading-snug">
                      Clinician-approved contours on file — dose generation unlocked.
                    </div>
                  </>
                ) : (
                  <>
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div className="text-[13px] leading-snug">
                      Clinician-approved contours required before dose generation can start.
                    </div>
                  </>
                )}
              </SafetyGate>

              {!approved && (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => approveContours(caseId)}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> Approve contours as clinician (mock)
                </Button>
              )}
              {approved && (
                <Button
                  className="w-full"
                  onClick={() => router.push(`/cases/${caseId}/intent`)}
                >
                  Continue to plan intent →
                </Button>
              )}
            </div>
            </div>
            <DnaScrollbar target={inspectRef} className="absolute inset-y-0 right-0.5" label="Inspection panel" />
          </div>
        </aside>
      </div>
    </div>
  );

  function StructureGroup({
    title,
    structures,
    className,
  }: {
    title: string;
    structures: typeof targets;
    className?: string;
  }) {
    return (
      <div className={className}>
        <h3 className="text-label mb-2 px-1 text-muted-foreground">{title}</h3>
        <ul className="space-y-0.5">
          {structures.map((s) => {
            const visible = visibleIds.has(s.id);
            const selected = selectedStructureId === s.id;
            return (
              <li key={s.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => select(selected ? null : s.id)}
                  onKeyDown={(e) => e.key === "Enter" && select(s.id)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 transition-colors",
                    selected ? "bg-accent" : "hover:bg-accent/70",
                  )}
                  aria-pressed={selected}
                >
                  <Switch
                    checked={visible}
                    onCheckedChange={() => toggleVisible(s.id)}
                    aria-label={`Toggle ${s.name} visibility`}
                    className="scale-[0.85]"
                  />
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: getStructureColor(s.id), opacity: visible ? 1 : 0.35 }} />
                  <span className={cn("truncate text-[13px]", !visible && "text-muted-foreground")}>{s.name}</span>
                  <span className="num ml-auto text-[10px] text-muted-foreground">{s.shortLabel}</span>
                  {visible ? (
                    <Eye className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
