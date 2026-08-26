"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  Undo2,
  ScanLine,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { RegistrationCompare } from "@/components/viewer/RegistrationCompare";
import { useCases } from "@/context/CaseContext";
import { useI18n, formatDate } from "@/i18n/I18nProvider";
import type { ImagingSeries } from "@/types";

export function ValidationClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { getCase, approveRegistration, returnToImport, setActiveCaseId } = useCases();
  const { t, td } = useI18n();
  const kase = getCase(caseId);
  const [sliceIndex, setSliceIndex] = useState(48);

  useEffect(() => setActiveCaseId(caseId), [caseId, setActiveCaseId]);

  if (!kase) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        Case not found. <Link className="text-status-ok underline" href="/">Back to dashboard</Link>
      </div>
    );
  }

  const ct = kase.imaging.find((s) => s.modality === "CT");
  const mr = kase.imaging.find((s) => s.modality === "MR");
  const confidence = mr?.registrationConfidence;
  const needsReview = kase.registrationDecision !== "approved" && (kase.registrationWarnings.length > 0 || (confidence !== undefined && confidence < 0.85));

  function decide(action: "approve" | "adjust" | "return") {
    if (action === "approve") {
      approveRegistration(caseId);
      router.push(`/cases/${caseId}/contours`);
    } else if (action === "return") {
      returnToImport(caseId);
      router.push("/cases/new");
    }
  }

    return (
    <div className="min-h-full">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label text-muted-foreground">{t("validation.title")}</p>
            <h1 className="num mt-1 text-xl font-semibold tracking-tight">{kase.id}</h1>
          </div>
          <StatusBadge status={kase.status} />
        </header>

        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          {/* left: series cards */}
          <section aria-label="Series" className="space-y-4">
            {[ct, mr].filter(Boolean).map((s) => (
              <SeriesCard key={s!.id} s={s!} />
            ))}

            {/* registration confidence */}
            <div className="rounded-md border border-border bg-card p-4">
              <h3 className="text-label text-muted-foreground">{t("validation.confidence")}</h3>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" role="presentation">
                  <motion.div
                    className={
                      "h-full rounded-full " +
                      (confidence === undefined
                        ? "bg-muted-foreground/40"
                        : confidence >= 0.85
                          ? "bg-status-ok"
                          : "bg-status-warn")
                    }
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((confidence ?? 0) * 100)}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className={"num text-sm " + (confidence !== undefined && confidence < 0.85 ? "text-status-warn" : "text-status-ok")}>
                  {confidence !== undefined ? confidence.toFixed(2) : "—"}
                </span>
              </div>
              {confidence !== undefined && confidence < 0.85 && (
                <p className="mt-2 text-xs text-status-warn">{t("validation.belowThreshold")}</p>
              )}
            </div>
          </section>

          {/* right: compare + warnings + actions */}
          <section aria-label="Registration comparison" className="space-y-6">
            <div className="rounded-md border border-border bg-card p-5">
              <RegistrationCompare sliceIndex={sliceIndex} />
              <label className="mt-4 block">
                <span className="text-label text-muted-foreground">{t("validation.scrub")}</span>
                <input
                  type="range"
                  min={20}
                  max={76}
                  value={sliceIndex}
                  onChange={(e) => setSliceIndex(Number(e.target.value))}
                  className="mt-2 w-full accent-[#1fc4ae]"
                  aria-label={t("validation.slicePosition")}
                />
              </label>
            </div>

            {kase.registrationWarnings.length > 0 && (
              <div className="rounded-md border border-warn/30 bg-warn-soft p-4" role="alert">
                <h3 className="flex items-center gap-2 text-sm font-medium text-status-warn">
                  <AlertTriangle className="h-4 w-4" aria-hidden /> {t("validation.warningsTitle")}
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {kase.registrationWarnings.map((w) => (
                    <li key={td(w)} className="text-[13px] leading-relaxed text-status-warn/90">{td(w)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
              <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                {needsReview
                  ? t("validation.reviewMsg")
                  : kase.registrationDecision === "approved"
                    ? t("validation.approvedMsg")
                    : t("validation.pendingMsg")}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => decide("return")}>
                  <Undo2 className="h-3.5 w-3.5" aria-hidden /> {t("validation.returnToImport")}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => decide("adjust")} disabled={kase.registrationDecision === "approved"}>
                  <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> {t("validation.adjust")}
                </Button>
                <Button size="sm" onClick={() => decide("approve")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("validation.approve")}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SeriesCard({ s }: { s: ImagingSeries }) {
  const { t, td, locale } = useI18n();
  const Icon = s.modality === "CT" ? ScanLine : Layers;
  const statusCls =
    s.status === "validated"
      ? "text-status-ok"
      : s.status === "warning"
        ? "text-status-warn"
        : "text-muted-foreground";
  return (
    <div className="panel-edge rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="num">{s.label}</span>
        </span>
        <span className={"text-[11px] " + statusCls}>{t(`validation.${s.status}` as never)}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{td(s.description)}</p>
      <dl className="num mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        <div><dt className="sr-only">{t("validation.slices")}</dt><dd>{s.sliceCount} {t("validation.slices")}</dd></div>
        <div><dt className="sr-only">{t("validation.thickness")}</dt><dd>{s.sliceThicknessMm} mm</dd></div>
        <div><dt className="sr-only">{t("validation.received")}</dt><dd>{formatDate(s.receivedAt, locale)}</dd></div>
      </dl>
    </div>
  );
}
