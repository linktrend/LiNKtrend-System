/**
 * OpenClaw Runtime Adapter
 *
 * Per CONTRACTS_MVO.md §6.1, LiNKbot is a delegating shell that:
 * 1. Accepts stage dispatch from LiNKaios kernel (BotReasonRequest)
 * 2. Returns typed output (BotReasonResult)
 * 3. MUST NOT write to LiNKbrain memory directly
 * 4. MUST NOT issue capability leases directly
 * 5. MUST NOT execute deterministic steps
 *
 * This adapter provides the bridge between LiNKaios and the OpenClaw engine.
 */

import {
  BotReasonRequest,
  BotReasonResult,
  FailureReport,
  ReasoningKind,
} from "./local-types.js";
import {
  OpenClawAdapterConfig,
  OpenClawAdapterConfigSchema,
  RoleResolutionResult,
  MissionResult,
  AdapterHealthStatus,
} from "./types.js";
import {
  createBotSession,
  getBotSession,
  updateSessionState,
  addSessionLeaseRef,
  addSessionAuditRef,
  addSessionContextRef,
  addSessionModelRunId,
  cleanupBotSession,
  sessionToMissionResult,
} from "./session.js";
import { requestLease, buildLeaseIdempotencyKey, isLeaseValid } from "./lease-adapter.js";
import {
  requestContextAssembly,
  emitRoleStarted,
  emitRoleCompleted,
  emitRoleFailed,
} from "./context-adapter.js";

/**
 * Default adapter configuration
 */
export const DEFAULT_ADAPTER_CONFIG: OpenClawAdapterConfig = {
  engine_endpoint: process.env.OPENCLAW_ENDPOINT || "http://localhost:3004",
  linkskills_endpoint: process.env.LINKSKILLS_ENDPOINT || "http://localhost:3002",
  linkbrain_endpoint: process.env.LINKBRAIN_ENDPOINT || "http://localhost:3003",
  linkautowork_endpoint: process.env.LINKAUTOWORK_ENDPOINT || "http://localhost:3005",
  default_model_profile: "gpt-4o-mini",
  max_reasoning_time_ms: 300000,
  lease_ttl_seconds: 300,
  default_execution_mode: "development",
  audit_emit_timeout_ms: 5000,
};

/**
 * Resolve role configuration
 *
 * In production, this fetches from role registry.
 * For MVO, uses built-in role definitions.
 */
async function resolveRole(
  role_id: string,
  config: OpenClawAdapterConfig
): Promise<RoleResolutionResult | null> {
  // Mock role resolution for MVO
  const mockRoles: Record<string, RoleResolutionResult> = {
    research_enrichment_bot: {
      role_id: "research_enrichment_bot",
      role_config: {
        role_id: "research_enrichment_bot",
        purpose: "Research the lead and comparable businesses; produce provenance-backed enrichment",
        inputs: ["lead_record_ref", "lead_input"],
        outputs: ["lead_research_bundle"],
        allowed_capabilities: ["cap.research.public_web", "cap.zulip.run_messaging"],
        allowed_skills: ["research.public_read"],
        model_policy: {
          model_routing_profile: "research-profile",
        },
        audit_events: ["role.started", "role.completed", "research.performed", "provenance.recorded"],
        development_restrictions: ["research_read_only", "provenance_required"],
      },
      allowed_capabilities: ["cap.research.public_web", "cap.zulip.run_messaging"],
      allowed_skills: ["research.public_read"],
      model_policy: {
        model_routing_profile: "research-profile",
      },
      resolved_at: new Date().toISOString(),
    },
    website_builder_bot: {
      role_id: "website_builder_bot",
      role_config: {
        role_id: "website_builder_bot",
        purpose: "Use discovered templates to produce business-specific website package",
        inputs: ["lead_record_ref", "lead_research_bundle", "template_id"],
        outputs: ["website_package"],
        allowed_capabilities: ["cap.asset.generation", "cap.research.public_web"],
        allowed_skills: ["content.generation", "style.planning"],
        model_policy: {
          model_routing_profile: "builder-profile",
        },
        audit_events: ["role.started", "role.completed", "template.guidance.selected", "website.package.generated"],
        development_restrictions: ["local_artifact_target_only", "no_direct_publish"],
      },
      allowed_capabilities: ["cap.asset.generation", "cap.research.public_web"],
      allowed_skills: ["content.generation", "style.planning"],
      model_policy: {
        model_routing_profile: "builder-profile",
      },
      resolved_at: new Date().toISOString(),
    },
  };

  return mockRoles[role_id] || null;
}

/**
 * Main reasoning dispatch handler
 *
 * Per CONTRACTS_MVO.md §6.1 - BotReasonRequest → BotReasonResult
 */
export async function handleReasoningDispatch(
  request: BotReasonRequest,
  role_id: string,
  config: OpenClawAdapterConfig = DEFAULT_ADAPTER_CONFIG
): Promise<BotReasonResult> {
  const validated_config = OpenClawAdapterConfigSchema.parse(config);

  // Create session
  const session = createBotSession(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    role_id,
    request.reasoning_kind,
    request.inputs,
    request.model_routing_profile
  );

  try {
    // Resolve role
    const role = await resolveRole(role_id, validated_config);
    if (!role) {
      throw new Error(`Unknown role: ${role_id}`);
    }

    // Emit role.started
    const started_event_id = await emitRoleStarted(
      request.tenant_id,
      request.run_id,
      request.stage_id,
      role_id,
      session.session_id
    );
    if (started_event_id) {
      addSessionAuditRef(session.session_id, started_event_id);
    }

    updateSessionState(session.session_id, "reasoning");

    // Request context from LiNKbrain
    updateSessionState(session.session_id, "awaiting_context");
    const context_result = await requestContextAssembly(
      {
        session_id: session.session_id,
        tenant_id: request.tenant_id,
        run_id: request.run_id,
        stage_id: request.stage_id,
        role_id,
        context_types: ["memory", "audit", "provenance"],
        query_scope: {
          module: "linksites",
        },
      },
      {
        linkbrain_endpoint: validated_config.linkbrain_endpoint,
        request_timeout_ms: validated_config.audit_emit_timeout_ms,
        max_context_entries: 100,
      }
    );

    if (context_result.error) {
      console.warn("Context assembly warning:", context_result.error.message);
    }

    // TODO: Integrate with actual OpenClaw engine
    // For MVO, simulate reasoning output
    const mock_outputs = generateMockOutputs(request.reasoning_kind, request.inputs);

    const model_run_id = `model-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    addSessionModelRunId(session.session_id, model_run_id);

    // Emit role.completed
    updateSessionState(session.session_id, "completed");
    const completed_event_id = await emitRoleCompleted(
      request.tenant_id,
      request.run_id,
      request.stage_id,
      role_id,
      session.session_id,
      model_run_id,
      1000, // tokens_in
      500 // tokens_out
    );
    if (completed_event_id) {
      addSessionAuditRef(session.session_id, completed_event_id);
    }

    // Cleanup session (LiNKguard handles deeper cleanup)
    cleanupBotSession(session.session_id);

    return {
      outputs: mock_outputs,
      model_run_id,
      tokens_in: 1000,
      tokens_out: 500,
    };
  } catch (error) {
    const failure: FailureReport = {
      code: "MODEL_PROVIDER_ERROR",
      plane: "linkbot",
      message: error instanceof Error ? error.message : "Unknown reasoning error",
      retryable: true,
      occurred_at: new Date().toISOString(),
    };

    // Emit role.failed
    const failed_event_id = await emitRoleFailed(
      request.tenant_id,
      request.run_id,
      request.stage_id,
      role_id,
      session.session_id,
      failure
    );
    if (failed_event_id) {
      addSessionAuditRef(session.session_id, failed_event_id);
    }

    updateSessionState(session.session_id, "failed", failure);
    cleanupBotSession(session.session_id);

    return {
      outputs: {},
      model_run_id: `failed-${Date.now()}`,
      tokens_in: 0,
      tokens_out: 0,
      failure,
    };
  }
}

/**
 * Generate mock outputs based on reasoning kind
 */
function generateMockOutputs(
  reasoning_kind: ReasoningKind,
  inputs: Record<string, unknown>
): Record<string, unknown> {
  switch (reasoning_kind) {
    case "lead_evaluation":
      return {
        lead_evaluation: {
          score: 0.85,
          segment: "high_value",
          rationale: "Strong industry presence and clear value proposition",
          model_run_id: `eval-${Date.now()}`,
        },
      };

    case "template_selection":
      return {
        template_id: "marketing-smb-v1",
        selection_rationale: "Best fit for small business marketing needs",
      };

    case "copy_generation":
      return {
        copy_bundle: {
          blocks: [
            {
              block_id: "hero",
              text: { headline: "Transform Your Business", subheadline: "Professional solutions" },
            },
            {
              block_id: "features",
              text: { title: "Why Choose Us", description: "Expert service" },
            },
          ],
          locale: "en-US",
        },
      };

    case "media_placement":
      return {
        media_plan: {
          placements: [
            { block_id: "hero", asset_ref: "hero-image-1", kind: "placeholder" },
            { block_id: "features", asset_ref: "icon-set-1", kind: "placeholder" },
          ],
        },
      };

    default:
      return { result: "mock_output" };
  }
}

/**
 * Check adapter health
 */
export async function checkAdapterHealth(
  config: OpenClawAdapterConfig = DEFAULT_ADAPTER_CONFIG
): Promise<AdapterHealthStatus> {
  const validated_config = OpenClawAdapterConfigSchema.parse(config);
  const now = new Date().toISOString();

  // Check engine connectivity
  let engine_connected = false;
  try {
    const response = await fetch(`${validated_config.engine_endpoint}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    engine_connected = response.ok;
  } catch {
    engine_connected = false;
  }

  // Check LinkSkills
  let linkskills_reachable = false;
  try {
    const response = await fetch(`${validated_config.linkskills_endpoint}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    linkskills_reachable = response.ok;
  } catch {
    linkskills_reachable = false;
  }

  // Check LiNKbrain
  let linkbrain_reachable = false;
  try {
    const response = await fetch(`${validated_config.linkbrain_endpoint}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    linkbrain_reachable = response.ok;
  } catch {
    linkbrain_reachable = false;
  }

  // Check LiNKautowork
  let linkautowork_reachable = false;
  try {
    const response = await fetch(`${validated_config.linkautowork_endpoint}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    linkautowork_reachable = response.ok;
  } catch {
    linkautowork_reachable = false;
  }

  const healthy = engine_connected && linkskills_reachable && linkbrain_reachable;

  return {
    status: healthy ? "healthy" : engine_connected ? "degraded" : "unhealthy",
    engine_connected,
    linkskills_reachable,
    linkbrain_reachable,
    linkautowork_reachable,
    last_check_at: now,
  };
}

/**
 * Get adapter version info
 */
export function getAdapterVersion(): {
  version: string;
  engine: string;
  supported_roles: string[];
} {
  return {
    version: "0.1.0",
    engine: "openclaw",
    supported_roles: [
      "research_enrichment_bot",
      "website_builder_bot",
      "lead_scout_bot",
      "outreach_bot",
    ],
  };
}
