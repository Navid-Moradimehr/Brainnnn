import { CheckCircle2, AlertTriangle, OctagonX, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/types";

const META: Record<
  Verdict,
  { label: string; icon: typeof CheckCircle2; cls: string } | null
> = {
  pass: { label: "Pass", icon: CheckCircle2, cls: "text-status-ok" },
  review: { label: "Review", icon: AlertTriangle, cls: "text-status-warn" },
  blocked: { label: "Blocked", icon: OctagonX, cls: "text-status-danger" },
  "not-evaluated": { label: "Pending", icon: CircleDashed, cls: "text-muted-foreground" },
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const meta = META[verdict];
  const Icon = meta!.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", meta!.cls, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta!.label}
      <span className="sr-only">{verdict === "blocked" ? "Safety-critical constraint breached" : ""}</span>
    </span>
  );
}
