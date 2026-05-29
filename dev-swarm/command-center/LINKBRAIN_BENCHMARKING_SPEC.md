# LiNKbrain benchmarking & learning loop — specification (WP-089)

**Status:** Design and SDK contract — database aggregation ships only after WP-087 `brain_memory_objects` (and optionally WP-088 context/vector surfaces) merge.  
**Source prompt:** `dev-swarm/programs/linktrend-system/prompts/legacy/WP-089-linkbrain-learning-benchmarks.prompt.md`  
**Companion types:** `packages/linklogic-sdk/src/brain-benchmarks.ts`

## 1. Goals

1. **Cross-tenant intelligence** — Platform-level metrics (latency, failure rates, cost bands) keyed by coarse plugin/workflow dimensions, not by customer identity.
2. **Human + LiNKbot feedback** — Authoritative labeling of derived memory (`approved` / `invalidated`) under LinkSkills leases, auditing through the existing envelope.
3. **Privacy by construction** — Benchmark rows must be safe if exported or displayed on a shared dashboard without per-tenant RLS quirks leaking identity.

Non-goals for this wave: live analytics SaaS, real-time aggregation, storing raw transcripts or CRM payloads in benchmark tables.

## 2. Architectural boundaries

| Plane | Responsibility |
|-------|----------------|
| LiNKbrain | Canonical event ledger, memory objects, **proposed** `brain_benchmarks` anonymized rollup table, benchmark read API shape. |
| LinkSkills | `feedback.record` capability lease (who may transition memory object lifecycle). |
| LiNKaios | Runs stages, dispatches governed work; exposes read-only dashboard view fed by aggregated rows only. |
| LiNKbot / operators | Submit feedback payloads referencing `memory_object_id` after WP-087 persistence exists. |

## 3. Planned table: `brain_benchmarks` (post–WP-087 merge)

Rolling buckets (recommended: hourly or daily UTC) aggregate **privacy-safe dimensions** only. RLS on this table should default to **deny**, with a narrow platform-admin/service-role read policy. Tenants MUST NOT query other tenants via this table—the rows deliberately omit tenant keys.

Suggested columns (exact migration is a follow-up once WP-087 lands):

| Column | Type | Notes |
|--------|------|--------|
| `id` | `uuid` | Primary key |
| `bucket_start` | `timestamptz` | Inclusive aggregation window |
| `bucket_end` | `timestamptz` | Exclusive |
| `plugin_vertical_key` | `text` | Coarse plugin family (e.g. `linksites_v2`), not tenant-scoped IDs |
| `dimension_key` | `text` | Opaque rollup key (`stage_slug`, deterministic hash of `(workflow_template_id, stage_slug)` etc.) |
| `sample_size` | `bigint` | Count of qualifying events/samples in bucket |
| `avg_duration_ms` | `double precision` | Nullable when insufficient data |
| `failure_rate` | `double precision` | `0..1`, nullable |
| `avg_cost_normalized` | `double precision` | **Dimensionless band** or normalized token index — not raw billing currency tied to accounts |
| `schema_version` | `smallint` | Row schema version for forward-compatible workers |
| `created_at` | `timestamptz` | Insert time |

## 4. Allowed fields on benchmark aggregates

Only the following categories may appear on **published** benchmark rows / API DTOs:

- **Temporal bucket** — `bucket_start`, `bucket_end`.
- **Coarse taxonomy** — `plugin_vertical_key`, `dimension_key` (must not encode tenant/org/user/email).
- **Statistical aggregates** — `sample_size`, `avg_duration_ms`, `failure_rate`, `avg_cost_normalized` (normalized or bucketed — see §7).
- **Provenance meta** — `schema_version`; optional **`aggregation_job_id`** (internal UUID unrelated to CRM or customer records).

Embeddings or text blobs for benchmarks are **out of scope** until reviewed for memorization risk.

## 5. Prohibited fields on benchmark aggregates

The following MUST NOT appear in benchmark rows, nested JSON, or outbound dashboard DTOs:

| Category | Examples |
|----------|-----------|
| Identity & tenancy | `tenant_id`, `org_id`, `workspace_id`, `account_id`, `customer_id`, `team_id`, `domain`, subdomain slugs pointing to one customer |
| People | Names, emails, phone numbers, auth subject IDs usable outside platform audit paths |
| Endpoints | IP addresses, full URLs containing customer-owned hosts if not uniformly hashed with salt rotation |
| CRM / ticketing | CRM record IDs, Plane project keys that reveal client names, Slack/Zulip channel names |
| Runs as traceHandles (raw) | `run_id`, `correlation_id`, `trace_id` **unless** contractually proven non-reversible to tenant (default: prohibit) |
| Content | Prompts, completions, documents, Payload/Supabase record bodies, LiNKbrain `payload_jsonb` excerpts |

Workers MUST pass raw event payloads through **`stripTenantIdentifyingFields`** (SDK) **before** any numeric rollup. Any new upstream field joins require an explicit privacy review checkbox in DECISIONS / ADR.

## 6. Aggregation pipeline

1. **Batch job** reads from the canonical audit/event store with service role inside LiNKbrain boundary.
2. **Strip** prohibited keys (recursive) from any intermediate struct used for rollup.
3. **Bucket & dimension** derive `plugin_vertical_key` and `dimension_key` from plugin manifest enums / stage slugs only.
4. **Compute** aggregates; discard per-event rows after flush.
5. **Write** only validated `brainBenchmarkAggregateRow` Zod payloads to Postgres.

No external analytics exporters; no third-party cookies or pixels tied to benchmarking.

## 7. Normalized cost

`avg_cost_normalized` MUST NOT be literal invoice amounts keyed to an org. Preferred encodings:

- Fixed band index `0..N` from deterministic bucketing applied to internal cost counters, **or**
- Relative ratio vs cohort median stored as a coarse rounded float.

Actual dollar reconciliation stays in billing systems, outside this table.

## 8. `feedback.record` capability (memory lifecycle)

**Intent:** Operators or governed LiNKbot mark a memory object's validity.

| Aspect | Rule |
|--------|------|
| Payload | Validated `brainFeedbackRecordPayload` — `memory_object_id` (UUID), `verdict` ∈ `approved` \| `invalidated`, `actor_subject_type`, stable `idempotency_key`. |
| Authorization | Requires LinkSkills lease; writes go to **`brain_memory_objects.state`** once WP-087 exists (`candidate → approved`, or `candidate → invalidated`, etc.). |
| Audit | Each successful toggle emits standard audit envelope referencing memory object ID and verdict (tenant-scoped audit — different privacy model from benchmarks). |
| Free-text rationale | If added later, keep **tenant-scoped** audit only; never copy rationale into cross-tenant `brain_benchmarks`. |

## 9. Dashboard

LiNKaios may expose a read-only benchmarks panel sourced **only** from `brain_benchmarks` (validated DTO). Rate-limit and platform-role-gate identical to other admin telemetry.

## 10. Acceptance tests (implemented in SDK)

| Test | Requirement |
|------|---------------|
| `stripTenantIdentifyingFields` | Removes known prohibited keys recursively |
| Row schema parse | Accepted aggregates lack forbidden keys |
| Feedback payload | Validates required UUID + enums + idempotency key length |

Heavy integration tests (SQL proof of rolled-up rows + feedback persistence) attach to migrations after WP-087 merges.

## 11. Decisions queued for DECISIONS.md (if not already captured)

- **D-LB-BENCH-01** — Aggregation cadence default: daily UTC buckets for cold path.
- **D-LB-BENCH-02** — `dimension_key` construction: deterministic hash of manifest-approved dimension tuple, never raw CRM IDs.

---

*End of benchmarking spec.*
