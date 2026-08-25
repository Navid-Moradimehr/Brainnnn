import type { Metadata } from "next";
import { CASES } from "@/lib/mock/cases";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }));
}

import { GenerateClient } from "./generate-client";

export const metadata: Metadata = { title: "Generate Candidate" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GenerateClient caseId={id} />;
}
