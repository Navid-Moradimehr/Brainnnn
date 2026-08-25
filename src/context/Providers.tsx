"use client";

import type { ReactNode } from "react";
import { CaseProvider } from "./CaseContext";
import { ViewerProvider } from "./ViewerContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CaseProvider>
      <ViewerProvider>{children}</ViewerProvider>
    </CaseProvider>
  );
}
