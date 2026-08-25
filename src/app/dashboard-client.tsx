"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileClock,
  Plus,
  ShieldAlert,
  TimerReset,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, ProtocolTag } from "@/components/primitives/StatusBadge";
import { MetricTile } from "@/components/primitives/Panel";
import { useCases } from "@/context/CaseContext";

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function DashboardClient() {
  const { cases } = useCases();
  const inReview = cases.filter(
    (c) => c.status === "review-required" || c.status === "data-review",
  ).length;
  const flagged = cases.reduce(
    (n, c) =>
      n + (c.candidatePlan?.constraints.filter((x) => x.verdict !== "pass").length ?? 0),
    0,
  );

  return (
    <div className="min-h-[calc(100dvh-3rem)]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* header */}
        <motion.div variants={fade} initial="hidden" animate="show" custom={0}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Case workspace</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Research planning review for adult glioblastoma · single protocol
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ProtocolTag />
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/cases/new">
                  <Plus className="h-4 w-4" aria-hidden /> Create new case
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* metrics */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <motion.div variants={fade} initial="hidden" animate="show" custom={1}>
            <MetricTile
              label="Cases in review"
              value={String(inReview)}
              sub="Awaiting clinician or physics action"
              tone={inReview > 0 ? "warn" : "default"}
              icon={<FolderOpen className="h-4 w-4" aria-hidden />}
            />
          </motion.div>
          <motion.div variants={fade} initial="hidden" animate="show" custom={2}>
            <MetricTile
              label="Planning time saved*"
              value="3.4 h"
              sub="Median per candidate, last 30 days"
              icon={<TimerReset className="h-4 w-4" aria-hidden />}
            />
          </motion.div>
          <motion.div variants={fade} initial="hidden" animate="show" custom={3}>
            <MetricTile
              label="Flagged constraints"
              value={String(flagged)}
              sub="In review band — none blocked"
              tone={flagged > 0 ? "warn" : "ok"}
              icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
            />
          </motion.div>
          <motion.div variants={fade} initial="hidden" animate="show" custom={4}>
            <MetricTile
              label="Active protocol"
              value="60 Gy / 30 fx"
              sub="VMAT · GBM adults only"
              icon={<FileClock className="h-4 w-4" aria-hidden />}
            />
          </motion.div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* recent cases */}
          <motion.section
            variants={fade}
            initial="hidden"
            animate="show"
            custom={5}
            aria-labelledby="recent-cases-h"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-cases-h" className="text-label text-muted-foreground">
                Recent cases
              </h2>
              <Select defaultValue="gbm60">
                <SelectTrigger size="sm" className="w-[190px]" aria-label="Filter by protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gbm60">GBM · 60 Gy / 30 fx</SelectItem>
                  <SelectItem value="all" disabled>
                    All protocols (MVP: one)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}/review`}
                    className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent"
                  >
                    <span className="num w-[86px] text-sm font-medium">{c.id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {c.diagnosis}
                    </span>
                    <StatusBadge status={c.status} />
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              *Simulated metric for prototype purposes only.
            </p>
          </motion.section>

          {/* activity timeline */}
          <motion.aside
            variants={fade}
            initial="hidden"
            animate="show"
            custom={6}
            aria-labelledby="activity-h"
          >
            <h2 id="activity-h" className="text-label mb-3 text-muted-foreground">
              Activity
            </h2>
            <ol className="relative space-y-5 rounded-md border border-border bg-card p-5">
              {cases.flatMap((c) =>
                c.auditTrail.slice(-3).map((e) => ({ key: `${c.id}-${e.id}`, c, e })),
              )
                .slice(-6)
                .reverse()
                .map(({ key, c, e }, i, arr) => (
                  <li key={key} className="relative pl-5">
                    {i < arr.length - 1 && (
                      <span aria-hidden className="absolute left-[5px] top-4 h-full w-px bg-border" />
                    )}
                    <span
                      aria-hidden
                      className={
                        "absolute left-0 top-1.5 h-[9px] w-[9px] rounded-full border " +
                        (e.severity === "success"
                          ? "border-ok/40 bg-status-ok"
                          : e.severity === "warning"
                            ? "border-warn/40 bg-status-warn"
                            : "border-border bg-muted-foreground")
                      }
                    />
                    <p className="text-[13px] leading-snug text-foreground/90">{e.action}</p>
                    <p className="num mt-1 text-[11px] text-muted-foreground">
                      {c.id} · {formatWhen(e.timestamp)}
                    </p>
                  </li>
                ))}
            </ol>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
