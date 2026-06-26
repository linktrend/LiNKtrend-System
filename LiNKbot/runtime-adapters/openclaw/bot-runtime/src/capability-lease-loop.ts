/**
 * Bot-runtime governed capability loop: request lease → execute → audit → LiNKbrain.
 */

import type { Env } from "@linktrend/shared-config";
import { writeBrainAuditEvent, type AuditEvent } from "@linktrend/linklogic-sdk";
import { createHash, randomUUID } from "node:crypto";
import {
  buildLeaseIdempotencyKey,
  executeLease,
  requestLease,
  isLeaseValid,
  type BotLeaseRequest,
} from "./lease-adapter.js";
import { addSessionAuditRef, addSessionLeaseRef } from "./session.js";
import { recordBotSkillTrace } from "./linkguard-cleanup.js";
import { persistLinkguardSessionCleanup } from "./linkguard-persist-cleanup.js";

export type GovernedCapabilityInvocation = {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  role_id: string;
  capability: string;
  arguments: Record<string, unknown>;
  session_id: string;
};

export type GovernedCapabilityResult = {
  ok: boolean;
  lease_id?: string;
  result?: Record<string, unknown>;
  audit_event_ids: string[];
  failure_message?: string;
};

export async function invokeGovernedCapability(
  env: Env,
  invocation: GovernedCapabilityInvocation,
): Promise<GovernedCapabilityResult> {
  const idempotency_key = buildLeaseIdempotencyKey(
    invocation.run_id,
    invocation.stage_id,
    invocation.capability,
  );

  const leaseRequest: BotLeaseRequest = {
    session_id: invocation.session_id,
    tenant_id: invocation.tenant_id,
    run_id: invocation.run_id,
    stage_id: invocation.stage_id,
    capability: invocation.capability,
    arguments: invocation.arguments,
    idempotency_key,
    requested_by_role: invocation.role_id,
  };

  const decision = await requestLease(leaseRequest, {
    linkskills_endpoint: env.LINKSKILLS_ENDPOINT ?? "http://localhost:3002",
    default_ttl_seconds: 300,
    request_timeout_ms: 15_000,
  });

  if (!isLeaseValid(decision) || decision.status !== "granted") {
    return {
      ok: false,
      audit_event_ids: [],
      failure_message: decision.reason ?? decision.failure?.message ?? "Lease denied",
    };
  }

  addSessionLeaseRef(invocation.session_id, decision.lease_id);

  const exec = await executeLease(decision.lease_id, `${idempotency_key}:exec`, {
    linkskills_endpoint: env.LINKSKILLS_ENDPOINT ?? "http://localhost:3002",
    default_ttl_seconds: 300,
    request_timeout_ms: 30_000,
  });

  if (exec.failure) {
    return {
      ok: false,
      lease_id: decision.lease_id,
      audit_event_ids: [],
      failure_message: exec.failure.message,
    };
  }

  recordBotSkillTrace({
    session_id: invocation.session_id,
    skill_id: invocation.capability,
    skill_name: invocation.capability,
    captured_at: new Date().toISOString(),
    trace_digest: createHash("sha256")
      .update(
        JSON.stringify({
          capability: invocation.capability,
          role_id: invocation.role_id,
          stage_id: invocation.stage_id,
        }),
      )
      .digest("hex"),
  });

  const auditIds: string[] = [];
  const requestedAudit = await writeBrainAuditEvent(env, {
    event_id: randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: invocation.tenant_id,
    plane: "linkskills",
    actor: { actor_kind: "bot", actor_id: invocation.role_id },
    action: "lease.requested",
    subject: { run_id: invocation.run_id, stage_id: invocation.stage_id, lease_id: decision.lease_id },
    payload: { capability: invocation.capability, idempotency_key },
    schema_version: "1",
  } as AuditEvent);
  if (!requestedAudit.failure) {
    auditIds.push(requestedAudit.event_id);
    addSessionAuditRef(invocation.session_id, requestedAudit.event_id);
  }

  const executedAudit = await writeBrainAuditEvent(env, {
    event_id: randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: invocation.tenant_id,
    plane: "linkskills",
    actor: { actor_kind: "bot", actor_id: invocation.role_id },
    action: "lease.executed",
    subject: { run_id: invocation.run_id, stage_id: invocation.stage_id, lease_id: decision.lease_id },
    payload: { capability: invocation.capability, result_keys: Object.keys(exec.result ?? {}) },
    schema_version: "1",
  } as AuditEvent);
  if (!executedAudit.failure) {
    auditIds.push(executedAudit.event_id);
    addSessionAuditRef(invocation.session_id, executedAudit.event_id);
  }

  await persistLinkguardSessionCleanup(env, {
    session_id: invocation.session_id,
    tenant_id: invocation.tenant_id,
    role_id: invocation.role_id,
    lease_ids: [decision.lease_id],
    audit_event_ids: auditIds,
  });

  return {
    ok: true,
    lease_id: decision.lease_id,
    result: exec.result,
    audit_event_ids: auditIds,
  };
}
