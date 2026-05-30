/**
 * LiNKbrain audit envelope writer — implements `brain.audit.write`
 * per `LiNKdev/product/grounding/CONTRACTS_MVO.md` §6.3 and `LiNKdev/product/grounding/DECISIONS.md` D-08.
 *
 * Canonical contract types (`AuditEvent`, `AuditWriteResult`, `Plane`, …)
 * are imported from `./contracts-mvo` (WP-005). This module is the only
 * writer-side surface; do not redefine envelope types elsewhere.
 */

import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";

import {
  AUDIT_ACTIONS,
  AuditEventSchema,
  type AuditEvent,
  type AuditWriteResult,
  type FailureReport,
} from "./contracts-mvo.js";

const CANONICAL_AUDIT_ACTIONS: ReadonlySet<string> = new Set(AUDIT_ACTIONS);

const PII_FORBIDDEN_PAYLOAD_KEYS = [
  "email",
  "phone",
  "contact_email",
  "contact_phone",
  "contact",
] as const;

export interface AuditEnvelopeRejection {
  code:
    | "AUDIT_ENVELOPE_INVALID"
    | "AUDIT_ENVELOPE_PII_FORBIDDEN"
    | "AUDIT_ACTION_UNKNOWN";
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Validates an `AuditEvent` envelope against §6.3 (envelope), §6.3.1
 * (canonical action set), and §3.4 (PII rules). Returns null on success
 * or a structured rejection on first violation.
 */
export function validateAuditEnvelope(event: unknown): AuditEnvelopeRejection | null {
  const parsed = AuditEventSchema.safeParse(event);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      code: "AUDIT_ENVELOPE_INVALID",
      message: issue ? `${issue.path.join(".") || "envelope"}: ${issue.message}` : "envelope invalid",
      details: { issues: parsed.error.issues },
    };
  }
  const ev = parsed.data;

  if (!CANONICAL_AUDIT_ACTIONS.has(ev.action)) {
    return {
      code: "AUDIT_ACTION_UNKNOWN",
      message: `action "${ev.action}" is not in the canonical §6.3.1 set; add via a decision row before emitting`,
    };
  }

  for (const key of PII_FORBIDDEN_PAYLOAD_KEYS) {
    if (Object.prototype.hasOwnProperty.call(ev.payload, key)) {
      return {
        code: "AUDIT_ENVELOPE_PII_FORBIDDEN",
        message: `payload must not include "${key}" (§3.4); reference contacts via subject.lead_id only`,
      };
    }
  }

  return null;
}

/**
 * `brain.audit.write` — persist a single AuditEvent envelope to LiNKbrain.
 *
 * - Validates §6.3 envelope and §3.4 PII rules before the database call.
 * - Calls the SECURITY DEFINER RPC `linkbrain.write_audit_event` which
 *   re-validates server-side and idempotently inserts on `event_id`.
 * - Always returns the canonical `AuditWriteResult` envelope: on rejection
 *   or DB error, `failure` is populated and `persisted_at` is the
 *   rejection timestamp (not a real persistence time).
 */
export async function writeBrainAuditEvent(
  env: Env,
  event: AuditEvent,
): Promise<AuditWriteResult> {
  const rejection = validateAuditEnvelope(event);
  if (rejection) {
    return rejectionResult(event, rejection);
  }

  const client = createSupabaseServiceClient(env);
  const { data, error } = await client
    .schema("linkbrain")
    .rpc("write_audit_event", {
      p_event_id: event.event_id,
      p_ts: event.ts,
      p_tenant_id: event.tenant_id,
      p_plane: event.plane,
      p_actor_kind: event.actor.actor_kind,
      p_actor_id: event.actor.actor_id,
      p_action: event.action,
      p_subject: event.subject,
      p_refs: event.refs ?? {},
      p_payload: event.payload,
      p_schema_version: event.schema_version,
    });

  if (error) {
    const msg = error.message ?? "unknown audit write error";
    const code: AuditEnvelopeRejection["code"] | "AUDIT_WRITE_FAILED" = msg.includes(
      "AUDIT_ENVELOPE_PII_FORBIDDEN",
    )
      ? "AUDIT_ENVELOPE_PII_FORBIDDEN"
      : msg.includes("AUDIT_ENVELOPE_INVALID")
        ? "AUDIT_ENVELOPE_INVALID"
        : "AUDIT_WRITE_FAILED";
    return {
      event_id: event.event_id,
      persisted_at: new Date().toISOString(),
      failure: makeFailure(event, code, msg, { pg_code: error.code }),
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object" || !("event_id" in row) || !("persisted_at" in row)) {
    return {
      event_id: event.event_id,
      persisted_at: new Date().toISOString(),
      failure: makeFailure(event, "AUDIT_WRITE_FAILED", "audit write returned no row"),
    };
  }

  return {
    event_id: String((row as { event_id: unknown }).event_id),
    persisted_at: String((row as { persisted_at: unknown }).persisted_at),
  };
}

function rejectionResult(event: AuditEvent, rejection: AuditEnvelopeRejection): AuditWriteResult {
  return {
    event_id: event.event_id,
    persisted_at: new Date().toISOString(),
    failure: makeFailure(event, rejection.code, rejection.message, rejection.details),
  };
}

function makeFailure(
  event: Pick<AuditEvent, "plane">,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): FailureReport {
  return {
    code,
    plane: event.plane,
    message,
    retryable: false,
    occurred_at: new Date().toISOString(),
    ...(details ? { details } : {}),
  };
}

export { CANONICAL_AUDIT_ACTIONS };
