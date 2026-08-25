import type { Metadata } from "next";
import { CASES } from "@/lib/mock/cases";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }));
}

import { ExportClient } from "./export-client";

export const metadata: Metadata = { title: "Export & Audit" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExportClient caseId={id} />;
}
