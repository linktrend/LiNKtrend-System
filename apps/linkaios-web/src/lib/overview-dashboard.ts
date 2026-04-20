import type { AgentRecord, MissionRecord, SkillRecord } from "@linktrend/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";

import { buildAttentionFeed, type AttentionFeedItem } from "@/lib/work-attention-feed";
import { mapWorkerSessionsToThreads } from "@/lib/work-sessions";
import { DEMO_CHANNEL_THREADS } from "@/lib/ui-mocks/channel-threads";
import { DEMO_SIDEBAR_AGENTS, DEMO_SIDEBAR_MISSIONS, isDemoAgentId } from "@/lib/ui-mocks/entities";
import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { traceToWorkAlert, type WorkAlert } from "@/lib/work-alerts";
import { groupZulipIntoThreads, type ZulipMessageLinkRow } from "@/lib/work-messages";

export type HealthState = "ok" | "degraded" | "failed";

export type HealthCard = {
  id: string;
  label: string;
  state: HealthState;
  hint: string;
  href?: string;
};

export type BotFleetCard = {
  id: string;
  display_name: string;
  shorthand: string;
  ux: "working" | "idle" | "offline";
  demo: boolean;
};

export type WorkRowTone = "ok" | "attention" | "critical";

export type GovernanceLine = { area: "LiNKbrain" | "Skills" | "Tools"; message: string; href: string };

export type SystemStatusLevel = "ok" | "attention" | "critical";

export type OverviewSystemIssue = { label: string; href: string };

export type OverviewData = {
  setupError: string | null;
  systemStatus: {
    level: SystemStatusLevel;
    issues: OverviewSystemIssue[];
  };
  attentionItems: AttentionFeedItem[];
  workforceSummary: {
    total: number;
    online: number;
    offline: number;
    busy: number;
    idle: number;
  };
  workCounts: { alerts: number; messages: number; sessions: number; brainInbox: number };
  projectsSummary: { active: number; needsAttention: number };
  fleet: BotFleetCard[];
};

function worst(a: HealthState, b: HealthState): HealthState {
  const rank = { failed: 3, degraded: 2, ok: 1 };
  return rank[a] >= rank[b] ? a : b;
}

/** One-line footer for health cards: OK → “Service online”; otherwise “Service — problem”. */
function healthStatusLine(serviceName: string, state: HealthState, detail: string): string {
  if (state === "ok") return `${serviceName} online`;
  const one = detail.replace(/\s+/g, " ").trim() || "Check configuration";
  const short = one.length > 72 ? `${one.slice(0, 69)}…` : one;
  return `${serviceName} — ${short}`;
}

/** Probes the configured LLM / agent ingress (OpenClaw shim or gateway) from the same origin as OPENCLAW_AGENT_RUN_URL. */
async function probeLlmApiHealth(): Promise<{ state: HealthState; hint: string }> {
  const runUrl = process.env.OPENCLAW_AGENT_RUN_URL?.trim();
  if (!runUrl) {
    return {
      state: "degraded",
      hint: "OPENCLAW_AGENT_RUN_URL not set — configure ingress for LLM runs",
    };
  }
  let origin: string;
  try {
    origin = new URL(runUrl).origin;
  } catch {
    return { state: "failed", hint: "OPENCLAW_AGENT_RUN_URL is not a valid URL" };
  }

  async function tryGet(url: string) {
    const ctl = new AbortController();
    const id = setTimeout(() => ctl.abort(), 2800);
    try {
      return await fetch(url, { method: "GET", signal: ctl.signal, cache: "no-store" });
    } finally {
      clearTimeout(id);
    }
  }

  try {
    const healthRes = await tryGet(`${origin}/health`);
    if (healthRes.ok) {
      return { state: "ok", hint: "LLM ingress health OK" };
    }
    const rootRes = await tryGet(`${origin}/`);
    if (rootRes.ok) {
      return { state: "ok", hint: "LLM ingress reachable" };
    }
    return {
      state: "degraded",
      hint: `Ingress HTTP ${healthRes.status} (/health) · ${rootRes.status} (/)`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("abort") || msg.includes("Abort")) {
      return { state: "failed", hint: "LLM ingress probe timed out" };
    }
    return { state: "failed", hint: msg };
  }
}

export function alertToneFromMerged(alerts: WorkAlert[]): WorkRowTone {
  if (alerts.some((a) => a.severity === "critical")) return "critical";
  if (alerts.some((a) => a.severity === "warning")) return "attention";
  return "ok";
}

async function loadAlertsList(supabase: SupabaseClient, uiMocksEnabled: boolean) {
  const { data: traces, error } = await supabase
    .schema("linkaios")
    .from("traces")
    .select("id, event_type, mission_id, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(50);
  const fromDb =
    error || !traces?.length
      ? []
      : traces.map((t) =>
          traceToWorkAlert({
            id: String((t as { id: string }).id),
            event_type: String((t as { event_type: string }).event_type),
            mission_id: (t as { mission_id: string | null }).mission_id,
            created_at: String((t as { created_at: string }).created_at),
            payload: (t as { payload: unknown }).payload,
          }),
        );
  const merged = uiMocksEnabled ? [...DEMO_WORK_ALERTS, ...fromDb] : fromDb;
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function missionTone(s: string): "ok" | "progress" | "risk" {
  if (s === "failed") return "risk";
  if (s === "running" || s === "assigned" || s === "draft") return "progress";
  return "ok";
}

function deriveSystemLevel(params: {
  detailHealth: HealthCard[];
  criticalAlerts: number;
  warningAlerts: number;
  governanceCount: number;
}): SystemStatusLevel {
  const failedHealth = params.detailHealth.some((h) => h.state === "failed");
  const degradedHealth = params.detailHealth.some((h) => h.state === "degraded");
  if (failedHealth || params.criticalAlerts > 0) return "critical";
  if (degradedHealth || params.warningAlerts > 0 || params.governanceCount > 0) return "attention";
  return "ok";
}

export async function loadOverviewData(
  supabase: SupabaseClient,
  options: { uiMocksEnabled: boolean },
): Promise<OverviewData> {
  const { uiMocksEnabled } = options;
  const now = Date.now();

  const [
    agentsPing,
    gatewayPing,
    memoryPing,
    runtimePing,
    agentsList,
    missionsList,
    skillsList,
    toolsList,
    gatewayRows,
    alertsList,
    llmApiHealth,
    brainDraftCountRes,
    workerSessionsPreview,
  ] = await Promise.all([
    supabase.schema("linkaios").from("agents").select("id").limit(1),
    supabase.schema("gateway").from("zulip_message_links").select("id").limit(1),
    supabase.schema("linkaios").from("memory_entries").select("id").limit(1),
    supabase.schema("bot_runtime").from("worker_sessions").select("id").limit(1),
    supabase.schema("linkaios").from("agents").select("id, display_name, status, created_at, updated_at").order("updated_at", { ascending: false }).limit(40),
    supabase
      .schema("linkaios")
      .from("missions")
      .select("id, title, status, primary_agent_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(40),
    supabase.schema("linkaios").from("skills").select("id, name, status, metadata").limit(200),
    supabase.schema("linkaios").from("tools").select("id, name, status").limit(200),
    supabase.schema("gateway").from("zulip_message_links").select("id, zulip_message_id, stream_id, topic, mission_id, payload, created_at").order("created_at", { ascending: false }).limit(200),
    loadAlertsList(supabase, uiMocksEnabled),
    probeLlmApiHealth(),
    supabase.schema("linkaios").from("brain_file_versions").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .schema("bot_runtime")
      .from("worker_sessions")
      .select("id, agent_id, status, started_at, last_heartbeat, ended_at, metadata")
      .order("started_at", { ascending: false })
      .limit(40),
  ]);

  const setupError = agentsPing.error ? agentsPing.error.message : null;

  const connState: HealthState = agentsPing.error ? "failed" : "ok";
  const gatewayState: HealthState = gatewayPing.error
    ? gatewayPing.error.code === "PGRST106" || String(gatewayPing.error.message).includes("schema")
      ? "failed"
      : "degraded"
    : "ok";
  const brainState: HealthState = memoryPing.error ? (memoryPing.error.code === "PGRST106" ? "failed" : "degraded") : "ok";
  const runtimeState: HealthState = runtimePing.error ? (runtimePing.error.code === "PGRST106" ? "failed" : "degraded") : "ok";

  const detailHealth: HealthCard[] = [
    {
      id: "connections",
      label: "Connections",
      state: connState,
      hint: healthStatusLine(
        "Connections",
        connState,
        connState === "ok" ? "" : agentsPing.error?.message ?? "Unreachable",
      ),
      href: "/settings/user",
    },
    {
      id: "communications",
      label: "Communications",
      state: gatewayState,
      hint: healthStatusLine(
        "Communications",
        gatewayState,
        gatewayState === "ok" ? "" : gatewayPing.error?.message ?? "Gateway schema unavailable",
      ),
      href: "/settings/gateway",
    },
    {
      id: "llm-api",
      label: "LLM API",
      state: llmApiHealth.state,
      hint: healthStatusLine("LLM API", llmApiHealth.state, llmApiHealth.hint),
      href: "/metrics",
    },
    {
      id: "linkbrain",
      label: "LiNKbrain",
      state: brainState,
      hint: healthStatusLine(
        "LiNKbrain",
        brainState,
        brainState === "ok" ? "" : memoryPing.error?.message ?? "Memory unavailable",
      ),
      href: "/memory",
    },
    {
      id: "runtime",
      label: "Bot runtime",
      state: runtimeState,
      hint: healthStatusLine(
        "Bot runtime",
        runtimeState,
        runtimeState === "ok" ? "" : runtimePing.error?.message ?? "Runtime schema unavailable",
      ),
      href: "/workers",
    },
    {
      id: "environment",
      label: "Environment",
      state: connState === "ok" && runtimeState === "ok" ? "ok" : worst(connState, runtimeState),
      hint: healthStatusLine(
        "Environment",
        connState === "ok" && runtimeState === "ok" ? "ok" : worst(connState, runtimeState),
        connState === "ok" && runtimeState === "ok"
          ? ""
          : `Connections ${connState}, runtime ${runtimeState}`,
      ),
      href: "/settings",
    },
  ];

  const apiAgents = (agentsList.data ?? []) as AgentRecord[];
  const demoFleet: BotFleetCard[] = uiMocksEnabled
    ? DEMO_SIDEBAR_AGENTS.map((d, i) => ({
        id: d.id,
        display_name: d.display_name,
        shorthand: i === 0 ? "CEO" : "CTO",
        ux: i === 0 ? "working" : "offline",
        demo: true,
      }))
    : [];

  const { data: recentSessions } = workerSessionsPreview;
  type WorkerSessionRow = {
    id: string;
    agent_id: string;
    status: string;
    started_at: string;
    last_heartbeat: string | null;
    metadata?: unknown;
  };
  const sessionsList = (recentSessions ?? []) as WorkerSessionRow[];

  const sessByAgent = new Map<string, WorkerSessionRow[]>();
  for (const s of sessionsList) {
    const aid = String(s.agent_id);
    const arr = sessByAgent.get(aid) ?? [];
    arr.push(s);
    sessByAgent.set(aid, arr);
  }

  function uxForAgent(id: string): BotFleetCard["ux"] {
    if (uiMocksEnabled && isDemoAgentId(id)) {
      return id === "demo-lisa" ? "working" : "offline";
    }
    const sessions = sessByAgent.get(id) ?? [];
    const latest = sessions[0];
    if (!latest) return "offline";
    if (latest.status === "running") return "working";
    const hb = latest.last_heartbeat ? new Date(latest.last_heartbeat).getTime() : 0;
    if (hb && now - hb < 5 * 60 * 1000) return "idle";
    return "offline";
  }

  const shorthandFor = (name: string) => {
    const m = name.match(/\(([^)]+)\)/);
    return m ? m[1].split(/\s+/)[0] ?? name.slice(0, 8) : name.slice(0, 10);
  };

  const liveFleet: BotFleetCard[] = apiAgents.map((a) => ({
    id: String(a.id),
    display_name: a.display_name,
    shorthand: shorthandFor(a.display_name),
    ux: uxForAgent(String(a.id)),
    demo: false,
  }));

  const fleetIds = new Set(demoFleet.map((d) => d.id));
  const fleet = demoFleet.length > 0 ? [...demoFleet, ...liveFleet.filter((a) => !fleetIds.has(a.id))] : liveFleet;

  const alertsMerged = alertsList;
  const crit = alertsMerged.filter((a) => a.severity === "critical").length;
  const warn = alertsMerged.filter((a) => a.severity === "warning").length;

  const zRows = (gatewayRows.data ?? []) as unknown as ZulipMessageLinkRow[];
  const liveThreads = zRows.length ? groupZulipIntoThreads(zRows) : [];
  const threads = [...(uiMocksEnabled ? DEMO_CHANNEL_THREADS : []), ...liveThreads].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );

  const agentName = new Map<string, string>();
  for (const a of apiAgents) {
    agentName.set(String(a.id), typeof a.display_name === "string" ? a.display_name : "LiNKbot");
  }
  const sessionThreads = sessionsList.length
    ? mapWorkerSessionsToThreads(sessionsList, agentName)
    : [];

  const brainInboxCount = brainDraftCountRes.error ? 0 : brainDraftCountRes.count ?? 0;

  const dbMissions = (missionsList.data ?? []) as MissionRecord[];
  const missionsMerged: MissionRecord[] =
    dbMissions.length > 0
      ? dbMissions
      : uiMocksEnabled
        ? DEMO_SIDEBAR_MISSIONS.map(
            (m, i) =>
              ({
                id: m.id,
                title: m.title,
                status: (i === 0 ? "running" : "completed") as MissionRecord["status"],
                primary_agent_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }) as MissionRecord,
          )
        : [];

  const skills = (skillsList.data ?? []) as SkillRecord[];
  const draftSkills = skills.filter((s) => s.status === "draft").length;
  const tools =
    toolsList.error || !toolsList.data ? ([] as Array<{ status: string }>) : (toolsList.data as Array<{ status: string }>);
  const draftTools = tools.filter((t) => t.status === "draft").length;
  const governanceLines: GovernanceLine[] = [];
  if (brainState !== "ok") {
    governanceLines.push({
      area: "LiNKbrain",
      message: memoryPing.error?.message ?? "Memory store check failed",
      href: "/memory",
    });
  }
  if (draftSkills > 0) {
    governanceLines.push({ area: "Skills", message: `${draftSkills} skill(s) in draft`, href: "/skills/skills" });
  }
  if (draftTools > 0) {
    governanceLines.push({ area: "Tools", message: `${draftTools} tool(s) in draft`, href: "/skills/tools" });
  }

  const issues: OverviewSystemIssue[] = [];
  for (const h of detailHealth) {
    if (h.state !== "ok" && h.href) {
      issues.push({ label: h.hint, href: h.href });
    }
  }
  for (const g of governanceLines) {
    issues.push({ label: `${g.area}: ${g.message}`, href: g.href });
  }

  const systemLevel = deriveSystemLevel({
    detailHealth,
    criticalAlerts: crit,
    warningAlerts: warn,
    governanceCount: governanceLines.length,
  });

  const attentionItems = buildAttentionFeed({
    alerts: alertsMerged,
    messages: threads,
    sessions: sessionThreads,
    brainDraftCount: brainInboxCount,
  }).slice(0, 14);

  const busy = fleet.filter((f) => f.ux === "working").length;
  const idle = fleet.filter((f) => f.ux === "idle").length;
  const offline = fleet.filter((f) => f.ux === "offline").length;
  const online = busy + idle;

  const activeProjects = missionsMerged.filter((m) => m.status === "running" || m.status === "assigned").length;
  const needsAttentionProjects = missionsMerged.filter(
    (m) => missionTone(m.status) === "risk" || m.status === "draft",
  ).length;

  return {
    setupError,
    systemStatus: {
      level: systemLevel,
      issues: issues.slice(0, 10),
    },
    attentionItems,
    workforceSummary: {
      total: fleet.length,
      online,
      offline,
      busy,
      idle,
    },
    workCounts: {
      alerts: alertsMerged.length,
      messages: threads.length,
      sessions: sessionThreads.length,
      brainInbox: brainInboxCount,
    },
    projectsSummary: {
      active: activeProjects,
      needsAttention: needsAttentionProjects,
    },
    fleet,
  };
}
