"use client";

import { CheckCircle2, AlertTriangle, OctagonX, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import type { Verdict } from "@/types";

const META: Record<Verdict, { icon: typeof CheckCircle2; cls: string } | null> = {
  pass: { icon: CheckCircle2, cls: "text-status-ok" },
  review: { icon: AlertTriangle, cls: "text-status-warn" },
  blocked: { icon: OctagonX, cls: "text-status-danger" },
  "not-evaluated": { icon: CircleDashed, cls: "text-muted-foreground" },
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const { t } = useI18n();
  const meta = META[verdict];
  const Icon = meta!.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", meta!.cls, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {t(`verdict.${verdict}`)}
      <span className="sr-only">{verdict === "blocked" ? t("verdict.blockedSr") : ""}</span>
    </span>
  );
}
