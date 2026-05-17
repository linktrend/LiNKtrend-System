import type { SupabaseClient } from "@supabase/supabase-js";
import type { CapabilityPluginSurface } from "@linktrend/linklogic-sdk";
import type { CapabilityCatalogRow } from "./types.js";

type Mode = "development" | "shadow" | "live";

const CANONICAL_FAILURE_CODES = new Set([
  "WORKFLOW_NOT_FOUND",
  "WORKFLOW_STEP_FAILED",
  "WORKFLOW_TIMEOUT",
  "WORKFLOW_COMPENSATED",
  "INTEGRATION_UNAVAILABLE",
  "INTEGRATION_AUTH_FAILED",
  "INTEGRATION_TIMEOUT",
  "LEASE_REQUEST_INVALID",
  "LEASE_DENIED",
  "LEASE_EXPIRED",
  "LEASE_KILL_SWITCH",
  "LEASE_IDEMPOTENCY_CONFLICT",
  "POLICY_REQUIRES_APPROVAL",
]);

export interface CapabilityListFilters {
  mode?: Mode;
  target_software?: string;
  limit?: number;
}

function validateManifestShape(input: CapabilityPluginSurface): string[] {
  const issues: string[] = [];
  if (!input.capability_id?.trim()) issues.push("capability_id is required");
  if (!input.target_software?.trim()) issues.push("target_software is required");
  if (input.allowed_operations.length === 0) issues.push("allowed_operations must not be empty");
  if (input.mode_flags.length === 0) issues.push("mode_flags must not be empty");
  if (!input.idempotency_rules?.trim()) issues.push("idempotency_rules is required");
  if (input.allowed_callers.length === 0) issues.push("allowed_callers must not be empty");
  if (input.not_configured.length === 0) issues.push("not_configured must not be empty");
  return issues;
}

export function validateCapabilityPluginContractPack(surface: CapabilityPluginSurface): string[] {
  const issues: string[] = [];
  if (surface.mode_flags.length === 0) issues.push("mode_flags must not be empty");
  if (surface.not_configured.length === 0) issues.push("not_configured must not be empty");
  const callerSet = new Set(["linkaios", "vertical_plugin", "linkbot", "linkautowork"]);
  if (surface.allowed_callers.some((caller: string) => !callerSet.has(caller))) {
    issues.push("allowed_callers contains unsupported caller");
  }
  for (const code of Object.values(surface.failure_mapping) as string[]) {
    if (!CANONICAL_FAILURE_CODES.has(code)) {
      issues.push(`failure_mapping contains non-canonical code: ${code}`);
    }
  }
  return issues;
}

export function toPublicCapabilityContract(entry: CapabilityCatalogRow): CapabilityPluginSurface {
  return {
    capability_id: entry.capability_id,
    target_software: entry.target_software,
    allowed_operations: entry.allowed_operations,
    auth_requirements: entry.auth_requirements,
    mode_flags: entry.mode_flags,
    lease_requirements: entry.lease_requirements,
    idempotency_rules: entry.idempotency_rules,
    audit_events: entry.audit_events,
    allowed_callers: entry.allowed_callers,
    failure_mapping: entry.failure_mapping,
    not_configured: entry.not_configured,
  };
}

function normalizeManifest(surface: CapabilityPluginSurface): CapabilityCatalogRow {
  return {
    capability_id: surface.capability_id,
    plugin_kind: "capability",
    target_software: surface.target_software,
    allowed_operations: [...surface.allowed_operations],
    auth_requirements: [...surface.auth_requirements],
    mode_flags: [...surface.mode_flags],
    lease_requirements: [...surface.lease_requirements],
    idempotency_rules: surface.idempotency_rules,
    audit_events: [...surface.audit_events],
    allowed_callers: [...surface.allowed_callers],
    failure_mapping: { ...surface.failure_mapping },
    not_configured: [...surface.not_configured],
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function registerCapability(
  client: SupabaseClient,
  input: CapabilityPluginSurface,
): Promise<{ data: CapabilityCatalogRow | null; error: Error | null }> {
  const shapeIssues = validateManifestShape(input);
  if (shapeIssues.length > 0) return { data: null, error: new Error(shapeIssues.join("; ")) };
  const contractIssues = validateCapabilityPluginContractPack(input);
  if (contractIssues.length > 0) return { data: null, error: new Error(contractIssues.join("; ")) };

  const row = normalizeManifest(input);
  const { data, error } = await client
    .schema("linkskills")
    .from("capabilities")
    .insert(row)
    .select("*")
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as CapabilityCatalogRow, error: null };
}

export async function listCapabilitiesApi(
  client: SupabaseClient,
  filters: CapabilityListFilters = {},
): Promise<{ data: CapabilityCatalogRow[]; error: Error | null }> {
  let query = client
    .schema("linkskills")
    .from("capabilities")
    .select("*")
    .order("capability_id", { ascending: true })
    .limit(filters.limit ?? 100);
  if (filters.mode) query = query.contains("mode_flags", [filters.mode]);
  if (filters.target_software) query = query.eq("target_software", filters.target_software);
  const { data, error } = await query;
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as CapabilityCatalogRow[], error: null };
}

export async function getCapabilityApi(
  client: SupabaseClient,
  capability_id: string,
): Promise<{ data: CapabilityCatalogRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("capabilities")
    .select("*")
    .eq("capability_id", capability_id)
    .maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data ?? null) as CapabilityCatalogRow | null, error: null };
}

export async function getCapabilityPublicContract(
  client: SupabaseClient,
  capability_id: string,
): Promise<{ data: CapabilityPluginSurface | null; error: Error | null }> {
  const { data, error } = await getCapabilityApi(client, capability_id);
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };
  return { data: toPublicCapabilityContract(data), error: null };
}

export async function validateCapabilityReference(client: SupabaseClient, capability_id: string): Promise<boolean> {
  const { data } = await getCapabilityApi(client, capability_id);
  return data !== null;
}

export async function validateCapabilityModes(
  client: SupabaseClient,
  capability_id: string,
  requested_mode: Mode,
): Promise<boolean> {
  const { data } = await getCapabilityApi(client, capability_id);
  if (!data) return false;
  return data.mode_flags.includes(requested_mode);
}

export const V1_MVO_CAPABILITY_SEEDS: CapabilityPluginSurface[] = [
  "cap.crm.odoo_shadow",
  "cap.accounting.odoo_shadow",
  "cap.payload.local_sync",
  "cap.supabase.mirror_content",
  "cap.zulip.run_messaging",
  "cap.research.public_web",
  "cap.asset.generation",
  "cap.plane.execution_tracking",
].map((capability_id) => ({
  capability_id,
  target_software: capability_id.includes("odoo") ? "odoo" : capability_id.split(".")[1] ?? "unknown",
  allowed_operations: ["connectivity.probe"],
  auth_requirements: ["credential_ref"],
  mode_flags: ["development", "shadow"],
  lease_requirements: ["lease_id", "run_id", "idempotency_key"],
  idempotency_rules: "${run_id}:${stage_id}:${capability}",
  audit_events: ["capability.requested", "capability.executed", "capability.failed"],
  allowed_callers: ["linkaios", "vertical_plugin", "linkbot", "linkautowork"],
  failure_mapping: {
    invalid: "LEASE_REQUEST_INVALID",
    denied: "LEASE_DENIED",
    auth: "INTEGRATION_AUTH_FAILED",
    unavailable: "INTEGRATION_UNAVAILABLE",
    timeout: "INTEGRATION_TIMEOUT",
  },
  not_configured: ["target_base_url", "credential_ref"],
}));
