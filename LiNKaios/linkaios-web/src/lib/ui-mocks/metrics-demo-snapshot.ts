import { buildMetricsSnapshotFromRows } from "@/lib/metrics-snapshot";
import { matchesActivityCategory, type MetricsActivityCategory } from "@/lib/metrics-filters";
import { scopePayloadMatches, type MetricsScopeState } from "@/lib/metrics-scope-filters";
import { modelFromPayload } from "@/lib/trace-metrics";

const MODULES = ["linksites", "lexos-litigation", "linkapps"] as const;
const PROJECT_TYPES = ["website-factory", "content-channel", "app-build"] as const;
const WORKFLOWS = ["lead-to-preview", "copy-generation", "publish-handoff"] as const;
const ISSUES = ["issue-142", "issue-158", "issue-201"] as const;
const SKILLS = ["invoice-generation", "research-enrichment", "copy-draft", "site-preview"] as const;
const TOOLS = ["browser.search", "payload.publish", "crm.upsert", "plane.create-task"] as const;

type DemoRow = {
  id: string;
  event_type: string;
  mission_id: string;
  payload: Record<string, unknown>;
  created_at: string;
};

function buildDemoRows() {
  const now = Date.now();
  const rows: DemoRow[] = [];
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
    const isTool = et.includes("tool");
    const isSkill = et.includes("skill");
    rows.push({
      id: `demo-metrics-row-${i}`,
      event_type: et,
      mission_id,
      payload: {
        cost_usd: 0.006 + i * 0.0005,
        usage: { total_tokens: 350 + i * 22, input_tokens: 200 + i * 10, output_tokens: 150 + i * 12 },
        model: models[i % models.length],
        duration_ms: 800 + i * 120 + (isErr ? 4000 : 0),
        module_id: MODULES[i % MODULES.length],
        project_type: PROJECT_TYPES[i % PROJECT_TYPES.length],
        workflow_id: WORKFLOWS[i % WORKFLOWS.length],
        issue_id: ISSUES[i % ISSUES.length],
        skill_id: isSkill || i % 4 === 0 ? SKILLS[i % SKILLS.length] : undefined,
        tool_name: isTool ? TOOLS[i % TOOLS.length] : undefined,
      },
      created_at,
    });
  }
  return { rows, now };
}

const DEMO_MISSION_META = new Map([
  ["demo-smb", { title: "SMB Website Builder", agent_id: "demo-lisa" }],
  ["demo-ai-edu", { title: "Ai Edu Channel", agent_id: "demo-eric" }],
]);

const DEMO_AGENT_NAMES = new Map([
  ["demo-lisa", "Lisa (CEO)"],
  ["demo-eric", "Eric (CTO)"],
]);

function demoSnapshotFromRows(rows: DemoRow[], now: number, days = 30) {
  const toIso = new Date(now).toISOString();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - days);
  const fromIso = from.toISOString();
  return buildMetricsSnapshotFromRows({
    rows,
    missionMeta: DEMO_MISSION_META,
    agentNames: DEMO_AGENT_NAMES,
    fromIso,
    toIso,
  });
}

function filterDemoRows(
  rows: DemoRow[],
  input: {
    days: number;
    missionId: string | null;
    agentId: string | null;
    modelContains?: string | null;
    missionTitleContains?: string | null;
    activityCategory?: MetricsActivityCategory;
    scope: MetricsScopeState;
  },
): DemoRow[] {
  const now = Date.now();
  const cutoff = now - input.days * 86_400_000;
  let filtered = rows.filter((r) => new Date(r.created_at).getTime() >= cutoff);

  if (input.missionId && input.missionId !== "all") {
    filtered = filtered.filter((r) => r.mission_id === input.missionId);
  }

  if (input.agentId && input.agentId !== "all") {
    filtered = filtered.filter((r) => {
      const agentId = DEMO_MISSION_META.get(r.mission_id)?.agent_id ?? null;
      return agentId === input.agentId;
    });
  }

  const activity = input.activityCategory ?? "all";
  if (activity !== "all") {
    filtered = filtered.filter((r) => matchesActivityCategory(r.event_type, activity));
  }

  const mc = input.modelContains?.trim().toLowerCase();
  if (mc) {
    filtered = filtered.filter((r) => (modelFromPayload(r.payload) ?? "").toLowerCase().includes(mc));
  }

  const mt = input.missionTitleContains?.trim().toLowerCase();
  if (mt) {
    filtered = filtered.filter((r) => {
      const title = DEMO_MISSION_META.get(r.mission_id)?.title ?? "";
      return title.toLowerCase().includes(mt);
    });
  }

  filtered = filtered.filter((r) => scopePayloadMatches(r.payload, input.scope));
  return filtered;
}

/** Deterministic metrics snapshot for layout review when `LINKAIOS_UI_MOCKS` is enabled. */
export function demoMetricsSnapshot() {
  const { rows, now } = buildDemoRows();
  return demoSnapshotFromRows(rows, now);
}

/** Demo snapshot with optional scope filter (client-side stub for Phase B). */
export function demoMetricsSnapshotForScope(scope: MetricsScopeState) {
  return demoMetricsSnapshotFiltered({ scope, days: 30, missionId: null, agentId: null });
}

/** Demo snapshot with full client-side filter parity to live fetch. */
export function demoMetricsSnapshotFiltered(input: {
  scope: MetricsScopeState;
  days: number;
  missionId: string | null;
  agentId: string | null;
  modelContains?: string | null;
  missionTitleContains?: string | null;
  activityCategory?: MetricsActivityCategory;
}) {
  const { rows, now } = buildDemoRows();
  const filtered = filterDemoRows(rows, input);
  return demoSnapshotFromRows(filtered, now, input.days);
}
