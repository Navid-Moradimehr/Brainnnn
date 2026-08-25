import type { Metadata } from "next";
import { CASES } from "@/lib/mock/cases";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }));
}

import { ValidationClient } from "./validation-client";

export const metadata: Metadata = { title: "Validation" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ValidationClient caseId={id} />;
}
