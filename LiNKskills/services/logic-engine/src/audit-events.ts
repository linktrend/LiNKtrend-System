/**
 * LinkSkills audit event builders for LiNKbrain integration.
 *
 * Implements §6.3 audit envelope contract:
 * - Every lease lifecycle transition emits a brain.audit.write event
 * - Capability outputs emit output-level events (crm.upserted, etc.)
 */

import type { Env } from "@linktrend/shared-config";
import {
  writeBrainAuditEvent,
  type AuditEvent,
  type LeaseRequest,
  type LeaseDecision,
  type LeaseExecuteResult,
  type FailureReport,
} from "@linktrend/linklogic-sdk";

/**
 * Build a lease.requested audit event.
 */
export function buildLeaseRequestedEvent(
  lease_id: string,
  request: LeaseRequest,
  kill_switch_state: "open" | "tripped",
): AuditEvent {
  return {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: request.tenant_id,
    plane: "linkskills",
    actor: {
      actor_kind: request.actor.actor_kind === "user" ? "user" : "plugin",
      actor_id: request.actor.actor_id,
    },
    action: "lease.requested",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
      lease_id,
      capability: request.capability,
    },
    refs: {},
    payload: {
      capability: request.capability,
      idempotency_key: request.idempotency_key,
      kill_switch_state: kill_switch_state,
      // PII guard: arguments may contain contact info; only log capability name
    },
    schema_version: "1",
  };
}

/**
 * Build a lease.granted audit event.
 */
export function buildLeaseGrantedEvent(
  lease_id: string,
  request: LeaseRequest,
  decision: LeaseDecision,
): AuditEvent {
  return {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: request.tenant_id,
    plane: "linkskills",
    actor: {
      actor_kind: "system",
      actor_id: "linkskills",
    },
    action: "lease.granted",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
      lease_id,
      capability: request.capability,
    },
    refs: {},
    payload: {
      capability: request.capability,
      expires_at: decision.expires_at,
      reason: decision.reason,
    },
    schema_version: "1",
  };
}

/**
 * Build a lease.denied audit event.
 */
export function buildLeaseDeniedEvent(
  lease_id: string,
  request: LeaseRequest,
  reason: string,
  failure?: FailureReport,
): AuditEvent {
  return {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: request.tenant_id,
    plane: "linkskills",
    actor: {
      actor_kind: "system",
      actor_id: "linkskills",
    },
    action: "lease.denied",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
      lease_id,
      capability: request.capability,
    },
    refs: {},
    payload: {
      capability: request.capability,
      reason,
      failure_code: failure?.code,
    },
    schema_version: "1",
  };
}

/**
 * Build a lease.requires_approval audit event.
 */
export function buildLeaseRequiresApprovalEvent(
  lease_id: string,
  request: LeaseRequest,
  reason?: string,
): AuditEvent {
  return {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: request.tenant_id,
    plane: "linkskills",
    actor: {
      actor_kind: "system",
      actor_id: "linkskills",
    },
    action: "lease.denied",  // Uses denied with requires_approval reason
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
      lease_id,
      capability: request.capability,
    },
    refs: {},
    payload: {
      capability: request.capability,
      requires_approval: true,
      reason: reason ?? "Policy requires approval",
    },
    schema_version: "1",
  };
}

/**
 * Build a lease.executed audit event.
 */
export function buildLeaseExecutedEvent(
  lease_id: string,
  request: LeaseRequest,
  result: LeaseExecuteResult,
): AuditEvent {
  return {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: request.tenant_id,
    plane: "linkskills",
    actor: {
      actor_kind: "system",
      actor_id: "linkskills",
    },
    action: "lease.executed",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
      lease_id,
      capability: request.capability,
    },
    refs: {},
    payload: {
      capability: request.capability,
      ledger_entry_id: result.ledger_entry_id,
      result_keys: Object.keys(result.result),
      // PII guard: do not log full result which may contain ids
    },
    schema_version: "1",
  };
}

/**
 * Build capability output-level audit events.
 * These are the "crm.upserted", "plane.project.created", etc. events.
 */
export function buildCapabilityOutputEvent(
  lease_id: string,
  request: LeaseRequest,
  result: LeaseExecuteResult,
): AuditEvent {
  const actionMap: Record<string, string> = {
    "crm.upsert": "crm.upserted",
    "plane.project.create": "plane.project.created",
    "plane.task.create": "plane.task.created",
    "preview.publish": "preview.published",
  };

  const action = actionMap[request.capability] ?? `${request.capability}.completed`;

  // Build subject based on capability type
  const subject: AuditEvent["subject"] = {
    run_id: request.run_id,
    stage_id: request.stage_id,
    lease_id,
    capability: request.capability,
  };

  // Add capability-specific subject fields
  if (request.capability === "crm.upsert") {
    subject.crm_record_id = result.result.crm_record_id as string | undefined;
  } else if (request.capability === "plane.project.create") {
    subject.project_id = result.result.project_id as string | undefined;
  } else if (request.capability === "plane.task.create") {
    subject.task_id = result.result.task_id as string | undefined;
  } else if (request.capability === "preview.publish") {
    subject.preview_url = result.result.preview_url as string | undefined;
    subject.preview_artifact_ref = result.result.preview_artifact_ref as string | undefined;
  }

  return {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: request.tenant_id,
    plane: "linkskills",
    actor: {
      actor_kind: "system",
      actor_id: "linkskills",
    },
    action: action as AuditEvent["action"],
    subject,
    refs: {
      caused_by_event_id: result.audit_event_id,  // Ref to the lease.executed event
    },
    payload: {
      capability: request.capability,
      result_summary: summarizeResult(result.result),
    },
    schema_version: "1",
  };
}

/**
 * Summarize a result object for audit payload (redacts sensitive fields).
 */
function summarizeResult(result: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of Object.keys(result)) {
    // Include boolean flags and ids, but mark as present
    if (typeof result[key] === "boolean") {
      summary[key] = result[key];
    } else if (typeof result[key] === "string" && key.endsWith("_id")) {
      summary[key] = "[id]";  // Redact actual id values
    } else if (key === "created") {
      summary[key] = result[key];
    }
  }
  return summary;
}

/**
 * Emit a lease.requested audit event to LiNKbrain.
 */
export async function emitLeaseRequested(
  env: Env,
  lease_id: string,
  request: LeaseRequest,
  kill_switch_state: "open" | "tripped",
): Promise<{ event_id: string | null; error?: Error }> {
  const event = buildLeaseRequestedEvent(lease_id, request, kill_switch_state);
  const result = await writeBrainAuditEvent(env, event);

  if (result.failure) {
    return { event_id: null, error: new Error(result.failure.message) };
  }

  return { event_id: result.event_id };
}

/**
 * Emit a lease.granted audit event to LiNKbrain.
 */
export async function emitLeaseGranted(
  env: Env,
  lease_id: string,
  request: LeaseRequest,
  decision: LeaseDecision,
): Promise<{ event_id: string | null; error?: Error }> {
  const event = buildLeaseGrantedEvent(lease_id, request, decision);
  const result = await writeBrainAuditEvent(env, event);

  if (result.failure) {
    return { event_id: null, error: new Error(result.failure.message) };
  }

  return { event_id: result.event_id };
}

/**
 * Emit a lease.denied audit event to LiNKbrain.
 */
export async function emitLeaseDenied(
  env: Env,
  lease_id: string,
  request: LeaseRequest,
  reason: string,
  failure?: FailureReport,
): Promise<{ event_id: string | null; error?: Error }> {
  const event = buildLeaseDeniedEvent(lease_id, request, reason, failure);
  const result = await writeBrainAuditEvent(env, event);

  if (result.failure) {
    return { event_id: null, error: new Error(result.failure.message) };
  }

  return { event_id: result.event_id };
}

/**
 * Emit a lease.executed audit event to LiNKbrain.
 */
export async function emitLeaseExecuted(
  env: Env,
  lease_id: string,
  request: LeaseRequest,
  result: LeaseExecuteResult,
): Promise<{ event_id: string | null; error?: Error }> {
  const event = buildLeaseExecutedEvent(lease_id, request, result);
  const writeResult = await writeBrainAuditEvent(env, event);

  if (writeResult.failure) {
    return { event_id: null, error: new Error(writeResult.failure.message) };
  }

  return { event_id: writeResult.event_id };
}

/**
 * Emit a capability output-level audit event to LiNKbrain.
 * This is the crm.upserted, plane.project.created, etc. event.
 */
export async function emitCapabilityOutput(
  env: Env,
  lease_id: string,
  request: LeaseRequest,
  result: LeaseExecuteResult,
): Promise<{ event_id: string | null; error?: Error }> {
  const event = buildCapabilityOutputEvent(lease_id, request, result);
  const writeResult = await writeBrainAuditEvent(env, event);

  if (writeResult.failure) {
    return { event_id: null, error: new Error(writeResult.failure.message) };
  }

  return { event_id: writeResult.event_id };
}
