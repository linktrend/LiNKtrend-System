# WP-088 - LiNKbrain Context Assembler & Retrieval

## Objective

Implement the context assembly service to provide LinkBots with scoped, relevant historical context.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-088-linkbrain-context-assembler`
- Base: `development`

## Allowed files

- `packages/linklogic-sdk/src/brain-retrieval.ts`
- `apps/linkaios-web/src/lib/kernel/context-assembler.ts`
- `services/migrations/*.sql` (for pgvector)
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`

## Mission

1.  **pgvector Setup:** Add migration to enable `vector` extension and add `embedding` column to `brain_memory_objects`.
2.  **Retrieval Logic:** Implement `RetrievalService` in the kernel supporting:
    *   Metadata filtering (tenant, plugin, scope).
    *   Keyword search (Postgres FTS).
    *   Vector search (pgvector).
3.  **Context Assembler:** Implement `ContextAssembler` that takes a `ContextRequest` (tenant, role, task) and returns a `ContextBundle` (facts + procedures + recent episodes).
4.  **Scope Lattice:** Enforce strict boundary checks: a bot can only retrieve memory within its authorized scope.

## Acceptance criteria

- `ContextAssembler` returns a valid bundle for a WebsiteFactory bot request.
- Vector search returns semantically similar research bundles.
- Attempting to retrieve memory from another tenant fails with an authorization error.

## Proof required

- Test suite for `RetrievalService` showing scoped results.
- Benchmark of retrieval latency for a 1000-object mock store.
