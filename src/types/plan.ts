/**
 * Meridian domain models — constraints, DVH, candidate plans,
 * audit events and generation jobs.
 */

export type Verdict = "pass" | "review" | "blocked" | "not-evaluated";

import type {
  CaseStatus,
  ImagingSeries,
  Prescription,
  RegistrationDecision,
  Structure,
} from "./core";

export interface ConstraintEvaluation {
  defId: string;
  structureName: string;
  metric: string;
  objective: string;
  candidateValueGy: number;
  referenceValueGy?: number;
  verdict: Verdict;
  /** one-line reasoning rendered under the verdict */
  rationale?: string;
  /** defIds of related trade-off constraints, lets the UI connect stories */
  relatesTo?: string[];
}

export interface DvhPoint {
  doseGy: number;
  /** cumulative relative volume, % */
  volumePct: number;
}

export interface DvhCurve {
  structureId: string;
  points: DvhPoint[];
}

/* ── Candidate plan ─────────────────────────────────────── */

export interface CandidatePlan {
  id: string;
  caseId: string;
  createdAt: string;
  /** always a research forecast, never a deliverable plan */
  label: "research-candidate-dose-forecast";
  summary: string;
  metrics: {
    ptvD95Gy: number;
    conformityIndex: number;
    homogeneityIndex: number;
    normalBrainV40Pct: number;
  };
  constraints: ConstraintEvaluation[];
  dvh: DvhCurve[];
}

/* ── Audit ──────────────────────────────────────────────── */

export type AuditSeverity = "info" | "success" | "warning";

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
  severity: AuditSeverity;
}

/* ── Generation jobs ────────────────────────────────────── */

export type JobStageState = "pending" | "active" | "done" | "failed";

export interface JobStage {
  id: string;
  label: string;
  state: JobStageState;
  detail?: string;
  /** simulated duration in ms for the prototype progress animation */
  durationMs: number;
}

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface GenerationJob {
  id: string;
  caseId: string;
  status: JobStatus;
  stages: JobStage[];
  startedAt?: string;
  completedAt?: string;
}

/* ── Case aggregate ─────────────────────────────────────── */

export interface Case {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  diagnosis: string;
  prescription: Prescription;
  imaging: ImagingSeries[];
  structures: Structure[];
  registrationDecision: RegistrationDecision;
  registrationWarnings: string[];
  contoursApproved: boolean;
  intentConfirmed: boolean;
  candidatePlan?: CandidatePlan;
  reviewDecision?: {
    outcome: "approved-for-tps-recalculation" | "revisions-required";
    by: string;
    at: string;
    notes: string;
  };
  auditTrail: AuditEvent[];
}
