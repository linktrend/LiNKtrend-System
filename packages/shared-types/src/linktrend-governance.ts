export type LinktrendBootstrapAuthorization = "granted" | "denied" | "pending";

export type LinktrendGovernanceBootstrap = {
  traceCorrelationId: string;
  authorizationState: LinktrendBootstrapAuthorization;
};

export type LinktrendGovernanceApprovedTools = {
  toolNames: string[];
};

export type LinktrendGovernanceSkillDeclaredTools = {
  toolNames: string[];
};

export type LinktrendGovernanceMission = {
  id: string;
  title?: string;
};

export type LinktrendRuntimeInstructionSegment = {
  label: string;
  text: string;
};

export type LinktrendGovernanceRuntimeInstructions = {
  text: string;
  segments?: LinktrendRuntimeInstructionSegment[];
};

/** When policy cannot satisfy the skill declaration. */
export type ToolGovernanceBlock = {
  reason: string;
  missingToolNames?: string[];
};

/**
 * Slim governance object for workers / OpenClaw (no full skill body or script blobs).
 * Execution prose is loaded via Layer-3 skill fetch when needed.
 */
export type LinktrendGovernancePayload = {
  bootstrap: LinktrendGovernanceBootstrap;
  approvedTools: LinktrendGovernanceApprovedTools;
  skillDeclaredTools?: LinktrendGovernanceSkillDeclaredTools;
  mission?: LinktrendGovernanceMission;
  runtimeInstructions?: LinktrendGovernanceRuntimeInstructions;
  /** Derived slim index for routing (optional). */
  skillIndex?: Record<string, unknown>;
  skillName?: string;
  skillVersion?: number;
  skillId?: string;
};

export type BuildLinktrendGovernanceResult = {
  payload: LinktrendGovernancePayload;
  block: ToolGovernanceBlock | null;
};
