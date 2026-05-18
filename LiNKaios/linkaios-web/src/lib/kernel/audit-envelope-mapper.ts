import { writeBrainAuditEvent, type AuditEvent, type AuditWriteResult } from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";

type SourcePlane = "linkbot" | "linkskills" | "linkautowork";

export interface AuditEnvelopeMappingSignal {
  source_plane: SourcePlane;
  source_action: string;
  tenant_id: string;
  run_id: string;
  stage_id?: string;
  payload?: Record<string, unknown>;
}

export interface CanonicalAuditEnvelopeDraft {
  plane: AuditEvent["plane"];
  action: string;
  subject: AuditEvent["subject"];
  payload: Record<string, unknown>;
}

function mapActionToCanonical(sourceAction: string): string | null {
  switch (sourceAction) {
    case "run.dispatched":
      return "run.started";
    case "role.started":
      return "stage.started";
    case "role.completed":
      return "stage.completed";
    case "role.failed":
      return "stage.failed";
    case "capability.requested":
      return "lease.requested";
    case "capability.executed":
      return "lease.executed";
    case "capability.failed":
      return "stage.failed";
    case "workflow.invoked":
    case "workflow.completed":
    case "workflow.failed":
      return sourceAction;
    case "linktrend.gov.authorization.granted":
      return "approval.granted";
    case "linktrend.gov.authorization.denied":
      return "approval.rejected";
    case "linktrend.gov.authorization.pending":
      return "stage.awaiting_approval";
    default:
      return null;
  }
}

export function mapToCanonicalAuditEnvelope(
  signal: AuditEnvelopeMappingSignal,
): CanonicalAuditEnvelopeDraft | null {
  const canonicalAction = mapActionToCanonical(signal.source_action);
  if (!canonicalAction) return null;

  const subject: AuditEvent["subject"] = {
    run_id: signal.run_id,
  };

  if (signal.stage_id) {
    subject.stage_id = signal.stage_id;
  }

  return {
    plane: signal.source_plane,
    action: canonicalAction,
    subject,
    payload: {
      source_action: signal.source_action,
      ...(signal.payload || {}),
    },
  };
}

export async function writeMappedAuditEnvelopeEvent(
  env: Env,
  signal: AuditEnvelopeMappingSignal,
): Promise<AuditWriteResult | null> {
  const mapped = mapToCanonicalAuditEnvelope(signal);
  if (!mapped) return null;

  const event: AuditEvent = {
    event_id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    tenant_id: signal.tenant_id,
    plane: mapped.plane,
    actor: {
      actor_kind: "system",
      actor_id: `${signal.source_plane}.mapper`,
    },
    action: mapped.action,
    subject: mapped.subject,
    payload: mapped.payload,
    schema_version: "1",
  };

  return writeBrainAuditEvent(env, event);
}
