import type { SessionThreadRow } from "../work-sessions";

export const DEMO_SESSION_THREADS: SessionThreadRow[] = [
  {
    id: "a0000001-0000-4000-8000-000000000001",
    agentId: "demo-lisa",
    agentName: "Lisa (CEO)",
    label: "Q3 portfolio review",
    sessionTitle: "Q3 portfolio review",
    projectId: "demo-mission-1",
    projectTitle: "Northwind modernisation",
    displayStatus: "running",
    preview: "Portfolio planning in progress.",
    status: "running",
    startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    endedAt: null,
    lastActivityAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    detail:
      "Fixture OpenClaw-style session transcript placeholder. Live session chats from the gateway will appear here " +
      "once wired (distinct from channel message threads).",
    metadata: { mission_id: "demo-mission-1", session_title: "Q3 portfolio review" },
    openHref: "/workers/demo-lisa/sessions/a0000001-0000-4000-8000-000000000001",
  },
  {
    id: "a0000002-0000-4000-8000-000000000002",
    agentId: "demo-eric",
    agentName: "Eric (CTO)",
    label: "Infra spike",
    sessionTitle: "Infra spike",
    projectId: "demo-mission-2",
    projectTitle: "Platform reliability sprint",
    displayStatus: "waiting",
    preview: "Waiting on your go-ahead for the next step.",
    status: "starting",
    startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 30 * 1000).toISOString(),
    endedAt: null,
    lastActivityAt: new Date(Date.now() - 30 * 1000).toISOString(),
    detail: "Fixture session — shows how session-scoped agent chats differ from Slack/Telegram channel threads.",
    metadata: { mission_id: "demo-mission-2", session_title: "Infra spike" },
    openHref: "/workers/demo-eric/sessions/a0000002-0000-4000-8000-000000000002",
  },
];
