"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Direction } from "radix-ui";
import { en, type Dict } from "./en";
import { fa } from "./fa";
import { dataFa } from "./data-fa";

export type Locale = "en" | "fa";

/** Dot-path union of every leaf in the English dictionary. */
type PathsOf<T> = T extends string
  ? ""
  : { [K in keyof T & string]: `${K}${PathsOf<T[K]> extends "" ? "" : "."}${PathsOf<T[K]>}` }[keyof T & string];

export type TranslationKey = PathsOf<Dict>;

const DICTS: Record<Locale, Dict> = { en, fa };

function resolve(dict: unknown, path: string): string {
  let node: unknown = dict;
  for (const seg of path.split(".")) {
    if (typeof node !== "object" || node === null) return path;
    node = (node as Record<string, unknown>)[seg];
  }
  return typeof node === "string" ? node : path;
}

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Translate mock-data strings (audit actions, diagnoses, …); falls back to the key. */
  td: (s: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // ?lang= deep link wins, then the saved preference (deferred past hydration)
    const id = window.requestAnimationFrame(() => {
      const fromUrl = new URLSearchParams(window.location.search).get("lang");
      if (fromUrl === "fa" || fromUrl === "en") {
        setLocaleState(fromUrl);
        return;
      }
      const saved = window.localStorage.getItem("locale");
      if (saved === "fa" || saved === "en") setLocaleState(saved);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "fa" ? "rtl" : "ltr";
    if (locale === "fa") {
      html.style.setProperty("--font-plex-sans", "var(--font-vazir)");
      html.style.setProperty("--font-vazir-active", "var(--font-vazir)");
    } else {
      html.style.removeProperty("--font-plex-sans");
      html.style.removeProperty("--font-vazir-active");
    }
    window.localStorage.setItem("locale", locale);
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let s = resolve(DICTS[locale], key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{${k}}`, String(v));
        }
      }
      return s;
    },
    [locale],
  );

  const td = useCallback(
    (s: string) => (locale === "fa" ? dataFa[s] ?? s : s),
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: locale === "fa" ? "rtl" : "ltr",
      setLocale: setLocaleState,
      t,
      td,
    }),
    [locale, t, td],
  );

  return (
    <Direction.DirectionProvider dir={locale === "fa" ? "rtl" : "ltr"}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </Direction.DirectionProvider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Locale-aware date/time formatting (Jalali calendar for Persian). */
export function formatDateTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleString(locale === "fa" ? "fa-IR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-GB", {
    day: "2-digit",
    month: "short",
  });
}
