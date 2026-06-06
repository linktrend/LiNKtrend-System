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
export { executeGrantedLease, resolveCapabilityFromIdempotencyKey } from "./execute-granted-lease.js";
export { createLinkSkillsHttpServer, startLinkSkillsHttpServer } from "./http-server.js";
export { isLinkSkillsLiveOpsEnabled, probePlaneApi, probeZulipGateway } from "./operational-probes.js";

export {
  requestLease,
  executeLease,
  grantLease,
  denyLease,
  requireApproval,
  expireLeases,
  revokeLease,
  getLease,
  getLeaseByIdempotencyKey,
  listLeasesForRun,
} from "./lease-lifecycle.js";

export {
  buildLeaseIdempotencyKey,
  isValidLeaseIdempotencyKey,
  hashPayload,
  checkIdempotency,
  storeIdempotencyResult,
} from "./idempotency.js";

// Kill switches
export {
  isKillSwitchTripped,
  tripKillSwitch,
  resetKillSwitch,
  getKillSwitchState,
  listKillSwitches,
  getKillSwitch,
} from "./kill-switch.js";
export {
  checkKillSwitch,
  evaluateSafetyTriggers,
  getSafetyKillSwitch,
  listSafetyKillSwitches,
  resetSafetyKillSwitch,
  tripSafetyKillSwitch,
} from "./safety.js";

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
export {
  getCapabilityApi,
  getCapabilityPublicContract,
  listCapabilitiesApi,
  registerCapability,
  validateCapabilityModes,
  validateCapabilityPluginContractPack,
  validateCapabilityReference,
  V1_MVO_CAPABILITY_SEEDS,
} from "./capability-catalog-api.js";

// Capability handlers
export {
  CapabilityExecutionError,
  handleCrmUpsert,
  handlePlaneProjectCreate,
  handlePlaneTaskCreate,
  handlePreviewPublish,
  handleCapCrmOdooShadow,
  handleCapPayloadLocalSync,
  handleCapSupabaseMirrorContent,
  handleCapResearchPublicWeb,
  handleCapAssetGeneration,
  handleCapPlaneExecutionTracking,
  handleCapPostizDistribution,
  handleZulipRunMessaging,
  getCapabilityHandler,
} from "./capability-handlers.js";

export {
  handleLlmCouncilDeliberation,
  mapDeliberationToCouncilReport,
  validateCouncilReport,
  COUNCIL_GATES,
  COUNCIL_PERSONA_IDS,
  type CouncilGate,
  type CouncilReport,
  type LlmCouncilDeliberationArgs,
  type LlmCouncilDeliberationResult,
} from "./llm-council-handler.js";

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

// Progressive disclosure (WP-080)
export {
  issueDisclosure,
  validateDisclosureToken,
  isTokenRevoked,
  revokeDisclosure,
  listDisclosuresForRun,
} from "./disclosure.js";

// LinkSites lease enforcement (WP-213)
export {
  getLinksitesCapabilityManifest,
  getAllLinksitesCapabilityIds,
} from "./linksites-capability-manifest.js";
