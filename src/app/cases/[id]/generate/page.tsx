import type { Metadata } from "next";
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
