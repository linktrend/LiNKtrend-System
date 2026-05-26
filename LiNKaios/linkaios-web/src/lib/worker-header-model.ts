import type { AgentRecord } from "@linktrend/shared-types";

import type { WorkerDetailHeaderModel } from "@/components/worker-detail-header";
import { agentOperationalUxFromSessions } from "@/lib/agent-operational-ux";
import { demoFleetProfile } from "@/lib/demo-fleet-profiles";
import { linkbotFleetStatusLabel, type LinkbotFleetStatusLabel } from "@/lib/linkbot-fleet-status";
import { parseRuntimeSettings } from "@/lib/agent-runtime-settings";
import { DEMO_AGENT_MODEL_DEFAULTS } from "@/lib/ui-mocks/worker-ui";

type SessionLite = { agent_id: string; status: string; started_at: string; last_heartbeat: string | null };

export function demoWorkerHeaderModel(
  id: string,
  name: string,
  role: string,
  bio: string,
  opts?: { activity?: string; statusLabel?: LinkbotFleetStatusLabel },
): WorkerDetailHeaderModel {
  const profile = demoFleetProfile(id);
  return {
    id,
    displayName: name,
    role,
    description: bio,
    statusLabel: opts?.statusLabel ?? profile?.statusLabel ?? "Online",
    lastHeartbeatIso: profile?.lastHeartbeatIso ?? null,
    primaryModel: profile?.primaryModel ?? DEMO_AGENT_MODEL_DEFAULTS[id]?.execution ?? null,
    isDemo: true,
  };
}

export function liveWorkerHeaderModel(agent: AgentRecord, sessions: SessionLite[]): WorkerDetailHeaderModel {
  const parsed = parseRuntimeSettings((agent as { runtime_settings?: unknown }).runtime_settings ?? {});
  const p = parsed.linkaiosProfile;
  const role = p.title?.trim() || "LiNKbot";
  const description =
    p.description?.trim() ||
    "Registered LiNKbot — use Sessions for runtime work, LiNKskills for bindings, and Settings for model routing.";

  const ux = agentOperationalUxFromSessions(String(agent.id), sessions);
  const statusLabel = linkbotFleetStatusLabel(agent.status, ux);
  const latest = sessions
    .filter((s) => String(s.agent_id) === String(agent.id))
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
  const running = sessions.some((s) => s.status === "running");
  void running;

  const primaryModel = parsed.models.primary.execution?.trim() || null;

  return {
    id: String(agent.id),
    displayName: agent.display_name,
    role,
    description,
    statusLabel,
    lastHeartbeatIso: latest?.last_heartbeat ?? null,
    primaryModel,
  };
}
