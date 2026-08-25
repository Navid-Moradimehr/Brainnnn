import type { Protocol } from "@/types";

/**
 * The single MVP protocol: adult glioblastoma, 60 Gy in 30 fractions.
 * Values are literature-plausible synthetic placeholders, not validated
 * clinical limits (see vault note "06 Data and Model Assumptions").
 */
export const GBM_PROTOCOL: Protocol = {
  id: "gbm-60gy-30fx",
  label: "GBM · 60 Gy / 30 fx",
  site: "Brain — supratentorial",
  totalDoseGy: 60,
  fractions: 30,
  dosePerFractionGy: 2,
  technique: "VMAT",
  ptvCoverageObjective: "D95% ≥ 57.0 Gy (95% of prescription)",
  oarPriorities: [
    "Brainstem — critical serial organ",
    "Optic apparatus — chiasm prioritised over nerves",
    "Lenses — as low as reasonably achievable",
    "Normal brain — minimise high-dose volume",
  ],
  constraints: [
    {
      id: "c-ptv-d95",
      structureName: "PTV",
      metric: "D95%",
      objective: "≥ 57.0 Gy",
      comparison: ">=",
      limitValueGy: 57,
      criticality: "critical",
      basis: "Protocol coverage objective for PTV7020",
    },
    {
      id: "c-bs-max",
      structureName: "Brainstem",
      metric: "Dmax",
      objective: "< 54.0 Gy",
      comparison: "<=",
      limitValueGy: 54,
      criticality: "critical",
      basis: "Critical serial structure hard limit",
    },
    {
      id: "c-chiasm-max",
      structureName: "Optic chiasm",
      metric: "Dmax",
      objective: "< 54.0 Gy",
      comparison: "<=",
      limitValueGy: 54,
      criticality: "critical",
      basis: "Optic apparatus hard limit",
    },
    {
      id: "c-nerves-max",
      structureName: "Optic nerves",
      metric: "Dmax",
      objective: "< 54.0 Gy",
      comparison: "<=",
      limitValueGy: 54,
      criticality: "review-band",
      basis: "Flagged within 2 Gy of limit for physicist review",
    },
    {
      id: "c-lens-max",
      structureName: "Lens",
      metric: "Dmax",
      objective: "< 7.0 Gy",
      comparison: "<=",
      limitValueGy: 7,
      criticality: "review-band",
      basis: "ALARA objective for lenses",
    },
    {
      id: "c-nb-v40",
      structureName: "Normal brain − PTV",
      metric: "V40Gy",
      objective: "< 33%",
      comparison: "<=",
      limitValueGy: 40,
      criticality: "review-band",
      basis: "High-dose spillage band, % volume",
    },
  ],
};
