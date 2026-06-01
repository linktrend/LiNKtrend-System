/**
 * Mission Lifecycle Management
 *
 * Per CONTRACTS_MVO.md §6.1 - LiNKbot accepts missions and returns results.
 * This module provides mission-level orchestration above individual reasoning calls.
 */

import {
  BotReasonRequest,
  BotReasonResult,
  FailureReport,
  LinkSitesV2RoleId,
} from "./local-types.js";
import {
  MissionResult,
  BotSessionContext,
  OpenClawAdapterConfig,
} from "./types.js";
import { handleReasoningDispatch } from "./adapter.js";
import {
  createBotSession,
  updateSessionState,
  addSessionLeaseRef,
  addSessionAuditRef,
  addSessionModelRunId,
  cleanupBotSession,
  sessionToMissionResult,
} from "./session.js";
import {
  emitAuditEvent,
  emitRoleStarted,
  emitRoleCompleted,
  emitRoleFailed,
  emitProvenanceRecorded,
} from "./context-adapter.js";

/**
 * Mission configuration
 */
export interface MissionConfig {
  role_id: LinkSitesV2RoleId;
  capabilities_required: string[];
  max_attempts: number;
  timeout_ms: number;
}

/**
 * Mission linkbot role configurations per CONTRACTS_MVO.md §0.A.4
 */
export const MISSION_ROLES: Record<LinkSitesV2RoleId, MissionConfig> = {
  lead_scout_bot: {
    role_id: "lead_scout_bot",
    capabilities_required: ["cap.research.public_web", "cap.crm.odoo_shadow"],
    max_attempts: 1,
    timeout_ms: 60000,
  },
  research_enrichment_bot: {
    role_id: "research_enrichment_bot",
    capabilities_required: ["cap.research.public_web", "cap.zulip.run_messaging"],
    max_attempts: 3,
    timeout_ms: 300000,
  },
  website_builder_bot: {
    role_id: "website_builder_bot",
    capabilities_required: ["cap.asset.generation", "cap.zulip.run_messaging"],
    max_attempts: 3,
    timeout_ms: 300000,
  },
  outreach_bot: {
    role_id: "outreach_bot",
    capabilities_required: [],
    max_attempts: 1,
    timeout_ms: 60000,
  },
  librarian_bot: {
    role_id: "librarian_bot",
    capabilities_required: ["cap.zulip.run_messaging"],
    max_attempts: 1,
    timeout_ms: 120000,
  },
};

/**
 * Execute a complete mission
 *
 * This is the high-level mission handler that:
 * 1. Validates role and capabilities
 * 2. Creates mission session
 * 3. Executes reasoning dispatch
 * 4. Emits audit events
 * 5. Returns mission result
 */
export async function executeMission(
  request: BotReasonRequest,
  role_id: LinkSitesV2RoleId,
  config: OpenClawAdapterConfig
): Promise<MissionResult> {
  const mission_config = MISSION_ROLES[role_id];
  if (!mission_config) {
    return createMissionFailure(
      request,
      role_id,
      {
        code: "MANIFEST_INVALID",
        plane: "linkbot",
        message: `Unknown mission role: ${role_id}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
      null
    );
  }

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

  if (role_id === "lead_scout_bot") {
    const result = await executeLeadScoutAcquisition(request, session);
    cleanupBotSession(session.session_id);
    return result;
  }

  if (role_id === "librarian_bot") {
    const { executeLibrarianKnowledgeLoop } = await import("./librarian-mission.js");
    const result = await executeLibrarianKnowledgeLoop(request, session, undefined);
    cleanupBotSession(session.session_id);
    return result;
  }

  // Check for disabled roles in MVO
  if (role_id === "outreach_bot") {
    // Emit role.skipped for disabled MVO roles
    const skipped_event_id = await emitRoleStarted(
      request.tenant_id,
      request.run_id,
      request.stage_id,
      role_id,
      session.session_id
    );
    if (skipped_event_id) {
      addSessionAuditRef(session.session_id, skipped_event_id);
    }

    const mockResult: MissionResult = {
      session_id: session.session_id,
      run_id: request.run_id,
      stage_id: request.stage_id,
      outputs: {
        status: "skipped",
        reason: "role_disabled_in_mvo",
        role_id,
      },
      provenance: {
        model_run_id: "mock-disabled",
        tokens_in: 0,
        tokens_out: 0,
        reasoning_duration_ms: 0,
        context_refs: [],
        lease_refs: [],
        audit_refs: session.refs.audit_event_ids,
      },
      completed_at: new Date().toISOString(),
      success: true,
    };

    cleanupBotSession(session.session_id);
    return mockResult;
  }

  // Execute with retry logic
  let last_error: Error | null = null;

  for (let attempt = 1; attempt <= mission_config.max_attempts; attempt++) {
    try {
      const result = await executeMissionAttempt(
        request,
        role_id,
        session,
        config,
        attempt
      );

      cleanupBotSession(session.session_id);
      return result;
    } catch (error) {
      last_error = error instanceof Error ? error : new Error(String(error));

      if (attempt < mission_config.max_attempts) {
        // Exponential backoff: 1s, 4s, 16s
        const backoff = Math.pow(4, attempt - 1) * 1000;
        await sleep(backoff);
      }
    }
  }

  // All attempts failed
  const failure: FailureReport = {
    code: "MODEL_PROVIDER_ERROR",
    plane: "linkbot",
    message: last_error?.message || "Mission failed after max attempts",
    retryable: false,
    occurred_at: new Date().toISOString(),
  };

  const failedResult = createMissionFailure(request, role_id, failure, session);
  cleanupBotSession(session.session_id);
  return failedResult;
}

type LeadScoutGovernanceInput = {
  mode?: "mock" | "shadow" | "live";
  capability?: string;
  lease_id?: string;
  idempotency_key?: string;
};

function getLeadScoutGovernance(inputs: Record<string, unknown>): LeadScoutGovernanceInput {
  const governance = inputs.governance;
  if (governance && typeof governance === "object" && !Array.isArray(governance)) {
    return governance as LeadScoutGovernanceInput;
  }
  return {};
}

function getLeadInput(inputs: Record<string, unknown>): Record<string, unknown> {
  const leadInput = inputs.lead_input;
  if (leadInput && typeof leadInput === "object" && !Array.isArray(leadInput)) {
    return leadInput as Record<string, unknown>;
  }
  return {};
}

function slugifyLeadId(value: unknown): string {
  const raw = typeof value === "string" && value.trim().length > 0 ? value : "mock-demo-lead";
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "mock-demo-lead";
}

function createLeadScoutFailure(
  request: BotReasonRequest,
  session: BotSessionContext,
  message: string,
  code: FailureReport["code"] = "LEASE_REQUEST_INVALID",
): MissionResult {
  const failure: FailureReport = {
    code,
    plane: "linkbot",
    message,
    retryable: code === "KERNEL_PERSISTENCE_FAILED",
    approval_required: code === "POLICY_REQUIRES_APPROVAL" ? true : undefined,
    occurred_at: new Date().toISOString(),
  };
  return createMissionFailure(request, "lead_scout_bot", failure, session);
}

/**
 * Execute Principal D1-B lead generation: one governed mock demo lead.
 *
 * LinkSkills owns lease issuance; LiNKbot only requires and records the supplied
 * lease reference, then emits the role/provenance audit trail for traceability.
 */
async function executeLeadScoutAcquisition(
  request: BotReasonRequest,
  session: BotSessionContext,
): Promise<MissionResult> {
  const governance = getLeadScoutGovernance(request.inputs);
  const mode = governance.mode ?? "mock";
  const capability = governance.capability ?? "cap.research.public_web";

  if (mode === "live") {
    return createLeadScoutFailure(
      request,
      session,
      "lead_scout_bot live acquisition is disabled for MVO; Principal approval is required before live Maps/search.",
      "POLICY_REQUIRES_APPROVAL",
    );
  }

  if (!governance.lease_id) {
    return createLeadScoutFailure(
      request,
      session,
      "lead_scout_bot requires a LinkSkills lease_id before acquiring the mock demo lead.",
    );
  }

  const auditRefs: string[] = [];
  const leaseRefs = [governance.lease_id];
  addSessionLeaseRef(session.session_id, governance.lease_id);

  const startedEventId = await emitRoleStarted(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    "lead_scout_bot",
    session.session_id,
  );
  if (!startedEventId) {
    return createLeadScoutFailure(
      request,
      session,
      "lead_scout_bot could not persist role.started audit event.",
      "KERNEL_PERSISTENCE_FAILED",
    );
  }
  auditRefs.push(startedEventId);
  addSessionAuditRef(session.session_id, startedEventId);

  const leadInput = getLeadInput(request.inputs);
  const businessName = leadInput.business_name ?? "Mock LinkSites Demo Lead";
  const leadSlug = slugifyLeadId(businessName);
  const acquiredAt = new Date().toISOString();
  const modelRunId = `lead-scout-mock-${leadSlug}`;
  addSessionModelRunId(session.session_id, modelRunId);

  const leadRecordRef = {
    lead_id: `mock-lead-${leadSlug}`,
    tenant_id: request.tenant_id,
    crm_record_id: `mock-crm-${leadSlug}`,
    source: "mock_demo_lead",
    acquisition_mode: "mock",
    capability,
    idempotency_key:
      governance.idempotency_key ??
      `${request.tenant_id}:${request.run_id}:${request.stage_id}:lead_scout_bot`,
    acquired_at: acquiredAt,
  };
  const provenanceRefs = [
    `mock-demo-lead:${leadRecordRef.lead_id}`,
    `lease:${governance.lease_id}`,
  ];

  const acquisitionEvent = await emitAuditEvent({
    tenant_id: request.tenant_id,
    plane: "linkbot",
    actor: {
      actor_kind: "bot",
      actor_id: "lead_scout_bot",
    },
    action: "lead.acquired",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
      lease_id: governance.lease_id,
      capability,
      lead_id: leadRecordRef.lead_id,
      crm_record_id: leadRecordRef.crm_record_id,
    },
    payload: {
      role_id: "lead_scout_bot",
      mode,
      source: "mock_demo_lead",
      live_acquisition_enabled: false,
      live_provider_ready: ["google_maps"],
      principal_decision: "D1 B",
      idempotency_key: leadRecordRef.idempotency_key,
    },
    schema_version: "1",
  });
  if (!acquisitionEvent) {
    return createLeadScoutFailure(
      request,
      session,
      "lead_scout_bot could not persist lead.acquired audit event.",
      "KERNEL_PERSISTENCE_FAILED",
    );
  }
  auditRefs.push(acquisitionEvent.event_id);
  addSessionAuditRef(session.session_id, acquisitionEvent.event_id);

  const provenanceEventId = await emitProvenanceRecorded(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    "lead_scout_bot",
    provenanceRefs,
  );
  if (!provenanceEventId) {
    return createLeadScoutFailure(
      request,
      session,
      "lead_scout_bot could not persist provenance.recorded audit event.",
      "KERNEL_PERSISTENCE_FAILED",
    );
  }
  auditRefs.push(provenanceEventId);
  addSessionAuditRef(session.session_id, provenanceEventId);

  updateSessionState(session.session_id, "completed");
  const completedEventId = await emitRoleCompleted(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    "lead_scout_bot",
    session.session_id,
    modelRunId,
    0,
    0,
  );
  if (!completedEventId) {
    return createLeadScoutFailure(
      request,
      session,
      "lead_scout_bot could not persist role.completed audit event.",
      "KERNEL_PERSISTENCE_FAILED",
    );
  }
  auditRefs.push(completedEventId);
  addSessionAuditRef(session.session_id, completedEventId);

  const createdTime = new Date(session.created_at).getTime();
  return {
    session_id: session.session_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    outputs: {
      lead_record_ref: leadRecordRef,
      lead_provenance: {
        provenance_refs: provenanceRefs,
        acquired_at: acquiredAt,
        provider: "mock_demo_lead",
        lease_id: governance.lease_id,
        audit_event_ids: auditRefs,
      },
      governance: {
        mode,
        capability,
        lease_id: governance.lease_id,
        live_provider_ready: ["google_maps"],
        live_acquisition_enabled: false,
        policy: "MVO uses governed mock lead; live Maps/search requires Principal approval.",
      },
    },
    provenance: {
      model_run_id: modelRunId,
      tokens_in: 0,
      tokens_out: 0,
      reasoning_duration_ms: Date.now() - createdTime,
      context_refs: [],
      lease_refs: leaseRefs,
      audit_refs: auditRefs,
    },
    completed_at: new Date().toISOString(),
    success: true,
  };
}

/**
 * Execute a single mission attempt
 */
async function executeMissionAttempt(
  request: BotReasonRequest,
  role_id: string,
  session: BotSessionContext,
  config: OpenClawAdapterConfig,
  attempt: number
): Promise<MissionResult> {
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

  // Execute reasoning dispatch
  const result = await handleReasoningDispatch(request, role_id, config);

  if (result.failure) {
    // Emit role.failed
    const failed_event_id = await emitRoleFailed(
      request.tenant_id,
      request.run_id,
      request.stage_id,
      role_id,
      session.session_id,
      result.failure
    );
    if (failed_event_id) {
      addSessionAuditRef(session.session_id, failed_event_id);
    }

    throw new Error(result.failure.message);
  }

  // Record model run ID
  if (result.model_run_id) {
    addSessionModelRunId(session.session_id, result.model_run_id);
  }

  // Emit role.completed
  const completed_event_id = await emitRoleCompleted(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    role_id,
    session.session_id,
    result.model_run_id,
    result.tokens_in,
    result.tokens_out
  );
  if (completed_event_id) {
    addSessionAuditRef(session.session_id, completed_event_id);
  }

  // Build mission result
  const createdTime = new Date(session.created_at).getTime();
  const currentTime = new Date().getTime();

  const missionResult: MissionResult = {
    session_id: session.session_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    outputs: result.outputs,
    provenance: {
      model_run_id: result.model_run_id,
      tokens_in: result.tokens_in,
      tokens_out: result.tokens_out,
      reasoning_duration_ms: currentTime - createdTime,
      context_refs: session.refs.context_request_id ? [session.refs.context_request_id] : [],
      lease_refs: session.refs.lease_ids,
      audit_refs: session.refs.audit_event_ids,
    },
    completed_at: new Date().toISOString(),
    success: true,
  };

  return missionResult;
}

/**
 * Create a mission failure result
 */
function createMissionFailure(
  request: BotReasonRequest,
  role_id: string,
  failure: FailureReport,
  session: BotSessionContext | null
): MissionResult {
  const now = new Date().toISOString();

  return {
    session_id: session?.session_id || `failed-${Date.now()}`,
    run_id: request.run_id,
    stage_id: request.stage_id,
    outputs: {},
    provenance: {
      model_run_id: "failed",
      tokens_in: 0,
      tokens_out: 0,
      reasoning_duration_ms: 0,
      context_refs: [],
      lease_refs: session?.refs.lease_ids || [],
      audit_refs: session?.refs.audit_event_ids || [],
    },
    completed_at: now,
    success: false,
    failure,
  };
}

/**
 * Sleep helper for backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate mission can proceed
 */
export function validateMission(
  role_id: string,
  capabilities_available: string[]
): { valid: boolean; missing_capabilities: string[] } {
  const config = MISSION_ROLES[role_id as LinkSitesV2RoleId];
  if (!config) {
    return {
      valid: false,
      missing_capabilities: [],
    };
  }

  const available = new Set(capabilities_available);
  const missing = config.capabilities_required.filter((cap) => !available.has(cap));

  return {
    valid: missing.length === 0,
    missing_capabilities: missing,
  };
}

/**
 * List available mission roles
 */
export function listMissionRoles(): Array<{ role_id: LinkSitesV2RoleId; enabled_in_mvo: boolean }> {
  return [
    { role_id: "lead_scout_bot", enabled_in_mvo: true },
    { role_id: "research_enrichment_bot", enabled_in_mvo: true },
    { role_id: "website_builder_bot", enabled_in_mvo: true },
    { role_id: "librarian_bot", enabled_in_mvo: true },
    { role_id: "outreach_bot", enabled_in_mvo: false },
  ];
}
