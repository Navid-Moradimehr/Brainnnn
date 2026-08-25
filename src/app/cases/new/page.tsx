import type { Metadata } from "next";
import { NewCaseClient } from "./new-case-client";

export const metadata: Metadata = {
  title: "New Case",
};

export default function Page() {
  return <NewCaseClient />;
}
