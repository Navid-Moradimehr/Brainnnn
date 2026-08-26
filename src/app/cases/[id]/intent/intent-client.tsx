"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CircleDot, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProtocolTag } from "@/components/primitives/StatusBadge";
import { BeamArc } from "@/components/motion/BeamArc";
import { useCases } from "@/context/CaseContext";
import { useI18n } from "@/i18n/I18nProvider";

export function IntentClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { getCase, confirmIntent, setActiveCaseId } = useCases();
  const { t, td } = useI18n();
  const kase = getCase(caseId);
  const [priorities, setPriorities] = useState<Record<string, boolean>>({});
  const [dosePerFx, setDosePerFx] = useState("2.00");

  useEffect(() => setActiveCaseId(caseId), [caseId, setActiveCaseId]);

  if (!kase) {
    return (
      <div className="p-10 text-sm text-muted-foreground">
        Case not found. <Link className="text-status-ok underline" href="/">Back to dashboard</Link>
      </div>
    );
  }

  const locked = kase.intentConfirmed;

  function togglePriority(key: string) {
    setPriorities((p) => ({ ...p, [key]: p[key] ?? true ? false : true }));
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label text-muted-foreground">{t("intent.title")}</p>
            <h1 className="num mt-1 text-xl font-semibold tracking-tight">{kase.id}</h1>
          </div>
          <ProtocolTag label={t("protocol.tag")} />
        </header>

        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* form column */}
          <section aria-label="Intent fields" className="space-y-5">
            <Field label={t("intent.diagnosis")}>
              <Input readOnly value={kase.diagnosis} className="num bg-secondary/70" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t("intent.prescription")}>
                <Input readOnly value={t("protocol.tag")} className="num bg-secondary/70" />
              </Field>
              <Field label={t("intent.dosePerFraction")}>
                <Input
                  value={dosePerFx}
                  onChange={(e) => setDosePerFx(e.target.value)}
                  readOnly={locked}
                  inputMode="decimal"
                  className="num"
                  aria-describedby="dpf-hint"
                />
                <p id="dpf-hint" className="mt-1.5 text-[11px] text-muted-foreground">
                  {t("intent.dpfHint")}
                </p>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t("intent.technique")}>
                <Select defaultValue="vmat" disabled={locked}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vmat">VMAT</SelectItem>
                    <SelectItem value="imrt" disabled>{t("intent.techniqueImrt")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("intent.machine")}>
                <Select defaultValue={td(kase.prescription.machineTemplate)} disabled={locked}>
                  <SelectTrigger className="num w-full text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={td(kase.prescription.machineTemplate)} className="num text-xs">
                      {td(kase.prescription.machineTemplate)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* coverage objectives */}
            <fieldset className="rounded-md border border-border bg-card p-4">
              <legend className="text-label px-1 text-muted-foreground">{t("intent.coverage")}</legend>
              <ul className="mt-2 space-y-2.5">
                {[
                  ["PTV D95%", "≥ 57.0 Gy", true],
                  ["PTV D2%", "≤ 63.0 Gy", true],
                  ["GTV D99%", "≥ 60.0 Gy", false],
                ].map(([label, obj, hard]) => (
                  <li key={label as string} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm">
                      {hard ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      ) : (
                        <CircleDot className="h-3.5 w-3.5 text-status-ok" aria-hidden />
                      )}
                      <span className="num">{label}</span>
                      {hard && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("intent.protocolLocked")}</span>}
                    </span>
                    <span className="num text-sm text-muted-foreground">{obj}</span>
                  </li>
                ))}
              </ul>
            </fieldset>

            {/* {t("intent.oarPriorities")} */}
            <fieldset className="rounded-md border border-border bg-card p-4">
              <legend className="text-label px-1 text-muted-foreground">{t("intent.oarPriorities")}</legend>
              <p className="mb-3 mt-1 text-xs text-muted-foreground">
                {t("intent.prioritiesHint")}
              </p>
              <ul className="space-y-2.5">
                {[td("Brainstem"), td("Optic chiasm"), td("Optic nerves"), td("Lenses")].map((oar) => (
                  <li key={oar} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{oar}</span>
                    <Switch
                      checked={priorities[oar] ?? true}
                      onCheckedChange={() => !locked && togglePriority(oar)}
                      aria-label={`${t("intent.prioritise")}: ${oar}`}
                    />
                  </li>
                ))}
              </ul>
            </fieldset>

            {!locked ? (
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                onClick={() => {
                  confirmIntent(caseId);
                  router.push(`/cases/${caseId}/generate`);
                }}
              >
                {t("intent.confirmBtn")}
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 rounded-md border border-ok/25 bg-ok-soft px-4 py-3 text-sm text-status-ok">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("intent.confirmed")}
              </div>
            )}
          </section>

          {/* summary column */}
          <aside aria-label={t("intent.summary")}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="sticky top-24 space-y-4"
            >
              <div className="panel-edge rounded-md border border-border bg-card p-5">
                <h2 className="text-label text-muted-foreground">{t("intent.summary")}</h2>
                <dl className="num mt-3 space-y-2.5 text-xs">
                  {[
                    [t("intent.site"), t("intent.siteValue")],
                    [t("intent.rx"), t("protocol.tag")],
                    [t("intent.technique"), t("intent.techniqueValue")],
                    [t("intent.machine"), t("intent.machineValue")],
                    [t("stages.contours"), kase.contoursApproved ? t("intent.contoursApproved") : t("intent.contoursPending")],
                    [t("intent.registration"), td(kase.registrationDecision)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="max-w-[170px] truncate text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* beam arc visual */}
              <div className="rounded-md border border-border bg-card p-5">
                <h2 className="text-label mb-1 text-muted-foreground">{t("intent.delivery")}</h2>
                <BeamArc />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {t("intent.deliveryCaption")}
                </p>
              </div>

              <p className="rounded-md border border-border bg-secondary p-3.5 text-[11px] leading-relaxed text-muted-foreground">
                {t("intent.noSettingsNote")}
              </p>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="block space-y-2">
      <span className="text-label text-muted-foreground">{label}</span>
      {children}
    </Label>
  );
}
