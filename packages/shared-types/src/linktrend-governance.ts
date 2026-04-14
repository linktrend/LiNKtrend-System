/**
 * JSON shape sent to the OpenClaw fork as `linktrendGovernance` (ingress / AgentCommand).
 * Keep aligned with fork `src/linktrend/` types; extend when the fork contract grows.
 */
export type LinktrendAuthorizationState = "accepted" | "denied" | "pending";

export interface LinktrendGovernanceBootstrap {
  traceId: string;
  authorizationState: LinktrendAuthorizationState;
  /** Correlate with `bot_runtime.worker_sessions.id`, Supabase traces, etc. */
  correlationId?: string;
}

export interface LinktrendGovernanceMission {
  id: string;
  title?: string;
  status?: string;
}

export interface LinktrendGovernanceRuntimeInstructions {
  text?: string;
  segments?: { role: string; content: string }[];
  skillVersionRef?: { name: string; version: number };
}

export interface LinktrendGovernanceApprovedTools {
  toolNames: string[];
}

/** Payload nested under `linktrendGovernance` when calling the fork. */
export interface LinktrendGovernancePayload {
  bootstrap: LinktrendGovernanceBootstrap;
  mission?: LinktrendGovernanceMission;
  runtimeInstructions?: LinktrendGovernanceRuntimeInstructions;
  approvedTools: LinktrendGovernanceApprovedTools;
}
