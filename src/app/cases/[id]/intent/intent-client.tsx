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

export function IntentClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { getCase, confirmIntent, setActiveCaseId } = useCases();
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
            <p className="text-label text-muted-foreground">Plan intent — protocol driven</p>
            <h1 className="num mt-1 text-xl font-semibold tracking-tight">{kase.id}</h1>
          </div>
          <ProtocolTag />
        </header>

        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* form column */}
          <section aria-label="Intent fields" className="space-y-5">
            <Field label="Diagnosis">
              <Input readOnly value={kase.diagnosis} className="num bg-secondary/70" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Prescription">
                <Input readOnly value="60 Gy / 30 fx" className="num bg-secondary/70" />
              </Field>
              <Field label="Dose per fraction (Gy)">
                <Input
                  value={dosePerFx}
                  onChange={(e) => setDosePerFx(e.target.value)}
                  readOnly={locked}
                  inputMode="decimal"
                  className="num"
                  aria-describedby="dpf-hint"
                />
                <p id="dpf-hint" className="mt-1.5 text-[11px] text-muted-foreground">
                  Locked by protocol — deviations require protocol owner sign-off.
                </p>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Technique">
                <Select defaultValue="vmat" disabled={locked}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vmat">VMAT</SelectItem>
                    <SelectItem value="imrt" disabled>IMRT (not in protocol)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Machine template">
                <Select defaultValue={kase.prescription.machineTemplate} disabled={locked}>
                  <SelectTrigger className="num w-full text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={kase.prescription.machineTemplate} className="num text-xs">
                      {kase.prescription.machineTemplate}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* coverage objectives */}
            <fieldset className="rounded-md border border-border bg-card p-4">
              <legend className="text-label px-1 text-muted-foreground">Target coverage objectives</legend>
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
                      {hard && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">protocol</span>}
                    </span>
                    <span className="num text-sm text-muted-foreground">{obj}</span>
                  </li>
                ))}
              </ul>
            </fieldset>

            {/* OAR priorities */}
            <fieldset className="rounded-md border border-border bg-card p-4">
              <legend className="text-label px-1 text-muted-foreground">OAR priorities</legend>
              <p className="mb-3 mt-1 text-xs text-muted-foreground">
                Priority order guides the trade-off scan during candidate generation.
              </p>
              <ul className="space-y-2.5">
                {["Brainstem", "Optic chiasm", "Optic nerves", "Lenses"].map((oar) => (
                  <li key={oar} className="flex items-center justify-between gap-3">
                    <span className="text-sm">{oar}</span>
                    <Switch
                      checked={priorities[oar] ?? true}
                      onCheckedChange={() => !locked && togglePriority(oar)}
                      aria-label={`Prioritise ${oar}`}
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
                Confirm intent → prepare candidate generation
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 rounded-md border border-ok/25 bg-ok-soft px-4 py-3 text-sm text-status-ok">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Intent confirmed — continue to generation.
              </div>
            )}
          </section>

          {/* summary column */}
          <aside aria-label="Intent summary">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="sticky top-24 space-y-4"
            >
              <div className="panel-edge rounded-md border border-border bg-card p-5">
                <h2 className="text-label text-muted-foreground">Intent summary</h2>
                <dl className="num mt-3 space-y-2.5 text-xs">
                  {[
                    ["Site", "Brain · right frontal lesion"],
                    ["Rx", "60 Gy / 30 fx"],
                    ["Technique", "VMAT dual-arc"],
                    ["Machine", kase.prescription.machineTemplate.split(" · ")[0]],
                    ["Contours", kase.contoursApproved ? "approved" : "pending"],
                    ["Registration", kase.registrationDecision],
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
                <h2 className="text-label mb-1 text-muted-foreground">Delivery concept</h2>
                <BeamArc />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Two coplanar arcs, collimator 30°/330° — geometric illustration only.
                </p>
              </div>

              <p className="rounded-md border border-border bg-secondary p-3.5 text-[11px] leading-relaxed text-muted-foreground">
                This screen intentionally exposes no model or optimisation settings.
                Meridian is protocol-driven; the forecast engine runs behind the API boundary.
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
