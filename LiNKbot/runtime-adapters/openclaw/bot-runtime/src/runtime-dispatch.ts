/**
 * Role runtime dispatch — OpenClaw vs Agent Zero (Wave 2.8 / Wave 9.3).
 */

import type { Env } from "@linktrend/shared-config";
import type { BotReasonRequest, BotReasonResult } from "@linktrend/linklogic-sdk";

import { agentZeroLaneForRole } from "./suite-role-agent-zero.js";
import { openClawAgentIdForRole } from "./suite-role-openclaw.js";

export type RuntimeDispatchRequest = BotReasonRequest & {
  role_id: string;
};

export type RoleRuntimeKind = "openclaw" | "agent_zero" | "unmapped";

export type RoleRuntimeResolution = {
  runtime: RoleRuntimeKind;
  agent_id?: string;
  lane_id?: string;
};

/** Resolve primary runtime for a role without invoking adapters. */
export function resolveRoleRuntime(roleId: string): RoleRuntimeResolution {
  const laneId = agentZeroLaneForRole(roleId);
  if (laneId) {
    return { runtime: "agent_zero", lane_id: laneId };
  }
  const agentId = openClawAgentIdForRole(roleId);
  if (agentId) {
    return { runtime: "openclaw", agent_id: agentId };
  }
  return { runtime: "unmapped" };
}

export type RoleDispatchResult = BotReasonResult & {
  runtime: "openclaw" | "agent_zero";
  agent_id?: string;
  lane_id?: string;
};

/**
 * Dispatch a role to its primary runtime adapter target.
 * Returns trace metadata; full adapter invocation remains in reasoning-dispatch/mission paths.
 */
export async function dispatchRoleRuntime(
  _env: Env,
  request: RuntimeDispatchRequest,
): Promise<RoleDispatchResult> {
  const resolution = resolveRoleRuntime(request.role_id);
  if (resolution.runtime === "agent_zero" && resolution.lane_id) {
    return {
      runtime: "agent_zero",
      lane_id: resolution.lane_id,
      outputs: {
        lane_id: resolution.lane_id,
        dispatch_note: "Routed to Agent Zero lane",
        role_id: request.role_id,
      },
      model_run_id: `az-${resolution.lane_id}-${request.run_id}`,
      tokens_in: 0,
      tokens_out: 0,
    };
  }
  if (resolution.runtime === "openclaw" && resolution.agent_id) {
    return {
      runtime: "openclaw",
      agent_id: resolution.agent_id,
      outputs: {
        agent_id: resolution.agent_id,
        dispatch_note: "Routed to OpenClaw profile",
        role_id: request.role_id,
      },
      model_run_id: `oc-${resolution.agent_id}-${request.run_id}`,
      tokens_in: 0,
      tokens_out: 0,
    };
  }
  return {
    runtime: "agent_zero",
    lane_id: "az-linksites-research",
    outputs: {
      dispatch_note: "Fallback lane for unmapped role",
      role_id: request.role_id,
    },
    model_run_id: `az-fallback-${request.run_id}`,
    tokens_in: 0,
    tokens_out: 0,
    failure: {
      code: "MANIFEST_INVALID",
      plane: "linkbot",
      message: `No fleet v1 runtime mapping for role ${request.role_id}`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    },
  };
}
