/**
 * Agent Zero runtime adapter — LiNKbot contract surface (Wave 2.2).
 */

import type { Env } from "@linktrend/shared-config";

import { emitAgentZeroEvent } from "./event.js";
import { requestAgentZeroLease } from "./lease.js";
import { executeAgentZeroMission, defaultAgentZeroConfig } from "./mission.js";
import { openAgentZeroSession, updateAgentZeroSessionState } from "./session.js";
import type { AgentZeroSessionContext } from "./types.js";
import { terminateAgentZeroSession } from "./terminate.js";
import type {
  AgentZeroMissionRequest,
  AgentZeroMissionResult,
  AgentZeroRuntimeAdapter,
} from "./types.js";

export class AgentZeroAdapter implements AgentZeroRuntimeAdapter {
  constructor(private readonly env: Env) {}

  openSession(request: AgentZeroMissionRequest): AgentZeroSessionContext {
    const session = openAgentZeroSession(request);
    updateAgentZeroSessionState(session.session_id, "mission_assigned");
    return session;
  }

  assignMission(
    session: AgentZeroSessionContext,
    request: AgentZeroMissionRequest,
  ): Promise<AgentZeroMissionResult> {
    return executeAgentZeroMission(this.env, request, defaultAgentZeroConfig(this.env));
  }

  requestLease(
    session: AgentZeroSessionContext,
    capability: string,
    arguments_: Record<string, unknown>,
  ): Promise<string | null> {
    return requestAgentZeroLease(
      this.env,
      session,
      capability,
      arguments_,
      defaultAgentZeroConfig(this.env),
    );
  }

  emitEvent(
    session: AgentZeroSessionContext,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<string | null> {
    return emitAgentZeroEvent(this.env, session, action, payload);
  }

  terminate(session: AgentZeroSessionContext, reason: string): Promise<void> {
    return terminateAgentZeroSession(this.env, session, reason);
  }
}

export function createAgentZeroAdapter(env: Env): AgentZeroRuntimeAdapter {
  return new AgentZeroAdapter(env);
}

/** Convenience dispatch used by bot-runtime router (Wave 2.8). */
export async function dispatchAgentZeroMission(
  env: Env,
  request: AgentZeroMissionRequest,
): Promise<AgentZeroMissionResult> {
  return executeAgentZeroMission(env, request);
}

export async function checkAgentZeroWorkerHealth(
  env: Env,
): Promise<{ ok: boolean; status: number; endpoint: string }> {
  const config = defaultAgentZeroConfig(env);
  const healthUrl = `${config.worker_endpoint.replace(/\/+$/, "")}/api/health`;
  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
    return { ok: res.ok, status: res.status, endpoint: healthUrl };
  } catch {
    return { ok: false, status: 0, endpoint: healthUrl };
  }
}
