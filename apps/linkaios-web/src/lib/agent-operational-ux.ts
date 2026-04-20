/**
 * Operational presence for a LiNKbot from recent `bot_runtime.worker_sessions` rows (heartbeat + status).
 * Distinct from registry `linkaios.agents.status` (active / inactive / retired).
 */
export type AgentOperationalUx = "working" | "idle" | "offline";

type SessionLite = {
  agent_id: string;
  status: string;
  started_at: string;
  last_heartbeat: string | null;
};

export function agentOperationalUxFromSessions(
  agentId: string,
  sessions: SessionLite[],
  nowMs: number = Date.now(),
): AgentOperationalUx {
  const mine = sessions.filter((s) => String(s.agent_id) === String(agentId));
  const latest = mine.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
  if (!latest) return "offline";
  if (latest.status === "running") return "working";
  const hb = latest.last_heartbeat ? new Date(latest.last_heartbeat).getTime() : 0;
  if (hb && nowMs - hb < 5 * 60 * 1000) return "idle";
  return "offline";
}
