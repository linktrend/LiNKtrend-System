# WP-087 - LiNKbrain Memory Object Schemas & Persistence

## Objective

Move beyond kernel stubs to actual persistence of derived memory objects (Leads, Research, Episodes).

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-087-linkbrain-memory-object-schemas`
- Base: `development`

## Allowed files

- `services/migrations/*.sql`
- `packages/linklogic-sdk/src/brain-memory.ts`
- `apps/linkaios-web/src/lib/kernel/memory-worker.ts`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/linkbrain-agent.md`

## Mission

1.  **Database Schemas:** Create migrations for `brain_memory_objects` table with columns: `id`, `tenant_id`, `type`, `scope_jsonb`, `provenance_event_ids[]`, `payload_jsonb`, `state`, `confidence`, `created_at`, `updated_at`.
2.  **Memory Types:** Define Zod schemas in SDK for `LeadMemory`, `ResearchBundle`, and `EpisodeSummary`.
3.  **Extraction Worker:** Implement a `MemoryWorker` in the kernel that listens for `run.completed` and `stage.completed` events and promotes them to memory objects.
4.  **Persistence:** Replace the `record_run` stage stub with real memory object persistence.

## Acceptance criteria

- `brain_memory_objects` table exists with RLS enforced by `tenant_id`.
- Successful runs result in at least one `EpisodeSummary` and one `LeadMemory` update.
- Research bundles are persisted with full provenance links to research events.

## Proof required

- Migration applied successfully.
- SQL query showing memory objects created after a mock run.
