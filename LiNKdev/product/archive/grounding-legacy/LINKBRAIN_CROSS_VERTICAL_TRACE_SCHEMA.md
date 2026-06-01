# LiNKbrain Cross-Vertical Trace Dashboard Schema (WP-116)

## Overview

This document defines the schema and SDK contracts for cross-vertical trace querying and dashboard aggregation in LiNKbrain. It enables operators to view workflow traces across LinkSites, LEXOS, and LiNKapps verticals while maintaining strict tenant isolation and privacy.

## Design Principles

1. **Privacy by Construction**: Cross-vertical aggregates MUST NOT contain tenant-identifying fields per `LINKBRAIN_BENCHMARKING_SPEC.md` §5.
2. **Tenant Isolation**: Per-tenant trace queries include `tenant_id`; cross-vertical aggregates exclude it.
3. **Coarse Taxonomy**: Cross-vertical views use vertical keys and stage slugs, not specific tenant/project identifiers.
4. **Statistical Focus**: Aggregates focus on statistical measures (counts, rates, percentiles) rather than individual records.

## Schema Components

### 1. Vertical Keys

Supported verticals for cross-vertical tracing:

| Key | Description |
|-----|-------------|
| `linksites` | WebsiteFactory / LinkSites vertical plugin |
| `lexos` | LEXOS litigation vertical plugin |
| `linkapps` | LiNKapps app-factory vertical plugin |

### 2. Stage Slugs

Normalized stage identifiers across all verticals:

**LinkSites stages:**
- `intake`, `research`, `template_selection`, `content_generation`, `site_generation`, `preview_build`, `crm_update`

**LEXOS stages:**
- `lexos_intake`, `matter_setup`, `story_develop`, `evidence_ingest`, `assertions_extract`, `support_map`, `strategy_develop`, `research_conduct`, `argument_draft`, `adversarial_review`, `output_generate`

**LiNKapps stages:**
- `app_intake`, `squad_form`, `capability_plan`, `provider_match`, `artifact_generate`, `delivery_handoff`

### 3. Trace Outcomes

Standardized outcome classification:

| Outcome | Description |
|---------|-------------|
| `success` | Trace completed successfully |
| `partial` | Trace completed with partial success |
| `failure` | Trace failed |
| `cancelled` | Trace was cancelled by operator or system |
| `timeout` | Trace timed out |

## Data Schemas

### TraceSummary (Tenant-Scoped)

Used for per-tenant trace queries. Contains `tenant_id` for proper isolation.

```typescript
{
  trace_id: UUID;
  tenant_id: string;           // Tenant-scoped
  vertical_key: VerticalKey;
  stage_slug: StageSlug;
  outcome: TraceOutcome;
  started_at: ISO8601;
  completed_at?: ISO8601;
  duration_ms?: number;
  run_id?: UUID;
  episode_id?: UUID;
  workflow_run_id?: UUID;
  plane: Plane;
  lease_count: number;
  audit_event_id?: UUID;
  schema_version: number;
}
```

### CrossVerticalTraceAggregate (Privacy-Safe)

Used for cross-vertical dashboard views. **NO tenant-identifying fields.**

```typescript
{
  bucket_start: ISO8601;
  bucket_end: ISO8601;
  bucket_unit: "hour" | "day" | "week";
  vertical_key: VerticalKey;
  stage_slug?: StageSlug;
  outcome?: TraceOutcome;
  trace_count: number;
  avg_duration_ms: number | null;
  p50_duration_ms: number | null;
  p95_duration_ms: number | null;
  p99_duration_ms: number | null;
  failure_rate: number | null;
  timeout_rate: number | null;
  cancellation_rate: number | null;
  avg_cost_band: number | null;        // Normalized 0-10, not currency
  avg_leases_per_trace: number | null;
  traces_with_leases: number;
  schema_version: number;
  aggregation_job_id: UUID;
}
```

### Query Types

**TraceQueryFilter** — For per-tenant trace queries:
```typescript
{
  time_range: { start: ISO8601; end: ISO8601 };
  vertical_keys?: VerticalKey[];
  stage_slugs?: StageSlug[];
  outcomes?: TraceOutcome[];
  planes?: Plane[];
  tenant_id?: string;           // Required for per-tenant, absent for cross-tenant aggregates
  limit: number (1-1000, default 100);
  offset: number (default 0);
  sort_by: "started_at" | "completed_at" | "duration_ms";
  sort_order: "asc" | "desc";
}
```

**CrossVerticalAggregateQuery** — For dashboard aggregation:
```typescript
{
  time_range: { start: ISO8601; end: ISO8601 };
  bucket_unit: "hour" | "day" | "week" (default "day");
  group_by_vertical: boolean (default true);
  group_by_stage: boolean (default false);
  group_by_outcome: boolean (default false);
  vertical_keys?: VerticalKey[];
  stage_slugs?: StageSlug[];
}
```

## Privacy Compliance

### Prohibited Fields (Cross-Vertical Aggregates)

Per `LINKBRAIN_BENCHMARKING_SPEC.md` §5, the following MUST NOT appear in cross-vertical trace aggregates:

| Category | Examples |
|----------|----------|
| Identity & tenancy | `tenant_id`, `org_id`, `workspace_id`, `account_id`, `customer_id` |
| People | Names, emails, phone numbers, auth subject IDs |
| Endpoints | IP addresses, full URLs with customer hosts |
| CRM / ticketing | CRM record IDs, Plane project keys with client names |
| Runs/Trace | `run_id`, `trace_id`, `correlation_id` (unless proven non-reversible) |
| Content | Prompts, completions, documents, raw payloads |

### Allowed Fields (Cross-Vertical Aggregates)

| Category | Examples |
|----------|----------|
| Temporal | `bucket_start`, `bucket_end`, `hour`, `day` |
| Coarse taxonomy | `vertical_key`, `stage_slug`, `outcome` |
| Statistical | `trace_count`, `avg_duration_ms`, `failure_rate`, `p95_latency_ms` |
| Provenance | `schema_version`, `aggregation_job_id` (internal UUID) |

### Privacy Stripping

The `stripTenantFieldsFromTrace()` function recursively removes tenant-identifying fields from trace data before aggregation:

```typescript
// Example usage
const tenantScopedTrace = { trace_id, tenant_id, vertical_key, ... };
const privacySafeTrace = stripTenantFieldsFromTrace(tenantScopedTrace);
// Result: { trace_id, vertical_key, ... } — tenant_id removed
```

## SDK Usage Examples

### Building a Recent Traces Query

```typescript
import { buildRecentTracesQuery } from "@linktrend/linklogic-sdk";

const query = buildRecentTracesQuery(24, {
  vertical_keys: ["linksites", "lexos"],
  tenant_id: "tenant_123",
});
// Returns TraceQueryFilter for last 24 hours
```

### Building a Daily Aggregate Query

```typescript
import { buildDailyAggregateQuery } from "@linktrend/linklogic-sdk";

const query = buildDailyAggregateQuery(7, {
  group_by_stage: true,
  vertical_keys: ["linksites"],
});
// Returns CrossVerticalAggregateQuery for last 7 days
```

### Validating Trace Data

```typescript
import { parseTraceSummary, parseCrossVerticalTraceAggregate } from "@linktrend/linklogic-sdk";

// Validate tenant-scoped trace
const trace = parseTraceSummary(rawTraceData);

// Validate privacy-safe aggregate
const aggregate = parseCrossVerticalTraceAggregate(rawAggregateData);
```

## Implementation Notes

1. **Database Tables**: Cross-vertical trace aggregation requires tables that are not yet merged (WP-087). This schema defines the contract only.

2. **Aggregation Workers**: Deferred until WP-087 memory objects merge. Schema is forward-compatible.

3. **Dashboard Integration**: LiNKaios will expose read-only trace views sourced from validated aggregates.

4. **SDK Location**: `packages/linklogic-sdk/src/brain-traces.ts`

## Acceptance Criteria

- [x] Trace schemas compile and export from SDK
- [x] Schema names do not collide with existing exports
- [x] Query request/response types support filtered retrieval
- [x] Privacy-safe aggregates exclude prohibited fields
- [x] Tests cover valid queries, invalid filters, and privacy guardrails
- [x] No runtime trace aggregation implemented (schema/spec only)

## Related Work Packets

- WP-087: Memory Object Schemas
- WP-089: Learning & Benchmarks
- WP-111: LiNKapps LiNKbrain Event Schema
- WP-114: LinkSkills Cross-Vertical Capability Catalog Seeds

## Decisions

| ID | Decision | Status |
|----|----------|--------|
| D-LB-TRACE-01 | Cross-vertical aggregates use coarse taxonomy only (vertical_key, stage_slug) | Accepted |
| D-LB-TRACE-02 | Per-tenant traces include tenant_id; cross-vertical aggregates exclude it | Accepted |
| D-LB-TRACE-03 | Cost bands normalized 0-10, not actual currency | Accepted |
| D-LB-TRACE-04 | Aggregation deferred until WP-087 merges | Accepted |
