# WP-116 - LiNKbrain Cross-Vertical Trace Dashboard Schema

## Objective

Define LiNKbrain schema and SDK contracts for cross-vertical trace querying and dashboard aggregation. Enable operators to view workflow traces across LinkSites, LEXOS, and LiNKapps verticals without compromising tenant isolation.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-116-linkbrain-cross-vertical-trace-dashboard-schema`
- Base: `origin/development`

## Allowed files

- `packages/linklogic-sdk/src/brain-traces.ts`
- `packages/linklogic-sdk/src/brain-traces.test.ts`
- `.ai-swarm/LINKBRAIN_CROSS_VERTICAL_TRACE_SCHEMA.md`
- `.ai-swarm/AGENT_REPORTS/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`

## Prohibited files

- No database migrations (defer until WP-087 memory objects merge)
- No live trace aggregation workers
- No cross-tenant trace exposure beyond schema definitions
- No dashboard UI implementation

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md`
- `.ai-swarm/LINKBRAIN_BENCHMARKING_SPEC.md`
- `packages/linklogic-sdk/src/brain-memory.ts`
- `packages/linklogic-sdk/src/brain-benchmarks.ts`
- `.ai-swarm/WORK_PACKETS/WP-087-linkbrain-memory-object-schemas.md`
- `.ai-swarm/WORK_PACKETS/WP-089-linkbrain-learning-benchmarks.md`

## Steps

1. Define Zod schemas for trace summary records that can be aggregated per-tenant or across verticals (without tenant-identifying fields for cross-vertical views).
2. Create trace query request/response types for dashboard consumption (time ranges, vertical filters, stage filters).
3. Define privacy-safe trace aggregate shapes that omit PII, CRM IDs, and tenant-identifying fields.
4. Add unit tests for schema validation, query builder logic, and privacy stripping.
5. Document the trace schema, query patterns, and dashboard read expectations.
6. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Trace schemas compile and are exported from SDK without collisions.
- Query request/response types support filtered trace retrieval.
- Privacy-safe aggregates exclude prohibited fields per `LINKBRAIN_BENCHMARKING_SPEC.md` §5.
- Tests cover valid queries, invalid filters, and privacy guardrails.
- No runtime trace aggregation or dashboard UI is implemented (schema/spec only).

## Proof required

- `@linktrend/linklogic-sdk` focused test output.
- `@linktrend/linklogic-sdk` build output.
- Confirmation schema names do not collide with existing SDK exports.
- Confirmation privacy-safe aggregates follow prohibited fields list.
