/**
 * Trace types for LinkApps sidebar integration (WP-123).
 * These types align with WP-116 cross-vertical trace dashboard schema.
 * Privacy-safe: no tenant IDs, PII, or customer-identifying fields.
 */

/** Vertical keys for cross-vertical trace aggregation */
export type VerticalKey = "linksites" | "lexos" | "linkapps" | "linkskills" | "linkbrain";

/** Trace outcome states */
export type TraceOutcome = "success" | "failure" | "partial" | "in_progress" | "cancelled";

/** Stage slugs from vertical manifests */
export type StageSlug =
  | "intake"
  | "validation"
  | "processing"
  | "generation"
  | "deployment"
  | "handoff";

/** Time bucket granularity for aggregations */
export type TimeBucket = "hour" | "day" | "week";

/**
 * Privacy-safe trace summary record.
 * Per WP-116: excludes tenant_id, org_id, customer_id, names, emails, IPs, CRM IDs.
 */
export interface TraceSummary {
  /** Internal aggregation job ID (UUID) */
  aggregationJobId: string;
  /** Schema version for forward compatibility */
  schemaVersion: string;
  /** Time bucket start */
  bucketStart: string;
  /** Time bucket end */
  bucketEnd: string;
  /** Vertical source */
  verticalKey: VerticalKey;
  /** Workflow stage */
  stageSlug: StageSlug;
  /** Outcome of traces in this bucket */
  outcome: TraceOutcome;
  /** Count of traces aggregated */
  count: number;
  /** Average duration in milliseconds */
  avgDurationMs: number;
  /** Failure rate (0-1) */
  failureRate: number;
  /** P95 latency in milliseconds */
  p95LatencyMs: number;
}

/** Filter options for trace queries */
export interface TraceFilter {
  /** Vertical filter (empty = all) */
  verticalKeys?: VerticalKey[];
  /** Stage filter (empty = all) */
  stageSlugs?: StageSlug[];
  /** Outcome filter (empty = all) */
  outcomes?: TraceOutcome[];
  /** Time range start (ISO 8601) */
  startTime?: string;
  /** Time range end (ISO 8601) */
  endTime?: string;
  /** Bucket granularity */
  bucket?: TimeBucket;
}

/** Trace query request shape */
export interface TraceQueryRequest {
  /** Query filters */
  filter: TraceFilter;
  /** Maximum results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/** Trace query response shape */
export interface TraceQueryResponse {
  /** Aggregated trace summaries */
  traces: TraceSummary[];
  /** Total count for pagination */
  totalCount: number;
  /** Applied filter (echoed) */
  appliedFilter: TraceFilter;
  /** Schema version of response */
  schemaVersion: string;
}

/** Metric card display data */
export interface TraceMetric {
  /** Metric label */
  label: string;
  /** Current value */
  value: number;
  /** Previous period value for comparison */
  previousValue?: number;
  /** Unit suffix (e.g., "ms", "%") */
  unit?: string;
  /** Trend direction */
  trend: "up" | "down" | "flat";
  /** Whether up is good (for trend coloring) */
  upIsGood: boolean;
}

/** Sidebar list item for trace summary */
export interface TraceListItem {
  /** Unique item ID */
  id: string;
  /** Display title */
  title: string;
  /** Subtitle with metadata */
  subtitle: string;
  /** Outcome for status icon */
  outcome: TraceOutcome;
  /** Timestamp */
  at: string;
  /** Count badge */
  count: number;
}

/** Trace sidebar state */
export interface TraceSidebarState {
  /** Current filter selection */
  filter: TraceFilter;
  /** Selected trace aggregation job ID */
  selectedTraceId: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message (if any) */
  error: string | null;
}
