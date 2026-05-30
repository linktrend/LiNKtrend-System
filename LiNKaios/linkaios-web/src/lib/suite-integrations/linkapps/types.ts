/** Typed fixtures for LiNKapps App Factory UI scaffold (WP-110). No runtime contracts. */

export type FactoryRunStatus = "running" | "succeeded" | "partial" | "failed";

export type LeasePhase = "requested" | "granted" | "executed" | "denied";

export type SquadRoleState = "pending" | "active" | "done" | "failed";

export interface FactoryRunContext {
  tenantId: string;
  runId: string;
  traceId: string;
  ventureId: string;
  status: FactoryRunStatus;
}

export interface BlueprintIntakeFixture {
  ventureId: string;
  blueprintRef: string;
  prdRef: string;
  appSlug: string;
  appName: string;
  state: "draft" | "validated" | "bound";
}

export interface SquadRoleRowFixture {
  roleId: string;
  label: string;
  stageId: string;
  state: SquadRoleState;
}

export interface CapabilityLeaseRowFixture {
  leaseId: string;
  skuLabel: string;
  phase: LeasePhase;
  retryable: boolean;
}

export interface WorkflowSubstageFixture {
  manifestStageId: string;
  displayLabel: string;
  workflowRunId: string;
  state: "queued" | "running" | "succeeded" | "failed";
}

export interface LogLineFixture {
  at: string;
  message: string;
  ref: string;
}

export interface HandoffPackFixture {
  handoffPackageRef: string;
  auditEventIds: string[];
  deploymentRefs: string[];
  previewUrls: string[];
}

export interface AuditSpineFixture {
  id: string;
  verb: string;
  at: string;
}

export interface LinkappsFactoryFixture {
  context: FactoryRunContext;
  blueprint: BlueprintIntakeFixture;
  squad: SquadRoleRowFixture[];
  leases: CapabilityLeaseRowFixture[];
  workflows: WorkflowSubstageFixture[];
  buildLogs: LogLineFixture[];
  validationLines: LogLineFixture[];
  deploymentLines: LogLineFixture[];
  handoff: HandoffPackFixture;
  auditSpine: AuditSpineFixture[];
}
