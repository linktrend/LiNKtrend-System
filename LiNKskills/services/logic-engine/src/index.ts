/**
 * LinkSkills Logic Engine
 *
 * Capability governance plane implementing §6.2 and §7 of CONTRACTS_MVO.md:
 * - Lease lifecycle (request, grant, execute)
 * - Capability catalog
 * - Kill switches
 * - Idempotency
 * - Audit event emission to LiNKbrain
 */

// Types
export type {
  LeaseRequest,
  LeaseDecision,
  LeaseDecisionStatus,
  LeaseExecuteRequest,
  LeaseExecuteResult,
  LeaseRequestResult,
  LeaseLedgerRow,
  LeaseStatus,
  KillSwitchRow,
  KillSwitchState,
  CapabilityCatalogRow,
  CapabilityContext,
  CapabilityHandler,
  CapabilityRegistryEntry,
  LeasePolicyConfig,
  LeaseAuditEvents,
  FailureReport,
  AuditEvent,
} from "./types.js";

// Lease lifecycle
export {
  requestLease,
  executeLease,
  grantLease,
  denyLease,
  requireApproval,
  getLease,
  getLeaseByIdempotencyKey,
  listLeasesForRun,
} from "./lease-lifecycle.js";

// Kill switches
export {
  isKillSwitchTripped,
  tripKillSwitch,
  resetKillSwitch,
  getKillSwitchState,
  listKillSwitches,
  getKillSwitch,
} from "./kill-switch.js";

// Capability catalog
export {
  getCapability,
  capabilityExists,
  getCapabilityPolicy,
  listCapabilities,
  validateCapabilityArguments,
  getMvoCapabilityIds,
  isMvoCapability,
} from "./capability-catalog.js";

// Capability handlers
export {
  handleCrmUpsert,
  handlePlaneProjectCreate,
  handlePlaneTaskCreate,
  handlePreviewPublish,
  getCapabilityHandler,
} from "./capability-handlers.js";

// Audit events
export {
  buildLeaseRequestedEvent,
  buildLeaseGrantedEvent,
  buildLeaseDeniedEvent,
  buildLeaseRequiresApprovalEvent,
  buildLeaseExecutedEvent,
  buildCapabilityOutputEvent,
  emitLeaseRequested,
  emitLeaseGranted,
  emitLeaseDenied,
  emitLeaseExecuted,
  emitCapabilityOutput,
} from "./audit-events.js";
