"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, CircleDashed, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoseBloomPlayer } from "@/components/motion/remotion/DoseBloomPlayer";
import { useCases } from "@/context/CaseContext";
import { GENERATION_STAGES } from "@/lib/mock/jobs";
import { cn } from "@/lib/utils";
import type { JobStage, JobStageState } from "@/types";

export function GenerateClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { getCase, beginGeneration, completeGeneration, setActiveCaseId } = useCases();
  const kase = getCase(caseId);
  const [stages, setStages] = useState<JobStage[]>(
    GENERATION_STAGES.map((s) => ({ ...s, state: "pending" as JobStageState })),
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => setActiveCaseId(caseId), [caseId, setActiveCaseId]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!kase) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        Case not found. <Link className="text-status-ok underline" href="/">Back to dashboard</Link>
      </div>
    );
  }

  const gatesOk = kase.contoursApproved && kase.intentConfirmed;
  const done = stages.every((s) => s.state === "done");
  const alreadyHasPlan = Boolean(kase.candidatePlan) && !running;

  function start() {
    beginGeneration(caseId);
    setRunning(true);
    setProgress(0);
    setStages(GENERATION_STAGES.map((s) => ({ ...s, state: "pending" as const })));
    let t = 0;
    GENERATION_STAGES.forEach((stage, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStages((prev) => prev.map((s, j) => (j === i ? { ...s, state: "active" } : s)));
        }, t),
      );
      t += stage.durationMs * (reduce ? 0.15 : 1);
      timers.current.push(
        window.setTimeout(() => {
          setStages((prev) => prev.map((s, j) => (j === i ? { ...s, state: "done" } : s)));
          setProgress(Math.round(((i + 1) / GENERATION_STAGES.length) * 100));
          if (i === GENERATION_STAGES.length - 1) {
            completeGeneration(caseId, `cand-${caseId.split("-")[1]}-a`);
            setRunning(false);
          }
        }, t),
      );
    });
  }

  return (
    <div className="min-h-[calc(100dvh-3rem)]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label text-muted-foreground">Candidate generation</p>
            <h1 className="num mt-1 text-xl font-semibold tracking-tight">{kase.id}</h1>
          </div>
          <span className="rounded-sm border border-info/30 bg-info-soft px-2.5 py-1 text-xs font-medium text-status-info">
            Research candidate dose forecast
          </span>
        </header>

        {!gatesOk && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/40 bg-danger-soft px-4 py-3" role="alert">
            <p className="flex items-center gap-2.5 text-sm text-status-danger">
              <TriangleAlert className="h-4 w-4" aria-hidden />
              Generation is gated: clinician-approved contours and confirmed plan intent are required.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/cases/${caseId}/contours`}>Open contour review</Link>
            </Button>
          </div>
        )}

        {gatesOk && (
          <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* stages */}
            <section aria-label="Job progress" className="rounded-md border border-border bg-card p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-label text-muted-foreground">Job stages</h2>
                <span className="num text-xs text-muted-foreground">{done ? "complete" : running ? `${progress}%` : `${progress}%`}</span>
              </div>
              <div className="mb-6 h-1 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className={cn("h-full rounded-full", done ? "bg-status-ok" : "bg-status-info")}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <ol className="space-y-0">
                {stages.map((s, i) => (
                  <li key={s.id} className="relative flex gap-4 pb-7 last:pb-0">
                    {i < stages.length - 1 && (
                      <span aria-hidden className="absolute left-[11px] top-6 h-full w-px bg-border" />
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        s.state === "done"
                          ? "border-ok/40 bg-ok-soft"
                          : s.state === "active"
                            ? "border-info/50 bg-info-soft"
                            : "border-border bg-secondary",
                      )}
                    >
                      {s.state === "done" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-status-ok" />
                      ) : s.state === "active" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-status-info" />
                      ) : (
                        <CircleDashed className="h-3.5 w-3.5 text-muted-foreground/60" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className={cn("text-sm", s.state === "pending" ? "text-muted-foreground" : "font-medium")}>
                        {s.label}
                      </p>
                      <AnimatePresence>
                        {(s.state === "active" || s.state === "done") && s.detail && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0 }}
                            className="mt-0.5 overflow-hidden text-xs leading-relaxed text-muted-foreground"
                          >
                            {s.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-border pt-5">
                {!running && !done && !alreadyHasPlan && (
                  <Button size="lg" onClick={start} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Start candidate generation
                  </Button>
                )}
                {running && (
                  <p className="flex items-center gap-2 text-sm text-status-info">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Running — this is a simulated job for prototype purposes.
                  </p>
                )}
                {done && (
                  <Button size="lg" onClick={() => router.push(`/cases/${caseId}/review`)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Open review workspace →
                  </Button>
                )}
                {alreadyHasPlan && !running && (
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-status-ok" aria-hidden /> Candidate already generated for this case.
                    </p>
                    <Button size="lg" onClick={() => router.push(`/cases/${caseId}/review`)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Open review workspace →
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* visual + disclaimer */}
            <aside aria-label="Forecast visualisation" className="space-y-4">
              <DoseBloomPlayer className="aspect-[8/5]" />
              <div className="rounded-md border border-warn/30 bg-warn-soft p-4" role="note">
                <p className="text-[13px] font-medium leading-snug text-status-warn">
                  What you are generating is a research candidate dose forecast.
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-status-warn/85">
                  It estimates achievable dose for review and discussion. It is not a treatment
                  plan and must be recalculated in an approved local TPS with patient-specific QA.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
