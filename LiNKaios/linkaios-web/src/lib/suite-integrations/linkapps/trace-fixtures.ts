/**
 * Mock trace data fixtures for LinkApps sidebar (WP-123).
 * Privacy-safe: no tenant_id, org_id, customer_id, names, emails, IPs, CRM IDs.
 * Per WP-116 privacy requirements.
 */

import type {
  TraceSummary,
  TraceQueryResponse,
  TraceMetric,
  TraceListItem,
  VerticalKey,
  StageSlug,
  TraceOutcome,
} from "./types/trace";

/** Schema version for fixtures */
const SCHEMA_VERSION = "2025-05-17-v1";

/** Helper to create ISO timestamp */
function ts(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

/** Mock trace summaries across verticals */
export const MOCK_TRACE_SUMMARIES: TraceSummary[] = [
  // LinkSites traces
  {
    aggregationJobId: "agg-001-a1b2c3d4",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(2),
    bucketEnd: ts(1),
    verticalKey: "linksites",
    stageSlug: "generation",
    outcome: "success",
    count: 12,
    avgDurationMs: 45000,
    failureRate: 0.08,
    p95LatencyMs: 89000,
  },
  {
    aggregationJobId: "agg-002-b2c3d4e5",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(4),
    bucketEnd: ts(3),
    verticalKey: "linksites",
    stageSlug: "deployment",
    outcome: "partial",
    count: 8,
    avgDurationMs: 32000,
    failureRate: 0.25,
    p95LatencyMs: 67000,
  },
  // LEXOS traces
  {
    aggregationJobId: "agg-003-c3d4e5f6",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(1),
    bucketEnd: ts(0),
    verticalKey: "lexos",
    stageSlug: "intake",
    outcome: "success",
    count: 3,
    avgDurationMs: 12000,
    failureRate: 0,
    p95LatencyMs: 18000,
  },
  {
    aggregationJobId: "agg-004-d4e5f6g7",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(6),
    bucketEnd: ts(5),
    verticalKey: "lexos",
    stageSlug: "processing",
    outcome: "failure",
    count: 2,
    avgDurationMs: 180000,
    failureRate: 1.0,
    p95LatencyMs: 250000,
  },
  // LinkApps traces
  {
    aggregationJobId: "agg-005-e5f6g7h8",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(3),
    bucketEnd: ts(2),
    verticalKey: "linkapps",
    stageSlug: "generation",
    outcome: "in_progress",
    count: 5,
    avgDurationMs: 125000,
    failureRate: 0,
    p95LatencyMs: 150000,
  },
  {
    aggregationJobId: "agg-006-f6g7h8i9",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(8),
    bucketEnd: ts(7),
    verticalKey: "linkapps",
    stageSlug: "handoff",
    outcome: "success",
    count: 1,
    avgDurationMs: 5000,
    failureRate: 0,
    p95LatencyMs: 8000,
  },
  // LinkSkills traces
  {
    aggregationJobId: "agg-007-g7h8i9j0",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(5),
    bucketEnd: ts(4),
    verticalKey: "linkskills",
    stageSlug: "validation",
    outcome: "success",
    count: 24,
    avgDurationMs: 850,
    failureRate: 0.04,
    p95LatencyMs: 1500,
  },
  // LinkBrain traces
  {
    aggregationJobId: "agg-008-h8i9j0k1",
    schemaVersion: SCHEMA_VERSION,
    bucketStart: ts(12),
    bucketEnd: ts(11),
    verticalKey: "linkbrain",
    stageSlug: "intake",
    outcome: "success",
    count: 156,
    avgDurationMs: 45,
    failureRate: 0.01,
    p95LatencyMs: 120,
  },
];

/** Mock query response */
export const MOCK_TRACE_QUERY_RESPONSE: TraceQueryResponse = {
  traces: MOCK_TRACE_SUMMARIES,
  totalCount: MOCK_TRACE_SUMMARIES.length,
  appliedFilter: {
    verticalKeys: ["linksites", "lexos", "linkapps", "linkskills", "linkbrain"],
    startTime: ts(24),
    endTime: ts(0),
    bucket: "hour",
  },
  schemaVersion: SCHEMA_VERSION,
};

/** Mock trace metrics for dashboard cards */
export const MOCK_TRACE_METRICS: TraceMetric[] = [
  {
    label: "Total Traces",
    value: 211,
    previousValue: 189,
    unit: "",
    trend: "up",
    upIsGood: true,
  },
  {
    label: "Success Rate",
    value: 87.5,
    previousValue: 92.0,
    unit: "%",
    trend: "down",
    upIsGood: true,
  },
  {
    label: "Avg Duration",
    value: 23450,
    previousValue: 28900,
    unit: "ms",
    trend: "down",
    upIsGood: false,
  },
  {
    label: "P95 Latency",
    value: 67800,
    previousValue: 72000,
    unit: "ms",
    trend: "down",
    upIsGood: false,
  },
];

/** Mock trace list items for sidebar */
export const MOCK_TRACE_LIST_ITEMS: TraceListItem[] = MOCK_TRACE_SUMMARIES.map((t) => ({
  id: t.aggregationJobId,
  title: `${capitalize(t.verticalKey)} — ${capitalize(t.stageSlug)}`,
  subtitle: `${formatTime(t.bucketStart)} · ${t.count} traces · ${t.outcome}`,
  outcome: t.outcome,
  at: t.bucketStart,
  count: t.count,
}));

/** Helper: capitalize string */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Helper: format time for display */
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Vertical options for filter dropdown */
export const VERTICAL_OPTIONS: { value: VerticalKey; label: string }[] = [
  { value: "linksites", label: "LinkSites" },
  { value: "lexos", label: "LEXOS" },
  { value: "linkapps", label: "LiNKapps" },
  { value: "linkskills", label: "LiNKskills" },
  { value: "linkbrain", label: "LiNKbrain" },
];

/** Stage options for filter dropdown */
export const STAGE_OPTIONS: { value: StageSlug; label: string }[] = [
  { value: "intake", label: "Intake" },
  { value: "validation", label: "Validation" },
  { value: "processing", label: "Processing" },
  { value: "generation", label: "Generation" },
  { value: "deployment", label: "Deployment" },
  { value: "handoff", label: "Handoff" },
];

/** Outcome options for filter dropdown */
export const OUTCOME_OPTIONS: { value: TraceOutcome; label: string; color: string }[] = [
  { value: "success", label: "Success", color: "emerald" },
  { value: "failure", label: "Failure", color: "red" },
  { value: "partial", label: "Partial", color: "amber" },
  { value: "in_progress", label: "In Progress", color: "sky" },
  { value: "cancelled", label: "Cancelled", color: "zinc" },
];

/** Empty state for trace sidebar */
export const EMPTY_TRACE_RESPONSE: TraceQueryResponse = {
  traces: [],
  totalCount: 0,
  appliedFilter: {
    verticalKeys: [],
    stageSlugs: [],
    outcomes: [],
  },
  schemaVersion: SCHEMA_VERSION,
};
