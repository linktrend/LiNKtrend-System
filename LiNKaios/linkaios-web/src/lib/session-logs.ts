import type { SessionDisplayStatus } from "@/lib/session-display";
import type { SessionThreadRow } from "@/lib/work-sessions";

/** Closed OpenClaw-style session log row — JSONL transcript summary, not live trace events. */
export type SessionLogRow = {
  id: string;
  sessionTitle: string;
  channel: string | null;
  projectTitle: string | null;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  userMessages: number;
  assistantMessages: number;
  toolCalls: number;
  costUsd: number | null;
  transcriptSizeKb: number | null;
  status: "completed" | "failed";
  openHref: string;
};

function numFromMeta(meta: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = meta[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function channelFromMeta(meta: Record<string, unknown>): string | null {
  for (const key of ["channel", "provider", "source", "chat_provider"]) {
    const v = meta[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function isClosedSession(row: { displayStatus: SessionDisplayStatus; endedAt: string | null }): boolean {
  return row.endedAt != null || row.displayStatus === "completed" || row.displayStatus === "failed";
}

export function mapThreadToSessionLog(row: SessionThreadRow): SessionLogRow | null {
  if (!isClosedSession(row)) return null;

  const meta = row.metadata;
  const endedAt = row.endedAt ?? row.lastActivityAt;
  const durationMs = Math.max(0, new Date(endedAt).getTime() - new Date(row.startedAt).getTime());
  const userMessages = numFromMeta(meta, "user_messages", "user_message_count") ?? 0;
  const assistantMessages = numFromMeta(meta, "assistant_messages", "assistant_message_count") ?? 0;
  const toolCalls = numFromMeta(meta, "tool_calls", "tool_call_count") ?? 0;
  const messageCount = numFromMeta(meta, "message_count", "messages");
  const inferredMessages = messageCount ?? userMessages + assistantMessages + toolCalls;

  const transcriptBytes = numFromMeta(meta, "transcript_bytes", "transcript_size_bytes");
  const costUsd = numFromMeta(meta, "cost_total", "cost_usd", "session_cost_usd");

  return {
    id: row.id,
    sessionTitle: row.sessionTitle,
    channel: channelFromMeta(meta),
    projectTitle: row.projectTitle,
    startedAt: row.startedAt,
    endedAt,
    durationMs,
    userMessages: userMessages || Math.max(0, Math.floor(inferredMessages * 0.35)),
    assistantMessages: assistantMessages || Math.max(0, Math.floor(inferredMessages * 0.45)),
    toolCalls,
    costUsd,
    transcriptSizeKb: transcriptBytes != null ? Math.round(transcriptBytes / 1024) : null,
    status: row.displayStatus === "failed" ? "failed" : "completed",
    openHref: `${row.openHref}?panel=transcript`,
  };
}

export function formatSessionDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  if (ms >= 3_600_000) return `${(ms / 3_600_000).toFixed(1)}h`;
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(0)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(0)}s`;
  return `${Math.round(ms)}ms`;
}

export function formatSessionCost(usd: number | null): string {
  if (usd == null || !Number.isFinite(usd)) return "—";
  return usd.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 });
}
