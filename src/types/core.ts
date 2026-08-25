/**
 * Meridian domain models — workflow, protocol, imaging, structures.
 * Shapes mirror the future FastAPI DTO contract (vault note 05).
 * A real backend replaces src/lib/mock without touching UI components.
 */

export type CaseStatus =
  | "draft"
  | "data-review"
  | "ready"
  | "generating"
  | "review-required"
  | "exported"
  | "blocked";

export const WORKFLOW_STAGES = [
  "import",
  "validation",
  "contours",
  "intent",
  "generate",
  "review",
  "export",
] as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export const STAGE_LABELS: Record<WorkflowStage, string> = {
  import: "Import",
  validation: "Validation",
  contours: "Contours",
  intent: "Intent",
  generate: "Generate",
  review: "Review",
  export: "Export",
};

/* ── Protocol & prescription ────────────────────────────── */

export type Technique = "VMAT";

export interface ProtocolConstraintDef {
  id: string;
  structureName: string;
  /** e.g. "D95%", "Dmax", "V40Gy" */
  metric: string;
  /** human-readable objective, e.g. ">= 57.0 Gy" */
  objective: string;
  comparison: ">=" | "<=";
  limitValueGy: number;
  /** "critical" breaches block the case; "review-band" flags amber */
  criticality: "critical" | "review-band";
  basis: string;
}

export interface Protocol {
  id: string;
  label: string;
  site: string;
  totalDoseGy: number;
  fractions: number;
  dosePerFractionGy: number;
  technique: Technique;
  ptvCoverageObjective: string;
  oarPriorities: string[];
  constraints: ProtocolConstraintDef[];
}

export interface Prescription {
  protocolId: string;
  totalDoseGy: number;
  fractions: number;
  dosePerFractionGy: number;
  technique: Technique;
  machineTemplate: string;
}

/* ── Imaging ────────────────────────────────────────────── */

export type Modality = "CT" | "MR";

export interface ImagingSeries {
  id: string;
  modality: Modality;
  /** synthetic series label, e.g. "CT_PLN" */
  label: string;
  description: string;
  sliceCount: number;
  sliceThicknessMm: number;
  receivedAt: string;
  status: "received" | "validated" | "warning";
  /** MR-to-CT registration confidence, 0..1 */
  registrationConfidence?: number;
}

export type RegistrationDecision =
  | "pending"
  | "approved"
  | "adjust"
  | "returned";

/* ── Structures ─────────────────────────────────────────── */

export type StructureKind = "target" | "oar";

export interface Structure {
  id: string;
  name: string;
  shortLabel: string;
  kind: StructureKind;
  /** CSS variable holding the structure colour, e.g. "--struct-ptv" */
  colorVar: string;
  volumeCc: number;
  completenessPct: number;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
}
