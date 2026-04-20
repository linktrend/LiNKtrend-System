import { buildMetricsSnapshotFromRows } from "@/lib/metrics-snapshot";

/** Deterministic-ish metrics snapshot for layout review when `LINKAIOS_UI_MOCKS` is enabled. */
export function demoMetricsSnapshot() {
  const missionMeta = new Map([
    ["demo-smb", { title: "SMB Website Builder", agent_id: "demo-lisa" }],
    ["demo-ai-edu", { title: "Ai Edu Channel", agent_id: "demo-eric" }],
  ]);
  const agentNames = new Map([
    ["demo-lisa", "Lisa (CEO)"],
    ["demo-eric", "Eric (CTO)"],
  ]);

  const now = Date.now();
  const rows = [];
  for (let i = 0; i < 28; i++) {
    const created_at = new Date(now - i * 2_700_000).toISOString();
    const mission_id = i % 2 === 0 ? "demo-smb" : "demo-ai-edu";
    const isErr = i % 6 === 0;
    rows.push({
      id: `demo-metrics-row-${i}`,
      event_type: isErr ? "llm.completion.error" : "llm.completion",
      mission_id,
      payload: {
        cost_usd: 0.008 + i * 0.0007,
        usage: { total_tokens: 400 + i * 25 },
        model: "claude-sonnet-4",
      },
      created_at,
    });
  }

  const toIso = new Date(now).toISOString();
  const fromIso = new Date(now - 7 * 86_400_000).toISOString();

  return buildMetricsSnapshotFromRows({
    rows,
    missionMeta,
    agentNames,
    fromIso,
    toIso,
    eventTypeContains: null,
  });
}
