import type { Metadata } from "next";
import { ReviewClient } from "./review-client";

export const metadata: Metadata = { title: "Plan Review" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewClient caseId={id} />;
}
