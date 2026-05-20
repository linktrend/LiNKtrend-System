/**
 * LinkSkills logic-engine types.
 *
 * Contract types (LeaseRequest, LeaseDecision, etc.) are imported from
 * `@linktrend/linklogic-sdk` (contracts-mvo.ts) and re-exported here for
 * local convenience.
 */

import type {
  LeaseRequest,
  LeaseDecision,
  LeaseDecisionStatus,
  LeaseExecuteRequest,
  LeaseExecuteResult,
  KillSwitchState,
  FailureReport,
  AuditEvent,
} from "@linktrend/linklogic-sdk";

export type {
  LeaseRequest,
  LeaseDecision,
  LeaseDecisionStatus,
  LeaseExecuteRequest,
  LeaseExecuteResult,
  KillSwitchState,
  FailureReport,
  AuditEvent,
};

/** Lease lifecycle states per CONTRACTS_MVO.md §6.2 */
export type LeaseStatus =
  | "requested"
  | "granted"
  | "denied"
  | "requires_approval"
  | "executed"
  | "expired"
  | "revoked";

/** Row from linkskills.lease_ledger */
export interface LeaseLedgerRow {
  lease_id: string;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability_id: string;
  arguments: Record<string, unknown>;
  idempotency_key: string;
  actor_kind: "plugin" | "bot" | "user";
  actor_id: string;
  status: LeaseStatus;
  decision_reason?: string;
  expires_at?: string;
  execution_result?: Record<string, unknown>;
  ledger_entry_id?: string;
  audit_event_id?: string;
  requested_at: string;
  decided_at?: string;
  executed_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

/** Row from linkskills.capability_catalog */
export interface CapabilityCatalogRow {
  capability_id: string;
  plugin_kind: "capability";
  target_software: string;
  allowed_operations: string[];
  auth_requirements: string[];
  mode_flags: Array<"development" | "shadow" | "live">;
  lease_requirements: string[];
  idempotency_rules: string;
  audit_events: string[];
  allowed_callers: Array<"linkaios" | "vertical_plugin" | "linkbot" | "linkautowork">;
  failure_mapping: Record<string, string>;
  not_configured: string[];
  version: number;
  created_at: string;
  updated_at: string;
}

/** Row from linkskills.capability_kill_switches */
export interface KillSwitchRow {
  id: string;
  capability_id: string;
  tenant_id?: string;
  state: KillSwitchState;
  reason: string;
  tripped_by?: string;
  tripped_at?: string;
  reset_by?: string;
  reset_at?: string;
  created_at: string;
  updated_at: string;
}

/** Result of a lease request operation */
export interface LeaseRequestResult {
  lease_id: string;
  status: LeaseDecisionStatus | "requested" | "denied";
  is_existing: boolean;
  kill_switch_state: KillSwitchState;
  failure?: FailureReport;
}

/** Configuration for lease TTL */
export interface LeasePolicyConfig {
  default_ttl_seconds: number;  // Default: 300 (5 minutes)
  max_ttl_seconds: number;      // Default: 3600 (1 hour)
}

/** Capability execution context passed to capability handlers */
export interface CapabilityContext {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  lease_id: string;
  actor: { actor_kind: string; actor_id: string };
  idempotency_key: string;
}

/** Capability handler function signature */
export type CapabilityHandler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>> = (
  args: TArgs,
  context: CapabilityContext,
) => Promise<TResult>;

/** Registry entry for a capability */
export interface CapabilityRegistryEntry {
  capability_id: string;
  handler: CapabilityHandler;
  policy_mode: "require_approval" | "auto_grant" | "deny_all";
}

/** Audit event builder result */
export interface LeaseAuditEvents {
  lease_requested?: AuditEvent;
  lease_granted?: AuditEvent;
  lease_denied?: AuditEvent;
  lease_executed?: AuditEvent;
  capability_output?: AuditEvent;  // e.g., crm.upserted, plane.project.created
}
