import type { AgentRecord } from "@linktrend/shared-types";

import type { WorkerDetailHeaderModel } from "@/components/worker-detail-header";
import { agentOperationalUxFromSessions } from "@/lib/agent-operational-ux";
import { parseRuntimeSettings } from "@/lib/agent-runtime-settings";

type SessionLite = { agent_id: string; status: string; started_at: string; last_heartbeat: string | null };

export function demoWorkerHeaderModel(
  id: string,
  name: string,
  role: string,
  bio: string,
  opts?: { activity?: string; operational?: string },
): WorkerDetailHeaderModel {
  return {
    id,
    displayName: name,
    role,
    description: bio,
    registryLabel: "Active",
    operationalSummary: opts?.operational ?? "Online · busy",
    currentActivity: opts?.activity ?? "Demo fixture — no live gateway session.",
    isDemo: true,
  };
}

function registryLabel(status: AgentRecord["status"]): string {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return "Retired";
}

export function liveWorkerHeaderModel(agent: AgentRecord, sessions: SessionLite[]): WorkerDetailHeaderModel {
  const parsed = parseRuntimeSettings((agent as { runtime_settings?: unknown }).runtime_settings ?? {});
  const p = parsed.linkaiosProfile;
  const role = p.title?.trim() || "LiNKbot";
  const description =
    p.description?.trim() ||
    "Registered LiNKbot — use Sessions for runtime work, LiNKskills for bindings, and Settings for model routing.";

  const ux = agentOperationalUxFromSessions(String(agent.id), sessions);
  const reg = registryLabel(agent.status);
  let operationalSummary = reg;
  if (agent.status === "active") {
    if (ux === "working") operationalSummary = "Online · busy";
    else if (ux === "idle") operationalSummary = "Online · idle";
    else operationalSummary = "Online · standby";
  } else if (agent.status === "inactive") {
    operationalSummary = "Offline";
  } else {
    operationalSummary = "Paused";
  }

  const running = sessions.some((s) => s.status === "running");
  const currentActivity = running
    ? "Executing a live worker session (runtime reports status running)."
    : agent.status === "active"
      ? "Idle — ready for the next scheduled or on-demand session."
      : "Not accepting new sessions while registry status is not active.";

  return {
    id: String(agent.id),
    displayName: agent.display_name,
    role,
    description,
    registryLabel: reg,
    operationalSummary,
    currentActivity,
  };
}
