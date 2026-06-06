/**
 * Agent Zero mission dispatch — POST to link-agentzero worker ingress (Wave 2.2).
 */

import { randomUUID } from "node:crypto";

import type { Env } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";

import { emitAgentZeroEvent } from "./event.js";
import { requestAgentZeroLease } from "./lease.js";
import { terminateAgentZeroSession } from "./terminate.js";
import {
  getAgentZeroSession,
  openAgentZeroSession,
  setAgentZeroModelRunId,
  updateAgentZeroSessionState,
} from "./session.js";
import type { AgentZeroAdapterConfig, AgentZeroMissionRequest, AgentZeroMissionResult } from "./types.js";
import { AgentZeroAdapterConfigSchema, AgentZeroMissionRequestSchema } from "./types.js";

export function defaultAgentZeroConfig(env: Env): AgentZeroAdapterConfig {
  const endpoint =
    env.AGENT_ZERO_WORKER_URL?.trim() ||
    process.env.AGENT_ZERO_WORKER_URL?.trim() ||
    "http://agent-zero:80";
  const linkskills = env.LINKSKILLS_ENDPOINT?.trim() || "http://linkskills:3002";
  return AgentZeroAdapterConfigSchema.parse({
    worker_endpoint: endpoint,
    linkskills_endpoint: linkskills,
    request_timeout_ms: Number(env.AGENT_ZERO_REQUEST_TIMEOUT_MS ?? 120_000),
    lease_ttl_seconds: Number(env.AGENT_ZERO_LEASE_TTL_SECONDS ?? 300),
  });
}

async function postToAgentZeroWorker(
  config: AgentZeroAdapterConfig,
  sessionId: string,
  request: AgentZeroMissionRequest,
): Promise<{ ok: boolean; body: Record<string, unknown> }> {
  const url = `${config.worker_endpoint.replace(/\/+$/, "")}/api/linktrend/mission`;
  const payload = {
    session_id: sessionId,
    lane_id: request.lane_id,
    role_id: request.role_id,
    tenant_id: request.tenant_id,
    run_id: request.run_id,
    stage_id: request.stage_id,
    inputs: request.inputs,
    correlation_id: request.correlation_id,
  };

  if (process.env.AGENT_ZERO_STUB_MODE === "1" || process.env.NODE_ENV === "test") {
    return {
      ok: true,
      body: {
        outputs: { stub: true, lane_id: request.lane_id, role_id: request.role_id },
        tokens_in: 10,
        tokens_out: 20,
      },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });
    if (!res.ok) {
      return { ok: false, body: { error: `HTTP ${res.status}` } };
    }
    const body = (await res.json()) as Record<string, unknown>;
    return { ok: true, body };
  } catch (error) {
    return {
      ok: false,
      body: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

export async function executeAgentZeroMission(
  env: Env,
  request: AgentZeroMissionRequest,
  config?: AgentZeroAdapterConfig,
): Promise<AgentZeroMissionResult> {
  const validated = AgentZeroMissionRequestSchema.parse(request);
  const adapterConfig = config ?? defaultAgentZeroConfig(env);

  const session = openAgentZeroSession(validated);
  updateAgentZeroSessionState(session.session_id, "mission_assigned");

  await emitAgentZeroEvent(env, session, "role.started");
  await emitAgentZeroEvent(env, session, "agent_zero.lane.assigned", { lane_id: validated.lane_id });

  await requestAgentZeroLease(env, session, "cap.agent_zero.lane_execution", {
    lane_id: validated.lane_id,
    role_id: validated.role_id,
  }, adapterConfig);

  updateAgentZeroSessionState(session.session_id, "executing");
  const worker = await postToAgentZeroWorker(adapterConfig, session.session_id, validated);

  const modelRunId = randomUUID();
  setAgentZeroModelRunId(session.session_id, modelRunId);

  const current = getAgentZeroSession(session.session_id);
  if (!current) {
    throw new Error("Agent Zero session lost during mission");
  }

  if (!worker.ok) {
    await emitAgentZeroEvent(env, current, "role.failed", { error: worker.body.error });
    const failure = {
      code: "MODEL_PROVIDER_ERROR" as const,
      plane: "linkbot" as const,
      message: String(worker.body.error ?? "Agent Zero worker error"),
      retryable: true,
      occurred_at: new Date().toISOString(),
    };
    await terminateAgentZeroSession(env, current, "worker_error");
    return {
      session_id: current.session_id,
      lane_id: validated.lane_id,
      outputs: {},
      model_run_id: modelRunId,
      tokens_in: 0,
      tokens_out: 0,
      lease_ids: current.lease_ids,
      audit_event_ids: current.audit_event_ids,
      failure,
    };
  }

  const outputs = (worker.body.outputs as Record<string, unknown> | undefined) ?? worker.body;
  const tokensIn = Number(worker.body.tokens_in ?? 0);
  const tokensOut = Number(worker.body.tokens_out ?? 0);

  updateAgentZeroSessionState(current.session_id, "completed");
  await emitAgentZeroEvent(env, current, "role.completed", { output_keys: Object.keys(outputs) });

  await terminateAgentZeroSession(env, current, "mission_complete");

  log("info", "agent-zero mission completed", {
    service: "agent-zero-runtime",
    lane_id: validated.lane_id,
    role_id: validated.role_id,
    session_id: current.session_id,
  });

  return {
    session_id: current.session_id,
    lane_id: validated.lane_id,
    outputs,
    model_run_id: modelRunId,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    lease_ids: current.lease_ids,
    audit_event_ids: current.audit_event_ids,
  };
}
