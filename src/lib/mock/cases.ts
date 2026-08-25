import type { AuditEvent, Case, ImagingSeries } from "@/types";
import { GBM_PROTOCOL } from "./protocol";
import { makeStructures } from "./structures";
import { buildConstraintEvaluations, buildDvhCurves } from "./dvh";
import type { CandidatePlan } from "@/types";

const prescription: Case["prescription"] = {
  protocolId: GBM_PROTOCOL.id,
  totalDoseGy: 60,
  fractions: 30,
  dosePerFractionGy: 2,
  technique: "VMAT",
  machineTemplate: "SY-MERC-01 · 6 MV FFF · dual-arc VMAT",
};

function imaging241(): ImagingSeries[] {
  return [
    { id: "ct-0241", modality: "CT", label: "CT_PLN", description: "Planning CT, head fixation", sliceCount: 148, sliceThicknessMm: 1.5, receivedAt: "2026-08-19T08:41:00Z", status: "validated" },
    { id: "mr-0241", modality: "MR", label: "MR_T1c_DEF", description: "T1c MRI, registered to CT", sliceCount: 176, sliceThicknessMm: 1.0, receivedAt: "2026-08-19T09:02:00Z", status: "validated", registrationConfidence: 0.94 },
  ];
}

function imaging198(): ImagingSeries[] {
  return [
    { id: "ct-0198", modality: "CT", label: "CT_PLN", description: "Planning CT, head fixation", sliceCount: 141, sliceThicknessMm: 2.0, receivedAt: "2026-08-21T14:12:00Z", status: "warning" },
    { id: "mr-0198", modality: "MR", label: "MR_T1c_DEF", description: "T1c MRI, registration suspect near vertex", sliceCount: 168, sliceThicknessMm: 1.2, receivedAt: "2026-08-21T14:30:00Z", status: "warning", registrationConfidence: 0.71 },
  ];
}

function imaging177(): ImagingSeries[] {
  return [
    { id: "ct-0177", modality: "CT", label: "CT_PLN", description: "Planning CT, head fixation", sliceCount: 152, sliceThicknessMm: 1.5, receivedAt: "2026-07-28T10:05:00Z", status: "validated" },
    { id: "mr-0177", modality: "MR", label: "MR_T1c_DEF", description: "T1c MRI, registered to CT", sliceCount: 180, sliceThicknessMm: 1.0, receivedAt: "2026-07-28T10:22:00Z", status: "validated", registrationConfidence: 0.96 },
  ];
}

function audit(events: Array<[string, string, string, AuditEvent["severity"]]>): AuditEvent[] {
  return events.map(([timestamp, actor, action, severity], i) => ({
    id: `ae-${i}-${timestamp.slice(0, 10)}`,
    timestamp,
    actor,
    action,
    detail: undefined,
    severity,
  }));
}

const candidatePlan241: CandidatePlan = {
  id: "cand-0241-a",
  caseId: "GBM-0241",
  createdAt: "2026-08-23T16:20:00Z",
  label: "research-candidate-dose-forecast",
  summary:
    "Achievable-dose forecast prioritising PTV coverage. Left optic nerve driven to 52.4 Gy (review band) in exchange for a 1.7 Gy D95 gain over the reference plan.",
  metrics: { ptvD95Gy: 58.1, conformityIndex: 0.87, homogeneityIndex: 0.94, normalBrainV40Pct: 31.8 },
  constraints: buildConstraintEvaluations(),
  dvh: buildDvhCurves("GBM-0241", "candidate"),
};

export const CASES: Case[] = [
  {
    id: "GBM-0241",
    createdAt: "2026-08-19T08:35:00Z",
    updatedAt: "2026-08-23T16:20:00Z",
    status: "ready",
    diagnosis: "Glioblastoma, right frontal",
    prescription,
    imaging: imaging241(),
    structures: makeStructures({
      gtv: { approvedBy: "Dr. E. Varga", approvedAt: "2026-08-22T11:05:00Z" },
      ctv: { approvedBy: "Dr. E. Varga", approvedAt: "2026-08-22T11:06:00Z" },
      ptv: { approvedBy: "Dr. E. Varga", approvedAt: "2026-08-22T11:07:00Z", note: "3 mm expansion confirmed." },
    }),
    registrationDecision: "approved",
    registrationWarnings: [],
    contoursApproved: true,
    intentConfirmed: true,
    candidatePlan: candidatePlan241,
    auditTrail: audit([
      ["2026-08-19T08:41:00Z", "system", "Planning CT imported (CT_PLN, 148 slices)", "info"],
      ["2026-08-19T09:02:00Z", "system", "T1c MRI imported and registered to CT (conf. 0.94)", "success"],
      ["2026-08-20T09:15:00Z", "R. Okafor", "Registration QC approved", "success"],
      ["2026-08-22T11:07:00Z", "Dr. E. Varga", "Target volumes GTV/CTV/PTV approved", "success"],
      ["2026-08-23T16:20:00Z", "system", "Research candidate dose forecast generated (cand-0241-a)", "success"],
    ]),
  },
  {
    id: "GBM-0198",
    createdAt: "2026-08-21T14:08:00Z",
    updatedAt: "2026-08-21T15:47:00Z",
    status: "data-review",
    diagnosis: "Glioblastoma, left temporal",
    prescription,
    imaging: imaging198(),
    structures: makeStructures(
      Object.fromEntries(
        makeStructures().map((s) => [s.id, { approvedBy: undefined, approvedAt: undefined }]),
      ) as never,
    ),
    registrationDecision: "pending",
    registrationWarnings: [
      "MRI-to-CT registration requires review — confidence 0.71 below threshold 0.85 near vertex slices.",
      "CT slice thickness 2.0 mm exceeds protocol preference of ≤ 1.5 mm; acceptable with review.",
    ],
    contoursApproved: false,
    intentConfirmed: false,
    auditTrail: audit([
      ["2026-08-21T14:12:00Z", "system", "Planning CT imported (CT_PLN, 141 slices)", "info"],
      ["2026-08-21T14:30:00Z", "system", "T1c MRI imported — registration confidence low", "warning"],
      ["2026-08-21T15:47:00Z", "system", "Automatic QC flagged vertex region mismatch", "warning"],
    ]),
  },
  {
    id: "GBM-0177",
    createdAt: "2026-07-28T10:00:00Z",
    updatedAt: "2026-08-04T13:26:00Z",
    status: "exported",
    diagnosis: "Glioblastoma, right parietal",
    prescription,
    imaging: imaging177(),
    structures: makeStructures({
      chiasm: { completenessPct: 100, note: "Chiasm contour verified on fused series." },
    }),
    registrationDecision: "approved",
    registrationWarnings: [],
    contoursApproved: true,
    intentConfirmed: true,
    candidatePlan: {
      id: "cand-0177-a",
      caseId: "GBM-0177",
      createdAt: "2026-08-01T09:44:00Z",
      label: "research-candidate-dose-forecast",
      summary: "Balanced forecast; all constraints passing at export time.",
      metrics: { ptvD95Gy: 57.6, conformityIndex: 0.84, homogeneityIndex: 0.93, normalBrainV40Pct: 29.4 },
      constraints: buildConstraintEvaluations().map((c) => ({ ...c, verdict: "pass" as const })),
      dvh: buildDvhCurves("GBM-0177", "candidate"),
    },
    reviewDecision: {
      outcome: "approved-for-tps-recalculation",
      by: "Dr. E. Varga + M. Lindqvist (physics)",
      at: "2026-08-03T14:02:00Z",
      notes: "Approved for local TPS recalculation. QA pending after recalculation.",
    },
    auditTrail: audit([
      ["2026-07-28T10:05:00Z", "system", "Planning CT imported (CT_PLN, 152 slices)", "info"],
      ["2026-07-28T10:22:00Z", "system", "T1c MRI registered to CT (conf. 0.96)", "success"],
      ["2026-07-30T09:31:00Z", "Dr. E. Varga", "Contours approved", "success"],
      ["2026-08-01T09:44:00Z", "system", "Candidate forecast generated (cand-0177-a)", "success"],
      ["2026-08-03T14:02:00Z", "Dr. E. Varga + M. Lindqvist (physics)", "Review decision recorded — approved for TPS recalculation", "success"],
      ["2026-08-04T13:26:00Z", "M. Lindqvist (physics)", "Export package prepared (report + JSON)", "info"],
    ]),
  },
];

export function getCase(id: string): Case | undefined {
  return CASES.find((c) => c.id.toLowerCase() === id.toLowerCase());
}
