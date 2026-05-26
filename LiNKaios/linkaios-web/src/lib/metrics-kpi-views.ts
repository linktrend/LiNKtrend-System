import {
  durationStatsFromSample,
  periodTrendFromDailySeries,
  type DailyValue,
  type MetricsSnapshot,
} from "@/lib/metrics-snapshot";

export type KpiViewId = "cost" | "performance" | "reliability";

export type KpiTone = "neutral" | "warn" | "bad";

export type KpiTrend = {
  pct: number;
};

export type KpiCard = {
  slot: number;
  label: string;
  value: string;
  context: string;
  tone: KpiTone;
  trend?: KpiTrend | null;
};

function fmtUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 });
}

function fmtTok(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtPct(n: number | null, digits = 1) {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function fmtDur(ms: number | null) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  if (ms >= 3600_000) return `${(ms / 3600_000).toFixed(1)}h`;
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

function windowHours(fromIso: string, toIso: string): number {
  const a = new Date(fromIso).getTime();
  const b = new Date(toIso).getTime();
  return Math.max(1 / 60, (b - a) / (1000 * 60 * 60));
}

function trendFromSeries(rows: DailyValue[]): KpiTrend | null {
  const t = periodTrendFromDailySeries(rows);
  return t.pct != null ? { pct: t.pct } : null;
}

function allDaysFromSnapshot(s: MetricsSnapshot): string[] {
  const set = new Set<string>();
  for (const d of s.tracesByDay) set.add(d.day);
  for (const d of s.costByDay) set.add(d.day);
  for (const d of s.tokensByDay) set.add(d.day);
  return [...set].sort();
}

function costPer1mTokensSeries(s: MetricsSnapshot): DailyValue[] {
  const costByDay = new Map(s.costByDay.map((d) => [d.day, d.cost]));
  const tokByDay = new Map(s.tokensByDay.map((d) => [d.day, d.tokens]));
  const days = allDaysFromSnapshot(s);
  return days
    .map((day) => {
      const tokens = tokByDay.get(day) ?? 0;
      const cost = costByDay.get(day) ?? 0;
      return { day, value: tokens > 0 ? (cost / tokens) * 1_000_000 : 0 };
    })
    .filter((d) => d.value > 0);
}

function costPerSuccessSeries(s: MetricsSnapshot): DailyValue[] {
  const costByDay = new Map(s.costByDay.map((d) => [d.day, d.cost]));
  const successByDay = new Map(s.successTracesByDay.map((d) => [d.day, d.count]));
  const days = allDaysFromSnapshot(s);
  return days
    .map((day) => {
      const successes = successByDay.get(day) ?? 0;
      const cost = costByDay.get(day) ?? 0;
      return { day, value: successes > 0 ? cost / successes : 0 };
    })
    .filter((d) => d.value > 0);
}

function wastedCostPctSeries(s: MetricsSnapshot): DailyValue[] {
  const costByDay = new Map(s.costByDay.map((d) => [d.day, d.cost]));
  const errByDay = new Map(s.errorCostByDay.map((d) => [d.day, d.cost]));
  const days = allDaysFromSnapshot(s);
  return days
    .map((day) => {
      const total = costByDay.get(day) ?? 0;
      const err = errByDay.get(day) ?? 0;
      return { day, value: total > 0 ? (err / total) * 100 : 0 };
    })
    .filter((d) => d.value > 0 || (costByDay.get(d.day) ?? 0) > 0);
}

function topSpendLeader(
  rows: { name: string; cost: number }[],
  entityLabel: string,
): { primary: string; secondary: string; tone: KpiTone } {
  const top = rows[0];
  if (!top || top.cost <= 0) {
    return { primary: "—", secondary: `No ${entityLabel} spend`, tone: "neutral" };
  }
  const second = rows[1];
  const short = top.name.length > 24 ? `${top.name.slice(0, 22)}…` : top.name;
  const secondary =
    second && second.cost > 0
      ? `${short} · +${(((top.cost - second.cost) / second.cost) * 100).toFixed(0)}% vs #2`
      : short;
  return { primary: fmtUsd(top.cost), secondary, tone: "neutral" };
}

function totalCostContext(s: MetricsSnapshot): string {
  if (s.totalTraces === 0) return "No activity in window";
  const parts: string[] = ["All spend in window"];
  if (s.distinctMissions > 0) parts.push(`${s.distinctMissions} projects`);
  if (s.distinctAgents > 0) parts.push(`${s.distinctAgents} LiNKbots`);
  return parts.join(" · ");
}

function card(
  slot: number,
  label: string,
  value: string,
  context: string,
  tone: KpiTone,
  trend?: KpiTrend | null,
): KpiCard {
  return { slot, label, value, context, tone, trend: trend ?? undefined };
}

/** Positional KPI strip: 12 cards (4×3 grid) per Cost / Performance / Reliability view. */
export const KPI_CARDS_PER_VIEW = 12;

export function buildKpiCards(view: KpiViewId, s: MetricsSnapshot): KpiCard[] {
  const kb = s.kpiBase;
  const total = Math.max(1, s.totalTraces);
  const costPer1mTok = s.totalTokens > 0 ? (s.totalCostUsd / s.totalTokens) * 1_000_000 : 0;
  const costPerSuccess = kb.successTraceEstimate > 0 ? s.totalCostUsd / kb.successTraceEstimate : 0;
  const wastedPct = s.totalCostUsd > 0 ? (kb.errorCostUsd / s.totalCostUsd) * 100 : 0;
  const trend = kb.costTrendPct;
  const trendTone: KpiTone =
    trend != null && trend > 15 ? "bad" : trend != null && trend > 5 ? "warn" : "neutral";

  const successRate = (kb.successTraceEstimate / total) * 100;
  const srTone: KpiTone = successRate < 88 ? "bad" : successRate < 94 ? "warn" : "neutral";

  const { avgMs, p50Ms, p95Ms } = durationStatsFromSample(kb.durationsMsSample);
  const durHint = kb.durationsMsSample.length ? `${kb.durationsMsSample.length} samples` : "No duration_ms in payloads";

  const retriesPerTask = kb.successTraceEstimate > 0 ? kb.retryTraces / kb.successTraceEstimate : 0;
  const rtTone: KpiTone = retriesPerTask > 0.35 ? "bad" : retriesPerTask > 0.2 ? "warn" : "neutral";

  const stepsProxy = kb.llmTraces > 0 ? kb.toolTraces / kb.llmTraces : 0;
  const handoffProxy = kb.llmTraces > 0 ? kb.gatewayTraces / kb.llmTraces : 0;
  const firstPass =
    kb.successTraceEstimate > 0
      ? Math.max(0, Math.min(100, ((kb.successTraceEstimate - kb.retryTraces) / kb.successTraceEstimate) * 100))
      : 0;
  const hours = windowHours(s.fromIso, s.toIso);
  const throughput = kb.successTraceEstimate / hours;

  const failRate = (s.errorEvents / total) * 100;
  const frTone: KpiTone = failRate > 8 ? "bad" : failRate > 3 ? "warn" : "neutral";

  const toolFailRate = kb.toolTraces > 0 ? (kb.toolErrorTraces / kb.toolTraces) * 100 : 0;
  const modelFailRate = kb.llmTraces > 0 ? (kb.llmErrorTraces / kb.llmTraces) * 100 : 0;
  const tfrTone: KpiTone = toolFailRate > 12 ? "bad" : toolFailRate > 5 ? "warn" : "neutral";
  const mfrTone: KpiTone = modelFailRate > 12 ? "bad" : modelFailRate > 5 ? "warn" : "neutral";

  const topAgent = topSpendLeader(
    s.costByAgent.map((r) => ({ name: r.name, cost: r.cost })),
    "LiNKbot",
  );
  const topModel = topSpendLeader(
    s.costByModel.map((r) => ({ name: r.name, cost: r.cost })),
    "model",
  );
  const topModelName = s.costByModel[0]?.name ?? "—";
  const topProject = topSpendLeader(
    s.costByMission.map((r) => ({ name: r.name, cost: r.cost })),
    "project",
  );

  const costDaily = s.costByDay.map((d) => ({ day: d.day, value: d.cost }));
  const tokenDaily = s.tokensByDay.map((d) => ({ day: d.day, value: d.tokens }));
  const successDaily = s.successTracesByDay.map((d) => ({ day: d.day, value: d.count }));
  const runDaily = s.tracesByDay.map((d) => ({ day: d.day, value: d.count }));

  if (view === "cost") {
    return [
      card(1, "Total cost", fmtUsd(s.totalCostUsd), totalCostContext(s), "neutral", trendFromSeries(costDaily)),
      card(2, "Tokens", fmtTok(s.totalTokens), "From payloads", "neutral", trendFromSeries(tokenDaily)),
      card(
        3,
        "Cost per 1M tokens",
        s.totalTokens > 0 ? fmtUsd(costPer1mTok) : "—",
        "Pricing efficiency",
        costPer1mTok > 20 ? "warn" : "neutral",
        trendFromSeries(costPer1mTokensSeries(s)),
      ),
      card(
        4,
        "Successful runs",
        String(kb.successTraceEstimate),
        "Total − error-like",
        "neutral",
        trendFromSeries(successDaily),
      ),
      card(
        5,
        "Cost per successful run",
        fmtUsd(costPerSuccess),
        "Est. non-error runs",
        costPerSuccess > 0.05 ? "warn" : "neutral",
        trendFromSeries(costPerSuccessSeries(s)),
      ),
      card(
        6,
        "Cost trend",
        trend == null ? "—" : fmtPct(trend),
        kb.costTrendLabel || "Period comparison",
        trendTone,
        trend != null ? { pct: trend } : null,
      ),
      card(7, "Top cost agent", topAgent.primary, topAgent.secondary, topAgent.tone, null),
      card(
        8,
        "Top cost model",
        topModel.primary,
        topModelName !== "—" ? `${topModelName} · most expensive model` : topModel.secondary,
        topModel.tone,
        null,
      ),
      card(
        9,
        "Wasted cost %",
        `${wastedPct.toFixed(1)}%`,
        "Error-like cost / total spend",
        wastedPct > 12 ? "bad" : wastedPct > 5 ? "warn" : "neutral",
        trendFromSeries(wastedCostPctSeries(s)),
      ),
      card(10, "Top cost project", topProject.primary, topProject.secondary, topProject.tone, null),
      card(
        11,
        "Error cost",
        fmtUsd(kb.errorCostUsd),
        "Spend on error-like rows",
        kb.errorCostUsd > s.totalCostUsd * 0.12 ? "bad" : kb.errorCostUsd > s.totalCostUsd * 0.05 ? "warn" : "neutral",
        trendFromSeries(s.errorCostByDay.map((d) => ({ day: d.day, value: d.cost }))),
      ),
      card(
        12,
        "Total activity",
        String(s.totalTraces),
        "All runs in filtered window",
        "neutral",
        trendFromSeries(runDaily),
      ),
    ];
  }

  if (view === "performance") {
    return [
      card(1, "Tasks (LLM-like)", String(kb.llmTraces), "Heuristic bucket", "neutral", trendFromSeries(runDaily)),
      card(2, "Run success rate", `${successRate.toFixed(1)}%`, "Non-error / total", srTone, trendFromSeries(successDaily)),
      card(3, "Avg duration", fmtDur(avgMs), durHint, avgMs != null && avgMs > 120_000 ? "warn" : "neutral", trendFromSeries(runDaily)),
      card(4, "Median (P50)", fmtDur(p50Ms), "Payload latency", "neutral", trendFromSeries(runDaily)),
      card(5, "P95 duration", fmtDur(p95Ms), "Tail latency", p95Ms != null && p95Ms > 300_000 ? "bad" : "neutral", trendFromSeries(runDaily)),
      card(6, "Retries / run", retriesPerTask.toFixed(2), "Retry signals in events", rtTone, trendFromSeries(runDaily)),
      card(7, "Steps proxy", stepsProxy.toFixed(2), "Tool / LLM ratio", stepsProxy > 6 ? "warn" : "neutral", trendFromSeries(runDaily)),
      card(8, "Handoffs proxy", handoffProxy.toFixed(2), "Gateway / LLM ratio", "neutral", trendFromSeries(runDaily)),
      card(9, "First-pass proxy", `${firstPass.toFixed(0)}%`, "1 − retries/success", firstPass < 75 ? "warn" : "neutral", trendFromSeries(successDaily)),
      card(10, "Throughput", throughput.toFixed(1), "Successful runs / hour", "neutral", trendFromSeries(successDaily)),
      card(11, "Total runs", String(s.totalTraces), "All activity in window", "neutral", trendFromSeries(runDaily)),
      card(12, "Tool runs", String(kb.toolTraces), "Tool / MCP / invoke-like", "neutral", trendFromSeries(runDaily)),
    ];
  }

  const retryRate = (kb.retryTraces / total) * 100;
  const rrTone: KpiTone = retryRate > 20 ? "bad" : retryRate > 12 ? "warn" : "neutral";
  const timeoutRate = (kb.timeoutTraces / total) * 100;
  const errRate = (kb.nonTimeoutErrorTraces / total) * 100;

  return [
    card(1, "Failure rate", `${failRate.toFixed(1)}%`, "Error-like / runs", frTone, trendFromSeries(runDaily)),
    card(2, "Incidents (proxy)", String(s.errorEvents), "Error-shaped runs", s.errorEvents > total * 0.08 ? "bad" : "neutral", trendFromSeries(runDaily)),
    card(3, "Timeout rate", `${timeoutRate.toFixed(1)}%`, "`timeout` in event", timeoutRate > 4 ? "warn" : "neutral", trendFromSeries(runDaily)),
    card(4, "Non-timeout errors", `${errRate.toFixed(1)}%`, "fail / denied / blocked", errRate > 6 ? "bad" : errRate > 2 ? "warn" : "neutral", trendFromSeries(runDaily)),
    card(5, "Stuck runs", "—", "See worker sessions", "neutral", null),
    card(6, "Retry rate", `${retryRate.toFixed(1)}%`, "retry in event_type", rrTone, trendFromSeries(runDaily)),
    card(7, "Human intervention", "—", "Not captured in metrics yet", "neutral", null),
    card(8, "Tool failure rate", `${toolFailRate.toFixed(1)}%`, "Tool errors / tool runs", tfrTone, trendFromSeries(runDaily)),
    card(9, "Model failure rate", `${modelFailRate.toFixed(1)}%`, "LLM errors / LLM runs", mfrTone, trendFromSeries(runDaily)),
    card(10, "MTTR", "—", "Needs incident timestamps", "neutral", null),
    card(11, "Successful runs", String(kb.successTraceEstimate), "Total − error-like", "neutral", trendFromSeries(successDaily)),
    card(12, "Total runs", String(s.totalTraces), "All activity in window", "neutral", trendFromSeries(runDaily)),
  ];
}

export const KPI_VIEW_LABELS: Record<KpiViewId, { title: string; question: string }> = {
  cost: { title: "Cost", question: "Are we spending efficiently?" },
  performance: { title: "Performance", question: "Are agents completing work well?" },
  reliability: { title: "Reliability", question: "Is the system stable and trustworthy?" },
};
