"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { CaseProvider } from "./CaseContext";
import { ViewerProvider } from "./ViewerContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <CaseProvider>
          <ViewerProvider>{children}</ViewerProvider>
        </CaseProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
