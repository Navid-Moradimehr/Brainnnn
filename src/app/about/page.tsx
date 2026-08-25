import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, ShieldCheck, Database, Server } from "lucide-react";

export const metadata: Metadata = { title: "Scope & Safety" };

export default function AboutPage() {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-label text-muted-foreground">About</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Scope &amp; safety</h1>

        <div className="mt-6 rounded-md border border-warn/30 bg-warn-soft p-4" role="note">
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-status-warn">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Meridian is a research prototype for treatment-planning review. It is not a treatment
            planning system, holds no regulatory or clinical approval, and never produces a
            deliverable plan. Candidate dose outputs require recalculation in an approved local TPS,
            patient-specific QA, and clinician approval.
          </p>
        </div>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-status-ok" aria-hidden /> What is real vs mocked
            </h2>
            <p className="mt-2">
              All data in this build is synthetic: cases (GBM-0241/0198/0177), imaging (procedurally
              drawn phantom slices), DVH curves, constraint values, registration confidence and job
              progress. The workflow logic — gates between stages, verdicts, audit trail — is real
              application state that mirrors the intended backend contract.
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Server className="h-4 w-4 text-status-info" aria-hidden /> Intended architecture
            </h2>
            <p className="mt-2">
              Next.js app → API boundary → FastAPI DICOM/ML workers → Orthanc DICOMweb, PostgreSQL,
              object storage and an async job queue. No direct frontend database access; RBAC and
              immutable audit records enforced server-side; on-premise deployable.
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Database className="h-4 w-4 text-status-warn" aria-hidden /> Data handling
            </h2>
            <p className="mt-2">
              Only de-identified research data may enter the platform. This prototype contains no
              patient data whatsoever — all labels are synthetic.
            </p>
          </div>
        </section>

        <Link href="/" className="mt-10 inline-block text-sm text-status-ok underline underline-offset-4">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
