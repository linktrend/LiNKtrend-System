import { describe, expect, it } from "vitest";

import { buildAdminBotByAgentId, canStopWorkerSession } from "@/lib/session-stop-policy";
import type { SessionThreadRow } from "@/lib/work-sessions";

function session(partial: Partial<SessionThreadRow> & Pick<SessionThreadRow, "id" | "agentId">): SessionThreadRow {
  return {
    agentName: "Bot",
    label: "Session",
    sessionTitle: "Session",
    projectId: null,
    projectTitle: null,
    displayStatus: "running",
    preview: "",
    status: "running",
    startedAt: "2026-06-01T12:00:00.000Z",
    lastHeartbeat: null,
    endedAt: null,
    lastActivityAt: "2026-06-01T12:00:00.000Z",
    detail: "",
    metadata: {},
    openHref: "/workers/a/sessions/s",
    ...partial,
  };
}

describe("session-stop-policy", () => {
  it("allows stop on client surface for running sessions", () => {
    const row = session({
      id: "22222222-2222-4222-8222-222222222222",
      agentId: "client-bot",
    });
    expect(canStopWorkerSession(row)).toBe(true);
  });

  it("blocks client tenant bot sessions on admin surface", () => {
    const row = session({
      id: "22222222-2222-4222-8222-222222222222",
      agentId: "client-bot",
    });
    expect(
      canStopWorkerSession(row, {
        adminSurface: true,
        adminBotByAgentId: { "client-bot": false, "studio-bot": true },
      }),
    ).toBe(false);
  });

  it("allows admin/studio bot sessions on admin surface", () => {
    const row = session({
      id: "22222222-2222-4222-8222-222222222222",
      agentId: "studio-bot",
    });
    expect(
      canStopWorkerSession(row, {
        adminSurface: true,
        adminBotByAgentId: { "studio-bot": true },
      }),
    ).toBe(true);
  });

  it("buildAdminBotByAgentId classifies licensor scope", () => {
    const map = buildAdminBotByAgentId(
      [
        { id: "studio-bot", runtime_settings: { linkaios_fleet: { scope: "licensor" } } },
        { id: "client-bot", runtime_settings: { linkaios_fleet: { scope: "licensee" } } },
      ],
      {},
    );
    expect(map["studio-bot"]).toBe(true);
    expect(map["client-bot"]).toBe(false);
  });
});
