import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/types";

const STATUS_META: Record<
  CaseStatus,
  { label: string; cls: string; dot: string }
> = {
  draft: { label: "Draft", cls: "text-muted-foreground border-border bg-muted", dot: "bg-muted-foreground" },
  "data-review": { label: "Data Review", cls: "text-status-warn border-warn/30 bg-warn-soft", dot: "bg-status-warn" },
  ready: { label: "Ready for Review", cls: "text-status-ok border-ok/25 bg-ok-soft", dot: "bg-status-ok" },
  generating: { label: "Generating", cls: "text-status-info border-info/30 bg-info-soft", dot: "bg-status-info animate-pulse" },
  "review-required": { label: "Review Required", cls: "text-status-warn border-warn/30 bg-warn-soft", dot: "bg-status-warn" },
  exported: { label: "Exported", cls: "text-muted-foreground border-border bg-secondary", dot: "bg-muted-foreground" },
  blocked: { label: "Blocked", cls: "text-status-danger border-danger/40 bg-danger-soft", dot: "bg-status-danger" },
};

export function StatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        meta.cls,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function ProtocolTag({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-1 rounded-sm border border-border bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground",
        className,
      )}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="5" cy="5" r="1.6" fill="currentColor" />
      </svg>
      {label ?? "GBM · 60 Gy / 30 fx"}
    </span>
  );
}
