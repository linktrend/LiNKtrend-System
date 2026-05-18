/**
 * Capability Connector Types
 *
 * Per CONTRACTS_MVO.md §1.2 and §7.5
 * Capability plugins declare governed connection surfaces to external software.
 */

export type PluginKind = "vertical" | "capability";
export type PluginMode = "development" | "shadow" | "live";
export type AllowedCaller = "linkaios" | "vertical_plugin" | "linkbot" | "linkautowork";

export interface CapabilityConnectorManifest {
  capability_id: string;
  plugin_kind: PluginKind;
  target_software: string;
  allowed_operations: string[];
  auth_requirements: string[];
  mode_flags: PluginMode[];
  lease_requirements: string[];
  idempotency_rules: string;
  audit_events: string[];
  allowed_callers: AllowedCaller[];
  failure_mapping: Record<string, string>;
  not_configured: string[];
}

export interface CapabilityConnectorRuntime {
  manifest: CapabilityConnectorManifest;
  isReady: (tenantId: string) => Promise<boolean>;
  execute: (operation: string, args: Record<string, unknown>, context: CapabilityContext) => Promise<unknown>;
}

export interface CapabilityContext {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  lease_id: string;
  actor: { actor_kind: string; actor_id: string };
  idempotency_key: string;
  mode: PluginMode;
}

export interface CapabilityExecutionResult {
  success: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface CapabilityReadinessCheck {
  capability_id: string;
  tenant_id: string;
  status: "ready" | "not_ready" | "degraded";
  checks: {
    auth: boolean;
    connectivity: boolean;
    config: boolean;
  };
  message?: string;
}
