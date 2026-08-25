import type { Metadata } from "next";
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
