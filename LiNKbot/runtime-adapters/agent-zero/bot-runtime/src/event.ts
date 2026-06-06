/**
 * Agent Zero audit event emission (Wave 2.2).
 */

import { randomUUID } from "node:crypto";

import { recordTrace, writeBrainAuditEvent } from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";

import type { AgentZeroSessionContext } from "./types.js";
import { addAgentZeroAuditRef } from "./session.js";

export async function emitAgentZeroEvent(
  env: Env,
  session: AgentZeroSessionContext,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<string | null> {
  const eventId = randomUUID();
  const fullPayload = {
    session_id: session.session_id,
    lane_id: session.lane_id,
    role_id: session.role_id,
    run_id: session.run_id,
    stage_id: session.stage_id,
    ...payload,
  };

  try {
    const auditResult = await writeBrainAuditEvent(env, {
      event_id: eventId,
      ts: new Date().toISOString(),
      schema_version: "1",
      tenant_id: session.tenant_id,
      plane: "linkbot",
      actor: { actor_kind: "bot", actor_id: session.role_id },
      action,
      subject: {
        run_id: session.run_id,
        stage_id: session.stage_id,
      },
      payload: fullPayload,
    });

    if (!auditResult.failure) {
      addAgentZeroAuditRef(session.session_id, eventId);
    }
  } catch (error) {
    log("warn", "agent-zero audit emit failed", {
      service: "agent-zero-runtime",
      action,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    await recordTrace(env, {
      eventType: `agent_zero.${action}`,
      payload: fullPayload,
    });
    addAgentZeroAuditRef(session.session_id, `trace-${eventId}`);
  } catch {
    /* best-effort */
  }

  return eventId;
}
