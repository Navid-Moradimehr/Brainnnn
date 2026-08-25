"use client";

import Link from "next/link";
import { Check, Lock, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Case } from "@/types";
import { STAGE_LABELS } from "@/types";
import { getStageStates } from "@/lib/workflow";

export function StageStepper({ kase }: { kase: Case }) {
  const states = getStageStates(kase);
  return (
    <nav aria-label="Workflow stages" className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
      {states.map((s, i) => {
        const href = `/cases/${kase.id}${s.stage === "import" ? "" : `/${s.stage}`}`;
        const clickable = s.unlocked || s.done;
        return (
          <div key={s.stage} className="flex items-center">
            {i > 0 && <span aria-hidden className="mx-1 h-px w-4 bg-border" />}
            <Link
              href={href}
              aria-current={s.current ? "step" : undefined}
              aria-disabled={!clickable}
              onClick={(e) => !clickable && e.preventDefault()}
              className={cn(
                "group flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] font-medium tracking-wide whitespace-nowrap",
                s.current
                  ? s.flagged
                    ? "bg-warn-soft text-status-warn"
                    : "bg-ok-soft text-status-ok"
                  : s.done
                    ? "text-muted-foreground hover:text-foreground"
                    : clickable
                      ? "text-muted-foreground hover:text-foreground"
                      : "cursor-not-allowed text-muted-foreground/45",
              )}
            >
              {s.done ? (
                <Check className="h-3 w-3 text-status-ok" aria-hidden />
              ) : s.flagged ? (
                <AlertTriangle className="h-3 w-3" aria-hidden />
              ) : clickable ? (
                <Circle className="h-3 w-3 opacity-60" aria-hidden />
              ) : (
                <Lock className="h-3 w-3" aria-hidden />
              )}
              {STAGE_LABELS[s.stage]}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
