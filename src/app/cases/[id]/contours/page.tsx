import type { Metadata } from "next";
import { CASES } from "@/lib/mock/cases";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }));
}

import { ContoursClient } from "./contours-client";

export const metadata: Metadata = { title: "Contour Review" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContoursClient caseId={id} />;
}
