"use client";

import { ArrowUpRight, Link2 } from "lucide-react";
import { VerdictBadge } from "@/components/primitives/VerdictBadge";
import { useI18n } from "@/i18n/I18nProvider";
import type { CandidatePlan } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  plan: CandidatePlan;
  selectedId: string | null;
  onSelectStructureName: (name: string) => void;
  highlightDefId?: string | null;
}

export function ConstraintTable({ plan, selectedId, onSelectStructureName, highlightDefId }: Props) {
  const { t, td } = useI18n();
  return (
    <div role="table" aria-label="Protocol constraint evaluation" className="overflow-hidden rounded-md border border-border">
      <div role="row" className="grid grid-cols-[1.5fr_1fr_0.9fr_auto] gap-3 border-b border-border bg-secondary/70 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <span role="columnheader">{t("review.colConstraint")}</span>
        <span role="columnheader" className="text-end">{t("review.colCandidate")}</span>
        <span role="columnheader" className="text-end">{t("review.colObjective")}</span>
        <span role="columnheader" className="w-20 text-end">{t("review.colVerdict")}</span>
      </div>
      <ul>
        {plan.constraints.map((c) => {
          const structureMatch = mapNameToId(c.structureName);
          const selected = selectedId === structureMatch || (structureMatch === null && selectedId === "normalbrain");
          const highlighted = highlightDefId === c.defId;
          const delta =
            c.referenceValueGy !== undefined ? c.candidateValueGy - c.referenceValueGy : undefined;
          return (
            <li key={c.defId} role="row">
              <button
                onClick={() => onSelectStructureName(c.structureName)}
                className={cn(
                  "grid w-full grid-cols-[1.5fr_1fr_0.9fr_auto] items-center gap-3 border-b border-border/70 px-3 py-2.5 text-start transition-colors last:border-b-0",
                  highlighted ? "bg-warn-soft/70" : selected ? "bg-accent" : "hover:bg-accent/60",
                  c.verdict === "blocked" && "bg-danger-soft",
                )}
                aria-label={`${td(c.structureName)} ${c.metric}: ${t("review.colCandidate")} ${fmt(c.candidateValueGy)} — ${c.objective}. ${t(`verdict.${c.verdict}` as never)}`}
              >
                <span role="cell" className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{td(c.structureName)}</span>
                  <span className="text-[11px] text-muted-foreground">{c.metric}</span>
                  {c.relatesTo && (
                    <Link2
                      className="ml-1.5 inline h-3 w-3 align-[-2px] text-status-warn"
                      aria-label="Linked trade-off constraint"
                    />
                  )}
                </span>
                <span role="cell" className="num text-end text-[13px]">
                  {fmt(c.candidateValueGy)}
                  {delta !== undefined && Math.abs(delta) >= 0.05 && (
                    <span
                      className={cn(
                        "ml-1.5 inline-flex items-center text-[10px]",
                        c.metric === "D95%" === true
                          ? delta > 0 ? "text-status-ok" : "text-status-danger"
                          : delta > 0 ? "text-status-warn" : "text-status-ok",
                      )}
                    >
                      <ArrowUpRight className={cn("h-3 w-3", delta < 0 && "rotate-90")} aria-hidden />
                      {Math.abs(delta).toFixed(1)}
                    </span>
                  )}
                </span>
                <span role="cell" className="num text-end text-xs text-muted-foreground">{c.objective}</span>
                <span role="cell" className="flex justify-end"><VerdictBadge verdict={c.verdict} /></span>
              </button>
              {(highlighted || selected) && c.rationale && (
                <p className="border-b border-border/70 bg-background/60 px-4 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  {c.rationale}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function fmt(v: number): string {
  // V40Gy is a percentage metric; keep one decimal for all readouts
  return `${v.toFixed(1)}${""}`;
}

export function mapNameToId(name: string): string | null {
  switch (name) {
    case "PTV": return "ptv";
    case "Brainstem": return "brainstem";
    case "Optic chiasm": return "chiasm";
    case "Optic nerves": return "nerve-l";
    case "Lens": return "lens-l";
    case "Normal brain − PTV": return "normalbrain";
    default: return null;
  }
}
