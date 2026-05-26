import type { SessionLogRow } from "@/lib/session-logs";

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/** Closed OpenClaw-style session log fixtures — JSONL transcript summaries for demo LiNKbots. */
export const DEMO_SESSION_LOG_ROWS: SessionLogRow[] = [
  {
    id: "b0000001-0000-4000-8000-000000000001",
    sessionTitle: "Northwind copy review",
    channel: "web",
    projectTitle: "Northwind modernisation",
    startedAt: daysAgo(12),
    endedAt: daysAgo(12),
    durationMs: 48 * 60_000,
    userMessages: 8,
    assistantMessages: 11,
    toolCalls: 4,
    costUsd: 0.042,
    transcriptSizeKb: 186,
    status: "completed",
    openHref: "/workers/demo-lisa/sessions/b0000001-0000-4000-8000-000000000001",
  },
  {
    id: "b0000002-0000-4000-8000-000000000002",
    sessionTitle: "Lead outreach draft",
    channel: "slack",
    projectTitle: "SMB Website Builder",
    startedAt: daysAgo(9),
    endedAt: daysAgo(9),
    durationMs: 22 * 60_000,
    userMessages: 5,
    assistantMessages: 7,
    toolCalls: 6,
    costUsd: 0.028,
    transcriptSizeKb: 94,
    status: "completed",
    openHref: "/workers/demo-lisa/sessions/b0000002-0000-4000-8000-000000000002",
  },
  {
    id: "b0000003-0000-4000-8000-000000000003",
    sessionTitle: "Board briefing prep",
    channel: "web",
    projectTitle: "Northwind modernisation",
    startedAt: daysAgo(5),
    endedAt: daysAgo(5),
    durationMs: 95 * 60_000,
    userMessages: 14,
    assistantMessages: 18,
    toolCalls: 9,
    costUsd: 0.091,
    transcriptSizeKb: 312,
    status: "completed",
    openHref: "/workers/demo-lisa/sessions/b0000003-0000-4000-8000-000000000003",
  },
  {
    id: "b0000004-0000-4000-8000-000000000004",
    sessionTitle: "CRM sync attempt",
    channel: "whatsapp",
    projectTitle: "SMB Website Builder",
    startedAt: daysAgo(2),
    endedAt: daysAgo(2),
    durationMs: 11 * 60_000,
    userMessages: 3,
    assistantMessages: 4,
    toolCalls: 2,
    costUsd: 0.011,
    transcriptSizeKb: 41,
    status: "failed",
    openHref: "/workers/demo-lisa/sessions/b0000004-0000-4000-8000-000000000004",
  },
  {
    id: "b0000005-0000-4000-8000-000000000005",
    sessionTitle: "Gateway health check",
    channel: "web",
    projectTitle: "Platform reliability sprint",
    startedAt: daysAgo(7),
    endedAt: daysAgo(7),
    durationMs: 18 * 60_000,
    userMessages: 4,
    assistantMessages: 6,
    toolCalls: 12,
    costUsd: 0.019,
    transcriptSizeKb: 72,
    status: "completed",
    openHref: "/workers/demo-eric/sessions/b0000005-0000-4000-8000-000000000005",
  },
];

export function demoSessionLogsForAgent(agentId: string): SessionLogRow[] {
  const prefix = agentId === "demo-lisa" ? "b000000" : agentId === "demo-eric" ? "b0000005" : "";
  if (!prefix) return [];
  return DEMO_SESSION_LOG_ROWS.filter((r) => r.openHref.includes(`/workers/${agentId}/`));
}
