/**
 * JSON nested under `linktrendGovernance` on OpenClaw gateway `agent` RPC params.
 * Mirrors LiNKbot-core `src/linktrend/governance-types.ts` + `AgentParamsSchema` subset.
 */
export type LinktrendBootstrapAuthorization = "granted" | "denied" | "pending";

export interface LinktrendGovernanceBootstrap {
  workerIdentityRef?: string;
  authorizationState: LinktrendBootstrapAuthorization;
  traceCorrelationId?: string;
  denialReasonCategory?: string;
}

export interface LinktrendGovernanceMission {
  missionId?: string;
  summaryText?: string;
  objective?: Record<string, unknown>;
}

export interface LinktrendRuntimeInstructionSegment {
  title?: string;
  body: string;
}

export interface LinktrendGovernanceRuntimeInstructions {
  text?: string;
  segments?: LinktrendRuntimeInstructionSegment[];
  skillVersionRef?: string;
}

export interface LinktrendGovernanceApprovedTools {
  toolNames?: string[];
  restrictToApprovedList?: boolean;
}

/** Payload nested under `linktrendGovernance` when calling the fork. */
export interface LinktrendGovernancePayload {
  bootstrap?: LinktrendGovernanceBootstrap;
  mission?: LinktrendGovernanceMission;
  runtimeInstructions?: LinktrendGovernanceRuntimeInstructions;
  approvedTools?: LinktrendGovernanceApprovedTools;
}
