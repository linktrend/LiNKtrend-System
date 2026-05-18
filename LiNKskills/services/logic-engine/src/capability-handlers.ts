/**
 * LinkSkills MVO capability handlers.
 *
 * Implements §7 capability backends:
 * - crm.upsert (stub backend: local Postgres tables)
 * - plane.project.create (stub backend: local Postgres tables)
 * - plane.task.create (stub backend: local Postgres tables)
 * - preview.publish (stub backend: static/local preview)
 *
 * These handlers are called by executeLease() after lease validation.
 * They return the result that will be recorded in lease_execution_results.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CrmUpsertArgs,
  CrmUpsertResult,
  PlaneProjectCreateArgs,
  PlaneProjectCreateResult,
  PlaneTaskCreateArgs,
  PlaneTaskCreateResult,
  PreviewPublishArgs,
  PreviewPublishResult,
} from "@linktrend/linklogic-sdk";
import type { CapabilityContext } from "./types.js";

export class CapabilityExecutionError extends Error {
  code: string;
  retryable: boolean;

  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

interface ZulipRunMessagingArgs {
  mode?: "mock" | "shadow" | "live";
  operation: "run.notify" | "channel.message.mock_send" | "connectivity.probe";
  run_id?: string;
  stage_id?: string;
  message_purpose?: string;
  to?: {
    stream?: string;
    topic?: string;
    operator_channel?: string;
    bot_channel?: string;
  };
  message?: {
    content?: string;
    kind?: "operator" | "bot_to_bot" | "run_status";
  };
}

interface ZulipRunMessagingResult extends Record<string, unknown> {
  operation: "run.notify" | "channel.message.mock_send" | "connectivity.probe";
  mode: "mock" | "shadow";
  status: "queued_mock" | "readiness_checked";
  message_ref?: string;
  connectivity?: {
    ok: boolean;
    checked_at: string;
    reason: "shadow_probe_placeholder";
  };
}

function getMode(args: { mode?: string }): "mock" | "shadow" | "live" {
  if (args.mode === "shadow" || args.mode === "live" || args.mode === "mock") {
    return args.mode;
  }
  return "mock";
}

function requireString(value: unknown, key: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CapabilityExecutionError("LEASE_REQUEST_INVALID", `Missing required argument "${key}"`);
  }
  return value;
}

/**
 * CRM Upsert handler (§7.1, INT-020).
 *
 * Stub backend: writes to mvo_crm_contacts and mvo_crm_records tables.
 * Idempotent per (tenant_id, lead_id).
 */
export async function handleCrmUpsert(
  client: SupabaseClient,
  args: CrmUpsertArgs,
  context: CapabilityContext,
): Promise<CrmUpsertResult> {
  // Hash PII for the stub (no plaintext email/phone at rest)
  const emailHash = args.contact_email
    ? await hashWithSalt(args.contact_email, args.tenant_id)
    : null;
  const phoneHash = args.contact_phone
    ? await hashWithSalt(args.contact_phone, args.tenant_id)
    : null;

  // Upsert contact (idempotent on email_hash or phone_hash)
  const { data: contact, error: contactError } = await client
    .schema("linkskills")
    .rpc("upsert_crm_contact", {
      p_tenant_id: args.tenant_id,
      p_business_name: args.business_name,
      p_email_hash: emailHash,
      p_phone_hash: phoneHash,
    });

  if (contactError) {
    throw new Error(`CRM contact upsert failed: ${contactError.message}`);
  }

  const contactId = Array.isArray(contact) ? contact[0]?.contact_id : contact?.contact_id;
  if (!contactId) {
    throw new Error("CRM contact upsert returned no contact_id");
  }

  // Upsert record (idempotent on tenant_id + lead_id)
  const { data: record, error: recordError } = await client
    .schema("linkskills")
    .rpc("upsert_crm_record", {
      p_tenant_id: args.tenant_id,
      p_lead_id: args.lead_id,
      p_contact_id: contactId,
      p_industry: args.industry,
      p_external_ids: args.external_ids ?? {},
      p_lease_id: context.lease_id,
    });

  if (recordError) {
    throw new Error(`CRM record upsert failed: ${recordError.message}`);
  }

  const recordRow = Array.isArray(record) ? record[0] : record;

  return {
    crm_record_id: recordRow?.crm_record_id ?? "",
    created: Boolean(recordRow?.created),
  };
}

/**
 * Plane Project Create handler (§7.2, INT-021).
 *
 * Stub backend: writes to mvo_projects table.
 * Idempotent per (tenant_id, lead_id).
 */
export async function handlePlaneProjectCreate(
  client: SupabaseClient,
  args: PlaneProjectCreateArgs,
  context: CapabilityContext,
): Promise<PlaneProjectCreateResult> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("create_plane_project", {
      p_tenant_id: args.tenant_id,
      p_lead_id: args.lead_id,
      p_project_name: args.project_name,
      p_owner_actor_id: args.owner_actor_id,
      p_lease_id: context.lease_id,
    });

  if (error) {
    throw new Error(`Plane project creation failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    project_id: row?.project_id ?? "",
    created: Boolean(row?.created),
  };
}

/**
 * Plane Task Create handler (§7.3, INT-021).
 *
 * Stub backend: writes to mvo_tasks table.
 * Idempotent per (project_id, title_normalized).
 */
export async function handlePlaneTaskCreate(
  client: SupabaseClient,
  args: PlaneTaskCreateArgs,
  context: CapabilityContext,
): Promise<PlaneTaskCreateResult> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("create_plane_task", {
      p_project_id: args.project_id,
      p_title: args.title,
      p_description: args.description ?? null,
      p_assignee_actor_id: args.assignee_actor_id ?? null,
      p_lease_id: context.lease_id,
    });

  if (error) {
    throw new Error(`Plane task creation failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    task_id: row?.task_id ?? "",
    created: Boolean(row?.created),
  };
}

/**
 * Preview Publish handler (§7.4, INT-022).
 *
 * Stub backend: delegates to LiNKautowork workflow.
 * The actual rendering and serving is handled by LiNKautowork;
 * this handler just validates the lease and returns the preview URL.
 */
export async function handlePreviewPublish(
  _client: SupabaseClient,
  args: PreviewPublishArgs,
  context: CapabilityContext,
): Promise<PreviewPublishResult> {
  // For MVO, the preview is generated by LiNKautowork workflow
  // and served by LiNKaios/linkaios-web. This handler returns the
  // expected URL pattern that LiNKautowork will register.

  const previewUrl = `${args.preview_route_prefix}/${args.tenant_id}/${args.run_id}`;
  const artifactRef = `preview:${args.tenant_id}:${args.run_id}`;

  // Note: In the full implementation, this would trigger the
  // autowork.websitefactory.preview_serve workflow. For MVO,
  // we return the expected URL and let the workflow populate
  // the actual rendered bundle.

  return {
    preview_url: previewUrl,
    preview_artifact_ref: artifactRef,
    // No expiration for MVO static previews
  };
}

/**
 * Zulip run messaging handler (§0.A.5.1, INT-043).
 *
 * Development defaults:
 * - outbound send operations are mock-only
 * - connectivity checks may run in shadow mode as readiness placeholders
 * - live mode is blocked
 */
export async function handleZulipRunMessaging(
  _client: SupabaseClient,
  args: ZulipRunMessagingArgs,
  context: CapabilityContext,
): Promise<ZulipRunMessagingResult> {
  const operation = args.operation;
  const requestedMode = args.mode ?? "mock";

  if (requestedMode === "live") {
    throw new CapabilityExecutionError(
      "LEASE_DENIED",
      "Live Zulip messaging is disabled in development mode",
    );
  }

  if (operation === "connectivity.probe") {
    const mode: "mock" | "shadow" = requestedMode === "shadow" ? "shadow" : "mock";
    return {
      operation,
      mode,
      status: "readiness_checked",
      connectivity: {
        ok: true,
        checked_at: new Date().toISOString(),
        reason: "shadow_probe_placeholder",
      },
    };
  }

  // Outbound sends remain mock-only for v2 MVO.
  if (requestedMode === "shadow") {
    throw new CapabilityExecutionError(
      "LEASE_DENIED",
      `Operation "${operation}" is mock-only in development mode`,
    );
  }

  const runRef = args.run_id ?? context.run_id;
  const stageRef = args.stage_id ?? context.stage_id;
  const purpose = args.message_purpose ?? "run_status";

  return {
    operation,
    mode: "mock",
    status: "queued_mock",
    message_ref: `zulip-mock:${context.tenant_id}:${runRef}:${stageRef}:${purpose}`,
  };
}

interface GenericLinksitesV2Args {
  mode?: "mock" | "shadow" | "live";
  operation?: string;
  [key: string]: unknown;
}

interface PostizDistributionArgs {
  mode?: "mock" | "shadow" | "live";
  operation: "connectivity.probe" | "draft.create_mock" | "schedule.mock" | "status.read";
  run_id?: string;
  stage_id?: string;
  distribution_id?: string;
}

function ensureNoLiveWrites(capabilityId: string, mode: "mock" | "shadow" | "live"): void {
  if (mode === "live") {
    throw new CapabilityExecutionError(
      "LEASE_DENIED",
      `Live mode is disabled by default for capability "${capabilityId}"`,
    );
  }
}

export async function handleCapCrmOdooShadow(
  _client: SupabaseClient,
  args: GenericLinksitesV2Args,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  const mode = getMode(args);
  const operation = requireString(args.operation, "operation");

  if (operation === "odoo.readiness.probe") {
    return {
      operation,
      mode: mode === "live" ? "shadow" : mode,
      status: "readiness_checked",
      readiness_ref: `odoo-readiness:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
      checked_at: new Date().toISOString(),
    };
  }

  ensureNoLiveWrites("cap.crm.odoo_shadow", mode);
  return {
    operation,
    mode,
    status: "updated_mock",
    crm_record_id: `crm-mock:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
    lead_status: "ready_to_contact",
  };
}

export async function handleCapPayloadLocalSync(
  _client: SupabaseClient,
  args: GenericLinksitesV2Args,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  const mode = getMode(args);
  ensureNoLiveWrites("cap.payload.local_sync", mode);
  return {
    operation: requireString(args.operation, "operation"),
    mode,
    status: "synced_mock",
    payload_sync_ref: `payload-sync:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
  };
}

export async function handleCapSupabaseMirrorContent(
  _client: SupabaseClient,
  args: GenericLinksitesV2Args,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  const mode = getMode(args);
  ensureNoLiveWrites("cap.supabase.mirror_content", mode);
  return {
    operation: requireString(args.operation, "operation"),
    mode,
    status: "upserted_mock",
    mirror_write_ref: `mirror-write:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
    mirror_revision_ref: `mirror-revision:${context.lease_id}`,
  };
}

export async function handleCapResearchPublicWeb(
  _client: SupabaseClient,
  args: GenericLinksitesV2Args,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  return {
    operation: requireString(args.operation, "operation"),
    mode: getMode(args) === "live" ? "shadow" : getMode(args),
    status: "fetched_mock",
    query_ref: `research-query:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
    citations_ref: `research-citations:${context.lease_id}`,
  };
}

export async function handleCapAssetGeneration(
  _client: SupabaseClient,
  args: GenericLinksitesV2Args,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  const mode = getMode(args);
  ensureNoLiveWrites("cap.asset.generation", mode);
  return {
    operation: requireString(args.operation, "operation"),
    mode,
    status: "generated_mock",
    asset_ref: `asset:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
    provenance_ref: `asset-provenance:${context.lease_id}`,
  };
}

export async function handleCapPlaneExecutionTracking(
  _client: SupabaseClient,
  args: GenericLinksitesV2Args,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  const mode = getMode(args);
  const operation = requireString(args.operation, "operation");

  if (operation === "readiness.probe") {
    return {
      operation,
      mode: mode === "live" ? "shadow" : mode,
      status: "readiness_checked",
      plane_ref: `plane-readiness:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
    };
  }

  ensureNoLiveWrites("cap.plane.execution_tracking", mode);
  return {
    operation,
    mode,
    status: "upserted_mock",
    plane_ref: `plane-write:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
  };
}

export async function handleCapPostizDistribution(
  _client: SupabaseClient,
  args: PostizDistributionArgs,
  context: CapabilityContext,
): Promise<Record<string, unknown>> {
  const mode = getMode(args);
  const operation = args.operation;

  if (mode === "live") {
    throw new CapabilityExecutionError(
      "LEASE_DENIED",
      "Live Postiz distribution is disabled until Linktrend Media workflow approval",
    );
  }

  if (operation === "connectivity.probe") {
    return {
      operation,
      mode: mode === "shadow" ? "shadow" : "mock",
      status: "readiness_checked",
      readiness_ref: `postiz-readiness:${context.tenant_id}:${context.run_id}:${context.stage_id}`,
      checked_at: new Date().toISOString(),
    };
  }

  if (operation === "status.read") {
    return {
      operation,
      mode: mode === "shadow" ? "shadow" : "mock",
      status: "status_read_mock",
      distribution_status: "draft_only",
      distribution_ref: args.distribution_id ?? `postiz-dist:${context.lease_id}`,
    };
  }

  if (mode === "shadow") {
    throw new CapabilityExecutionError(
      "LEASE_DENIED",
      `Operation "${operation}" is mock-only in development mode`,
    );
  }

  return {
    operation,
    mode: "mock",
    status: operation === "draft.create_mock" ? "draft_created_mock" : "scheduled_mock",
    distribution_ref: `postiz-mock:${context.tenant_id}:${args.run_id ?? context.run_id}:${args.stage_id ?? context.stage_id}`,
    idempotency_ref: `${context.run_id}:${context.stage_id}:${operation}`,
  };
}

/**
 * Get the appropriate handler for a capability.
 */
export function getCapabilityHandler(capability_id: string) {
  const handlers: Record<string, (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>> = {
    "crm.upsert": handleCrmUpsert as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "plane.project.create": handlePlaneProjectCreate as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "plane.task.create": handlePlaneTaskCreate as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "preview.publish": handlePreviewPublish as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.crm.odoo_shadow": handleCapCrmOdooShadow as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.payload.local_sync": handleCapPayloadLocalSync as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.supabase.mirror_content": handleCapSupabaseMirrorContent as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.zulip.run_messaging": handleZulipRunMessaging as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.research.public_web": handleCapResearchPublicWeb as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.asset.generation": handleCapAssetGeneration as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.plane.execution_tracking": handleCapPlaneExecutionTracking as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
    "cap.postiz.distribution": handleCapPostizDistribution as unknown as (client: SupabaseClient, args: unknown, context: CapabilityContext) => Promise<Record<string, unknown>>,
  };

  return handlers[capability_id] ?? null;
}

/**
 * Simple hash function for PII hashing in stub backend.
 * In production, this would use a proper HMAC with tenant-scoped salt.
 */
async function hashWithSalt(value: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${value}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
