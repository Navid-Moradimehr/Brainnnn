"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  FileUp,
  ScanLine,
  Layers,
  Boxes,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProtocolTag } from "@/components/primitives/StatusBadge";
import { useCases } from "@/context/CaseContext";
import type { Modality } from "@/types";

type SeriesState = "idle" | "receiving" | "received" | "checked";

interface Slot {
  id: string;
  title: string;
  desc: string;
  icon: typeof FileUp;
  required: boolean;
  modality?: Modality;
}

const SLOTS: Slot[] = [
  { id: "ct", title: "Planning CT", desc: "RTIMAGE · head fixation, thin slices preferred", icon: ScanLine, required: true, modality: "CT" },
  { id: "mr", title: "T1c MRI", desc: "Registered or registration-ready series", icon: Layers, required: true, modality: "MR" },
  { id: "rtstruct", title: "RTSTRUCT — approved contours", desc: "Clinician-approved target and OAR set", icon: Boxes, required: true },
  { id: "rtdose", title: "Reference RTDOSE", desc: "Optional — existing plan dose for side-by-side review", icon: FileUp, required: false },
];

export function NewCaseClient() {
  const router = useRouter();
  const { createCase } = useCases();
  const [slots, setSlots] = useState<Record<string, SeriesState>>({ ct: "idle", mr: "idle", rtstruct: "idle", rtdose: "idle" });
  const [missingOar, setMissingOar] = useState(false);
  const [noticeAck, setNoticeAck] = useState(false);
  const [creating, setCreating] = useState(false);

  const receivedRequired = SLOTS.filter((s) => s.required).every((s) => slots[s.id] === "received" || slots[s.id] === "checked");
  const anyReceived = Object.values(slots).some((s) => s === "received" || s === "checked");

  function receive(slotId: string) {
    if (slots[slotId] !== "idle") return;
    setSlots((p) => ({ ...p, [slotId]: "receiving" }));
    window.setTimeout(() => {
      setSlots((p) => ({ ...p, [slotId]: "received" }));
      if (slotId === "rtdose") return;
      // simulate per-series checks completing
      window.setTimeout(() => setSlots((p) => ({ ...p, [slotId]: "checked" })), 900);
    }, 1100);
  }

  const checklist: Array<{ ok: boolean; warn?: boolean; label: string }> = useMemo(() => {
    if (!anyReceived) return [];
    return [
      { ok: slots.ct === "checked", label: "Planning CT received — 148 slices, 1.5 mm" },
      { ok: slots.mr === "checked", label: "T1c MRI detected — 176 slices, 1.0 mm" },
      { ok: slots.rtstruct === "checked", label: "RTSTRUCT detected — 12 structure ROIs read" },
      { ok: slots.rtstruct === "checked", label: "Required target structures found — GTV, CTV, PTV" },
      missingOar
        ? { ok: false, warn: true, label: "Missing OAR warning — optic chiasm contour incomplete (review-band)" }
        : { ok: slots.rtstruct === "checked", label: "Required OARs present — brainstem, optic apparatus, lenses" },
    ];
  }, [slots, missingOar, anyReceived]);

  function handleCreate() {
    setCreating(true);
    const id = createCase({
      diagnosis: "Glioblastoma, right frontal",
      missingOar,
    });
    router.push(`/cases/${id}/validation`);
  }

  return (
    <div className="min-h-[calc(100dvh-3rem)]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">New case — import</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Synthetic case label will be assigned on creation · no patient identifiers
            </p>
          </div>
          <ProtocolTag />
        </header>

        {/* upload slots */}
        <section aria-label="Series import" className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SLOTS.map((s) => {
            const st = slots[s.id];
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                disabled={st !== "idle"}
                onClick={() => receive(s.id)}
                aria-label={`Import ${s.title}`}
                className={
                  "group relative flex flex-col items-start gap-3 rounded-md border border-dashed p-5 text-left transition-colors " +
                  (st === "idle"
                    ? "border-input bg-card/70 hover:border-primary/50 hover:bg-accent cursor-pointer"
                    : st === "receiving"
                      ? "border-info/40 bg-info-soft"
                      : "border-ok/30 bg-ok-soft cursor-default")
                }
              >
                <span className="flex w-full items-center justify-between">
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                  {st === "idle" && <span className="text-label text-muted-foreground">Select files</span>}
                  {st === "receiving" && <Loader2 className="h-4 w-4 animate-spin text-status-info" aria-hidden />}
                  {(st === "received" || st === "checked") && <CheckCircle2 className="h-4 w-4 text-status-ok" aria-hidden />}
                </span>
                <span className="text-sm font-medium">{s.title}{!s.required && <span className="ml-1.5 text-muted-foreground">· optional</span>}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{s.desc}</span>
                {st === "received" && (
                  <span className="num text-[11px] text-status-info">Checking series integrity…</span>
                )}
              </button>
            );
          })}
        </section>

        {/* validation checklist */}
        <AnimatePresence>
          {checklist.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              aria-label="Import validation"
              className="mt-7 rounded-md border border-border bg-card p-5"
            >
              <h2 className="text-label text-muted-foreground">Import validation</h2>
              <ul className="mt-3 space-y-2.5">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm">
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-status-ok" aria-hidden />
                    ) : item.warn ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-status-warn" aria-hidden />
                    ) : (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                    )}
                    <span className={item.ok ? "" : item.warn ? "text-status-warn" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* mock scenario toggle */}
              <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={missingOar}
                  onChange={(e) => setMissingOar(e.target.checked)}
                  className="accent-[#e2a33e]"
                />
                Simulate missing OAR contour scenario
              </label>
            </motion.section>
          )}
        </AnimatePresence>

        {/* protocol + de-id notice */}
        <section aria-label="Protocol and research notice" className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-md border border-border bg-card p-5">
            <h2 className="text-label text-muted-foreground">Protocol selection</h2>
            <RadioGroup defaultValue="gbm60" className="mt-3 gap-3">
              <Label
                htmlFor="proto-gbm60"
                className="flex cursor-pointer items-start gap-3 rounded-sm border border-primary/40 bg-ok-soft p-3.5"
              >
                <RadioGroupItem id="proto-gbm60" value="gbm60" className="mt-0.5" />
                <span>
                  <span className="block text-sm font-medium">GBM · 60 Gy / 30 fx</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    VMAT · adult glioblastoma · the only protocol in this MVP
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="proto-none"
                className="flex cursor-not-allowed items-start gap-3 rounded-sm border border-border p-3.5 opacity-55"
              >
                <RadioGroupItem id="proto-none" value="other" disabled className="mt-0.5" />
                <span>
                  <span className="block text-sm font-medium">Other protocols</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Not available — separate protocols are introduced only with suitable data
                  </span>
                </span>
              </Label>
            </RadioGroup>
          </div>

          <div className="rounded-md border border-border bg-secondary p-5">
            <h2 className="text-label flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Research use notice
            </h2>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              Data must be de-identified before upload. Meridian is a research prototype:
              outputs are candidate forecasts for review, never deliverable plans.
            </p>
            <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={noticeAck} onChange={(e) => setNoticeAck(e.target.checked)} />
              I confirm the data is de-identified for research use
            </label>
          </div>
        </section>

        {/* actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button
            size="lg"
            disabled={!receivedRequired || !noticeAck || creating}
            onClick={handleCreate}
            className="gap-2"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Create case and continue to validation
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

