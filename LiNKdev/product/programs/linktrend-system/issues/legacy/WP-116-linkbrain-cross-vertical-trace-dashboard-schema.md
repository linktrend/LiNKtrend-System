# WP-116 - LiNKbrain Cross-Vertical Trace Dashboard Schema

## Objective

Define and test SDK schemas for a cross-vertical LiNKbrain trace/status view spanning LinkSites, LEXOS, and LiNKapps runs.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-116-linkbrain-cross-vertical-trace-dashboard-schema`
- Base: `origin/development`

## Allowed files

- `packages/linklogic-sdk/src/*trace*.ts`
- `packages/linklogic-sdk/src/*trace*.test.ts`
- `packages/linklogic-sdk/src/index.ts`
- `LiNKdev/product/grounding/LINKBRAIN_CROSS_VERTICAL_TRACE_SCHEMA.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`

## Prohibited files

- No database migrations.
- No UI implementation.
- No provider/client calls.
- No changes to existing event writer behavior unless required by compile errors.

## Required context

- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/linkapps-brain-events.ts`
- `packages/linklogic-sdk/src/brain-memory.ts`
- `LiNKdev/product/grounding/LINKAPPS_LINKBRAIN_EVENT_SCHEMA.md`
- `LiNKdev/product/grounding/LINKBRAIN_BENCHMARKING_SPEC.md`

## Steps

1. Define Zod schemas/types for trace dashboard rows, run summaries, plane status badges, and blocker summaries.
2. Include LinkSites, LEXOS, and LiNKapps vertical identifiers.
3. Add tests for valid rows, invalid PII/secret fields, and canonical failure mapping.
4. Export schemas/types from SDK without naming collisions.
5. Document the trace schema and expected consumers.
6. Update the packet-specific report.

## Acceptance criteria

- SDK build passes.
- Focused SDK tests pass.
- Schema avoids storing secrets, raw contact data, or provider credentials.

## Proof required

- `pnpm --filter @linktrend/linklogic-sdk build` output.
- Focused `pnpm --filter @linktrend/linklogic-sdk test -- trace` output.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
