import type { Case, WorkflowStage } from "@/types";
import { WORKFLOW_STAGES } from "@/types";

export interface StageState {
  stage: WorkflowStage;
  /** completed */
  done: boolean;
  /** reachable now (gate satisfied) */
  unlocked: boolean;
  /** is the active stage */
  current: boolean;
  /** gate warning colouring (e.g., registration requires review) */
  flagged?: boolean;
}

/** Derive per-case workflow stage states — gates are data-driven here. */
export function getStageStates(c: Case): StageState[] {
  const validationOk = c.registrationDecision === "approved";
  const contoursOk = c.contoursApproved;
  const intentOk = c.intentConfirmed;
  const generated = Boolean(c.candidatePlan);
  const reviewed = Boolean(c.reviewDecision);
  const exported = c.status === "exported";

  const order = [
    { stage: "import" as WorkflowStage, done: true, unlocked: true },
    { stage: "validation" as WorkflowStage, done: validationOk, unlocked: true, flagged: !validationOk && c.registrationWarnings.length > 0 },
    { stage: "contours" as WorkflowStage, done: contoursOk, unlocked: validationOk || contoursOk, flagged: validationOk && !contoursOk },
    { stage: "intent" as WorkflowStage, done: intentOk, unlocked: contoursOk || intentOk },
    { stage: "generate" as WorkflowStage, done: generated, unlocked: contoursOk && intentOk },
    { stage: "review" as WorkflowStage, done: reviewed, unlocked: generated },
    { stage: "export" as WorkflowStage, done: exported, unlocked: reviewed },
  ];

  let currentAssigned = false;
  return order.map((s) => {
    const idx = WORKFLOW_STAGES.indexOf(s.stage);
    void idx;
    const current = s.unlocked && !s.done && !currentAssigned ? (currentAssigned = true) : false;
    return { ...s, current };
  });
}

export function caseRoute(c: Case, stage: WorkflowStage): string {
  return `/cases/${c.id}${stage === "import" ? "" : `/${stage}`}`;
}
