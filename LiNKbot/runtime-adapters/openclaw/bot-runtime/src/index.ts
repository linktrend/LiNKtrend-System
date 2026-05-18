/**
 * LiNKbot OpenClaw Runtime Adapter
 *
 * Per CONTRACTS_MVO.md §6.1 - Bot reasoning dispatch contract
 * Per LINKBOT_ADAPTER_PLAN.md - Adapter boundaries
 *
 * This package provides:
 * - OpenClaw runtime adapter contracts
 * - Mission/session lifecycle management
 * - Role/fleet resolution
 * - LinkSkills lease adapter integration
 * - LiNKbrain context handoff integration
 * - Audit event emission
 */

// Local types (mirror of SDK contracts)
export type {
  BotReasonRequest,
  BotReasonResult,
  FailureReport,
  LinkBotRoleAttachment,
  LinkSitesV2RoleId,
  ReasoningKind,
  LeaseRequest,
  LeaseDecision,
  LeaseExecuteRequest,
  LeaseExecuteResult,
  KillSwitchState,
  AuditEvent,
  AuditEventSubject,
  ContextRequest,
  ContextAssemblyResult,
} from "./local-types.js";

// Core types
export type {
  BotSessionContext,
  BotSessionState,
  BotLeaseRequest,
  BotContextRequest,
  OpenClawAdapterConfig,
  RoleResolutionResult,
  MissionResult,
  AdapterHealthStatus,
} from "./types.js";

// Session management
export {
  createBotSession,
  getBotSession,
  updateSessionState,
  addSessionLeaseRef,
  addSessionAuditRef,
  addSessionContextRef,
  addSessionModelRunId,
  cleanupBotSession,
  listActiveSessions,
  getSessionStats,
  sessionToMissionResult,
  initializeSessionFromRequest,
} from "./session.js";

// Lease adapter (LinkSkills integration)
export {
  requestLease,
  executeLease,
  checkLeaseStatus,
  requestLeasesBatch,
  isLeaseValid,
  buildLeaseIdempotencyKey,
  LeaseAdapterError,
  DEFAULT_LEASE_CONFIG,
} from "./lease-adapter.js";
export type { LeaseAdapterConfig } from "./lease-adapter.js";

// Context adapter (LiNKbrain integration)
export {
  requestContextAssembly,
  emitAuditEvent,
  emitRoleStarted,
  emitRoleCompleted,
  emitRoleFailed,
  emitCapabilityRequested,
  emitResearchPerformed,
  emitProvenanceRecorded,
  ContextAdapterError,
  DEFAULT_CONTEXT_CONFIG,
} from "./context-adapter.js";
export type { ContextAdapterConfig } from "./context-adapter.js";

// Main adapter
export {
  handleReasoningDispatch,
  checkAdapterHealth,
  getAdapterVersion,
  DEFAULT_ADAPTER_CONFIG,
} from "./adapter.js";

// Mission management
export {
  executeMission,
  validateMission,
  listMissionRoles,
  MISSION_ROLES,
} from "./mission.js";
export type { MissionConfig } from "./mission.js";
