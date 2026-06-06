/**
 * Unified bot-runtime dispatch router (Wave 5.5).
 *
 * Routes by runtime_tier or role mapping to OpenClaw, Agent Zero, LiNKautowork,
 * codex lane, or council capability. Trace includes runtime_chosen.
 */

import type { Env } from "@linktrend/shared-config";
import type { BotReasonRequest, BotReasonResult } from "@linktrend/linklogic-sdk";

import { dispatchRoleRuntime, resolveRoleRuntime, type RuntimeDispatchRequest } from "./runtime-dispatch.js";
import { openClawAgentIdForRole } from "./suite-role-openclaw.js";
import { agentZeroLaneForRole } from "./suite-role-agent-zero.js";

export type UnifiedRuntimeTier =
  | "automation"
  | "agent_zero"
  | "openclaw_head"
  | "openclaw_subagent"
  | "codex_lane"
  | "council";

export type UnifiedDispatchRequest = RuntimeDispatchRequest & {
  runtime_tier?: UnifiedRuntimeTier;
  workflow_handle?: string;
  issue_id?: string;
};

export type UnifiedDispatchResult = BotReasonResult & {
  runtime_chosen: UnifiedRuntimeTier | "openclaw" | "agent_zero";
  dispatch_target: "linkautowork" | "agent_zero" | "openclaw" | "codex_lane" | "council" | "linkbot";
  lane_id?: string;
  agent_id?: string;
  workflow_handle?: string;
};

/** Resolve runtime tier from explicit template tier or role/plane hints. */
export function resolveUnifiedRuntimeTier(request: UnifiedDispatchRequest): UnifiedRuntimeTier {
  if (request.runtime_tier) return request.runtime_tier;

  if (request.workflow_handle?.startsWith("autowork.")) return "automation";
  if (agentZeroLaneForRole(request.role_id)) return "agent_zero";
  if (openClawAgentIdForRole(request.role_id)) return "openclaw_head";
  return "agent_zero";
}

/**
 * Dispatch issue execution through the unified runtime router.
 * Extends Wave 2.8 role dispatch with automation, codex, and council tiers.
 */
export async function dispatchUnifiedRuntime(
  env: Env,
  request: UnifiedDispatchRequest,
): Promise<UnifiedDispatchResult> {
  const tier = resolveUnifiedRuntimeTier(request);

  if (tier === "automation") {
    const workflowHandle = request.workflow_handle ?? `autowork.issue.${request.issue_id ?? request.stage_id}`;
    return {
      runtime_chosen: "automation",
      dispatch_target: "linkautowork",
      workflow_handle: workflowHandle,
      outputs: {
        workflow_handle: workflowHandle,
        dispatch_note: "Routed to LiNKautowork; kernel invokes workflow with lease + audit",
      },
      model_run_id: `autowork-${Date.now()}`,
      tokens_in: 0,
      tokens_out: 0,
    };
  }

  if (tier === "codex_lane") {
    return {
      runtime_chosen: "codex_lane",
      dispatch_target: "codex_lane",
      outputs: {
        codex_lane: "governed_implementation",
        issue_id: request.issue_id ?? request.stage_id,
      },
      model_run_id: `codex-${Date.now()}`,
      tokens_in: 0,
      tokens_out: 0,
    };
  }

  if (tier === "council") {
    return {
      runtime_chosen: "council",
      dispatch_target: "council",
      outputs: {
        capability_id: "cap.llm_council.deliberation",
        gate: request.issue_id ?? "council_gate",
      },
      model_run_id: `council-${Date.now()}`,
      tokens_in: 0,
      tokens_out: 0,
    };
  }

  if (tier === "openclaw_subagent") {
    const agentId = openClawAgentIdForRole(request.role_id) ?? "linksites-head";
    const handoffResult = await dispatchRoleRuntime(env, {
      ...request,
      role_id: request.role_id,
    } as BotReasonRequest & { role_id: string });
    return {
      ...handoffResult,
      runtime_chosen: "openclaw_subagent",
      dispatch_target: "openclaw",
      agent_id: agentId,
    };
  }

  const roleResult = await dispatchRoleRuntime(env, request);
  const chosenTier: UnifiedRuntimeTier =
    roleResult.runtime === "agent_zero" ? "agent_zero" : "openclaw_head";

  return {
    ...roleResult,
    runtime_chosen: chosenTier,
    dispatch_target: roleResult.runtime === "agent_zero" ? "agent_zero" : "openclaw",
    lane_id: roleResult.lane_id,
    agent_id: roleResult.agent_id,
  };
}

/** Expose role resolution for trace/debug surfaces. */
export { resolveRoleRuntime };
