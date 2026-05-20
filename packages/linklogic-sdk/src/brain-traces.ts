/**
 * Cross-vertical trace dashboard schemas for LiNKbrain (WP-116).
 *
 * This module provides:
 * - Zod schemas for trace summary records aggregated per-tenant or cross-vertical
 * - Query request/response types for dashboard consumption
 * - Privacy-safe trace aggregate shapes that omit PII, CRM IDs, and tenant-identifying fields
 *
 * Privacy requirements per LINKBRAIN_BENCHMARKING_SPEC.md §5:
 * - Cross-vertical aggregates MUST NOT include: tenant_id, org_id, customer_id, emails,
 *   phone numbers, IP addresses, CRM record IDs, raw payloads, prompts, or completions.
 * - Allowed fields: temporal buckets, coarse taxonomy (vertical_key, stage_slug),
 *   statistical aggregates, and provenance meta.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Vertical Key Enum — Supported verticals for cross-vertical tracing         */
/* -------------------------------------------------------------------------- */

export const VerticalKeySchema = z.enum([
  "linksites",
  "lexos",
  "linkapps",
]);
export type VerticalKey = z.infer<typeof VerticalKeySchema>;

/* -------------------------------------------------------------------------- */
/* Trace Outcome — Simplified outcome classification for aggregation          */
/* -------------------------------------------------------------------------- */

export const TraceOutcomeSchema = z.enum([
  "success",
  "partial",
  "failure",
  "cancelled",
  "timeout",
]);
export type TraceOutcome = z.infer<typeof TraceOutcomeSchema>;

/* -------------------------------------------------------------------------- */
/* Stage Slug — Normalized stage identifiers across verticals                   */
/* -------------------------------------------------------------------------- */

export const StageSlugSchema = z.enum([
  // LinkSites stages
  "intake",
  "research",
  "template_selection",
  "content_generation",
  "site_generation",
  "preview_build",
  "crm_update",
  // LEXOS stages
  "lexos_intake",
  "matter_setup",
  "story_develop",
  "evidence_ingest",
  "assertions_extract",
  "support_map",
  "strategy_develop",
  "research_conduct",
  "argument_draft",
  "adversarial_review",
  "output_generate",
  // LiNKapps stages
  "app_intake",
  "squad_form",
  "capability_plan",
  "provider_match",
  "artifact_generate",
  "delivery_handoff",
]);
export type StageSlug = z.infer<typeof StageSlugSchema>;

/* -------------------------------------------------------------------------- */
/* Time Bucket — Temporal aggregation units                                     */
/* -------------------------------------------------------------------------- */

export const TimeBucketUnitSchema = z.enum(["hour", "day", "week"]);
export type TimeBucketUnit = z.infer<typeof TimeBucketUnitSchema>;

/* -------------------------------------------------------------------------- */
/* Trace Summary — Privacy-safe per-trace record for dashboard queries        */
/* -------------------------------------------------------------------------- */

/**
 * Core trace summary schema — tenant-scoped for per-tenant queries.
 * Contains tenant_id for tenant isolation.
 */
export const TraceSummarySchema = z.object({
  trace_id: z.string().uuid(),
  tenant_id: z.string().min(1),
  vertical_key: VerticalKeySchema,
  stage_slug: StageSlugSchema,
  outcome: TraceOutcomeSchema,

  // Temporal
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  duration_ms: z.number().int().min(0).optional(),

  // Cross-reference (internal UUIDs only, not CRM/external IDs)
  run_id: z.string().uuid().optional(),
  episode_id: z.string().uuid().optional(),
  workflow_run_id: z.string().uuid().optional(),

  // Plane identifiers (these are internal to our system)
  plane: z.enum(["linkaios", "linkbot", "linkskills", "linkautowork", "linkbrain"]),

  // Capability lease references (lease_id is internal)
  lease_count: z.number().int().min(0).default(0),

  // Audit trail reference
  audit_event_id: z.string().uuid().optional(),

  // Schema version for forward compatibility
  schema_version: z.number().int().positive().max(32767).default(1),
});
export type TraceSummary = z.infer<typeof TraceSummarySchema>;

/* -------------------------------------------------------------------------- */
/* Cross-Vertical Trace Aggregate — Privacy-safe for cross-vertical views       */
/* -------------------------------------------------------------------------- */

/**
 * Cross-vertical trace aggregate — NO tenant-identifying fields.
 * Suitable for operator dashboards showing patterns across all verticals.
 *
 * Per LINKBRAIN_BENCHMARKING_SPEC.md §5, prohibited fields include:
 * - tenant_id, org_id, customer_id, user_id, email, phone, IP address
 * - CRM record IDs, Plane project keys with client names
 * - Raw payloads, prompts, completions
 */
export const CrossVerticalTraceAggregateSchema = z.object({
  // Temporal bucket
  bucket_start: z.string().datetime(),
  bucket_end: z.string().datetime(),
  bucket_unit: TimeBucketUnitSchema,

  // Coarse taxonomy (no tenant-identifying data)
  vertical_key: VerticalKeySchema,
  stage_slug: StageSlugSchema.optional(),
  outcome: TraceOutcomeSchema.optional(),

  // Statistical aggregates
  trace_count: z.number().int().nonnegative(),
  avg_duration_ms: z.number().nonnegative().nullable(),
  p50_duration_ms: z.number().nonnegative().nullable(),
  p95_duration_ms: z.number().nonnegative().nullable(),
  p99_duration_ms: z.number().nonnegative().nullable(),
  failure_rate: z.number().min(0).max(1).nullable(),
  timeout_rate: z.number().min(0).max(1).nullable(),
  cancellation_rate: z.number().min(0).max(1).nullable(),

  // Cost indicator (normalized band, not actual currency)
  avg_cost_band: z.number().int().min(0).max(10).nullable(),

  // Lease activity summary (no lease IDs, just counts)
  avg_leases_per_trace: z.number().nonnegative().nullable(),
  traces_with_leases: z.number().int().nonnegative(),

  // Provenance meta
  schema_version: z.number().int().positive().max(32767).default(1),
  aggregation_job_id: z.string().uuid(),
});
export type CrossVerticalTraceAggregate = z.infer<typeof CrossVerticalTraceAggregateSchema>;

/* -------------------------------------------------------------------------- */
/* Trace Query Request — Dashboard query parameters                             */
/* -------------------------------------------------------------------------- */

export const TraceQueryFilterSchema = z.object({
  // Time range (required)
  time_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),

  // Optional filters
  vertical_keys: z.array(VerticalKeySchema).optional(),
  stage_slugs: z.array(StageSlugSchema).optional(),
  outcomes: z.array(TraceOutcomeSchema).optional(),
  planes: z.array(z.enum(["linkaios", "linkbot", "linkskills", "linkautowork", "linkbrain"])).optional(),

  // Tenant scoping (for per-tenant queries only)
  tenant_id: z.string().optional(),

  // Pagination
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),

  // Sorting
  sort_by: z.enum(["started_at", "completed_at", "duration_ms"]).default("started_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});
export type TraceQueryFilter = z.infer<typeof TraceQueryFilterSchema>;

/* -------------------------------------------------------------------------- */
/* Trace Query Response — Dashboard query results                               */
/* -------------------------------------------------------------------------- */

export const TraceQueryResultSchema = z.object({
  // Results
  traces: z.array(TraceSummarySchema),

  // Pagination meta
  total_count: z.number().int().min(0),
  has_more: z.boolean(),

  // Aggregation summary (computed from results)
  summary: z.object({
    count_by_vertical: z.record(VerticalKeySchema, z.number().int().min(0)),
    count_by_outcome: z.record(TraceOutcomeSchema, z.number().int().min(0)),
    avg_duration_ms: z.number().nullable(),
    failure_rate: z.number().min(0).max(1).nullable(),
  }),

  // Query metadata
  query_time_ms: z.number().int().min(0),
  schema_version: z.number().int().positive().default(1),
});
export type TraceQueryResult = z.infer<typeof TraceQueryResultSchema>;

/* -------------------------------------------------------------------------- */
/* Cross-Vertical Aggregate Query — For dashboard aggregation views             */
/* -------------------------------------------------------------------------- */

export const CrossVerticalAggregateQuerySchema = z.object({
  // Time range (required)
  time_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),

  // Bucket size for aggregation
  bucket_unit: TimeBucketUnitSchema.default("day"),

  // Optional grouping dimensions
  group_by_vertical: z.boolean().default(true),
  group_by_stage: z.boolean().default(false),
  group_by_outcome: z.boolean().default(false),

  // Optional filters (these filter what goes into aggregates, not query scope)
  vertical_keys: z.array(VerticalKeySchema).optional(),
  stage_slugs: z.array(StageSlugSchema).optional(),
});
export type CrossVerticalAggregateQuery = z.infer<typeof CrossVerticalAggregateQuerySchema>;

export const CrossVerticalAggregateResultSchema = z.object({
  // Aggregated buckets
  buckets: z.array(CrossVerticalTraceAggregateSchema),

  // Overall statistics (across all buckets)
  overall: z.object({
    total_traces: z.number().int().min(0),
    total_duration_ms: z.number().min(0),
    overall_failure_rate: z.number().min(0).max(1).nullable(),
    vertical_distribution: z.record(VerticalKeySchema, z.number().int().min(0)),
  }),

  // Query metadata
  query_time_ms: z.number().int().min(0),
  schema_version: z.number().int().positive().default(1),
});
export type CrossVerticalAggregateResult = z.infer<typeof CrossVerticalAggregateResultSchema>;

/* -------------------------------------------------------------------------- */
/* Privacy Stripping — Remove tenant-identifying fields                         */
/* -------------------------------------------------------------------------- */

/**
 * Forbidden key patterns for cross-vertical aggregates.
 * Aligned with LINKBRAIN_BENCHMARKING_SPEC.md §5.
 */
const FORBIDDEN_TRACE_KEY_PATTERNS = new Set([
  "tenant_id",
  "org_id",
  "organization_id",
  "workspace_id",
  "account_id",
  "customer_id",
  "team_id",
  "user_id",
  "email",
  "user_email",
  "phone",
  "phone_number",
  "mobile_number",
  "ip_address",
  "domain",
  "lead_id",
  "crm_record_id",
  "customer_crm_id",
  "project_key", // May contain client names in Plane
  "channel_name", // May contain sensitive info
  "prompt",
  "completion",
  "payload_jsonb",
]);

function isForbiddenTraceKey(key: string): boolean {
  const compact = key.toLowerCase();
  if (FORBIDDEN_TRACE_KEY_PATTERNS.has(compact)) return true;
  if (compact.startsWith("tenant")) return true;
  if (compact.startsWith("crm") && compact.endsWith("id")) return true;
  if (compact.includes("secret")) return true;
  if (compact.includes("password")) return true;
  if (compact.includes("token")) return true;
  return false;
}

/**
 * Recursively strip tenant-identifying fields from trace data.
 * Use before creating cross-vertical aggregates or returning to dashboard.
 */
export function stripTenantFieldsFromTrace(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((entry) => stripTenantFieldsFromTrace(entry));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [rawKey, v] of Object.entries(value as Record<string, unknown>)) {
      if (isForbiddenTraceKey(rawKey)) continue;
      out[rawKey] = stripTenantFieldsFromTrace(v);
    }
    return out;
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Validation Helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Validate a trace summary record.
 */
export function parseTraceSummary(raw: unknown): TraceSummary {
  return TraceSummarySchema.parse(raw);
}

/**
 * Validate a cross-vertical trace aggregate.
 */
export function parseCrossVerticalTraceAggregate(raw: unknown): CrossVerticalTraceAggregate {
  return CrossVerticalTraceAggregateSchema.parse(raw);
}

/**
 * Validate trace query filter.
 */
export function parseTraceQueryFilter(raw: unknown): TraceQueryFilter {
  return TraceQueryFilterSchema.parse(raw);
}

/**
 * Validate trace query result.
 */
export function parseTraceQueryResult(raw: unknown): TraceQueryResult {
  return TraceQueryResultSchema.parse(raw);
}

/**
 * Validate cross-vertical aggregate query.
 */
export function parseCrossVerticalAggregateQuery(raw: unknown): CrossVerticalAggregateQuery {
  return CrossVerticalAggregateQuerySchema.parse(raw);
}

/**
 * Validate cross-vertical aggregate result.
 */
export function parseCrossVerticalAggregateResult(raw: unknown): CrossVerticalAggregateResult {
  return CrossVerticalAggregateResultSchema.parse(raw);
}

/* -------------------------------------------------------------------------- */
/* Dashboard Query Builders (Client-side helpers)                                 */
/* -------------------------------------------------------------------------- */

/**
 * Build a trace query for the last N hours.
 */
export function buildRecentTracesQuery(
  hours: number,
  options?: {
    vertical_keys?: VerticalKey[];
    tenant_id?: string;
  },
): TraceQueryFilter {
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return {
    time_range: {
      start: start.toISOString(),
      end: now.toISOString(),
    },
    vertical_keys: options?.vertical_keys,
    tenant_id: options?.tenant_id,
    limit: 100,
    offset: 0,
    sort_by: "started_at",
    sort_order: "desc",
  };
}

/**
 * Build a cross-vertical aggregate query for daily buckets.
 */
export function buildDailyAggregateQuery(
  days: number,
  options?: {
    vertical_keys?: VerticalKey[];
    group_by_stage?: boolean;
  },
): CrossVerticalAggregateQuery {
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    time_range: {
      start: start.toISOString(),
      end: now.toISOString(),
    },
    bucket_unit: "day",
    group_by_vertical: true,
    group_by_stage: options?.group_by_stage ?? false,
    group_by_outcome: false,
    vertical_keys: options?.vertical_keys,
  };
}
