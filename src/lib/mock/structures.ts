import type { Structure } from "@/types";

/**
 * Canonical GBM structure set. Contour completeness/approval vary per case;
 * this factory returns the shared baseline for a fully contoured case.
 */
export function makeStructures(
  overrides?: Partial<Record<string, Partial<Structure>>>,
): Structure[] {
  const base: Structure[] = [
    { id: "gtv", name: "GTV", shortLabel: "GTV", kind: "target", colorVar: "--struct-gtv", volumeCc: 38.2, completenessPct: 100 },
    { id: "ctv", name: "CTV", shortLabel: "CTV", kind: "target", colorVar: "--struct-ctv", volumeCc: 96.7, completenessPct: 100 },
    { id: "ptv", name: "PTV", shortLabel: "PTV", kind: "target", colorVar: "--struct-ptv", volumeCc: 168.4, completenessPct: 100 },
    { id: "brainstem", name: "Brainstem", shortLabel: "BS", kind: "oar", colorVar: "--struct-brainstem", volumeCc: 24.1, completenessPct: 100 },
    { id: "chiasm", name: "Optic chiasm", shortLabel: "CH", kind: "oar", colorVar: "--struct-chiasm", volumeCc: 0.6, completenessPct: 100 },
    { id: "nerve-l", name: "Optic nerve L", shortLabel: "N-L", kind: "oar", colorVar: "--struct-nerves", volumeCc: 0.9, completenessPct: 100 },
    { id: "nerve-r", name: "Optic nerve R", shortLabel: "N-R", kind: "oar", colorVar: "--struct-nerves", volumeCc: 0.9, completenessPct: 100 },
    { id: "eye-l", name: "Eye L", shortLabel: "E-L", kind: "oar", colorVar: "--struct-eyes", volumeCc: 7.8, completenessPct: 100 },
    { id: "eye-r", name: "Eye R", shortLabel: "E-R", kind: "oar", colorVar: "--struct-eyes", volumeCc: 7.9, completenessPct: 100 },
    { id: "lens-l", name: "Lens L", shortLabel: "L-L", kind: "oar", colorVar: "--struct-lens", volumeCc: 0.2, completenessPct: 100 },
    { id: "lens-r", name: "Lens R", shortLabel: "L-R", kind: "oar", colorVar: "--struct-lens", volumeCc: 0.2, completenessPct: 100 },
    { id: "normalbrain", name: "Normal brain − PTV", shortLabel: "NB", kind: "oar", colorVar: "--struct-normalbrain", volumeCc: 1180.0, completenessPct: 100 },
  ];
  if (!overrides) return base;
  return base.map((s) => ({ ...s, ...(overrides[s.id] ?? {}) }));
}
