import { isAdminBot } from "@/lib/agent-fleet-classification";
import type { SessionThreadRow } from "@/lib/work-sessions";

const SESSION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SessionStopPolicyInput = {
  /** LiNKaios Admin surface — client tenant bot sessions are view-only. */
  adminSurface?: boolean;
  /** agent_id → vendor/studio (admin) bot */
  adminBotByAgentId?: Record<string, boolean>;
};

function sessionStatusStopEligible(s: SessionThreadRow): boolean {
  if (!SESSION_UUID_RE.test(s.id)) return false;
  return s.displayStatus === "running" || s.displayStatus === "waiting";
}

/** Whether the operator may stop this session from the Work → Sessions inbox. */
export function canStopWorkerSession(s: SessionThreadRow, policy: SessionStopPolicyInput = {}): boolean {
  if (!sessionStatusStopEligible(s)) return false;
  if (!policy.adminSurface) return true;
  return policy.adminBotByAgentId?.[s.agentId] === true;
}

export function buildAdminBotByAgentId(
  agents: { id: string; runtime_settings?: unknown }[],
  options: { licensorTenantId?: string | null; uiMocksDemoAgent?: boolean },
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const agent of agents) {
    out[String(agent.id)] = isAdminBot(
      {
        id: String(agent.id),
        runtime_settings:
          (agent.runtime_settings as Record<string, unknown> | null | undefined) ?? null,
      },
      options,
    );
  }
  return out;
}
