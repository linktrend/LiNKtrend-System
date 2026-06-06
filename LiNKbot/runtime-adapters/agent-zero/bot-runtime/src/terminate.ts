/**
 * Agent Zero session terminate + LiNKguard residue cleanup (Wave 2.2, 2.7).
 */

import type { Env } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";

import { emitAgentZeroEvent } from "./event.js";
import { persistAgentZeroLinkguardCleanup } from "./linkguard-cleanup.js";
import { removeAgentZeroSession, updateAgentZeroSessionState } from "./session.js";
import type { AgentZeroSessionContext } from "./types.js";

export async function terminateAgentZeroSession(
  env: Env,
  session: AgentZeroSessionContext,
  reason: string,
): Promise<void> {
  updateAgentZeroSessionState(session.session_id, "terminated");

  await emitAgentZeroEvent(env, session, "session.terminated", { reason });

  await persistAgentZeroLinkguardCleanup(env, {
    session_id: session.session_id,
    tenant_id: session.tenant_id,
    role_id: session.role_id,
    lane_id: session.lane_id,
    lease_ids: [...session.lease_ids],
    audit_event_ids: [...session.audit_event_ids],
  });

  removeAgentZeroSession(session.session_id);

  log("info", "agent-zero session terminated", {
    service: "agent-zero-runtime",
    session_id: session.session_id,
    lane_id: session.lane_id,
    reason,
  });
}
