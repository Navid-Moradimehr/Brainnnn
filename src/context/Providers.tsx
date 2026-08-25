"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { CaseProvider } from "./CaseContext";
import { ViewerProvider } from "./ViewerContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CaseProvider>
        <ViewerProvider>{children}</ViewerProvider>
      </CaseProvider>
    </ThemeProvider>
  );
}
