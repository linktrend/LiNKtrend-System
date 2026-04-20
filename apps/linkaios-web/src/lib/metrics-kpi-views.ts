import { durationStatsFromSample, type MetricsSnapshot } from "@/lib/metrics-snapshot";

export type KpiViewId = "cost" | "performance" | "reliability";

export type KpiTone = "neutral" | "warn" | "bad";

export type KpiCard = {
  slot: number;
  label: string;
  value: string;
  context: string;
  tone: KpiTone;
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

function topSpendRow(
  rows: { name: string; cost: number }[],
  totalCost: number,
): { primary: string; secondary: string; tone: KpiTone } {
  const top = rows[0];
  if (!top || totalCost <= 0) return { primary: "—", secondary: "No spend", tone: "neutral" };
  const pct = (top.cost / totalCost) * 100;
  const short = top.name.length > 22 ? `${top.name.slice(0, 20)}…` : top.name;
  return { primary: `${pct.toFixed(0)}%`, secondary: `${short} · ${fmtUsd(top.cost)}`, tone: "neutral" };
}

/** Positional KPI strip: same 10 slots across Cost / Performance / Reliability. */
export function buildKpiCards(view: KpiViewId, s: MetricsSnapshot): KpiCard[] {
  const kb = s.kpiBase;
  const total = Math.max(1, s.totalTraces);
  const costPer1kTok = s.totalTokens > 0 ? (s.totalCostUsd / s.totalTokens) * 1000 : 0;
  const costPerSuccess = kb.successTraceEstimate > 0 ? s.totalCostUsd / kb.successTraceEstimate : 0;
  const successPerUsd = s.totalCostUsd > 0 ? kb.successTraceEstimate / s.totalCostUsd : 0;
  const wastedPct = s.totalCostUsd > 0 ? (kb.errorCostUsd / s.totalCostUsd) * 100 : 0;
  const trend = kb.costTrendPct;
  const trendTone: KpiTone =
    trend != null && trend > 15 ? "bad" : trend != null && trend > 5 ? "warn" : "neutral";

  const successRate = ((kb.successTraceEstimate / total) * 100);
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

  const topAgent = topSpendRow(
    s.costByAgent.map((r) => ({ name: r.name, cost: r.cost })),
    s.totalCostUsd,
  );
  const topModel = topSpendRow(
    s.costByModel.map((r) => ({ name: r.name, cost: r.cost })),
    s.totalCostUsd,
  );

  if (view === "cost") {
    return [
      { slot: 1, label: "Total cost", value: fmtUsd(s.totalCostUsd), context: s.totalTraces ? `${s.totalTraces} runs` : "No data", tone: "neutral" },
      { slot: 2, label: "Cost / successful run", value: fmtUsd(costPerSuccess), context: "Est. non-error runs", tone: costPerSuccess > 0.05 ? "warn" : "neutral" },
      { slot: 3, label: "AI usage (tokens)", value: fmtTok(s.totalTokens), context: "From payloads", tone: "neutral" },
      { slot: 4, label: "Cost / 1K tokens", value: s.totalTokens > 0 ? fmtUsd(costPer1kTok) : "—", context: "Pricing efficiency", tone: costPer1kTok > 0.02 ? "warn" : "neutral" },
      { slot: 5, label: "Successful runs", value: String(kb.successTraceEstimate), context: "Total − error-like", tone: "neutral" },
      { slot: 6, label: "Success / $", value: successPerUsd >= 1000 ? `${(successPerUsd / 1000).toFixed(1)}k` : successPerUsd.toFixed(1), context: "Runs per USD", tone: "neutral" },
      { slot: 7, label: "Cost trend", value: trend == null ? "—" : fmtPct(trend), context: "2nd half vs 1st half of days", tone: trendTone },
      { slot: 8, label: "Top cost agent", value: topAgent.primary, context: topAgent.secondary, tone: topAgent.tone },
      { slot: 9, label: "Top cost model", value: topModel.primary, context: topModel.secondary, tone: topModel.tone },
      { slot: 10, label: "Wasted cost %", value: `${wastedPct.toFixed(1)}%`, context: "Error-like rows’ cost / total", tone: wastedPct > 12 ? "bad" : wastedPct > 5 ? "warn" : "neutral" },
    ];
  }

  if (view === "performance") {
    return [
      { slot: 1, label: "Tasks (LLM-like)", value: String(kb.llmTraces), context: "Heuristic bucket", tone: "neutral" },
      { slot: 2, label: "Run success rate", value: `${successRate.toFixed(1)}%`, context: "Non-error / total", tone: srTone },
      { slot: 3, label: "Avg duration", value: fmtDur(avgMs), context: durHint, tone: avgMs != null && avgMs > 120_000 ? "warn" : "neutral" },
      { slot: 4, label: "Median (P50)", value: fmtDur(p50Ms), context: "Payload latency", tone: "neutral" },
      { slot: 5, label: "P95 duration", value: fmtDur(p95Ms), context: "Tail latency", tone: p95Ms != null && p95Ms > 300_000 ? "bad" : "neutral" },
      { slot: 6, label: "Retries / run", value: retriesPerTask.toFixed(2), context: "Retry signals in events", tone: rtTone },
      { slot: 7, label: "Steps proxy", value: stepsProxy.toFixed(2), context: "Tool / LLM ratio", tone: stepsProxy > 6 ? "warn" : "neutral" },
      { slot: 8, label: "Handoffs proxy", value: handoffProxy.toFixed(2), context: "Gateway / LLM ratio", tone: "neutral" },
      { slot: 9, label: "First-pass proxy", value: `${firstPass.toFixed(0)}%`, context: "1 − retries/success", tone: firstPass < 75 ? "warn" : "neutral" },
      { slot: 10, label: "Throughput", value: throughput.toFixed(1), context: "Successful runs / hour", tone: "neutral" },
    ];
  }

  // reliability
  const retryRate = (kb.retryTraces / total) * 100;
  const rrTone: KpiTone = retryRate > 20 ? "bad" : retryRate > 12 ? "warn" : "neutral";
  const timeoutRate = (kb.timeoutTraces / total) * 100;
  const errRate = (kb.nonTimeoutErrorTraces / total) * 100;

  return [
    { slot: 1, label: "Failure rate", value: `${failRate.toFixed(1)}%`, context: "Error-like / runs", tone: frTone },
    { slot: 2, label: "Incidents (proxy)", value: String(s.errorEvents), context: "Error-shaped runs", tone: s.errorEvents > total * 0.08 ? "bad" : "neutral" },
    { slot: 3, label: "Timeout rate", value: `${timeoutRate.toFixed(1)}%`, context: "`timeout` in event", tone: timeoutRate > 4 ? "warn" : "neutral" },
    { slot: 4, label: "Non-timeout errors", value: `${errRate.toFixed(1)}%`, context: "fail / denied / blocked", tone: errRate > 6 ? "bad" : errRate > 2 ? "warn" : "neutral" },
    { slot: 5, label: "Stuck runs", value: "—", context: "See worker sessions", tone: "neutral" },
    { slot: 6, label: "Retry rate", value: `${retryRate.toFixed(1)}%`, context: "retry in event_type", tone: rrTone },
    { slot: 7, label: "Human intervention", value: "—", context: "Not captured in metrics yet", tone: "neutral" },
    { slot: 8, label: "Tool failure rate", value: `${toolFailRate.toFixed(1)}%`, context: "Tool errors / tool runs", tone: tfrTone },
    { slot: 9, label: "Model failure rate", value: `${modelFailRate.toFixed(1)}%`, context: "LLM errors / LLM runs", tone: mfrTone },
    { slot: 10, label: "MTTR", value: "—", context: "Needs incident timestamps", tone: "neutral" },
  ];
}

export const KPI_VIEW_LABELS: Record<KpiViewId, { title: string; question: string }> = {
  cost: { title: "Cost", question: "Are we spending efficiently?" },
  performance: { title: "Performance", question: "Are agents completing work well?" },
  reliability: { title: "Reliability", question: "Is the system stable and trustworthy?" },
};
