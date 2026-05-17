/**
 * Trace integration helpers for LinkApps sidebar (WP-123).
 * Provides type-safe utilities for working with cross-vertical trace data.
 */

import type {
  TraceSummary,
  TraceFilter,
  TraceQueryRequest,
  TraceQueryResponse,
  TraceMetric,
  TraceListItem,
  VerticalKey,
  StageSlug,
  TraceOutcome,
} from "./types/trace";

/** Default filter for trace queries */
export const DEFAULT_TRACE_FILTER: TraceFilter = {
  bucket: "hour",
};

/** Create a trace query request with defaults */
export function createTraceQueryRequest(filter?: Partial<TraceFilter>): TraceQueryRequest {
  return {
    filter: { ...DEFAULT_TRACE_FILTER, ...filter },
    limit: 100,
    offset: 0,
  };
}

/** Check if a trace matches the given filter */
export function traceMatchesFilter(trace: TraceSummary, filter: TraceFilter): boolean {
  if (filter.verticalKeys?.length && !filter.verticalKeys.includes(trace.verticalKey)) {
    return false;
  }
  if (filter.stageSlugs?.length && !filter.stageSlugs.includes(trace.stageSlug)) {
    return false;
  }
  if (filter.outcomes?.length && !filter.outcomes.includes(trace.outcome)) {
    return false;
  }
  if (filter.startTime && new Date(trace.bucketStart) < new Date(filter.startTime)) {
    return false;
  }
  if (filter.endTime && new Date(trace.bucketEnd) > new Date(filter.endTime)) {
    return false;
  }
  return true;
}

/** Filter a list of traces */
export function filterTraces(traces: TraceSummary[], filter: TraceFilter): TraceSummary[] {
  return traces.filter((t) => traceMatchesFilter(t, filter));
}

/** Convert trace summaries to list items for sidebar display */
export function tracesToListItems(traces: TraceSummary[]): TraceListItem[] {
  return traces.map((t) => ({
    id: t.aggregationJobId,
    title: `${capitalize(t.verticalKey)} — ${capitalize(t.stageSlug)}`,
    subtitle: `${formatTime(t.bucketStart)} · ${t.count} traces · ${t.outcome}`,
    outcome: t.outcome,
    at: t.bucketStart,
    count: t.count,
  }));
}

/** Calculate aggregate metrics from trace summaries */
export function calculateTraceMetrics(traces: TraceSummary[]): TraceMetric[] {
  if (traces.length === 0) {
    return [
      { label: "Total Traces", value: 0, trend: "flat", upIsGood: true },
      { label: "Success Rate", value: 0, unit: "%", trend: "flat", upIsGood: true },
      { label: "Avg Duration", value: 0, unit: "ms", trend: "flat", upIsGood: false },
      { label: "P95 Latency", value: 0, unit: "ms", trend: "flat", upIsGood: false },
    ];
  }

  const totalCount = traces.reduce((sum, t) => sum + t.count, 0);
  const successCount = traces
    .filter((t) => t.outcome === "success")
    .reduce((sum, t) => sum + t.count, 0);
  const avgDuration = traces.reduce((sum, t) => sum + t.avgDurationMs * t.count, 0) / totalCount;

  // Calculate P95 across all traces (simplified)
  const allLatencies = traces.flatMap((t) => Array(t.count).fill(t.p95LatencyMs));
  allLatencies.sort((a, b) => a - b);
  const p95Index = Math.floor(allLatencies.length * 0.95);
  const p95Latency = allLatencies[p95Index] ?? 0;

  return [
    {
      label: "Total Traces",
      value: totalCount,
      trend: "flat",
      upIsGood: true,
    },
    {
      label: "Success Rate",
      value: (successCount / totalCount) * 100,
      unit: "%",
      trend: "flat",
      upIsGood: true,
    },
    {
      label: "Avg Duration",
      value: Math.round(avgDuration),
      unit: "ms",
      trend: "flat",
      upIsGood: false,
    },
    {
      label: "P95 Latency",
      value: Math.round(p95Latency),
      unit: "ms",
      trend: "flat",
      upIsGood: false,
    },
  ];
}

/** Group traces by vertical */
export function groupTracesByVertical(traces: TraceSummary[]): Map<VerticalKey, TraceSummary[]> {
  const grouped = new Map<VerticalKey, TraceSummary[]>();
  for (const trace of traces) {
    const list = grouped.get(trace.verticalKey) ?? [];
    list.push(trace);
    grouped.set(trace.verticalKey, list);
  }
  return grouped;
}

/** Group traces by stage */
export function groupTracesByStage(traces: TraceSummary[]): Map<StageSlug, TraceSummary[]> {
  const grouped = new Map<StageSlug, TraceSummary[]>();
  for (const trace of traces) {
    const list = grouped.get(trace.stageSlug) ?? [];
    list.push(trace);
    grouped.set(trace.stageSlug, list);
  }
  return grouped;
}

/** Group traces by outcome */
export function groupTracesByOutcome(traces: TraceSummary[]): Map<TraceOutcome, TraceSummary[]> {
  const grouped = new Map<TraceOutcome, TraceSummary[]>();
  for (const trace of traces) {
    const list = grouped.get(trace.outcome) ?? [];
    list.push(trace);
    grouped.set(trace.outcome, list);
  }
  return grouped;
}

/** Validate that trace data complies with privacy requirements (WP-116) */
export function validatePrivacyCompliance(trace: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const t = trace as Record<string, unknown>;

  // Check for prohibited fields
  const prohibitedFields = [
    "tenant_id",
    "org_id",
    "workspace_id",
    "account_id",
    "customer_id",
    "email",
    "name",
    "phone",
    "ip_address",
    "crm_id",
    "prompt",
    "completion",
  ];

  for (const field of prohibitedFields) {
    if (field in t) {
      errors.push(`Prohibited field detected: ${field}`);
    }
  }

  // Check for PII patterns in string values
  const emailPattern = /@.+\./;
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

  for (const [key, value] of Object.entries(t)) {
    if (typeof value === "string") {
      if (emailPattern.test(value)) {
        errors.push(`Potential email PII detected in field: ${key}`);
      }
      if (ipPattern.test(value)) {
        errors.push(`Potential IP address detected in field: ${key}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Helper: capitalize string */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Helper: format time for display */
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Create empty query response */
export function createEmptyTraceResponse(): TraceQueryResponse {
  return {
    traces: [],
    totalCount: 0,
    appliedFilter: DEFAULT_TRACE_FILTER,
    schemaVersion: "2025-05-17-v1",
  };
}
