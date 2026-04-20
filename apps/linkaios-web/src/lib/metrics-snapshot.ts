import { costFromPayload, modelFromPayload, observabilityCategory, tokensFromPayload } from "@/lib/trace-metrics";

function durationMsFromPayload(p: Record<string, unknown>): number | null {
  for (const k of ["duration_ms", "latency_ms", "total_duration_ms", "elapsed_ms", "response_time_ms"]) {
    const v = p[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return v;
  }
  return null;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const arr = [...sorted].sort((a, b) => a - b);
  const idx = Math.min(arr.length - 1, Math.max(0, Math.ceil((p / 100) * arr.length) - 1));
  return arr[idx];
}

export function durationStatsFromSample(sample: number[]): {
  avgMs: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
} {
  if (sample.length === 0) return { avgMs: null, p50Ms: null, p95Ms: null };
  const sum = sample.reduce((a, b) => a + b, 0);
  return {
    avgMs: sum / sample.length,
    p50Ms: percentile(sample, 50),
    p95Ms: percentile(sample, 95),
  };
}

export type MetricsRunRow = {
  id: string;
  created_at: string;
  event_type: string;
  mission_id: string | null;
  mission_title: string | null;
  agent_name: string | null;
  agent_id: string | null;
  cost_usd: number | null;
  model: string | null;
  tokens: number | null;
  payload: Record<string, unknown>;
};

export type NamedAmount = { name: string; cost: number; tokens: number; traces: number };

/** Aggregates for KPI strips (Cost / Performance / Reliability views). */
export type MetricsKpiBase = {
  llmTraces: number;
  toolTraces: number;
  memoryTraces: number;
  gatewayTraces: number;
  retryTraces: number;
  timeoutTraces: number;
  /** Errors excluding timeout keyword in `event_type`. */
  nonTimeoutErrorTraces: number;
  /** Cost attributed to error-like rows (same heuristic as `errorEvents`). */
  errorCostUsd: number;
  /** Traces not matching error-like heuristic. */
  successTraceEstimate: number;
  /** Duration samples from payload (`duration_ms`, `latency_ms`, …) when present. */
  durationsMsSample: number[];
  /** Sum of first vs second half of calendar days in window (cost). */
  costFirstHalfUsd: number;
  costSecondHalfUsd: number;
  /** % change second half vs first half of days in window; null if not computable. */
  costTrendPct: number | null;
  llmErrorTraces: number;
  toolErrorTraces: number;
};

export type MetricsSnapshot = {
  fromIso: string;
  toIso: string;
  totalTraces: number;
  distinctMissions: number;
  distinctAgents: number;
  errorEvents: number;
  totalCostUsd: number;
  totalTokens: number;
  tracesByDay: { day: string; count: number }[];
  tokensByDay: { day: string; tokens: number }[];
  costByDay: { day: string; cost: number }[];
  eventTypeSlices: { name: string; count: number }[];
  /** High-level buckets derived from `event_type` heuristics. */
  observabilityCategories: { id: string; label: string; count: number }[];
  costByModel: NamedAmount[];
  costByAgent: NamedAmount[];
  costByMission: NamedAmount[];
  runs: MetricsRunRow[];
  kpiBase: MetricsKpiBase;
};

type TraceInput = {
  id: string;
  event_type: string;
  mission_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

function topNamedAmounts(
  map: Map<string, { cost: number; tokens: number; traces: number }>,
  labels: Map<string, string>,
  topN: number,
): NamedAmount[] {
  const arr = [...map.entries()].map(([name, v]) => ({
    name: labels.get(name) ?? name,
    cost: v.cost,
    tokens: v.tokens,
    traces: v.traces,
  }));
  arr.sort((a, b) => b.cost - a.cost || b.traces - a.traces);
  if (arr.length <= topN) return arr;
  const head = arr.slice(0, topN);
  const tail = arr.slice(topN);
  if (tail.length === 0) return head;
  const other = tail.reduce(
    (a, r) => ({
      name: "Other (combined)",
      cost: a.cost + r.cost,
      tokens: a.tokens + r.tokens,
      traces: a.traces + r.traces,
    }),
    { name: "Other (combined)", cost: 0, tokens: 0, traces: 0 },
  );
  return [...head, other];
}

export function buildMetricsSnapshotFromRows(input: {
  rows: TraceInput[];
  missionMeta: Map<string, { title: string; agent_id: string | null }>;
  agentNames: Map<string, string>;
  fromIso: string;
  toIso: string;
  eventTypeContains?: string | null;
}): MetricsSnapshot {
  const filter = input.eventTypeContains?.trim().toLowerCase() ?? "";
  const list = filter
    ? input.rows.filter((r) => r.event_type.toLowerCase().includes(filter))
    : input.rows;

  const byDay = new Map<string, number>();
  const byDayTokens = new Map<string, number>();
  const byDayCost = new Map<string, number>();
  const byType = new Map<string, number>();
  const byModel = new Map<string, { cost: number; tokens: number; traces: number }>();
  const byAgent = new Map<string, { cost: number; tokens: number; traces: number }>();
  const byMission = new Map<string, { cost: number; tokens: number; traces: number }>();
  const modelLabels = new Map<string, string>();
  const agentLabels = new Map<string, string>();
  const missionLabels = new Map<string, string>();

  const catCounts = new Map<string, number>([
    ["llm", 0],
    ["tool", 0],
    ["memory", 0],
    ["gateway", 0],
    ["error", 0],
    ["other", 0],
  ]);

  let errorEvents = 0;
  let totalCostUsd = 0;
  let totalTokens = 0;
  const agentIdsSeen = new Set<string>();
  let retryTraces = 0;
  let timeoutTraces = 0;
  let nonTimeoutErrorTraces = 0;
  let errorCostUsd = 0;
  let llmErrorTraces = 0;
  let toolErrorTraces = 0;
  const durationsSample: number[] = [];

  for (const r of list) {
    const day = r.created_at.slice(0, 10);
    const p = r.payload ?? {};
    const tokens = tokensFromPayload(p);
    const cost = costFromPayload(p);
    const model = modelFromPayload(p);
    const et = r.event_type.toLowerCase();
    const isErr =
      et.includes("error") || et.includes("fail") || et.includes("denied") || et.includes("blocked");
    if (isErr) {
      errorEvents += 1;
      errorCostUsd += cost;
    }
    if (et.includes("timeout")) timeoutTraces += 1;
    if (isErr && !et.includes("timeout")) nonTimeoutErrorTraces += 1;
    if (et.includes("retry")) retryTraces += 1;

    byDay.set(day, (byDay.get(day) ?? 0) + 1);
    byDayTokens.set(day, (byDayTokens.get(day) ?? 0) + tokens);
    byDayCost.set(day, (byDayCost.get(day) ?? 0) + cost);
    byType.set(r.event_type, (byType.get(r.event_type) ?? 0) + 1);
    totalCostUsd += cost;
    totalTokens += tokens;

    const cat = observabilityCategory(r.event_type);
    catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
    if (cat === "llm" && isErr) llmErrorTraces += 1;
    if (cat === "tool" && isErr) toolErrorTraces += 1;

    const dm = durationMsFromPayload(p);
    if (dm != null && durationsSample.length < 3000) durationsSample.push(dm);

    const mid = r.mission_id ? String(r.mission_id) : null;
    const mm = mid ? input.missionMeta.get(mid) : undefined;
    const agentId = mm?.agent_id ? String(mm.agent_id) : null;
    if (agentId) agentIdsSeen.add(agentId);
    const agentKey = agentId ?? "__unscoped__";
    const agentLabel = agentId ? input.agentNames.get(agentId) ?? `Agent ${agentId.slice(0, 8)}…` : "Unscoped / no mission";
    agentLabels.set(agentKey, agentLabel);

    const mkey = model ?? "__unknown_model__";
    modelLabels.set(mkey, model ?? "Unknown model");
    const curM = byModel.get(mkey) ?? { cost: 0, tokens: 0, traces: 0 };
    curM.cost += cost;
    curM.tokens += tokens;
    curM.traces += 1;
    byModel.set(mkey, curM);

    const curA = byAgent.get(agentKey) ?? { cost: 0, tokens: 0, traces: 0 };
    curA.cost += cost;
    curA.tokens += tokens;
    curA.traces += 1;
    byAgent.set(agentKey, curA);

    const msKey = mid ?? "__no_mission__";
    const msTitle = mid ? mm?.title ?? `Project ${mid.slice(0, 8)}…` : "No project";
    missionLabels.set(msKey, msTitle);
    const curS = byMission.get(msKey) ?? { cost: 0, tokens: 0, traces: 0 };
    curS.cost += cost;
    curS.tokens += tokens;
    curS.traces += 1;
    byMission.set(msKey, curS);
  }

  const tracesByDay = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }));

  const tokensByDay = [...byDayTokens.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, tokens]) => ({ day, tokens }));

  const costByDay = [...byDayCost.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, cost]) => ({ day, cost }));

  const dayCosts = [...costByDay];
  let costFirstHalfUsd = 0;
  let costSecondHalfUsd = 0;
  let costTrendPct: number | null = null;
  if (dayCosts.length >= 2) {
    const mid = Math.floor(dayCosts.length / 2);
    costFirstHalfUsd = dayCosts.slice(0, mid).reduce((s, d) => s + d.cost, 0);
    costSecondHalfUsd = dayCosts.slice(mid).reduce((s, d) => s + d.cost, 0);
    costTrendPct =
      costFirstHalfUsd > 0
        ? ((costSecondHalfUsd - costFirstHalfUsd) / costFirstHalfUsd) * 100
        : costSecondHalfUsd > 0
          ? 100
          : 0;
  }

  const successTraceEstimate = Math.max(0, list.length - errorEvents);
  const kpiBase: MetricsKpiBase = {
    llmTraces: catCounts.get("llm") ?? 0,
    toolTraces: catCounts.get("tool") ?? 0,
    memoryTraces: catCounts.get("memory") ?? 0,
    gatewayTraces: catCounts.get("gateway") ?? 0,
    retryTraces,
    timeoutTraces,
    nonTimeoutErrorTraces,
    errorCostUsd,
    successTraceEstimate,
    durationsMsSample: durationsSample,
    costFirstHalfUsd,
    costSecondHalfUsd,
    costTrendPct,
    llmErrorTraces,
    toolErrorTraces,
  };

  const eventTypeSlices = [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([name, count]) => ({ name, count }));

  const observabilityCategories = [
    { id: "llm", label: "LLM / completion-like", count: catCounts.get("llm") ?? 0 },
    { id: "tool", label: "Tool / MCP / invoke-like", count: catCounts.get("tool") ?? 0 },
    { id: "memory", label: "Memory-like", count: catCounts.get("memory") ?? 0 },
    { id: "gateway", label: "Gateway / comms-like", count: catCounts.get("gateway") ?? 0 },
    { id: "error", label: "Error / fail-like", count: catCounts.get("error") ?? 0 },
    { id: "other", label: "Other", count: catCounts.get("other") ?? 0 },
  ];

  const costByModel = topNamedAmounts(byModel, modelLabels, 18);
  const costByAgent = topNamedAmounts(byAgent, agentLabels, 18);
  const costByMission = topNamedAmounts(byMission, missionLabels, 18);

  const runs: MetricsRunRow[] = list.slice(0, 100).map((r) => {
    const mid = r.mission_id ? String(r.mission_id) : null;
    const mm = mid ? input.missionMeta.get(mid) : undefined;
    const agentId = mm?.agent_id ? String(mm.agent_id) : null;
    const p = r.payload ?? {};
    const rawCost = p.cost_usd;
    const costDisplay =
      typeof rawCost === "number" && Number.isFinite(rawCost) ? rawCost : null;
    const tok = tokensFromPayload(p);
    return {
      id: String(r.id),
      created_at: r.created_at,
      event_type: r.event_type,
      mission_id: mid,
      mission_title: mm?.title ?? null,
      agent_id: agentId,
      agent_name: agentId ? input.agentNames.get(agentId) ?? null : null,
      cost_usd: costDisplay,
      model: modelFromPayload(p),
      tokens: tok > 0 ? tok : null,
      payload: p,
    };
  });

  return {
    fromIso: input.fromIso,
    toIso: input.toIso,
    totalTraces: list.length,
    distinctMissions: new Set(list.map((r) => r.mission_id).filter(Boolean)).size,
    distinctAgents: agentIdsSeen.size,
    errorEvents,
    totalCostUsd,
    totalTokens,
    tracesByDay,
    tokensByDay,
    costByDay,
    eventTypeSlices,
    observabilityCategories,
    costByModel,
    costByAgent,
    costByMission,
    runs,
    kpiBase,
  };
}
