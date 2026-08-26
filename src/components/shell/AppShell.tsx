"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Plus,
  FlaskConical,
  BookOpenText,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCases } from "@/context/CaseContext";
import { useI18n } from "@/i18n/I18nProvider";
import { StageStepper } from "./StageStepper";
import { DnaScrollbar } from "@/components/scrollbar/DnaScrollbar";

function ThemeToggle() {
  const { t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setDark(resolvedTheme === "dark"));
    return () => window.cancelAnimationFrame(id);
  }, [resolvedTheme]);
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? t("shell.themeToLight") : t("shell.themeToDark")}
      title={dark ? t("shell.themeLight") : t("shell.themeDark")}
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

function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const target = locale === "en" ? "fa" : "en";
  return (
    <button
      type="button"
      onClick={() => setLocale(target)}
      aria-label={t("shell.langToggle")}
      title={t("shell.langToggle")}
      className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Languages className="h-[18px] w-[18px]" aria-hidden />
        <span className="num absolute -bottom-1 text-[8px] font-semibold uppercase leading-none">
          {target}
        </span>
      </span>
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cases, activeCase, setActiveCaseId } = useCases();
  const { t, td } = useI18n();
  const mainRef = useRef<HTMLElement | null>(null);
  const caseMatch = pathname.match(/^\/cases\/([^/]+)/);
  const activeId = caseMatch?.[1] ?? null;
  const onCaseRoute = Boolean(caseMatch);

  useEffect(() => {
    if (activeId) setActiveCaseId(activeId);
  }, [activeId, setActiveCaseId]);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ── left rail (start side; flips to the right in RTL) ── */}
      <aside className="fixed inset-y-0 start-0 z-40 flex w-14 flex-col items-center border-e border-sidebar-border bg-sidebar py-4">
        <Link href="/" aria-label={t("shell.home")} className="mb-6 block">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="text-[var(--dna-a)]">
            <circle cx="13" cy="13" r="11.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.9" />
            <circle cx="13" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" strokeDasharray="3 2.2" />
            <circle cx="13" cy="13" r="3.2" fill="currentColor" />
          </svg>
        </Link>

        <nav className="flex flex-col items-center gap-1.5" aria-label="Primary">
          <RailButton
            href="/"
            label={t("dashboard.title")}
            icon={LayoutDashboard}
            active={pathname === "/"}
          />
        </nav>

        <div className="mt-5 flex flex-col items-center gap-1.5" aria-label={t("shell.casesGroup")}>
          <span className="text-label mb-1 text-[8px] text-muted-foreground/60">{t("shell.casesGroup")}</span>
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
            title={t("shell.newCase")}
            aria-label={t("shell.newCase")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm border border-dashed transition-colors",
              pathname === "/cases/new"
                ? "border-primary/60 bg-ok-soft text-status-ok"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-status-ok",
            )}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* bottom of the rail: language, theme, research flag */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <LanguageToggle />
          <Link
            href="/about"
            title={t("shell.scopeSafety")}
            aria-label={t("shell.scopeSafety")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground",
              pathname === "/about" && "bg-accent text-foreground",
            )}
          >
            <BookOpenText className="h-4 w-4" aria-hidden />
          </Link>
          <span
            title={t("shell.researchFlag")}
            className="flex h-8 w-8 cursor-help items-center justify-center rounded-sm bg-warn-soft text-status-warn"
          >
            <FlaskConical className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </aside>

      {/* ── main column ── */}
      <div className="ms-14 flex min-w-0 flex-1 flex-col">
        <header className="z-30 border-b border-border bg-background">
          <div className="flex h-12 items-center gap-4 px-5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[15px] font-semibold tracking-tight">Meridian</span>
              <span className="text-label hidden text-muted-foreground md:inline">{t("shell.subtitle")}</span>
            </div>
            <span className="rounded-sm border border-warn/35 bg-warn-soft px-2 py-0.5 text-[10px] font-medium uppercase text-status-warn">
              {t("shell.researchBadge")}
            </span>
            <div className="ms-auto flex items-center gap-2">
              <ThemeToggle />
              <span className="num text-xs text-muted-foreground">{t("shell.user")}</span>
            </div>
          </div>
          {onCaseRoute && activeCase && (
            <div className="border-t border-border/70 px-5 py-2">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="num text-sm font-medium text-foreground">{activeCase.id}</span>
                <span className="truncate text-xs text-muted-foreground">{td(activeCase.diagnosis)}</span>
              </div>
              <StageStepper kase={activeCase} />
            </div>
          )}
        </header>

        {/* scroll region — the DNA page bar owns the end-side rail beside it */}
        <div className="relative flex min-h-0 flex-1">
          <main
            ref={mainRef}
            id="page-scroll"
            className="dna-scroll min-h-0 min-w-0 flex-1 overflow-y-auto"
            style={{ paddingInlineEnd: "var(--dna-bar-w)" }}
          >
            {children}
          </main>
          <DnaScrollbar
            target={mainRef}
            controls="page-scroll"
            className="absolute inset-y-0 end-0 z-50"
            label={t("common.pageScrollbar")}
          />
        </div>
      </div>
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