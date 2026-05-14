/**
 * LiNKaios kernel orchestration module
 *
 * Exports the kernel API for work request/run/stage lifecycle,
 * dispatch adapters, approval hooks, and trace surfaces.
 */

// Types
export type {
  KernelConfig,
  TenantRecord,
  PluginRecord,
  TenantPluginEntitlement,
  LeadRecord,
  ApprovalRecord,
  DispatchContext,
  DispatchResult,
  StageExecutionOptions,
  RunCreationResult,
  TraceViewResult,
} from "./types";

export { DEFAULT_KERNEL_CONFIG, DEFAULT_STAGE_OPTIONS } from "./types";

// Manifest loader
export {
  loadWebsiteFactoryManifest,
  validateManifest,
  loadAndValidateWebsiteFactoryManifest,
  seedWebsiteFactoryPlugin,
  getPluginManifest,
  ManifestValidationError,
} from "./manifest-loader";

// Orchestrator
export {
  intakeLeadWorkRequest,
  createRun,
  executeRun,
  getRunTrace,
  buildPreviewOutput,
  LeadValidationError,
  RunCreationError,
} from "./orchestrator";

// Dispatch adapters
export {
  dispatchToLinkBot,
  requestLinkSkillsLease,
  executeLinkSkillsLease,
  dispatchToLinkAutowork,
  dispatchToLinkBrainRecordRun,
  writeStageAuditEvent,
  writeRunAuditEvent,
} from "./dispatch";

// Approval hooks
export {
  listPendingApprovals,
  getApproval,
  getStageApproval,
  decideApproval,
  expireStaleApprovals,
  ApprovalError,
} from "./approval";

// Types for API consumers
export type { ApprovalDecision } from "./approval";
