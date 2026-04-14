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

  const payload: LinktrendGovernancePayload = {
    bootstrap: {
      traceId,
      authorizationState: options.deny ? "denied" : "accepted",
      correlationId: options.correlationId ?? undefined,
    },
    mission: mission
      ? {
          id: mission.id,
          title: mission.title,
          status: mission.status,
        }
      : undefined,
    runtimeInstructions: skill
      ? {
          text: skill.body_markdown,
          skillVersionRef: { name: skill.name, version: skill.version },
        }
      : undefined,
    approvedTools: { toolNames },
  };

  return payload;
}

/** Wrap for HTTP / CLI — OpenClaw fork expects this key on ingress. */
export function wrapGovernanceForOpenClaw(payload: LinktrendGovernancePayload): {
  linktrendGovernance: LinktrendGovernancePayload;
} {
  return { linktrendGovernance: payload };
}
