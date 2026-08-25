"use client";

import dynamic from "next/dynamic";

/** Lazy-loaded Remotion player — keeps the remotion bundle out of the main chunk. */
export const DoseBloomPlayer = dynamic(
  () => import("./DoseBloomPlayerInner").then((m) => m.DoseBloomPlayerInner),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[8/5] w-full animate-pulse rounded-md border border-border bg-secondary" aria-hidden />
    ),
  },
);
