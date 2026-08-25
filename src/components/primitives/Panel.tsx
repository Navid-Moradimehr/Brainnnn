import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  hint,
  actions,
  className,
}: {
  title: string;
  hint?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-label text-muted-foreground">{title}</h2>
        {hint && <p className="mt-0.5 text-[13px] text-foreground/80">{hint}</p>}
      </div>
      {actions}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "ok" | "warn" | "danger";
  icon?: ReactNode;
}) {
  const toneCls =
    tone === "ok"
      ? "text-status-ok"
      : tone === "warn"
        ? "text-status-warn"
        : tone === "danger"
          ? "text-status-danger"
          : "text-foreground";
  return (
    <div className="panel-edge rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-label text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className={cn("num mt-2 text-[26px] font-medium leading-none", toneCls)}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function SafetyGate({
  active,
  children,
}: {
  /** true = gate is blocking */
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3",
        active
          ? "border-danger/40 bg-danger-soft text-status-danger"
          : "border-ok/25 bg-ok-soft text-status-ok",
      )}
    >
      {children}
    </div>
  );
}
