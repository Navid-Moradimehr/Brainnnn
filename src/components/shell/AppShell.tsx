"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  FlaskConical,
  BookOpenText,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCases } from "@/context/CaseContext";
import { StageStepper } from "./StageStepper";
import { DnaScrollbar } from "@/components/scrollbar/DnaScrollbar";

const RAIL = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "#cases", label: "Cases", icon: FolderOpen, match: () => false }, // expanded below
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [dark, setDark] = useState<boolean | null>(null);
  // read the resolved theme after hydration to avoid SSR mismatch
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setDark(resolvedTheme === "dark"));
    return () => window.cancelAnimationFrame(id);
  }, [resolvedTheme]);
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme (paper)" : "Dark theme (graphite)"}
      className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {dark === null ? (
        <Sun className="h-4 w-4 opacity-0" aria-hidden />
      ) : dark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cases, activeCase } = useCases();
  const caseMatch = pathname.match(/^\/cases\/([^/]+)/);
  const activeId = caseMatch?.[1] ?? null;
  const onCaseRoute = Boolean(caseMatch);
  const isNewCase = pathname === "/cases/new";

  return (
    <div className="flex min-h-dvh">
      {/* ── left rail ── */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-14 flex-col items-center border-r border-sidebar-border bg-sidebar py-4">
        <Link href="/" aria-label="Meridian home" className="mb-6 block">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="text-[var(--dna-a)]">
            <circle cx="13" cy="13" r="11.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.9" />
            <circle cx="13" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" strokeDasharray="3 2.2" />
            <circle cx="13" cy="13" r="3.2" fill="currentColor" />
          </svg>
        </Link>

        <nav className="flex flex-col items-center gap-1.5" aria-label="Primary">
          {RAIL.slice(0, 1).map((item) => (
            <RailButton key={item.href} {...item} active={item.match(pathname)} />
          ))}
        </nav>

        <div className="mt-5 flex flex-col items-center gap-1.5" aria-label="Recent cases">
          <span className="text-label mb-1 rotate-0 text-[8px] text-muted-foreground/60">CASES</span>
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}/review`}
              title={`${c.id} · ${c.diagnosis}`}
              className={cn(
                "num flex h-8 w-8 items-center justify-center rounded-sm border text-[9px] tracking-tight transition-colors",
                activeId === c.id
                  ? "border-primary/50 bg-ok-soft text-status-ok"
                  : "border-border bg-card/60 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {c.id.split("-")[1]}
            </Link>
          ))}
          <Link
            href="/cases/new"
            title="Create new case"
            aria-label="Create new case"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm border border-dashed transition-colors",
              isNewCase
                ? "border-primary/60 bg-ok-soft text-status-ok"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-status-ok",
            )}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-auto flex flex-col items-center gap-1.5">
          <Link
            href="/about"
            title="Scope & safety"
            aria-label="Scope and safety information"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground",
              pathname === "/about" && "bg-accent text-foreground",
            )}
          >
            <BookOpenText className="h-4 w-4" aria-hidden />
          </Link>
          <span
            title="Research build — not clinically approved"
            className="flex h-8 w-8 cursor-help items-center justify-center rounded-sm bg-warn-soft text-status-warn"
          >
            <FlaskConical className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </aside>

      {/* ── main column ── */}
      <div className="ml-14 flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex h-12 items-center gap-4 px-5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[15px] font-semibold tracking-tight">Meridian</span>
              <span className="text-label hidden text-muted-foreground md:inline">RT Planning Research</span>
            </div>
            <span className="rounded-sm border border-warn/35 bg-warn-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-status-warn">
              Research build · Not clinically approved
            </span>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <span className="num text-xs text-muted-foreground">R. Okafor · Physics</span>
            </div>
          </div>
          {onCaseRoute && activeCase && (
            <div className="border-t border-border/70 px-5 py-2">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="num text-sm font-medium text-foreground">{activeCase.id}</span>
                <span className="truncate text-xs text-muted-foreground">{activeCase.diagnosis}</span>
              </div>
              <StageStepper kase={activeCase} />
            </div>
          )}
        </header>
        <main className="flex-1">{children}</main>
      </div>

      {/* DNA page scrollbar (document scroll) */}
      <DnaScrollbar className="fixed inset-y-0 right-0 z-50" label="Page scrollbar" />
    </div>
  );
}

function RailButton({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-sm transition-colors",
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </Link>
  );
}
