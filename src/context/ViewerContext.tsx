"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Plane = "axial" | "coronal" | "sagittal";
export type CompareMode = "candidate" | "reference" | "split";

export const PLANE_TOTAL_SLICES: Record<Plane, number> = {
  axial: 96,
  coronal: 88,
  sagittal: 84,
};

interface ViewerState {
  plane: Plane;
  sliceIndex: number;
  visibleIds: ReadonlySet<string>;
  selectedStructureId: string | null;
  compareMode: CompareMode;
  washOn: boolean;
  washLevel: number; // 0..1 opacity of dose colour wash
  isolinesOn: boolean;
}

interface ViewerActions {
  setPlane: (p: Plane) => void;
  stepSlice: (delta: number) => void;
  setSliceIndex: (i: number) => void;
  toggleVisible: (id: string) => void;
  showAll: (ids: string[]) => void;
  hideAll: () => void;
  select: (id: string | null) => void;
  setCompareMode: (m: CompareMode) => void;
  setWashOn: (v: boolean) => void;
  setWashLevel: (v: number) => void;
  setIsolinesOn: (v: boolean) => void;
  reset: (opts?: { defaultVisible?: string[] }) => void;
}

type ViewerContextValue = ViewerState & ViewerActions;

const DEFAULT_VISIBLE = ["gtv", "ctv", "ptv", "brainstem", "chiasm", "nerve-l", "nerve-r"];

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [plane, setPlane] = useState<Plane>("axial");
  const [sliceIndex, setSliceIndex] = useState(48);
  const [visibleIds, setVisibleIds] = useState<ReadonlySet<string>>(new Set(DEFAULT_VISIBLE));
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>("candidate");
  const [washOn, setWashOn] = useState(true);
  const [washLevel, setWashLevel] = useState(0.55);
  const [isolinesOn, setIsolinesOn] = useState(true);

  const stepSlice = useCallback((delta: number) => {
    setSliceIndex((i) =>
      Math.min(PLANE_TOTAL_SLICES[plane] - 1, Math.max(0, i + delta)),
    );
  }, [plane]);

  const toggleVisible = useCallback((id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback((opts?: { defaultVisible?: string[] }) => {
    setPlane("axial");
    setSliceIndex(48);
    setVisibleIds(new Set(opts?.defaultVisible ?? DEFAULT_VISIBLE));
    setSelectedStructureId(null);
    setCompareMode("candidate");
    setWashOn(true);
    setWashLevel(0.55);
    setIsolinesOn(true);
  }, []);

  const value = useMemo<ViewerContextValue>(
    () => ({
      plane,
      sliceIndex,
      visibleIds,
      selectedStructureId,
      compareMode,
      washOn,
      washLevel,
      isolinesOn,
      setPlane,
      stepSlice,
      setSliceIndex,
      toggleVisible,
      showAll: (ids) => setVisibleIds(new Set(ids)),
      hideAll: () => setVisibleIds(new Set()),
      select: setSelectedStructureId,
      setCompareMode,
      setWashOn,
      setWashLevel,
      setIsolinesOn,
      reset,
    }),
    [plane, sliceIndex, visibleIds, selectedStructureId, compareMode, washOn, washLevel, isolinesOn, stepSlice, toggleVisible, reset],
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerContextValue {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
