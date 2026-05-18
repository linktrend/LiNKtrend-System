import type { SessionDisplayStatus } from "@/lib/session-display";
import {
  mapDbSessionStatusToDisplay,
  missionIdFromSessionMetadata,
  sessionTitleFromMetadata,
} from "@/lib/session-display";

export type SessionThreadRow = {
  id: string;
  agentId: string;
  agentName: string;
  /** Short label (legacy + modal) */
  label: string;
  /** Human session title — project-scoped work unit when metadata provides context */
  sessionTitle: string;
  projectId: string | null;
  projectTitle: string | null;
  displayStatus: SessionDisplayStatus;
  preview: string;
  /** Raw DB status string */
  status: string;
  startedAt: string;
  lastHeartbeat: string | null;
  endedAt: string | null;
  lastActivityAt: string;
  detail: string;
  metadata: Record<string, unknown>;
  /** LiNKbot session detail page */
  openHref: string;
};

type WorkerSessionRow = {
  id: string;
  agent_id: string;
  status: string;
  started_at: string;
  last_heartbeat: string | null;
  ended_at?: string | null;
  metadata?: unknown;
};

function humanSessionPreview(metadata: Record<string, unknown>, agentName: string, projectTitle: string | null): string {
  const topic =
    typeof metadata.topic === "string"
      ? metadata.topic
      : typeof metadata.subject === "string"
        ? metadata.subject
        : typeof metadata.channel === "string"
          ? metadata.channel
          : null;
  if (topic?.trim()) return topic.trim().slice(0, 140);
  if (projectTitle) return `Linked to ${projectTitle}.`;
  return `Session with ${agentName}.`;
}

export function mapWorkerSessionsToThreads(
  rows: WorkerSessionRow[],
  agentNames: Map<string, string>,
  missionTitles?: Map<string, string>,
): SessionThreadRow[] {
  return rows.map((s) => {
    const name = agentNames.get(String(s.agent_id)) ?? String(s.agent_id);
    const meta =
      typeof s.metadata === "object" && s.metadata !== null ? (s.metadata as Record<string, unknown>) : {};
    const metaStr =
      typeof s.metadata === "object" && s.metadata !== null ? JSON.stringify(s.metadata, null, 2) : String(s.metadata ?? "");
    const sid = String(s.id);
    const aid = String(s.agent_id);
    const endedAt = s.ended_at ?? null;
    const displayStatus = mapDbSessionStatusToDisplay(s.status, endedAt);
    const projectId = missionIdFromSessionMetadata(s.metadata);
    const projectTitle = projectId && missionTitles?.get(projectId) ? missionTitles.get(projectId)! : null;
    const preview = humanSessionPreview(meta, name, projectTitle);
    const fallbackTitle = `Session · ${s.status}`;
    const sessionTitle = sessionTitleFromMetadata(s.metadata, fallbackTitle);
    const lastActivityRaw = [s.last_heartbeat, endedAt, s.started_at].filter(Boolean) as string[];
    const lastActivityAt = lastActivityRaw
      .map((x) => new Date(x).getTime())
      .reduce((a, b) => Math.max(a, b), 0);
    const lastActivityIso = Number.isFinite(lastActivityAt) ? new Date(lastActivityAt).toISOString() : s.started_at;

    return {
      id: sid,
      agentId: aid,
      agentName: name,
      label: sessionTitle,
      sessionTitle,
      projectId,
      projectTitle,
      displayStatus,
      preview,
      status: s.status,
      startedAt: s.started_at,
      lastHeartbeat: s.last_heartbeat,
      endedAt,
      lastActivityAt: lastActivityIso,
      detail:
        `bot_runtime.worker_sessions\n\n` +
        `id: ${sid}\n` +
        `agent_id: ${aid}\n` +
        `status: ${s.status}\n` +
        `started_at: ${s.started_at}\n` +
        `last_heartbeat: ${s.last_heartbeat ?? "—"}\n` +
        `ended_at: ${endedAt ?? "—"}\n\n` +
        `metadata:\n${metaStr.slice(0, 3000)}${metaStr.length > 3000 ? "\n…" : ""}`,
      metadata: meta,
      openHref: `/workers/${encodeURIComponent(aid)}/sessions/${encodeURIComponent(sid)}`,
    };
  });
}
