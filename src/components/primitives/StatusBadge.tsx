"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import type { CaseStatus } from "@/types";

const STATUS_CLS: Record<CaseStatus, { cls: string; dot: string }> = {
  draft: { cls: "text-muted-foreground border-border bg-muted", dot: "bg-muted-foreground" },
  "data-review": { cls: "text-status-warn border-warn/30 bg-warn-soft", dot: "bg-status-warn" },
  ready: { cls: "text-status-ok border-ok/25 bg-ok-soft", dot: "bg-status-ok" },
  generating: { cls: "text-status-info border-info/30 bg-info-soft", dot: "bg-status-info animate-pulse" },
  "review-required": { cls: "text-status-warn border-warn/30 bg-warn-soft", dot: "bg-status-warn" },
  exported: { cls: "text-muted-foreground border-border bg-secondary", dot: "bg-muted-foreground" },
  blocked: { cls: "text-status-danger border-danger/40 bg-danger-soft", dot: "bg-status-danger" },
};

export function StatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  const { t } = useI18n();
  const meta = STATUS_CLS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium",
        meta.cls,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {t(`status.${status}`)}
    </span>
  );
}

export function ProtocolTag({ label, className }: { label?: string; className?: string }) {
  const { t } = useI18n();
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
      {label ?? t("protocol.filter")}
    </span>
  );
}
