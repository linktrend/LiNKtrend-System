/** Product-facing session state (maps from `bot_runtime.worker_sessions.status`). */
export type SessionDisplayStatus = "running" | "waiting" | "completed" | "failed";

export function mapDbSessionStatusToDisplay(
  dbStatus: string,
  endedAt: string | null | undefined,
): SessionDisplayStatus {
  const s = dbStatus.toLowerCase();
  if (s === "failed") return "failed";
  if (s === "running") return "running";
  if (s === "stopped") return endedAt ? "completed" : "completed";
  if (s === "starting" || s === "stopping") return "waiting";
  return "waiting";
}

export function missionIdFromSessionMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const candidates = [m.mission_id, m.missionId, m.project_id, m.projectId, m.linktrend_mission_id];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

export function sessionTitleFromMetadata(metadata: unknown, fallback: string): string {
  if (!metadata || typeof metadata !== "object") return fallback;
  const m = metadata as Record<string, unknown>;
  const t = m.session_title ?? m.title ?? m.summary;
  if (typeof t === "string" && t.trim()) return t.trim().slice(0, 120);
  return fallback;
}
