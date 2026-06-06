/**
 * Unified bot-runtime dispatch router (Wave 2.8).
 *
 * Resolves role → runtime and delegates to OpenClaw or Agent Zero adapters.
 */

import type { Env } from "@linktrend/shared-config";
import type { BotReasonRequest, BotReasonResult } from "@linktrend/linklogic-sdk";

import { agentZeroLaneForRole } from "./suite-role-agent-zero.js";
import { openClawAgentIdForRole } from "./suite-role-openclaw.js";
import { dispatchAgentZeroMission } from "@linktrend/agent-zero-runtime";
import { postGovernanceToOpenClaw } from "./openclaw-handoff.js";
import { buildLinktrendGovernancePayload } from "@linktrend/linklogic-sdk";

export type BotRuntimeKind = "agent_zero" | "openclaw";

export type RoleRuntimeResolution =
  | { runtime: "agent_zero"; laneId: string; roleId: string }
  | { runtime: "openclaw"; agentId: string; roleId: string }
  | null;

/** Resolve primary bot runtime for a LiNKbot role_id. Agent Zero wins over OpenClaw. */
export function resolveRoleRuntime(roleId: string): RoleRuntimeResolution {
  const laneId = agentZeroLaneForRole(roleId);
  if (laneId) {
    return { runtime: "agent_zero", laneId, roleId };
  }

  const agentId = openClawAgentIdForRole(roleId);
  if (agentId) {
    return { runtime: "openclaw", agentId, roleId };
  }

  return null;
}

export type RuntimeDispatchRequest = BotReasonRequest & {
  role_id: string;
  correlation_id?: string;
};

export type RuntimeDispatchResult = BotReasonResult & {
  runtime: BotRuntimeKind;
  lane_id?: string;
  agent_id?: string;
};

/**
 * Dispatch issue execution to the correct runtime adapter.
 * Agent Zero mapping routes to AZ adapter; otherwise OpenClaw handoff when configured.
 */
export async function dispatchRoleRuntime(
  env: Env,
  request: RuntimeDispatchRequest,
): Promise<RuntimeDispatchResult> {
  const resolution = resolveRoleRuntime(request.role_id);
  if (!resolution) {
    return {
      runtime: "openclaw",
      outputs: {},
      model_run_id: `unmapped-${Date.now()}`,
      tokens_in: 0,
      tokens_out: 0,
      failure: {
        code: "MANIFEST_INVALID",
        plane: "linkbot",
        message: `No runtime mapping for role: ${request.role_id}`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  if (resolution.runtime === "agent_zero") {
    const azResult = await dispatchAgentZeroMission(env, {
      tenant_id: request.tenant_id,
      run_id: request.run_id,
      stage_id: request.stage_id,
      role_id: request.role_id,
      lane_id: resolution.laneId,
      inputs: request.inputs,
      reasoning_kind: request.reasoning_kind,
      correlation_id: request.correlation_id ?? request.run_id,
    });

    return {
      runtime: "agent_zero",
      lane_id: resolution.laneId,
      outputs: azResult.outputs,
      model_run_id: azResult.model_run_id,
      tokens_in: azResult.tokens_in,
      tokens_out: azResult.tokens_out,
      failure: azResult.failure,
    };
  }

  const { payload: governance } = await buildLinktrendGovernancePayload(env, {
    correlationId: request.correlation_id ?? request.run_id,
    skillName: env.BOT_RUNTIME_SKILL_NAME ?? "bootstrap",
    missionId: env.BOT_RUNTIME_MISSION_ID ?? null,
    requireApprovedSkill: false,
  });

  const handoff = await postGovernanceToOpenClaw(env, governance);

  if (!handoff.ok) {
    return {
      runtime: "openclaw",
      agent_id: resolution.agentId,
      outputs: {},
      model_run_id: `openclaw-fail-${Date.now()}`,
      tokens_in: 0,
      tokens_out: 0,
      failure: {
        code: "MODEL_PROVIDER_ERROR",
        plane: "linkbot",
        message: `OpenClaw handoff failed: HTTP ${handoff.status}`,
        retryable: handoff.status >= 500,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  return {
    runtime: "openclaw",
    agent_id: resolution.agentId,
    outputs: { handoff_status: handoff.status, handoff_preview: handoff.text.slice(0, 500) },
    model_run_id: `openclaw-${Date.now()}`,
    tokens_in: 0,
    tokens_out: 0,
  };
}
