import { buildMetricsSnapshotFromRows } from "@/lib/metrics-snapshot";

/** Deterministic metrics snapshot for layout review when `LINKAIOS_UI_MOCKS` is enabled. */
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
  const eventTypes = [
    "llm.completion",
    "llm.completion.error",
    "tool.invoke",
    "tool.invoke.error",
    "skill.run",
    "workflow.run",
    "gateway.message",
  ];
  const models = ["claude-sonnet-4", "gpt-4.1-mini", "gemini-2.5-flash"];

  for (let i = 0; i < 36; i++) {
    const created_at = new Date(now - i * 2_400_000).toISOString();
    const mission_id = i % 2 === 0 ? "demo-smb" : "demo-ai-edu";
    const et = eventTypes[i % eventTypes.length]!;
    const isErr = et.includes("error");
    rows.push({
      id: `demo-metrics-row-${i}`,
      event_type: et,
      mission_id,
      payload: {
        cost_usd: 0.006 + i * 0.0005,
        usage: { total_tokens: 350 + i * 22, input_tokens: 200 + i * 10, output_tokens: 150 + i * 12 },
        model: models[i % models.length],
        duration_ms: 800 + i * 120 + (isErr ? 4000 : 0),
        skill_id: i % 4 === 0 ? "invoice-generation" : i % 4 === 1 ? "research-enrichment" : undefined,
        tool_name: et.includes("tool") ? "browser.search" : undefined,
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
