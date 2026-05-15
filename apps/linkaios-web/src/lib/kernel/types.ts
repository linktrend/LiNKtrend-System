/**
 * LiNKaios kernel types — local to the kernel module.
 * Cross-service contract types are imported from @linktrend/linklogic-sdk
 */

import type {
  PluginManifest,
  LeadInput,
  Run,
  Stage,
  WorkRequest,
  FailureReport,
  Plane,
  PreviewOutput,
} from "@linktrend/linklogic-sdk";

export interface KernelConfig {
  maxStageRetries: number;
  defaultLeaseTtlSeconds: number;
  approvalTimeoutHours: number;
}

export const DEFAULT_KERNEL_CONFIG: KernelConfig = {
  maxStageRetries: 3,
  defaultLeaseTtlSeconds: 300, // 5 minutes
  approvalTimeoutHours: 24,
};

// Tenant record from kernel registry
export interface TenantRecord {
  tenant_id: string;
  display_name: string;
  slug: string;
  status: "active" | "suspended" | "inactive";
  config_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Plugin record from kernel registry
export interface PluginRecord {
  plugin_id: string;
  plugin_name: string;
  version: string;
  purpose: string;
  manifest_json: PluginManifest;
  status: "active" | "deprecated" | "disabled";
  created_at: string;
  updated_at: string;
}

// Tenant-plugin entitlement
export interface TenantPluginEntitlement {
  tenant_id: string;
  plugin_id: string;
  config_json: Record<string, unknown>;
  enabled: boolean;
}

// Lead registry record
export interface LeadRecord {
  lead_id: string;
  tenant_id: string;
  idempotency_key: string;
  business_name: string;
  industry: string;
  contact_json?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  location_json?: {
    city?: string;
    region?: string;
    country?: string;
  };
  notes?: string;
  external_ids?: Record<string, string>;
  source: "manual" | "csv_import" | "stub";
  created_at: string;
}

// Approval record
export interface ApprovalRecord {
  approval_id: string;
  run_id: string;
  stage_id: string;
  tenant_id: string;
  capability_id: string;
  lease_id?: string;
  status: "pending" | "granted" | "rejected" | "timed_out";
  requested_at: string;
  requested_by_actor_kind: string;
  requested_by_actor_id: string;
  decided_at?: string;
  decided_by_actor_id?: string;
  decision_reason?: string;
  expires_at: string;
}

// Dispatch context passed to adapters
export interface DispatchContext {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  plugin_id: string;
  attempt: number;
}

// Dispatch result from any plane
export interface DispatchResult {
  success: boolean;
  outputs?: Record<string, unknown>;
  failure?: FailureReport;
  // Trace refs (populated by kernel after dispatch)
  lease_id?: string;
  workflow_run_id?: string;
  audit_event_id?: string;
  audit_event_ids?: string[];
  model_run_id?: string;
  // Approval required flag
  requires_approval?: boolean;
}

// Stage execution options
export interface StageExecutionOptions {
  retryCount?: number;
  retryDelayMs?: number;
}

export const DEFAULT_STAGE_OPTIONS: StageExecutionOptions = {
  retryCount: 3,
  retryDelayMs: 1000,
};

// Manifest validation error
export interface ManifestValidationError {
  code: string;
  message: string;
  field?: string;
}

// Run creation result
export interface RunCreationResult {
  run: Run;
  isExisting: boolean;
  existingRunId?: string;
}

// Trace view result (read-only, no PII)
export interface TraceViewResult {
  run: Run;
  stages: Stage[];
  approvals: ApprovalRecord[];
}
