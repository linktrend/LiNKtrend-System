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

const COMMON_FAILURE_MAPPING = {
  invalid_lease_input: "LEASE_REQUEST_INVALID",
  denied: "LEASE_DENIED",
  auth: "INTEGRATION_AUTH_FAILED",
  unavailable: "INTEGRATION_UNAVAILABLE",
  timeout: "INTEGRATION_TIMEOUT",
  idempotency_conflict: "LEASE_IDEMPOTENCY_CONFLICT",
} as const;

export const V1_MVO_CAPABILITY_SEEDS: CapabilityPluginSurface[] = [
  {
    capability_id: "cap.crm.odoo_shadow",
    target_software: "odoo",
    allowed_operations: ["lead.read_mock", "lead.status.set_ready_to_contact", "odoo.readiness.probe"],
    auth_requirements: ["crm.provider", "crm.mock_table_ref", "odoo.base_url", "odoo.credential_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["crm.lead.read", "crm.lead.status.write", "crm.odoo.readiness.check"],
    idempotency_rules: "(tenant_id, lead_id, target_status, run_id) for status writes; (tenant_id, probe_window) for readiness",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "crm.lead.status.updated",
      "crm.odoo.readiness.checked",
      "capability.failed",
    ],
    allowed_callers: ["vertical_plugin", "linkautowork"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Odoo chart of accounts",
      "accounting rules",
      "CRM stage/taxonomy design",
      "business master data",
    ],
  },
  {
    capability_id: "cap.accounting.odoo_shadow",
    target_software: "odoo",
    allowed_operations: ["invoice.draft_mock", "ledger.status.read", "odoo.readiness.probe"],
    auth_requirements: ["accounting.provider", "accounting.mock_table_ref", "odoo.base_url", "odoo.credential_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["accounting.invoice.write", "accounting.ledger.read", "accounting.odoo.readiness.check"],
    idempotency_rules: "(tenant_id, run_id, invoice_scope, normalized_subject)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "accounting.invoice.drafted",
      "accounting.odoo.readiness.checked",
      "capability.failed",
    ],
    allowed_callers: ["vertical_plugin", "linkautowork", "linkaios"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Odoo chart of accounts",
      "tax rules",
      "payment terms",
      "ledger posting policy",
    ],
  },
  {
    capability_id: "cap.payload.local_sync",
    target_software: "payload_cms",
    allowed_operations: ["content.upsert_local", "preview.publish_local", "sync.status.read"],
    auth_requirements: ["payload.base_url", "payload.space_ref", "payload.credential_ref", "payload.schema_source_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["payload.content.write", "payload.preview.publish", "payload.sync.read"],
    idempotency_rules: "(tenant_id, site_id, site_generation_run_id, content_checksum)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "payload.content.upserted",
      "payload.preview.updated",
      "payload.sync.checked",
      "capability.failed",
    ],
    allowed_callers: ["linkautowork", "vertical_plugin"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Payload collection/schema design",
      "field modeling",
      "locale strategy",
      "editorial workflow policy",
    ],
  },
  {
    capability_id: "cap.supabase.mirror_content",
    target_software: "supabase",
    allowed_operations: ["site_content.upsert", "asset_refs.upsert", "mirror.status.read"],
    auth_requirements: ["supabase.project_ref", "supabase.schema_ref", "supabase.credential_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["supabase.mirror.write", "supabase.mirror.read"],
    idempotency_rules: "(tenant_id, site_id, site_generation_run_id, payload_version)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "supabase.mirror.content.upserted",
      "supabase.mirror.asset_refs.upserted",
      "capability.failed",
    ],
    allowed_callers: ["linkautowork", "vertical_plugin"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Supabase mirror table/column invention",
      "non-mirror business schema design",
    ],
  },
  {
    capability_id: "cap.zulip.run_messaging",
    target_software: "zulip",
    allowed_operations: ["run.notify", "channel.message.mock_send", "connectivity.probe"],
    auth_requirements: ["zulip.base_url", "zulip.bot_email_ref", "zulip.api_key_ref", "zulip.stream_ref", "zulip.topic_template"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["zulip.run.notify", "zulip.channel.message.send"],
    idempotency_rules: "(tenant_id, run_id, stage_id, message_purpose)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "zulip.notification.queued",
      "zulip.connectivity.checked",
      "capability.failed",
    ],
    allowed_callers: ["linkaios", "vertical_plugin", "linkbot", "linkautowork"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Zulip org stream taxonomy design",
      "community/public broadcast policy",
    ],
  },
  {
    capability_id: "cap.research.public_web",
    target_software: "public_web",
    allowed_operations: ["search.query", "page.fetch", "citation.extract"],
    auth_requirements: ["research.provider", "research.api_key_ref", "research.allow_domains", "research.blocked_domains"],
    mode_flags: ["development", "shadow", "live"],
    lease_requirements: ["research.public.read"],
    idempotency_rules: "(tenant_id, run_id, query_hash, provider)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "research.query.performed",
      "research.citation.recorded",
      "capability.failed",
    ],
    allowed_callers: ["linkbot", "vertical_plugin", "linkautowork"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Target-site account setup",
      "outreach actions",
      "any write/submit side effect on external sites",
    ],
  },
  {
    capability_id: "cap.asset.generation",
    target_software: "asset_generation_provider",
    allowed_operations: ["image.generate", "video.generate", "asset.metadata.record"],
    auth_requirements: ["asset.provider", "asset.model_profile", "asset.output_path_template", "asset.credential_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["asset.generate.image", "asset.generate.video", "asset.metadata.write"],
    idempotency_rules: "(tenant_id, site_id, site_generation_run_id, asset_prompt_hash, asset_kind)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "asset.generated",
      "asset.provenance.recorded",
      "capability.failed",
    ],
    allowed_callers: ["linkbot", "vertical_plugin", "linkautowork"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Brand guideline authoring",
      "DAM taxonomy design",
      "external CDN publishing",
      "production media rights policy",
    ],
  },
  {
    capability_id: "cap.plane.execution_tracking",
    target_software: "plane",
    allowed_operations: ["project.ensure_mock", "task.ensure_mock", "readiness.probe"],
    auth_requirements: ["plane.base_url", "plane.workspace_ref", "plane.api_key_ref", "plane.project_template_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["plane.project.write", "plane.task.write", "plane.readiness.check"],
    idempotency_rules: "(tenant_id, run_id, execution_scope, normalized_title)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "plane.project.upserted",
      "plane.task.upserted",
      "plane.readiness.checked",
      "capability.failed",
    ],
    allowed_callers: ["vertical_plugin", "linkautowork", "linkaios"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Plane workspace structure policy",
      "sprint/workflow state taxonomy",
      "client-facing project governance",
    ],
  },
  {
    capability_id: "cap.llm_council.deliberation",
    target_software: "link_llm_council",
    allowed_operations: ["gate.deliberate", "connectivity.probe"],
    auth_requirements: ["llm_council.base_url", "openrouter.api_key_ref"],
    mode_flags: ["mock", "shadow", "live"],
    lease_requirements: ["llm_council.gate.deliberate"],
    idempotency_rules: "(tenant_id, run_id, stage_id, gate, program_id)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "llm_council.deliberation.completed",
      "llm_council.deliberation.failed",
      "capability.failed",
    ],
    allowed_callers: ["linkaios", "vertical_plugin", "linkbot", "linkautowork"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Gate policy definitions (G1–G5)",
      "Principal approval decisions",
      "Per-suite resident council bots",
    ],
  },
  {
    capability_id: "cap.postiz.distribution",
    target_software: "postiz",
    allowed_operations: ["connectivity.probe", "draft.create_mock", "schedule.mock", "status.read"],
    auth_requirements: ["postiz.base_url", "postiz.workspace_ref", "postiz.credential_ref"],
    mode_flags: ["development", "shadow"],
    lease_requirements: ["postiz.draft.write", "postiz.schedule.write", "postiz.status.read"],
    idempotency_rules: "(tenant_id, run_id, stage_id, distribution_id, operation)",
    audit_events: [
      "capability.requested",
      "capability.executed",
      "postiz.draft.created",
      "postiz.schedule.queued",
      "postiz.status.read",
      "capability.failed",
    ],
    allowed_callers: ["vertical_plugin", "linkautowork", "linkaios"],
    failure_mapping: COMMON_FAILURE_MAPPING,
    not_configured: [
      "Social account connection",
      "brand channel strategy",
      "live posting approval policy",
    ],
  },
];
