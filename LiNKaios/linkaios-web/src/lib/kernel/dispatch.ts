/**
 * LiNKaios kernel — Dispatch adapters to external planes
 *
 * Implements CONTRACTS_MVO.md §6 cross-plane contracts:
 * - §6.1 LiNKbot (reasoning dispatch)
 * - §6.2 LinkSkills (lease lifecycle)
 * - §6.3 LiNKbrain (audit/event envelope) — via SDK writer
 * - §6.4 LiNKautowork (workflow invocation)
 *
 * Role-bleed guards:
 * - Kernel NEVER executes side effects, reasoning, or audit writes itself
 * - Kernel ONLY dispatches to the responsible plane and records trace refs
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { SupabaseClient } from "@linktrend/db";
import {
  writeBrainAuditEvent,
  type AuditEvent,
  type AuditWriteResult,
  type BotReasonRequest,
  type BotReasonResult,
  type LeaseRequest,
  type LeaseDecision,
  type LeaseExecuteRequest,
  type LeaseExecuteResult,
  type WorkflowInvokeRequest,
  type WorkflowInvokeResult,
  type FailureReport,
  type FailureCode,
} from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import type { DispatchContext, DispatchResult } from "./types";
import type { Env } from "@linktrend/shared-config";
import { createPlaneAdapter, PlaneReadinessError } from "./plane-adapter";
import {
  executeLeaseThroughLogicEngine,
  isLinkSkillsExecutionGateRequired,
  parseCapabilityFromExecuteRequest,
} from "./linkskills-execution";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";
import {
  discoverTemplateRegistry,
  buildTemplateContextForLiNKbot,
  isValidTemplateId,
} from "@/lib/suite-integrations/websitefactory/template-registry-discovery";
import { shouldUseLiveAutoworkDispatch } from "./linkautowork-dispatch-mode";

// Retry config
const DEFAULT_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = [1000, 4000, 16000]; // exponential backoff per CONTRACTS_MVO.md §4.6
const CHATWOOT_READINESS_TIMEOUT_MS_DEFAULT = 5000;
const CHATWOOT_READINESS_TIMEOUT_MS_MAX = 60_000;
const DIGITALOCEAN_READINESS_TIMEOUT_MS = 5000;
export type PreviewPublishMode = "static" | "digitalocean";

interface PreviewPublishResult {
  success: boolean;
  outputs?: Record<string, unknown>;
  failure?: FailureReport;
}

interface PreviewPublishAdapter {
  mode: PreviewPublishMode;
  publish: () => Promise<PreviewPublishResult>;
}

function parseEnvBool(raw: string | undefined): boolean {
  if (!raw) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function resolvePreviewBaseUrl(env: Env): string {
  const configured = env.LINKTREND_PUBLIC_BASE_URL?.trim();
  if (!configured) return "http://localhost:3000";
  return configured;
}

function buildAbsolutePreviewUrl(env: Env, tenantId: string, runId: string): string {
  const path = `/preview/${tenantId}/${runId}`;
  const base = resolvePreviewBaseUrl(env);
  try {
    return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
  } catch {
    return `http://localhost:3000${path}`;
  }
}

export function resolvePreviewPublishMode(env: Env): PreviewPublishMode {
  return env.PREVIEW_PUBLISH_MODE === "digitalocean" ? "digitalocean" : "static";
}

export function resolveChatwootReadinessTimeoutMs(env: Env): number {
  const raw = env.CHATWOOT_READINESS_TIMEOUT_MS;
  if (!raw || raw.trim() === "") return CHATWOOT_READINESS_TIMEOUT_MS_DEFAULT;
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n < 1) return CHATWOOT_READINESS_TIMEOUT_MS_DEFAULT;
  return Math.min(Math.floor(n), CHATWOOT_READINESS_TIMEOUT_MS_MAX);
}

type ChatwootReadinessOutcome =
  | "ready"
  | "auth_failed"
  | "endpoint_unavailable"
  | "timeout"
  | "request_failed"
  | "config_missing";

function sanitizeUrlOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function buildChatwootReadinessTracePayload(args: {
  env: Env;
  outcome: ChatwootReadinessOutcome;
  success: boolean;
  timeout_ms: number;
  duration_ms: number;
  http_status?: number;
  error_name?: string;
}): Record<string, unknown> {
  return {
    integration: "chatwoot",
    provider: args.env.CRM_PROVIDER ?? "stub",
    mode: args.env.CRM_MODE ?? "stub_write",
    outcome: args.outcome,
    success: args.success,
    http_status: args.http_status ?? null,
    timeout_ms: args.timeout_ms,
    duration_ms: args.duration_ms,
    base_url_origin: sanitizeUrlOrigin(args.env.CHATWOOT_BASE_URL),
    account_id_configured: Boolean(args.env.CHATWOOT_ACCOUNT_ID),
    token_configured: Boolean(args.env.CHATWOOT_API_ACCESS_TOKEN),
    error_name: args.error_name ?? null,
  };
}

function buildDigitalOceanPreviewValidationFailure(env: Env): FailureReport | null {
  if (!parseEnvBool(env.PREVIEW_PUBLISH_DIGITALOCEAN_ENABLED)) {
    return integrationFailure(
      "INTEGRATION_UNAVAILABLE",
      "DigitalOcean preview publish mode is configured but explicitly disabled",
    );
  }

  const missing: string[] = [];
  if (!env.DIGITALOCEAN_ACCESS_TOKEN) missing.push("DIGITALOCEAN_ACCESS_TOKEN");
  if (!env.DIGITALOCEAN_APP_ID) missing.push("DIGITALOCEAN_APP_ID");
  if (!env.DIGITALOCEAN_PREVIEW_BASE_URL) missing.push("DIGITALOCEAN_PREVIEW_BASE_URL");

  if (missing.length > 0) {
    return integrationFailure(
      "INTEGRATION_AUTH_FAILED",
      `Missing DigitalOcean preview configuration: ${missing.join(", ")}`,
    );
  }

  return null;
}

function buildDigitalOceanPreviewUrl(env: Env, tenantId: string, runId: string): string {
  const base = env.DIGITALOCEAN_PREVIEW_BASE_URL ?? resolvePreviewBaseUrl(env);
  const path = `/preview/${tenantId}/${runId}`;
  try {
    return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
  } catch {
    return buildAbsolutePreviewUrl(env, tenantId, runId);
  }
}

async function validateDigitalOceanReadiness(
  env: Env,
): Promise<{ success: true } | { success: false; failure: FailureReport }> {
  const token = env.DIGITALOCEAN_ACCESS_TOKEN;
  const appId = env.DIGITALOCEAN_APP_ID;
  if (!token || !appId) {
    return {
      success: false,
      failure: integrationFailure(
        "INTEGRATION_AUTH_FAILED",
        "Missing DigitalOcean readiness configuration",
      ),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DIGITALOCEAN_READINESS_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.digitalocean.com/v2/apps/${encodeURIComponent(appId)}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
    });

    if (response.ok) return { success: true };

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        failure: integrationFailure(
          "INTEGRATION_AUTH_FAILED",
          `DigitalOcean auth failed (${response.status})`,
        ),
      };
    }

    return {
      success: false,
      failure: integrationFailure(
        "INTEGRATION_UNAVAILABLE",
        `DigitalOcean readiness endpoint unavailable (${response.status})`,
      ),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        failure: integrationFailure("INTEGRATION_TIMEOUT", "DigitalOcean readiness check timed out"),
      };
    }

    return {
      success: false,
      failure: integrationFailure("INTEGRATION_UNAVAILABLE", "DigitalOcean readiness check failed"),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function buildPreviewPublishAdapter(
  env: Env,
  ctx: DispatchContext,
): PreviewPublishAdapter {
  const mode = resolvePreviewPublishMode(env);

  if (mode === "digitalocean") {
    return {
      mode,
      publish: async () => {
        const validationFailure = buildDigitalOceanPreviewValidationFailure(env);
        if (validationFailure) {
          return { success: false, failure: validationFailure };
        }
        const readiness = await validateDigitalOceanReadiness(env);
        if (!readiness.success) {
          return { success: false, failure: readiness.failure };
        }
        return {
          success: true,
          outputs: {
            preview_url: buildDigitalOceanPreviewUrl(env, ctx.tenant_id, ctx.run_id),
            preview_artifact_ref: `storage://previews/${ctx.run_id}.zip`,
          },
        };
      },
    };
  }

  return {
    mode: "static",
    publish: async () => ({
      success: true,
      outputs: {
        preview_url: buildAbsolutePreviewUrl(env, ctx.tenant_id, ctx.run_id),
        preview_artifact_ref: `storage://previews/${ctx.run_id}.zip`,
      },
    }),
  };
}

/**
 * Dispatch to LiNKbot for reasoning stages.
 * Implements CONTRACTS_MVO.md §6.1.
 *
 * WP-093: Template registry discovery is injected into LiNKbot inputs
 * for website_package_generation stage to enable template-aware reasoning.
 */
export async function dispatchToLiNKbot(
  env: Env,
  ctx: DispatchContext,
  request: Omit<BotReasonRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const _fullRequest: BotReasonRequest = {
    tenant_id: ctx.tenant_id,
    run_id: ctx.run_id,
    stage_id: ctx.stage_id,
    ...request,
  };

  const governance = request.inputs?.linktrendGovernance;
  const governanceValidation = validateIngressGovernancePayload(governance);
  if (!governanceValidation.valid) {
    const failure: FailureReport = {
      code: "MANIFEST_INVALID",
      plane: "linkaios",
      message: `LiNKbot governance ingress rejected: ${governanceValidation.reason}`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    const deniedAudit = await writeStageAuditEvent(
      env,
      ctx,
      "stage.failed",
      {
        dispatch_target: "linkbot",
        reason: "governance_ingress_rejected",
        failure_code: failure.code,
        details: governanceValidation.reason,
      },
      "linkaios",
    );
    return {
      success: false,
      failure,
      audit_event_ids: [deniedAudit.event_id],
    };
  }

  // WP-093: Discover and inject template registry for website_package_generation
  let enhancedInputs = { ...request.inputs };
  if (request.reasoning_kind === "website_package_generation") {
    try {
      const registry = await discoverTemplateRegistry(env);
      const templateContext = buildTemplateContextForLiNKbot(registry);
      enhancedInputs = {
        ...enhancedInputs,
        linktrend_templates: templateContext,
      };
    } catch {
      // Discovery failed - continue without template context
      // Validation will catch invalid template_ids later
    }
  }

  // MVO: LiNKbot dispatch is a stub that returns mock success
  // Real implementation calls LiNKbot runtime via HTTP or internal RPC
  // For MVO, we simulate the contract to prove kernel dispatch works

  const mockResult: BotReasonResult = {
    outputs: generateMockReasoningOutputs(request.reasoning_kind, enhancedInputs),
    model_run_id: `mock-model-${Date.now()}`,
    tokens_in: 150,
    tokens_out: 250,
  };

  // WP-093: Validate template_id from website_package_generation output
  if (request.reasoning_kind === "website_package_generation") {
    const websitePackage = mockResult.outputs.website_package as Record<
      string,
      unknown
    >;
    if (websitePackage?.template_id) {
      try {
        const registry = await discoverTemplateRegistry(env);
        if (!isValidTemplateId(websitePackage.template_id, registry)) {
          // Invalid template_id - audit the validation failure
          await writeStageAuditEvent(
            env,
            ctx,
            "stage.warning",
            {
              warning_code: "INVALID_TEMPLATE_ID",
              received_template_id: websitePackage.template_id,
              available_template_ids: registry.available_template_ids,
              fallback_to_default: true,
            },
            "linkaios",
          );
          // Fall back to default template
          websitePackage.template_id = registry.default_template_id;
        }
      } catch {
        // Registry validation failed - keep original output
      }
    }
  }

  return {
    success: true,
    outputs: mockResult.outputs,
    model_run_id: mockResult.model_run_id,
  };
}

function validateIngressGovernancePayload(payload: unknown): { valid: true } | { valid: false; reason: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, reason: "missing linktrendGovernance payload" };
  }

  const p = payload as LinktrendGovernancePayload;
  if (!p.bootstrap?.traceCorrelationId?.trim()) {
    return { valid: false, reason: "missing bootstrap.traceCorrelationId" };
  }
  if (!["granted", "denied", "pending"].includes(p.bootstrap.authorizationState)) {
    return { valid: false, reason: "invalid bootstrap.authorizationState" };
  }
  if (!Array.isArray(p.approvedTools?.toolNames)) {
    return { valid: false, reason: "missing approvedTools.toolNames" };
  }
  if (p.approvedTools.toolNames.some((name) => typeof name !== "string" || name.trim() === "")) {
    return { valid: false, reason: "approvedTools.toolNames contains invalid entries" };
  }

  return { valid: true };
}

/**
 * Generate mock reasoning outputs based on reasoning kind.
 * MVO stub — real LiNKbot would call OpenRouter.
 */
function generateMockReasoningOutputs(
  reasoningKind: string,
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  switch (reasoningKind) {
    case "lead_evaluation":
    case "research_enrichment":
      return {
        lead_research_bundle: {
          score: 75,
          segment: "smb_services",
          rationale: "Public research completed with provenance-ready references",
          model_run_id: `eval-${Date.now()}`,
        },
      };
    case "website_package_generation":
      return {
        website_package: {
          template_id: "marketing-smb-v1",
          copy_bundle: {
            blocks: [
              { block_id: "hero", text: { headline: "Your Success Starts Here", subhead: "Professional services tailored for you" } },
              { block_id: "about", text: { title: "About Us", body: "We deliver excellence in every project." } },
            ],
            locale: "en-US",
          },
          media_plan: {
            placements: [
              { block_id: "hero", asset_ref: "placeholder://hero-bg", kind: "placeholder" },
              { block_id: "about", asset_ref: "stock://team-photo", kind: "stock" },
            ],
          },
        },
      };
    default:
      return {};
  }
}

/**
 * Request a capability lease from LinkSkills.
 * Implements CONTRACTS_MVO.md §6.2.
 */
export async function requestLinkSkillsLease(
  env: Env,
  ctx: DispatchContext,
  request: Omit<LeaseRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const supabase = createSupabaseServiceClient(env);

  const { data, error } = await supabase.schema("linkskills").rpc("request_lease", {
    p_tenant_id: ctx.tenant_id,
    p_run_id: ctx.run_id,
    p_stage_id: ctx.stage_id,
    p_capability_id: request.capability,
    p_arguments: request.arguments,
    p_idempotency_key: request.idempotency_key,
    p_actor_kind: request.actor.actor_kind,
    p_actor_id: request.actor.actor_id,
  });

  if (error) {
    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkskills",
      message: error.message,
      retryable: true,
      occurred_at: new Date().toISOString(),
    };
    return { success: false, failure };
  }

  // data returns: { lease_id, status, is_existing, kill_switch_state }
  const result = Array.isArray(data) ? data[0] : data;
  const leaseId = result?.lease_id as string;
  const status = result?.status as string;
  const killSwitch = result?.kill_switch_state as string;

  // Write audit events
  await writeStageAuditEvent(env, ctx, "lease.requested", {
    capability: request.capability,
    lease_id: leaseId,
  }, "linkskills");

  if (status === "denied" || killSwitch === "tripped") {
    const failure: FailureReport = {
      code: killSwitch === "tripped" ? "LEASE_KILL_SWITCH" : "LEASE_DENIED",
      plane: "linkskills",
      message: killSwitch === "tripped" ? "Kill switch tripped for capability" : "Lease denied by policy",
      retryable: false,
      occurred_at: new Date().toISOString(),
    };

    await writeStageAuditEvent(env, ctx, "lease.denied", {
      capability: request.capability,
      lease_id: leaseId,
      reason: failure.message,
    }, "linkskills");

    return { success: false, failure, lease_id: leaseId };
  }

  // Check if approval is required
  if (status === "requires_approval") {
    await writeStageAuditEvent(env, ctx, "lease.granted", {
      capability: request.capability,
      lease_id: leaseId,
      requires_approval: true,
    }, "linkskills");

    return {
      success: false, // Not yet executed
      requires_approval: true,
      lease_id: leaseId,
    };
  }

  // Granted - proceed to execute
  await writeStageAuditEvent(env, ctx, "lease.granted", {
    capability: request.capability,
    lease_id: leaseId,
  }, "linkskills");

  return { success: true, lease_id: leaseId };
}

/**
 * Execute a granted lease via LinkSkills.
 */
export async function executeLinkSkillsLease(
  env: Env,
  ctx: DispatchContext,
  request: LeaseExecuteRequest,
): Promise<DispatchResult> {
  const capability = parseCapabilityFromExecuteRequest(request);

  if (capability === "crm.upsert") {
    const readiness = await validateCrmReadiness(env);
    if (!readiness.success) {
      return {
        success: false,
        failure: readiness.failure,
      };
    }
  }

  if (isLinkSkillsExecutionGateRequired(env)) {
    const exec = await executeLeaseThroughLogicEngine(env, request);
    if (exec.failure) {
      return { success: false, failure: exec.failure, lease_id: request.lease_id };
    }

    await writeStageAuditEvent(env, ctx, "lease.executed", {
      lease_id: request.lease_id,
      capability,
      ledger_entry_id: exec.ledger_entry_id,
      audit_event_id: exec.audit_event_id,
    }, "linkskills");

    const outputAuditEventIds = await writeCapabilityOutputAuditEvents(
      env,
      ctx,
      capability,
      exec.result ?? {},
    );

    return {
      success: true,
      outputs: exec.result,
      lease_id: request.lease_id,
      audit_event_id: exec.audit_event_id || outputAuditEventIds.at(-1),
      audit_event_ids: outputAuditEventIds,
    };
  }

  const supabase = createSupabaseServiceClient(env);

  let mockResult: Record<string, unknown> = {};
  if (capability === "preview.publish") {
    const previewAdapter = buildPreviewPublishAdapter(env, ctx);
    const publishResult = await previewAdapter.publish();
    if (!publishResult.success) {
      return { success: false, failure: publishResult.failure };
    }
    mockResult = publishResult.outputs || {};
  } else if (capability === "crm.upsert") {
    mockResult = { crm_record_id: `crm-${Date.now()}` };
  } else if (capability === "plane.project.create") {
    try {
      const planeAdapter = createPlaneAdapter(env);
      const planeResult = await planeAdapter.provisionProjectAndWorkItem({
        tenant_id: ctx.tenant_id,
        lead_id: ctx.run_id,
        project_name: `Run ${ctx.run_id}`,
        work_item_title: "Kernel plane bootstrap",
      });
      mockResult = {
        project_id: planeResult.project_id,
        task_id: planeResult.task_id,
      };
    } catch (error) {
      if (error instanceof PlaneReadinessError) {
        return {
          success: false,
          failure: integrationFailure(error.failureCode, error.message),
        };
      }
      throw error;
    }
  } else if (isLinkSkillsExecutionGateRequired(env)) {
    const exec = await executeLeaseThroughLogicEngine(env, request);
    if (exec.failure) {
      return { success: false, failure: exec.failure, lease_id: request.lease_id };
    }
    mockResult = exec.result ?? {};
  } else {
    // Permissive dev/MVO: side-effect proof is carried by LiNKautowork workflows; skip logic-engine exec idempotency.
    mockResult = { capability_executed: capability };
  }

  const { data, error } = await supabase.schema("linkskills").rpc("record_execution", {
    p_lease_id: request.lease_id,
    p_idempotency_key: request.idempotency_key,
    p_result: mockResult,
    p_audit_event_id: null,
  });

  if (error) {
    const failure: FailureReport = {
      code: "LEASE_DENIED",
      plane: "linkskills",
      message: error.message,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return { success: false, failure };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const isDuplicate = result?.is_duplicate as boolean;
  const execResult = (result?.result as Record<string, unknown>) ?? mockResult;

  await writeStageAuditEvent(env, ctx, "lease.executed", {
    lease_id: request.lease_id,
    is_duplicate: isDuplicate,
  }, "linkskills");

  const outputAuditEventIds = await writeCapabilityOutputAuditEvents(
    env,
    ctx,
    capability,
    execResult,
  );

  return {
    success: true,
    outputs: execResult,
    audit_event_id: outputAuditEventIds.at(-1),
    audit_event_ids: outputAuditEventIds,
  };
}

async function validateCrmReadiness(
  env: Env,
): Promise<{ success: true } | { success: false; failure: FailureReport }> {
  const provider = env.CRM_PROVIDER ?? "stub";
  const mode = env.CRM_MODE ?? "stub_write";

  if (provider !== "chatwoot" || mode !== "shadow_readiness") {
    return { success: true };
  }

  const baseUrl = env.CHATWOOT_BASE_URL;
  const accountId = env.CHATWOOT_ACCOUNT_ID;
  const token = env.CHATWOOT_API_ACCESS_TOKEN;
  const timeoutMs = resolveChatwootReadinessTimeoutMs(env);
  const startedAt = Date.now();
  const emitReadinessTrace = (args: {
    outcome: ChatwootReadinessOutcome;
    success: boolean;
    http_status?: number;
    error_name?: string;
  }) => {
    log(args.success ? "info" : "warn", "chatwoot.readiness", {
      service: "linkaios-web",
      ...buildChatwootReadinessTracePayload({
        env,
        outcome: args.outcome,
        success: args.success,
        timeout_ms: timeoutMs,
        duration_ms: Date.now() - startedAt,
        http_status: args.http_status,
        error_name: args.error_name,
      }),
    });
  };
  if (!baseUrl || !accountId || !token) {
    emitReadinessTrace({ outcome: "config_missing", success: false });
    return {
      success: false,
      failure: integrationFailure("INTEGRATION_AUTH_FAILED", "Missing Chatwoot CRM readiness configuration"),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");
    const response = await fetch(`${trimmedBaseUrl}/api/v1/accounts/${encodeURIComponent(accountId)}`, {
      method: "GET",
      headers: {
        api_access_token: token,
        "content-type": "application/json",
      },
      signal: controller.signal,
    });

    if (response.ok) {
      emitReadinessTrace({ outcome: "ready", success: true, http_status: response.status });
      return { success: true };
    }

    if (response.status === 401 || response.status === 403) {
      emitReadinessTrace({ outcome: "auth_failed", success: false, http_status: response.status });
      return {
        success: false,
        failure: integrationFailure("INTEGRATION_AUTH_FAILED", `Chatwoot auth failed (${response.status})`),
      };
    }

    emitReadinessTrace({ outcome: "endpoint_unavailable", success: false, http_status: response.status });
    return {
      success: false,
      failure: integrationFailure("INTEGRATION_UNAVAILABLE", `Chatwoot readiness endpoint unavailable (${response.status})`),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      emitReadinessTrace({ outcome: "timeout", success: false, error_name: error.name });
      return {
        success: false,
        failure: integrationFailure("INTEGRATION_TIMEOUT", "Chatwoot readiness check timed out"),
      };
    }

    emitReadinessTrace({
      outcome: "request_failed",
      success: false,
      error_name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      success: false,
      failure: integrationFailure("INTEGRATION_UNAVAILABLE", "Chatwoot readiness check failed"),
    };
  } finally {
    clearTimeout(timeout);
  }
}

type IntegrationFailureCode =
  | Extract<FailureCode, "INTEGRATION_UNAVAILABLE">
  | Extract<FailureCode, "INTEGRATION_AUTH_FAILED">
  | Extract<FailureCode, "INTEGRATION_TIMEOUT">;

function integrationFailure(code: IntegrationFailureCode, message: string): FailureReport {
  return {
    code,
    plane: "linkskills",
    message,
    retryable: code !== "INTEGRATION_AUTH_FAILED",
    occurred_at: new Date().toISOString(),
  };
}

async function writeCapabilityOutputAuditEvents(
  env: Env,
  ctx: DispatchContext,
  capability: string,
  outputs: Record<string, unknown>,
): Promise<string[]> {
  const eventIds: string[] = [];

  const write = async (action: string, payload: Record<string, unknown>) => {
    const result = await writeStageAuditEvent(env, ctx, action, payload, "linkskills");
    eventIds.push(result.event_id);
  };

  if (capability === "crm.upsert") {
    await write("crm.upserted", {
      crm_record_id: outputs.crm_record_id,
    });
    return eventIds;
  }

  if (capability === "plane.project.create") {
    await write("plane.project.created", {
      project_id: outputs.project_id,
    });
    await write("plane.task.created", {
      task_id: outputs.task_id,
      project_id: outputs.project_id,
    });
    return eventIds;
  }

  if (capability === "preview.publish") {
    await write("preview.published", {
      preview_url: outputs.preview_url,
      preview_artifact_ref: outputs.preview_artifact_ref,
    });
    return eventIds;
  }

  if (capability === "cap.zulip.run_messaging") {
    await write("zulip.connectivity.checked", {
      connectivity: outputs.connectivity,
      operation: outputs.operation,
      status: outputs.status,
    });
    return eventIds;
  }

  if (capability === "cap.plane.execution_tracking") {
    await write("plane.readiness.checked", {
      plane_ref: outputs.plane_ref,
      connectivity: outputs.connectivity,
      operation: outputs.operation,
      status: outputs.status,
    });
    return eventIds;
  }

  return eventIds;
}

/**
 * Dispatch to LiNKautowork for deterministic workflow execution.
 * Implements CONTRACTS_MVO.md §6.4.
 */
export async function dispatchToLinkAutowork(
  env: Env,
  ctx: DispatchContext,
  request: Omit<WorkflowInvokeRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const fullRequest: WorkflowInvokeRequest = {
    tenant_id: ctx.tenant_id,
    run_id: ctx.run_id,
    stage_id: ctx.stage_id,
    ...request,
  };

  if (!shouldUseLiveAutoworkDispatch()) {
    return dispatchToLinkAutoworkMock(env, ctx, request);
  }

  const { invokeLinkAutoworkWorkflow } = await import("./linkautowork-runtime");
  const result = await invokeLinkAutoworkWorkflow(env, fullRequest);
  const workflowRunId = result.workflow_run_id;
  const auditEventIds = result.audit_event_ids ?? [];

  if (result.status === "failed" || result.status === "compensated" || result.failure) {
    return {
      success: false,
      failure: result.failure ?? {
        code: "WORKFLOW_STEP_FAILED",
        plane: "linkautowork",
        message: `Workflow ${request.workflow_handle} ended with status ${result.status}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
      workflow_run_id: workflowRunId,
      audit_event_ids: auditEventIds,
      outputs: result.outputs,
    };
  }

  return {
    success: true,
    outputs: result.outputs,
    workflow_run_id: workflowRunId,
    audit_event_ids: auditEventIds,
  };
}

/** Legacy mock dispatch for tests and LINKAUTOWORK_DISPATCH_MODE=mock. */
async function dispatchToLinkAutoworkMock(
  env: Env,
  ctx: DispatchContext,
  request: Omit<WorkflowInvokeRequest, "tenant_id" | "run_id" | "stage_id">,
): Promise<DispatchResult> {
  const leaseRequiredHandles = new Set([
    "autowork.linksites.supabase_mirror_upsert",
    "autowork.linksites.payload_sync_local",
    "autowork.linksites.crm_ready_to_contact_mark",
  ]);
  const workflowRunId = `wf-${Date.now()}`;

  const invokedAudit = await writeStageAuditEvent(env, ctx, "workflow.invoked", {
    workflow_handle: request.workflow_handle,
    workflow_run_id: workflowRunId,
  }, "linkautowork");

  if (leaseRequiredHandles.has(request.workflow_handle) && !request.lease_id) {
    const failedAudit = await writeStageAuditEvent(env, ctx, "workflow.failed", {
      workflow_handle: request.workflow_handle,
      workflow_run_id: workflowRunId,
      failure_code: "LEASE_DENIED",
      failure_message: `${request.workflow_handle} requires lease_id`,
    }, "linkautowork");

    return {
      success: false,
      failure: {
        code: "LEASE_DENIED",
        plane: "linkautowork",
        message: `${request.workflow_handle} requires lease_id`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
      workflow_run_id: workflowRunId,
      audit_event_ids: [invokedAudit.event_id, failedAudit.event_id],
    };
  }

  const mockOutputs: Record<string, unknown> =
    request.workflow_handle === "autowork.websitefactory.render"
      ? { render_spec: request.inputs }
      : request.workflow_handle === "autowork.websitefactory.preview_serve"
        ? {
            preview_url: buildAbsolutePreviewUrl(env, ctx.tenant_id, ctx.run_id),
            preview_artifact_ref: `storage://previews/${ctx.run_id}.zip`,
          }
        : request.workflow_handle === "autowork.linksites.artifact_write_local"
          ? {
              artifact_ref: `artifact_local:${ctx.tenant_id}:${ctx.run_id}`,
              artifact_manifest_ref: `artifact_local:${ctx.tenant_id}:${ctx.run_id}:manifest`,
              artifact_root_path:
                (request.inputs.artifact_root_path as string | undefined) || "/tmp/linksites-artifacts",
              written_files_count: 3,
              artifact_digest: `digest:${ctx.run_id}`,
            }
          : request.workflow_handle === "autowork.linksites.supabase_mirror_upsert"
            ? {
                mirror_write_ref: `supabase_mirror:${ctx.tenant_id}:${ctx.run_id}`,
                mirror_revision_ref: `supabase_mirror:${ctx.tenant_id}:${ctx.run_id}:${request.idempotency_key}`,
                upserted_records_count: 4,
                mirror_digest: `digest:${ctx.run_id}`,
              }
            : request.workflow_handle === "autowork.linksites.payload_sync_local"
              ? {
                  payload_sync_ref: `payload_sync:${ctx.tenant_id}:${ctx.run_id}`,
                  payload_document_refs: ["payload:home", "payload:about", "payload:contact"],
                  payload_sync_status: "succeeded",
                }
              : request.workflow_handle === "autowork.linksites.preview_readiness_check"
                ? {
                    checks_passed: true,
                    check_report_ref: `readiness_report:${ctx.tenant_id}:${ctx.run_id}`,
                    failed_checks: [],
                    preview_readiness_status: "ready",
                  }
                : request.workflow_handle === "autowork.linksites.crm_ready_to_contact_mark"
                  ? {
                      crm_record_id: `crm_record:${ctx.tenant_id}:${ctx.run_id}`,
                      lead_status: "ready_to_contact",
                      status_updated_at: new Date().toISOString(),
                    }
        : {};

  const completedAudit = await writeStageAuditEvent(env, ctx, "workflow.completed", {
    workflow_handle: request.workflow_handle,
    workflow_run_id: workflowRunId,
  }, "linkautowork");

  return {
    success: true,
    outputs: mockOutputs,
    workflow_run_id: workflowRunId,
    audit_event_ids: [invokedAudit.event_id, completedAudit.event_id],
  };
}

/**
 * Write a stage-level audit event to LiNKbrain.
 * Uses the SDK's writeBrainAuditEvent which calls linkbrain.write_audit_event RPC.
 */
export async function writeStageAuditEvent(
  env: Env,
  ctx: DispatchContext,
  action: string,
  payload: Record<string, unknown> = {},
  plane: AuditEvent["plane"] = "linkaios",
): Promise<AuditWriteResult> {
  const event: AuditEvent = {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: ctx.tenant_id,
    plane,
    actor: {
      actor_kind: "kernel",
      actor_id: "linkaios.kernel",
    },
    action,
    subject: {
      run_id: ctx.run_id,
      stage_id: ctx.stage_id,
    },
    payload,
    schema_version: "1",
  };

  return writeBrainAuditEvent(env, event);
}

/**
 * Write a run-level audit event to LiNKbrain.
 */
export async function writeRunAuditEvent(
  env: Env,
  tenantId: string,
  runId: string,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<AuditWriteResult> {
  const event: AuditEvent = {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: tenantId,
    plane: "linkaios",
    actor: {
      actor_kind: "kernel",
      actor_id: "linkaios.kernel",
    },
    action,
    subject: {
      run_id: runId,
    },
    payload,
    schema_version: "1",
  };

  return writeBrainAuditEvent(env, event);
}

/**
 * Dispatch the record_run stage to LiNKbrain.
 * This persists the run closure to LiNKbrain memory.
 */
export async function dispatchToLiNKbrainRecordRun(
  env: Env,
  ctx: DispatchContext,
  outputs: Record<string, unknown>,
  auditEventIds: string[],
): Promise<DispatchResult> {
  // Write the final run.completed audit event
  const auditResult = await writeRunAuditEvent(
    env,
    ctx.tenant_id,
    ctx.run_id,
    "run.completed",
    {
      plugin_id: ctx.plugin_id,
      final_outputs_keys: Object.keys(outputs),
    },
  );

  // MVO: LiNKbrain memory persistence is stubbed
  // Real implementation would write to LiNKbrain memory system

  return {
    success: true,
    audit_event_id: auditResult.event_id,
  };
}
