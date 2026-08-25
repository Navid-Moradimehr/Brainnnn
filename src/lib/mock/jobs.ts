import type { JobStage } from "@/types";

/** Stage templates for the "Generate candidate" job screen. */
export const GENERATION_STAGES: JobStage[] = [
  {
    id: "validate",
    label: "Validating inputs",
    detail: "Series presence, contour completeness, protocol match",
    state: "pending",
    durationMs: 2600,
  },
  {
    id: "register",
    label: "Registering images",
    detail: "T1c MRI → planning CT rigid + refinement QC",
    state: "pending",
    durationMs: 3400,
  },
  {
    id: "structures",
    label: "Preparing structure maps",
    detail: "Rasterising approved contours to dose grid",
    state: "pending",
    durationMs: 2400,
  },
  {
    id: "predict",
    label: "Estimating achievable dose",
    detail: "Research model — achievable 3D dose forecast for this anatomy",
    state: "pending",
    durationMs: 5200,
  },
  {
    id: "constraints",
    label: "Evaluating constraints",
    detail: "Protocol metrics, trade-off scan, verdict assignment",
    state: "pending",
    durationMs: 3000,
  },
  {
    id: "package",
    label: "Preparing review package",
    detail: "DVH curves, candidate overlays, audit entries",
    state: "pending",
    durationMs: 2200,
  },
];
