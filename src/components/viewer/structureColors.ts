/** Structure colour lookup shared by viewer, list, DVH and constraint table. */
export const STRUCTURE_COLORS: Record<string, string> = {
  gtv: "var(--struct-gtv)",
  ctv: "var(--struct-ctv)",
  ptv: "var(--struct-ptv)",
  brainstem: "var(--struct-brainstem)",
  chiasm: "var(--struct-chiasm)",
  "nerve-l": "var(--struct-nerves)",
  "nerve-r": "var(--struct-nerves)",
  "eye-l": "var(--struct-eyes)",
  "eye-r": "var(--struct-eyes)",
  "lens-l": "var(--struct-lens)",
  "lens-r": "var(--struct-lens)",
  normalbrain: "var(--struct-normalbrain)",
};

export function getStructureColor(id: string): string {
  return STRUCTURE_COLORS[id] ?? "#8b94a7";
}
