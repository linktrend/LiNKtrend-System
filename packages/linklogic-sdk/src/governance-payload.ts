import type { Env } from "@linktrend/shared-config";
import type {
  LinktrendGovernancePayload,
  MissionRecord,
} from "@linktrend/shared-types";
import { createSupabaseServiceClient } from "@linktrend/db";

import { resolveSkillByName } from "./resolve-skill.js";

export type BuildGovernanceOptions = {
  /** Prefer this mission; otherwise first mission row or env BOT_RUNTIME_MISSION_ID */
  missionId?: string | null;
  /** Approved skill to inject as runtime instructions (markdown body). */
  skillName?: string;
  /** Force denied bootstrap (fail-closed drill). */
  deny?: boolean;
  /** Passed through as bootstrap.correlationId (e.g. worker session id). */
  correlationId?: string | null;
};

/** Extract tool names from manifest.payload JSON (best-effort; shapes evolve). */
export function toolNamesFromManifestPayload(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const raw = p.approvedTools ?? p.approved_tool_names ?? p.toolNames ?? p.tools;
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

/**
 * Builds `linktrendGovernance` JSON from Supabase (central truth).
 * Does not call the fork — `bot-runtime` (or tests) hand off the result.
 */
export async function buildLinktrendGovernancePayload(
  env: Env,
  options: BuildGovernanceOptions = {},
): Promise<LinktrendGovernancePayload> {
  const client = createSupabaseServiceClient(env);
  const traceId = crypto.randomUUID();
  const skillName = options.skillName ?? "bootstrap";

  const missionId =
    options.missionId ??
    (typeof process !== "undefined" && process.env.BOT_RUNTIME_MISSION_ID) ??
    null;

  let mission: MissionRecord | null = null;
  if (missionId) {
    const { data, error } = await client
      .schema("linkaios")
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .maybeSingle();
    if (error) throw error;
    mission = data as MissionRecord | null;
  } else {
    const { data, error } = await client
      .schema("linkaios")
      .from("missions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    mission = data as MissionRecord | null;
  }

  const skill = await resolveSkillByName(env, { service: "linklogic-sdk", skillName });

  let toolNames: string[] = [];
  if (mission?.id) {
    const { data: manifest, error: manErr } = await client
      .schema("linkaios")
      .from("manifests")
      .select("payload")
      .eq("mission_id", mission.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!manErr && manifest?.payload) {
      toolNames = toolNamesFromManifestPayload(manifest.payload);
    }
  }

  const workerIdentityRef =
    typeof options.correlationId === "string" && options.correlationId.trim()
      ? `linktrend:worker-session:${options.correlationId.trim()}`
      : undefined;

  const skillVersionRef =
    skill != null ? `${skill.name}@${String(skill.version)}` : undefined;

  const payload: LinktrendGovernancePayload = {
    bootstrap: {
      workerIdentityRef,
      authorizationState: options.deny ? "denied" : "granted",
      traceCorrelationId: traceId,
      denialReasonCategory: options.deny ? "policy" : undefined,
    },
    mission: mission
      ? {
          missionId: mission.id,
          summaryText: mission.title ?? undefined,
          objective: mission.status ? { status: mission.status } : undefined,
        }
      : undefined,
    runtimeInstructions: skill
      ? {
          text: skill.body_markdown ?? undefined,
          skillVersionRef,
        }
      : undefined,
    approvedTools: toolNames.length ? { toolNames } : undefined,
  };

  return payload;
}

/** Wrap for HTTP / CLI — OpenClaw fork expects this key on ingress. */
export function wrapGovernanceForOpenClaw(payload: LinktrendGovernancePayload): {
  linktrendGovernance: LinktrendGovernancePayload;
} {
  return { linktrendGovernance: payload };
}

/**
 * Body for `OPENCLAW_AGENT_RUN_URL`.
 * - `agent_params`: flat object matching gateway `agent` method params (LiNKbot-core WebSocket / shims).
 * - `governance_only`: `{ linktrendGovernance }` for custom proxies.
 */
export function buildOpenClawAgentIngressBody(
  env: Env,
  governance: LinktrendGovernancePayload,
): Record<string, unknown> {
  const mode = env.OPENCLAW_AGENT_RUN_BODY ?? "agent_params";
  if (mode === "governance_only") {
    return wrapGovernanceForOpenClaw(governance) as unknown as Record<string, unknown>;
  }

  return {
    message:
      env.OPENCLAW_AGENT_INGRESS_MESSAGE?.trim() ||
      "[LiNKtrend] bot-runtime governed ingress (no user message).",
    idempotencyKey: crypto.randomUUID(),
    ...(env.OPENCLAW_AGENT_SESSION_KEY
      ? { sessionKey: env.OPENCLAW_AGENT_SESSION_KEY.trim() }
      : {}),
    ...(env.OPENCLAW_AGENT_ID ? { agentId: env.OPENCLAW_AGENT_ID.trim() } : {}),
    linktrendGovernance: governance,
  };
}
