/**
 * §6.3-shaped audit envelopes for integration tests only.
 * Duplicates {@link ../audit-events.ts} builders without importing `@linktrend/linklogic-sdk`
 * runtime (Vitest cannot resolve workspace SDK until `dist/` exists).
 */

import type { IntegrationCapturedEnvelope } from "./audit-sink.js";

export interface LeaseRequestLike {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability: string;
  idempotency_key: string;
  actor: { actor_kind: string; actor_id: string };
}

export interface LeaseDecisionLike {
  expires_at: string;
  reason?: string;
}

export interface LeaseExecuteResultLike {
  ledger_entry_id: string;
  audit_event_id: string;
  result: Record<string, unknown>;
}

export interface FailureLike {
  code?: string;
}

function summarizeResult(result: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "boolean") {
      summary[key] = result[key];
    } else if (typeof result[key] === "string" && key.endsWith("_id")) {
      summary[key] = "[id]";
    } else if (key === "created") {
      summary[key] = result[key];
    }
  }
  return summary;
}

export function integrationLeaseRequested(
  lease_id: string,
  request: LeaseRequestLike,
  kill_switch_state: "open" | "tripped",
): IntegrationCapturedEnvelope {
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
      kill_switch_state,
    },
    schema_version: "1",
  };
}

export function integrationLeaseGranted(
  lease_id: string,
  request: LeaseRequestLike,
  decision: LeaseDecisionLike,
): IntegrationCapturedEnvelope {
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
      ...(decision.reason !== undefined ? { reason: decision.reason } : {}),
    },
    schema_version: "1",
  };
}

export function integrationLeaseDenied(
  lease_id: string,
  request: LeaseRequestLike,
  reason: string,
  failure?: FailureLike,
): IntegrationCapturedEnvelope {
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
      ...(failure?.code !== undefined ? { failure_code: failure.code } : {}),
    },
    schema_version: "1",
  };
}

export function integrationLeaseExecuted(
  lease_id: string,
  request: LeaseRequestLike,
  result: LeaseExecuteResultLike,
): IntegrationCapturedEnvelope {
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
    },
    schema_version: "1",
  };
}

export function integrationCapabilityOutput(
  lease_id: string,
  request: LeaseRequestLike,
  result: LeaseExecuteResultLike,
): IntegrationCapturedEnvelope {
  const actionMap: Record<string, string> = {
    "crm.upsert": "crm.upserted",
    "plane.project.create": "plane.project.created",
    "plane.task.create": "plane.task.created",
    "preview.publish": "preview.published",
    "cap.zulip.run_messaging": "zulip.notification.queued",
    "cap.postiz.distribution": "postiz.distribution.mocked",
  };

  const action = actionMap[request.capability] ?? `${request.capability}.completed`;

  const subject: Record<string, unknown> = {
    run_id: request.run_id,
    stage_id: request.stage_id,
    lease_id,
    capability: request.capability,
  };

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
    action,
    subject,
    refs: {
      caused_by_event_id: result.audit_event_id,
    },
    payload: {
      capability: request.capability,
      result_summary: summarizeResult(result.result),
    },
    schema_version: "1",
  };
}
