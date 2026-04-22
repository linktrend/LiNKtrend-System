import type { Env } from "@linktrend/shared-config";
import type {
  LinktrendGovernancePayload,
  ToolGovernanceBlock,
} from "@linktrend/shared-types";
import { createSupabaseServiceClient } from "@linktrend/db";

import { getDeclaredToolsFromSkill } from "./declared-tools.js";
import {
  loadMissionlessDefaultToolNames,
  loadMissionToolNames,
  loadOrgAllowedToolNames,
} from "./tool-governance-db.js";
import { resolveSkillByName } from "./resolve-skill.js";

function randomId(): string {
  return globalThis.crypto.randomUUID();
}

export type BuildGovernanceOptions = {
  correlationId?: string;
  skillName?: string;
  missionId?: string | null;
  requireApprovedSkill?: boolean;
};

function intersectSorted(a: string[], b: Set<string>): string[] {
  return a.filter((x) => b.has(x)).sort();
}

function toSet(names: string[]): Set<string> {
  return new Set(names.map((n) => n.toLowerCase()));
}

export function toolNamesFromManifestPayload(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const approved = p.approvedTools;
  if (Array.isArray(approved)) {
    return approved.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  }
  const tools = p.tools;
  if (Array.isArray(tools)) {
    return tools.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

export function wrapGovernanceForOpenClaw(payload: LinktrendGovernancePayload): { linktrendGovernance: LinktrendGovernancePayload } {
  return { linktrendGovernance: payload };
}

export function buildOpenClawAgentIngressBody(
  env: Env,
  governance: LinktrendGovernancePayload,
): Record<string, unknown> {
  const mode = env.OPENCLAW_AGENT_RUN_BODY ?? "agent_params";
  if (mode === "governance_only") {
    return wrapGovernanceForOpenClaw(governance);
  }
  const message = env.OPENCLAW_AGENT_INGRESS_MESSAGE ?? "ping";
  const sessionKey = env.OPENCLAW_AGENT_SESSION_KEY ?? "agent:main:main";
  return {
    message,
    idempotencyKey: randomId(),
    sessionKey,
    linktrendGovernance: governance,
  };
}

/**
 * Build effective tool policy: org ∩ (mission tools | mission-less defaults) ∩ declared (when declared non-empty).
 * @see docs/LiNKaios-tool-governance-spec.md §7
 */
export async function buildLinktrendGovernancePayload(
  env: Env,
  options: BuildGovernanceOptions = {},
): Promise<{ payload: LinktrendGovernancePayload; block: ToolGovernanceBlock | null }> {
  const client = createSupabaseServiceClient(env);
  const skillName = (options.skillName ?? "bootstrap").trim().toLowerCase();
  const missionId = options.missionId?.trim() || null;
  const traceCorrelationId = options.correlationId?.trim() || randomId();

  const skill = await resolveSkillByName(env, { service: "linklogic-sdk", skillName });
  if (options.requireApprovedSkill === true && !skill) {
    throw new Error(`LiNKlogic governance: no approved skill "${skillName}".`);
  }

  const orgNames = await loadOrgAllowedToolNames(client);
  const orgSet = toSet(orgNames);

  let policyNames: string[];
  if (missionId) {
    const missionNames = await loadMissionToolNames(client, missionId);
    policyNames = intersectSorted(missionNames, orgSet);
  } else {
    const mless = await loadMissionlessDefaultToolNames(client);
    const base = mless.length > 0 ? mless : orgNames;
    policyNames = intersectSorted(base, orgSet);
  }

  const declared = skill ? getDeclaredToolsFromSkill(skill) : [];
  const policySet = toSet(policyNames);

  let effective: string[];
  if (declared.length > 0) {
    effective = intersectSorted(declared, policySet);
    const missing = declared.filter((n) => !policySet.has(n));
    if (missing.length > 0) {
      const block: ToolGovernanceBlock = {
        reason: "One or more declared tools are not permitted by effective org/mission policy.",
        missingToolNames: missing.sort(),
      };
      const payload: LinktrendGovernancePayload = {
        bootstrap: {
          traceCorrelationId,
          authorizationState: "denied",
        },
        approvedTools: { toolNames: effective.sort() },
        skillDeclaredTools: { toolNames: declared },
        mission: missionId ? { id: missionId } : undefined,
        runtimeInstructions: {
          text: `Governance blocked for skill "${skillName}": declared tools exceed effective allowlist.`,
        },
        skillName: skill?.name,
        skillVersion: skill?.version,
        skillId: skill?.id,
      };
      return { payload, block };
    }
  } else {
    effective = [...policySet].sort();
  }

  const payload: LinktrendGovernancePayload = {
    bootstrap: {
      traceCorrelationId,
      authorizationState: "granted",
    },
    approvedTools: { toolNames: effective },
    skillDeclaredTools: declared.length ? { toolNames: declared } : undefined,
    mission: missionId ? { id: missionId } : undefined,
    runtimeInstructions: {
      text: skill
        ? `LiNKtrend governance for skill "${skill.name}" v${skill.version} (${effective.length} tools).`
        : "LiNKtrend governance (no skill resolved).",
    },
    skillIndex: skill?.metadata && typeof skill.metadata === "object" ? (skill.metadata.linkaios_index as Record<string, unknown> | undefined) : undefined,
    skillName: skill?.name,
    skillVersion: skill?.version,
    skillId: skill?.id,
  };

  return { payload, block: null };
}
