"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  FlaskConical,
  Info,
  Move,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DnaScrollbar } from "@/components/scrollbar/DnaScrollbar";
import { SliceViewport } from "@/components/viewer/SliceViewport";
import { DvhChart } from "@/components/viewer/DvhChart";
import { ConstraintTable, mapNameToId } from "@/components/viewer/ConstraintTable";
import { getStructureColor } from "@/components/viewer/structureColors";
import { StatusBadge, ProtocolTag } from "@/components/primitives/StatusBadge";
import { useCases } from "@/context/CaseContext";
import { useI18n } from "@/i18n/I18nProvider";
import { useViewer, PLANE_TOTAL_SLICES, type Plane } from "@/context/ViewerContext";
import { cn } from "@/lib/utils";
import type { Structure } from "@/types";

const PLANES: Plane[] = ["axial", "coronal", "sagittal"];

function StructureGroup({
  title,
  list,
  className,
}: {
  title: string;
  list: Structure[];
  className?: string;
}) {
  const { visibleIds, toggleVisible, select, selectedStructureId } = useViewer();
  const { t, td } = useI18n();
  return (
    <div className={className}>
      <h3 className="text-label mb-2 px-1 text-muted-foreground">{title}</h3>
      <ul className="space-y-0.5">
        {list.map((s) => {
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
                  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 transition-colors",
                  selected ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <Switch checked={visible} onCheckedChange={() => toggleVisible(s.id)} aria-label={`${t("contours.toggleVisibility")}: ${td(s.name)}`} className="scale-[0.8]" />
                <span aria-hidden className="h-2 w-2 rounded-full shrink-0" style={{ background: getStructureColor(s.id), opacity: visible ? 1 : 0.35 }} />
                <span className={cn("truncate text-xs", !visible && "text-muted-foreground")}>{td(s.name)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ReviewClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { getCase, recordReviewDecision, setActiveCaseId } = useCases();
  const { t, td } = useI18n();
  const kase = getCase(caseId);
  const viewer = useViewer();
  const {
    plane, setPlane, sliceIndex, stepSlice,
    visibleIds, toggleVisible, select, selectedStructureId,
    compareMode, setCompareMode, imageMode, setImageMode,
    washOn, setWashOn, washLevel, setWashLevel,
    isolinesOn, setIsolinesOn,
  } = viewer;
  const defaultNotes = td(
    "Left optic nerve at 52.4 Gy accepted to secure D95 coverage; physics concurrence recorded in audit.",
  );
  const [editedNotes, setEditedNotes] = useState<string | null>(null);
  const notes = editedNotes ?? defaultNotes;
  const [highlightDefId, setHighlightDefId] = useState<string | null>(null);
  const structRef = useRef<HTMLDivElement>(null);
  const evalRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActiveCaseId(caseId), [caseId, setActiveCaseId]);

  if (!kase) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        Case not found. <Link className="text-status-ok underline" href="/">Back to dashboard</Link>
      </div>
    );
  }

  const plan = kase.candidatePlan;
  const total = PLANE_TOTAL_SLICES[plane];
  const targets = kase.structures.filter((s) => s.kind === "target");
  const oars = kase.structures.filter((s) => s.kind === "oar");
  const reviewed = Boolean(kase.reviewDecision);

  const tradeOff = plan
    ? (() => {
        const nerve = plan.constraints.find((c) => c.defId === "c-nerves-max");
        const ptv = plan.constraints.find((c) => c.defId === "c-ptv-d95");
        if (!nerve || !ptv || !nerve.relatesTo?.includes("c-ptv-d95")) return null;
        return { nerve, ptv };
      })()
    : null;

  function handleSelectStructure(name: string) {
    setHighlightDefId(null);
    const id = mapNameToId(name);
    if (!id) {
      select("normalbrain");
      return;
    }
    select(id);
    if (!visibleIds.has(id)) toggleVisible(id);
  }

  if (!plan) {
    return (
      <div className="p-10">
        <div className="mx-auto max-w-md rounded-md border border-border bg-card p-6 text-center">
          <FlaskConical className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
          <h1 className="mt-2 text-sm font-medium">{t("review.noCandidateTitle")}</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {t("review.noCandidateBody")}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/cases/${caseId}/generate`}>{t("review.goToGeneration")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const doseVariant = compareMode === "reference" ? "reference" : "candidate";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* research disclaimer strip */}
      <div className="flex items-center justify-center gap-2 border-b border-warn/25 bg-warn-soft px-4 py-1.5" role="note">
        <Info className="h-3.5 w-3.5 shrink-0 text-status-warn" aria-hidden />
        <p className="text-center text-[11px] font-medium tracking-wide text-status-warn">
          {t("review.disclaimer")}
        </p>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border bg-card px-5 py-2.5">
        <div className="flex items-center gap-3">
          <span className="num text-sm font-medium">{kase.id}</span>
          <StatusBadge status={kase.status} />
        </div>

        <div role="tablist" aria-label="Plane" className="flex rounded-sm border border-border bg-secondary p-0.5">
          {PLANES.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={plane === p}
              onClick={() => setPlane(p)}
              className={cn(
                "rounded-[3px] px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                plane === p ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`contours.${p}` as never)}
            </button>
          ))}
        </div>

        {/* raw vs processed image */}
        <div role="tablist" aria-label={t("review.comparisonLabel")} className="flex rounded-sm border border-border bg-secondary p-0.5">
          {(["raw", "processed"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={imageMode === m}
              onClick={() => setImageMode(m)}
              className={cn(
                "rounded-[3px] px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                imageMode === m ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "raw" ? t("review.raw") : t("review.processed")}
            </button>
          ))}
        </div>

        <Select value={compareMode} onValueChange={(v) => setCompareMode(v as typeof compareMode)}>
          <SelectTrigger size="sm" className="w-[170px]" aria-label={t("review.comparisonLabel")} disabled={imageMode === "raw"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="candidate">{t("review.candidateDose")}</SelectItem>
            <SelectItem value="reference">{t("review.referenceDose")}</SelectItem>
            <SelectItem value="split">{t("review.splitView")}</SelectItem>
          </SelectContent>
        </Select>

        <label className={cn("flex items-center gap-2 text-xs", imageMode === "raw" ? "opacity-40" : "text-muted-foreground")}>
          <Switch
            checked={washOn && imageMode === "processed"}
            disabled={imageMode === "raw"}
            onCheckedChange={setWashOn}
            aria-label={t("review.toggleWash")}
          />
          {t("review.wash")}
        </label>
        <Slider
          value={[washLevel]}
          min={0}
          max={1}
          step={0.05}
          disabled={imageMode === "raw"}
          onValueChange={([v]) => setWashLevel(v)}
          className="w-28"
          aria-label={t("review.washOpacity")}
        />
        <label className={cn("flex items-center gap-2 text-xs", imageMode === "raw" ? "opacity-40" : "text-muted-foreground")}>
          <Switch
            checked={isolinesOn && imageMode === "processed"}
            disabled={imageMode === "raw"}
            onCheckedChange={setIsolinesOn}
            aria-label={t("review.toggleIsolines")}
          />
          {t("review.isolines")}
        </label>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => stepSlice(-1)} aria-label={t("review.prevSlice")}>−</Button>
          <span className="num w-14 text-[11px] text-muted-foreground">
            {String(Math.min(sliceIndex, total - 1) + 1).padStart(3, "0")}/{total}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => stepSlice(1)} aria-label={t("review.nextSlice")}>+</Button>
        </div>
      </div>

      {/* workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[220px_1fr_380px]">
        {/* structures */}
        <aside aria-label={t("review.structures")} className="border-r border-border bg-card/60">
          <div className="relative h-full h-full">
            <div ref={structRef} id="review-structures" className="dna-scroll h-full overflow-y-auto">
            <div className="space-y-5 p-3 pr-5">
              <StructureGroup title={t("contours.targets")} list={targets} />
              <StructureGroup title={t("contours.oars")} list={oars} className="mt-5" />

              {/* isodose legend */}
              <div className="rounded-sm border border-border p-2.5">
                <h3 className="text-label mb-2 text-muted-foreground">{t("review.legend")}</h3>
                <ul className="num space-y-1.5 text-[11px] text-muted-foreground">
                  {[["60 Gy", "#ff5c49"], ["57 Gy", "#ff8a4d"], ["54 Gy", "#e8d24a"], ["45 Gy", "#43d0b0"], ["30 Gy", "#3aa6d8"]].map(([label, color]) => (
                    <li key={label} className="flex items-center gap-2">
                      <span aria-hidden className="inline-block h-0.5 w-5 rounded-full" style={{ background: color }} />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
            <DnaScrollbar target={structRef} controls="review-structures" className="absolute inset-y-0 right-0.5" label="Structure list" />
          </div>
        </aside>

        {/* viewer */}
        <section aria-label={t("review.dvh")} className="flex flex-col p-4">
          <motion.div
            ref={viewportRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="relative mx-auto aspect-square w-full max-w-[620px]"
          >
            <SliceViewport modality="mr" doseVariant={doseVariant} className="h-full w-full" />
            {compareMode === "split" && (
              <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.04}
                dragConstraints={viewportRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-3 right-3 w-[46%] cursor-grab touch-none overflow-hidden rounded-md border border-info/40 shadow-xl active:cursor-grabbing"
                title={t("review.refPanelHint")}
              >
                <SliceViewport modality="ct" doseVariant="reference" showContours={false} className="aspect-square w-full pointer-events-none" />
                <span className="pointer-events-none absolute left-2 top-2 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white/85">{t("review.refPanelLabel")}</span>
                <Move className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-white/70" aria-hidden />
              </motion.div>
            )}
          </motion.div>

          {/* trade-off callout */}
          {tradeOff && (
            <motion.div
              layoutId="tradeoff"
              className="mx-auto mt-4 w-full max-w-[620px] rounded-md border border-border bg-card px-4 py-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-label text-muted-foreground">{t("review.tradeOffTitle")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
                <span>
                  {t("review.tradeOffNerve")}{" "}
                  <b className="num text-status-warn">{tradeOff.nerve.candidateValueGy.toFixed(1)} Gy</b>
                  <span className="ml-1.5 text-[11px] text-muted-foreground">+{(tradeOff.nerve.candidateValueGy - (tradeOff.nerve.referenceValueGy ?? 0)).toFixed(1)} {t("common.vsRef")}</span>
                </span>
                <span aria-hidden className="text-muted-foreground">⇄</span>
                <span>
                  {t("review.tradeOffPtv")}{" "}
                  <b className="num text-status-ok">{tradeOff.ptv.candidateValueGy.toFixed(1)} Gy</b>
                  <span className="ml-1.5 text-[11px] text-muted-foreground">+{(tradeOff.ptv.candidateValueGy - (tradeOff.ptv.referenceValueGy ?? 0)).toFixed(1)} {t("common.vsRef")}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 text-xs"
                  onClick={() => {
                    select("nerve-l");
                    setHighlightDefId("c-nerves-max");
                  }}
                >
                  {t("review.inspectTradeOff")}
                </Button>
              </div>
            </motion.div>
          )}
        </section>

        {/* right column */}
        <aside aria-label={t("review.decision")} className="border-l border-border bg-card/60">
          <div className="relative h-full h-full">
            <div ref={evalRef} id="review-eval" className="dna-scroll h-full overflow-y-auto">
            <div className="space-y-5 p-4 pr-5">
              {/* DVH */}
              <section aria-label="DVH">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-label text-muted-foreground">{t("review.dvh")}</h2>
                  <ProtocolTag label={`CI ${plan.metrics.conformityIndex}`} />
                </div>
                <div
                  className={cn(
                    "rounded-md border bg-background/50 p-2",
                    selectedStructureId && "border-primary/30",
                  )}
                >
                  <DvhChart
                    plan={plan}
                    reference={
                      plan.dvh.length
                        ? {
                            ...plan,
                            dvh: plan.dvh.map((curve) => ({
                              ...curve,
                              points: curve.points.map((pt) => ({
                                doseGy: pt.doseGy,
                                volumePct: Math.max(
                                  0,
                                  pt.volumePct -
                                    (pt.doseGy > 45 ? Math.min(18, (pt.doseGy - 45) * 1.6) : 0),
                                ),
                              })),
                            })),
                          }
                        : undefined
                    }
                    visibleIds={visibleIds}
                    selectedId={selectedStructureId}
                    onSelect={(id) => select(id === selectedStructureId ? null : id)}
                  />
                </div>
              </section>

              {/* constraints */}
              <section aria-label="Constraints">
                <h2 className="text-label mb-2 text-muted-foreground">{t("review.constraints")}</h2>
                <ConstraintTable
                  plan={plan}
                  selectedId={selectedStructureId}
                  onSelectStructureName={handleSelectStructure}
                  highlightDefId={highlightDefId}
                />
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  {t("review.constraintsNote")}
                </p>
              </section>

              {/* metrics strip */}
              <section aria-label="Plan metrics" className="grid grid-cols-3 gap-2">
                {[
                  [t("review.metricPtvD95"), `${plan.metrics.ptvD95Gy.toFixed(1)} Gy`],
                  [t("review.metricConformity"), plan.metrics.conformityIndex.toFixed(2)],
                  [t("review.metricNbV40"), `${plan.metrics.normalBrainV40Pct.toFixed(1)}%`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-sm border border-border bg-secondary/60 px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{k}</p>
                    <p className="num mt-1 text-sm font-medium">{v}</p>
                  </div>
                ))}
              </section>

              {/* decision */}
              <section aria-label="Review decision" className="rounded-md border border-border p-4">
                <h2 className="text-label text-muted-foreground">{t("review.decision")}</h2>
                {!reviewed ? (
                  <>
                    <textarea
                      value={notes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      className="mt-2.5 min-h-24 w-full resize-none rounded-sm border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label={t("review.decisionNotes")}
                      placeholder={t("review.decisionPlaceholder")}
                    />
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <Button
                        onClick={() =>
                          recordReviewDecision(caseId, {
                            outcome: "approved-for-tps-recalculation",
                            notes: notes,
                          })
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("review.approveForTps")}
                      </Button>
                      <Button variant="outline" onClick={() => router.push(`/cases/${caseId}/export`)}>
                        <FileText className="h-4 w-4" aria-hidden /> {t("review.continueExport")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-2.5 space-y-2">
                    <p className="flex items-center gap-2 text-[13px] text-status-ok">
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      {kase.reviewDecision!.outcome === "approved-for-tps-recalculation"
                        ? t("review.approvedRecorded")
                        : t("review.revisionsRecorded")}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{td(kase.reviewDecision!.notes)}</p>
                    <Button asChild className="w-full">
                      <Link href={`/cases/${caseId}/export`}>Open export &amp; audit →</Link>
                    </Button>
                  </div>
                )}
                {reviewed && kase.reviewDecision!.outcome !== "approved-for-tps-recalculation" && (
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => router.push(`/cases/${caseId}/contours`)}>
                    <Undo2 className="h-3.5 w-3.5" aria-hidden /> {t("review.backToContours")}
                  </Button>
                )}
              </section>
            </div>
            </div>
            <DnaScrollbar target={evalRef} controls="review-eval" className="absolute inset-y-0 right-0.5" label="Evaluation panel" />
          </div>
        </aside>
      </div>
    </div>
  );
}
