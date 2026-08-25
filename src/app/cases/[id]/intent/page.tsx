import type { Metadata } from "next";
import { IntentClient } from "./intent-client";

export const metadata: Metadata = { title: "Plan Intent" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IntentClient caseId={id} />;
}
