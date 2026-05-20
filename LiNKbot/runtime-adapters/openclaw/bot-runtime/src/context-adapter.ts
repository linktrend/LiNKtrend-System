/**
 * LiNKbrain Context Handoff Adapter
 *
 * Per CONTRACTS_MVO.md §6.3 - All planes emit to LiNKbrain audit envelope.
 * LiNKbot MUST NOT hold canonical memory. This adapter provides:
 * - Context assembly requests to LiNKbrain
 * - Audit event emission tracking
 * - Memory retrieval for bot reasoning (read-only via LiNKbrain)
 */

import {
  ContextRequest,
  ContextAssemblyResult,
  AuditEvent,
  FailureReport,
  FailureCode,
} from "./local-types.js";
import { BotContextRequest } from "./types.js";

/**
 * Context adapter configuration
 */
export interface ContextAdapterConfig {
  linkbrain_endpoint: string;
  request_timeout_ms: number;
  max_context_entries: number;
}

/**
 * Default context adapter config
 */
export const DEFAULT_CONTEXT_CONFIG: ContextAdapterConfig = {
  linkbrain_endpoint: process.env.LINKBRAIN_ENDPOINT || "http://localhost:3003",
  request_timeout_ms: 15000,
  max_context_entries: 100,
};

/**
 * Context adapter error
 */
export class ContextAdapterError extends Error {
  constructor(
    message: string,
    public code: FailureCode,
    public context_request?: BotContextRequest
  ) {
    super(message);
    this.name = "ContextAdapterError";
  }
}

/**
 * Request context assembly from LiNKbrain
 */
export async function requestContextAssembly(
  bot_request: BotContextRequest,
  config: ContextAdapterConfig = DEFAULT_CONTEXT_CONFIG
): Promise<ContextAssemblyResult> {
  const context_request: ContextRequest = {
    tenant_id: bot_request.tenant_id,
    query_scope: {
      module: bot_request.query_scope.module,
      memory_types: bot_request.context_types,
      ...(bot_request.query_scope.lead_id && {
        subject: { lead_id: bot_request.query_scope.lead_id },
      }),
      ...(bot_request.query_scope.time_range && {
        time_range: bot_request.query_scope.time_range,
      }),
    },
    role_context: {
      role_id: bot_request.role_id,
      run_id: bot_request.run_id,
      stage_id: bot_request.stage_id,
    },
  };

  try {
    // In development mode, return mock context
    if (process.env.NODE_ENV === "development" && process.env.MOCK_CONTEXT === "true") {
      return {
        bundle: {
          memories: [],
          episodes: [],
          procedures: [],
        },
        scope: {
          tenant_id: bot_request.tenant_id,
          module: bot_request.query_scope.module || "default",
        },
        assembly_time_ms: 0,
        retrieved_at: new Date().toISOString(),
      };
    }

    const response = await fetch(`${config.linkbrain_endpoint}/context/assemble`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(context_request),
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });

    if (!response.ok) {
      throw new ContextAdapterError(
        `LiNKbrain context request failed: ${response.status}`,
        "INTEGRATION_UNAVAILABLE",
        bot_request
      );
    }

    const result = (await response.json()) as ContextAssemblyResult;
    return result;
  } catch (error) {
    if (error instanceof ContextAdapterError) {
      throw error;
    }

    return {
      bundle: {
        memories: [],
        episodes: [],
        procedures: [],
      },
      scope: {
        tenant_id: bot_request.tenant_id,
        module: bot_request.query_scope.module || "default",
      },
      assembly_time_ms: 0,
      retrieved_at: new Date().toISOString(),
      error: {
        code: "INTEGRATION_UNAVAILABLE",
        message: error instanceof Error ? error.message : "Unknown context error",
      },
    };
  }
}

/**
 * Emit audit event to LiNKbrain
 */
export async function emitAuditEvent(
  event: Omit<AuditEvent, "event_id" | "ts">,
  config: ContextAdapterConfig = DEFAULT_CONTEXT_CONFIG
): Promise<{ event_id: string; persisted_at: string } | null> {
  const full_event: AuditEvent = {
    ...event,
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
  };

  try {
    // In development mode, log and return mock success
    if (process.env.NODE_ENV === "development" && process.env.MOCK_AUDIT === "true") {
      console.log("[MOCK AUDIT]", full_event.action, full_event.subject);
      return {
        event_id: full_event.event_id,
        persisted_at: full_event.ts,
      };
    }

    const response = await fetch(`${config.linkbrain_endpoint}/audit/write`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(full_event),
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });

    if (!response.ok) {
      console.error(`Audit emission failed: ${response.status}`);
      return null;
    }

    const result = (await response.json()) as { persisted_at?: string };
    return {
      event_id: full_event.event_id,
      persisted_at: result.persisted_at || full_event.ts,
    };
  } catch (error) {
    console.error("Audit emission error:", error);
    return null;
  }
}

/**
 * Emit bot role started event
 */
export async function emitRoleStarted(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  session_id: string,
  config?: ContextAdapterConfig
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id,
      plane: "linkbot",
      actor: {
        actor_kind: "bot",
        actor_id: role_id,
      },
      action: "role.started",
      subject: {
        run_id,
        stage_id,
      },
      payload: {
        session_id,
        role_id,
      },
      schema_version: "1",
    },
    config
  );

  return result?.event_id || null;
}

/**
 * Emit bot role completed event
 */
export async function emitRoleCompleted(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  session_id: string,
  model_run_id: string,
  tokens_in: number,
  tokens_out: number,
  config?: ContextAdapterConfig
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id,
      plane: "linkbot",
      actor: {
        actor_kind: "bot",
        actor_id: role_id,
      },
      action: "role.completed",
      subject: {
        run_id,
        stage_id,
      },
      payload: {
        session_id,
        role_id,
        model_run_id,
        tokens_in,
        tokens_out,
      },
      schema_version: "1",
    },
    config
  );

  return result?.event_id || null;
}

/**
 * Emit bot role failed event
 */
export async function emitRoleFailed(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  session_id: string,
  failure: FailureReport,
  config?: ContextAdapterConfig
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id,
      plane: "linkbot",
      actor: {
        actor_kind: "bot",
        actor_id: role_id,
      },
      action: "role.failed",
      subject: {
        run_id,
        stage_id,
      },
      payload: {
        session_id,
        role_id,
        failure,
      },
      schema_version: "1",
    },
    config
  );

  return result?.event_id || null;
}

/**
 * Emit capability requested event
 */
export async function emitCapabilityRequested(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  capability: string,
  lease_id: string,
  config?: ContextAdapterConfig
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id,
      plane: "linkbot",
      actor: {
        actor_kind: "bot",
        actor_id: role_id,
      },
      action: "capability.requested",
      subject: {
        run_id,
        stage_id,
        lease_id,
        capability,
      },
      payload: {
        role_id,
      },
      schema_version: "1",
    },
    config
  );

  return result?.event_id || null;
}

/**
 * Emit research performed event
 */
export async function emitResearchPerformed(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  query_summary: string,
  citation_count: number,
  config?: ContextAdapterConfig
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id,
      plane: "linkbot",
      actor: {
        actor_kind: "bot",
        actor_id: role_id,
      },
      action: "research.performed",
      subject: {
        run_id,
        stage_id,
      },
      payload: {
        query_summary,
        citation_count,
      },
      schema_version: "1",
    },
    config
  );

  return result?.event_id || null;
}

/**
 * Emit provenance recorded event
 */
export async function emitProvenanceRecorded(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  provenance_refs: string[],
  config?: ContextAdapterConfig
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id,
      plane: "linkbot",
      actor: {
        actor_kind: "bot",
        actor_id: role_id,
      },
      action: "provenance.recorded",
      subject: {
        run_id,
        stage_id,
      },
      payload: {
        provenance_refs,
      },
      schema_version: "1",
    },
    config
  );

  return result?.event_id || null;
}
