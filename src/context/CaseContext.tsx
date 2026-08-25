"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuditEvent, Case } from "@/types";
import { CASES, getCase as getMockCase } from "@/lib/mock/cases";

/**
 * CaseContext owns the case list and every consequential workflow action.
 * In production this becomes fetch/mutate calls against the FastAPI
 * boundary — the action names are the API contract.
 */
export interface CaseActions {
  approveRegistration: (caseId: string, actor?: string) => void;
  returnToImport: (caseId: string) => void;
  approveContours: (caseId: string, actor?: string) => void;
  confirmIntent: (caseId: string) => void;
  beginGeneration: (caseId: string) => void;
  completeGeneration: (caseId: string, candidatePlanId: string) => void;
  recordReviewDecision: (
    caseId: string,
    decision: {
      outcome: NonNullable<Case["reviewDecision"]>["outcome"];
      notes: string;
      by?: string;
    },
  ) => void;
  markExported: (caseId: string, what: string) => void;
  createCase: (init: { diagnosis: string; missingOar?: boolean }) => string;
}

interface CaseContextValue extends CaseActions {
  cases: Case[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  activeCase: Case | null;
  getCase: (id: string) => Case | undefined;
}

const CaseContext = createContext<CaseContextValue | null>(null);

function withEvent(c: Case, ev: Omit<AuditEvent, "id">): Case {
  const event: AuditEvent = { ...ev, id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
  return { ...c, updatedAt: new Date().toISOString(), auditTrail: [...c.auditTrail, event] };
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>(CASES);
  const [activeCaseId, setActiveCaseId] = useState<string | null>("GBM-0241");

  const update = useCallback((caseId: string, fn: (c: Case) => Case) => {
    setCases((prev) => prev.map((c) => (c.id === caseId ? fn(c) : c)));
  }, []);

  const now = () => new Date().toISOString();

  const actions = useMemo<CaseActions>(
    () => ({
      approveRegistration: (caseId, actor = "R. Okafor") =>
        update(caseId, (c) =>
          withEvent(
            { ...c, registrationDecision: "approved", status: c.status === "data-review" ? "ready" : c.status },
            { timestamp: now(), actor, action: "Registration QC approved", severity: "success" },
          ),
        ),
      returnToImport: (caseId) =>
        update(caseId, (c) =>
          withEvent(
            { ...c, registrationDecision: "returned", status: "draft" },
            { timestamp: now(), actor: "R. Okafor", action: "Returned to import for re-registration", severity: "warning" },
          ),
        ),
      approveContours: (caseId, actor = "Dr. E. Varga") => {
        const ts = now();
        update(caseId, (c) =>
          withEvent(
            {
              ...c,
              contoursApproved: true,
              structures: c.structures.map((s) => ({
                ...s,
                approvedBy: s.kind === "target" ? actor : s.approvedBy,
                approvedAt: s.kind === "target" ? ts : s.approvedAt,
              })),
            },
            { timestamp: ts, actor, action: "Clinician approved target and OAR contours", severity: "success" },
          ),
        );
      },
      confirmIntent: (caseId) =>
        update(caseId, (c) =>
          withEvent(
            { ...c, intentConfirmed: true },
            { timestamp: now(), actor: "M. Lindqvist (physics)", action: "Plan intent confirmed", severity: "success" },
          ),
        ),
      beginGeneration: (caseId) =>
        update(caseId, (c) =>
          withEvent(
            { ...c, status: "generating" },
            { timestamp: now(), actor: "system", action: "Candidate generation job queued (research forecast)", severity: "info" },
          ),
        ),
      completeGeneration: (caseId, candidatePlanId) =>
        update(caseId, (c) => {
          if (!c.candidatePlan) {
            // A real backend would attach the produced forecast here.
            return withEvent({ ...c }, { timestamp: now(), actor: "system", action: `Candidate ${candidatePlanId} attached`, severity: "success" });
          }
          return withEvent(
            { ...c, status: "review-required" },
            { timestamp: now(), actor: "system", action: `Research candidate dose forecast ready (${candidatePlanId})`, severity: "success" },
          );
        }),
      recordReviewDecision: (caseId, { outcome, notes, by = "Dr. E. Varga" }) =>
        update(caseId, (c) =>
          withEvent(
            {
              ...c,
              reviewDecision: { outcome, by, at: now(), notes },
              status: outcome === "approved-for-tps-recalculation" ? "ready" : "data-review",
            },
            {
              timestamp: now(),
              actor: by,
              action:
                outcome === "approved-for-tps-recalculation"
                  ? "Review decision recorded — approved for TPS recalculation"
                  : "Review decision recorded — revisions required",
              severity: outcome === "approved-for-tps-recalculation" ? "success" : "warning",
            },
          ),
        ),
      markExported: (caseId, what) =>
        update(caseId, (c) =>
          withEvent(
            { ...c, status: "exported" },
            { timestamp: now(), actor: "M. Lindqvist (physics)", action: `Export prepared — ${what}`, severity: "info" },
          ),
        ),
      createCase: ({ diagnosis, missingOar }) => {
        const num = 242 + (cases.length > 3 ? cases.length - 3 : 0);
        const id = `GBM-${String(num).padStart(4, "0")}`;
        const ts = now();
        const base = getMockCase("GBM-0241")!;
        const newCase: Case = {
          ...base,
          id,
          createdAt: ts,
          updatedAt: ts,
          status: "data-review",
          diagnosis,
          imaging: base.imaging.map((s, i) => ({
            ...s,
            id: `${i === 0 ? "ct" : "mr"}-${num}`,
            receivedAt: ts,
            registrationConfidence: i === 1 ? undefined : s.registrationConfidence,
            status: "received",
          })),
          structures: base.structures.map((s) => ({
            ...s,
            approvedBy: undefined,
            approvedAt: undefined,
            completenessPct: missingOar && s.id === "chiasm" ? 60 : 100,
            note: missingOar && s.id === "chiasm" ? "Contour incomplete — flagged at import." : undefined,
          })),
          contoursApproved: false,
          intentConfirmed: false,
          candidatePlan: undefined,
          reviewDecision: undefined,
          registrationDecision: "pending",
          registrationWarnings: missingOar
            ? ["Required OAR contour incomplete: optic chiasm — add or import updated RTSTRUCT."]
            : [],
          auditTrail: [
            { id: `ae-${Date.now()}`, timestamp: ts, actor: "R. Okafor", action: `Case created via import wizard (${id})`, severity: "info" as const },
          ],
        };
        setCases((prev) => [newCase, ...prev]);
        setActiveCaseId(id);
        return id;
      },
    }),
    [update, cases.length],
  );

  const value = useMemo<CaseContextValue>(
    () => ({
      ...actions,
      cases,
      activeCaseId,
      setActiveCaseId,
      activeCase: activeCaseId ? cases.find((c) => c.id === activeCaseId) ?? null : null,
      getCase: (id) => cases.find((c) => c.id === id) ?? getMockCase(id),
    }),
    [cases, activeCaseId, actions],
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCases(): CaseContextValue {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error("useCases must be used within CaseProvider");
  return ctx;
}