import type { ConstraintEvaluation, DvhCurve, DvhPoint } from "@/types";

/**
 * Deterministic mock DVH curves. Analytic cumulative shapes per structure
 * class — good enough to read like real dose-volume data in charts.
 * A real backend replaces this with DVHs computed from the dose grid.
 */
export function buildDvhCurves(
  caseId: string,
  variant: "candidate" | "reference",
): DvhCurve[] {
  // Per-structure mean doses differ slightly between candidate and reference,
  // encoding the trade-off story (nerves up, coverage up).
  const shift = variant === "candidate" ? 1 : 0;
  const defs: Array<{
    id: string;
    dMean: number;
    dHigh?: number;
    slope: number;
    floor?: number;
  }> = [
    { id: "ptv", dMean: 59.6 + shift * 0.4, slope: 2.6, floor: 12 },
    { id: "ctv", dMean: 60.1 + shift * 0.3, slope: 2.9, floor: 6 },
    { id: "gtv", dMean: 60.9 + shift * 0.2, slope: 3.4, floor: 2 },
    { id: "brainstem", dMean: 30.5, slope: 7.5 },
    { id: "chiasm", dMean: 46.8 + shift * 1.1, slope: 9.0 },
    { id: "nerve-l", dMean: 49.9 + shift * 2.5, slope: 8.0 },
    { id: "nerve-r", dMean: 41.2 + shift * 0.4, slope: 8.5 },
    { id: "eye-l", dMean: 18.4 + shift * 0.6, slope: 10 },
    { id: "eye-r", dMean: 15.7 + shift * 0.2, slope: 10 },
    { id: "lens-l", dMean: 4.9 + shift * 0.2, slope: 14 },
    { id: "lens-r", dMean: 4.2, slope: 14 },
  ];

  return defs.map(({ id, dMean, slope, floor }) => {
    const points: DvhPoint[] = [];
    for (let dose = 0; dose <= 66; dose += 0.5) {
      const x = (dose - dMean) / slope;
      let v = 100 / (1 + Math.exp(x * 3));
      if (floor && dose > 40) {
        v = Math.max(v, Math.max(0, floor - (dose - 40) * 2.4));
      }
      v = Math.max(0, Math.min(100, v));
      if (dose === 0) v = 100;
      points.push({ doseGy: Number(dose.toFixed(1)), volumePct: Number(v.toFixed(2)) });
    }
    void caseId;
    return { structureId: id, points };
  });
}

/** Metric readouts used by the constraint table, derived from the same story. */
export function buildConstraintEvaluations(): ConstraintEvaluation[] {
  return [
    {
      defId: "c-ptv-d95",
      structureName: "PTV",
      metric: "D95%",
      objective: "≥ 57.0 Gy",
      candidateValueGy: 58.1,
      referenceValueGy: 56.4,
      verdict: "pass",
      rationale:
        "Candidate lifts coverage by 1.7 Gy vs reference — the gain that justifies near-limit optic nerve dose.",
      relatesTo: ["c-nerves-max"],
    },
    {
      defId: "c-bs-max",
      structureName: "Brainstem",
      metric: "Dmax",
      objective: "< 54.0 Gy",
      candidateValueGy: 41.6,
      referenceValueGy: 42.3,
      verdict: "pass",
      rationale: "Well inside limit; candidate slightly improves on reference.",
    },
    {
      defId: "c-chiasm-max",
      structureName: "Optic chiasm",
      metric: "Dmax",
      objective: "< 54.0 Gy",
      candidateValueGy: 48.9,
      referenceValueGy: 48.2,
      verdict: "pass",
      rationale: "Headroom of 5.1 Gy retained.",
    },
    {
      defId: "c-nerves-max",
      structureName: "Optic nerves",
      metric: "Dmax",
      objective: "< 54.0 Gy",
      candidateValueGy: 52.4,
      referenceValueGy: 48.7,
      verdict: "review",
      rationale:
        "Left nerve within 1.6 Gy of limit. Accepted trade-off against PTV coverage (see c-ptv-d95).",
      relatesTo: ["c-ptv-d95"],
    },
    {
      defId: "c-lens-max",
      structureName: "Lens",
      metric: "Dmax",
      objective: "< 7.0 Gy",
      candidateValueGy: 5.1,
      referenceValueGy: 4.9,
      verdict: "pass",
    },
    {
      defId: "c-nb-v40",
      structureName: "Normal brain − PTV",
      metric: "V40Gy",
      objective: "< 33%",
      candidateValueGy: 31.8,
      referenceValueGy: 31.1,
      verdict: "review",
      rationale:
        "High-dose spillage band rises with improved conformity; still inside protocol ceiling.",
    },
  ];
}
