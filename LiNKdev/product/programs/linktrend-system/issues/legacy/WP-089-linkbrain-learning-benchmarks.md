# WP-089 - LiNKbrain Learning Loop & Benchmarking

## Objective

Implement the learning loop and cross-tenant benchmarking to turn operational history into platform intelligence.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-089-linkbrain-learning-benchmarks`
- Base: `development`

## Allowed files

- `services/migrations/*.sql`
- `packages/linklogic-sdk/src/brain-benchmarks.ts`
- `apps/linkaios-web/src/lib/kernel/benchmark-worker.ts`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/linkbrain-agent.md`

## Mission

1.  **Benchmark Schema:** Create `brain_benchmarks` table for anonymized metrics (e.g. `plugin_id`, `stage_id`, `avg_duration`, `failure_rate`, `avg_cost`, `sample_size`).
2.  **Anonymization Worker:** Implement a worker that aggregates event data into the benchmark table, stripping all tenant-identifying info.
3.  **Feedback Loop:** Implement a `feedback.record` capability that allows operators or LinkBots to mark a memory object as `approved` or `invalidated`.
4.  **Dashboard Integration:** Expose a read-only view of platform benchmarks to the LiNKaios dashboard.

## Acceptance criteria

- `brain_benchmarks` table contains aggregated data from mock runs.
- No PII or tenant-specific data exists in the benchmark table.
- Feedback capability successfully updates memory object state.

## Proof required

- SQL query showing aggregated benchmark data.
- Test proving feedback updates object lifecycle state correctly.
