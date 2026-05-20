/**
 * Operational cockpit types for LiNKaios cross-plane visibility.
 *
 * These types support the operational cockpit views that give operators
 * visibility into module status, lease status, workflow runs, and traces
 * without requiring direct database queries.
 */

import type { RunStatus, StageStatus, LeaseDecisionStatus, WorkflowRunStatus } from "@linktrend/linklogic-sdk";

/** Module activation status for a tenant */
export type ModuleStatus = {
  module_id: string;
  module_name: string;
  plugin_kind: "vertical" | "capability";
  is_enabled: boolean;
  enabled_at: string | null;
  configured_capabilities: string[];
  missing_capabilities: string[];
  health: "healthy" | "degraded" | "unhealthy" | "unknown";
  last_check_at: string | null;
};

/** LinkSkills lease status overview */
export type LeaseStatus = {
  lease_id: string;
  capability: string;
  status: LeaseDecisionStatus | "expired" | "revoked" | "executed";
  tenant_id: string;
  run_id: string | null;
  stage_id: string | null;
  requested_at: string;
  granted_at: string | null;
  executed_at: string | null;
  expires_at: string | null;
  kill_switch_state: "open" | "tripped";
  ledger_entry_id: string | null;
  audit_event_id: string | null;
};

/** LiNKautowork workflow run status */
export type WorkflowRunStatusView = {
  workflow_run_id: string;
  workflow_handle: string;
  status: WorkflowRunStatus;
  tenant_id: string;
  run_id: string | null;
  stage_id: string | null;
  lease_id: string | null;
  invoked_at: string;
  completed_at: string | null;
  audit_event_ids: string[];
  failure_message: string | null;
};

/** Cross-plane run stage visibility */
export type RunStageView = {
  stage_id: string;
  run_id: string;
  display_name: string;
  responsible_plane: "linkaios" | "linkbot" | "linkskills" | "linkautowork" | "linkbrain";
  status: StageStatus;
  attempt: number;
  started_at: string | null;
  ended_at: string | null;
  lease_ids: string[];
  workflow_run_ids: string[];
  audit_event_ids: string[];
  failure_message: string | null;
};

/** Cross-plane run overview */
export type RunOverview = {
  run_id: string;
  tenant_id: string;
  plugin_id: string;
  work_request_type: string;
  status: RunStatus;
  started_at: string;
  ended_at: string | null;
  stages: RunStageView[];
  total_stages: number;
  completed_stages: number;
  failed_stages: number;
  lease_count: number;
  workflow_run_count: number;
  failure_summary: string | null;
};

/** LiNKbrain audit event for cockpit display */
export type AuditEventView = {
  event_id: string;
  ts: string;
  plane: string;
  action: string;
  run_id: string | null;
  stage_id: string | null;
  lease_id: string | null;
  workflow_run_id: string | null;
  capability: string | null;
  plugin_id: string | null;
  payload_summary: string;
};

/** Worker/LiNKbot session status */
export type WorkerSessionStatus = {
  agent_id: string;
  agent_name: string;
  status: "online" | "offline" | "busy" | "idle";
  current_mission_id: string | null;
  current_stage_id: string | null;
  last_heartbeat_at: string | null;
  session_started_at: string | null;
  capabilities_available: string[];
};

/** Operational cockpit dashboard data */
export type CockpitDashboardData = {
  tenant_id: string;
  generated_at: string;

  // Module status
  modules: ModuleStatus[];
  enabled_module_count: number;
  total_module_count: number;

  // Lease status
  recent_leases: LeaseStatus[];
  active_lease_count: number;
  tripped_kill_switch_count: number;

  // Workflow runs
  recent_runs: RunOverview[];
  running_run_count: number;
  failed_run_count: number;

  // Worker sessions
  worker_sessions: WorkerSessionStatus[];
  online_worker_count: number;
  busy_worker_count: number;

  // Audit/events
  recent_audit_events: AuditEventView[];
  event_count_24h: number;

  // System health
  system_health: "healthy" | "degraded" | "unhealthy" | "unknown";
  health_issues: string[];
};

/** Filter options for cockpit views */
export type CockpitFilterOptions = {
  tenant_id?: string;
  time_range?: "1h" | "24h" | "7d" | "30d";
  status?: string[];
  plane?: string[];
  capability?: string[];
};
