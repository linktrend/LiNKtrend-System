# WP-121 - LEXOS Server Query and Mutation Scaffold

## Objective

Create a safe LiNKaios-side LEXOS server query/mutation scaffold using adapted schema types, with tenant isolation and no live legal side effects.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-121-lexos-server-query-mutation-scaffold`
- Base: `origin/development`

## Allowed files

- `apps/linkaios-web/src/lib/plugins/lexos/**`
- `apps/linkaios-web/src/app/**/lexos/**` only for server action route support if needed
- `dev-swarm/command-center/LEXOS_SERVER_QUERY_MUTATION_SCAFFOLD.md`
- `dev-swarm/reports/legacy-ai-swarm/WP-121-lexos-server-query-mutation-scaffold.md`

## Prohibited files

- No database migrations.
- No source `LiNKtrend-LEXOS` modifications.
- No live legal research, court filing, CRM, or provider writes.
- No broad app navigation changes.

## Required context

- `packages/db/src/types/lexos/database.ts`
- `packages/linklogic-sdk/src/lexos-contracts.ts`
- `packages/db/migrations/lexos/*.sql`
- `dev-swarm/command-center/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`

## Steps

1. Create typed query/mutation helper modules for intake, matters, evidence, assertions, and support matrix using Supabase/client patterns already present in LiNKaios.
2. Enforce tenant_id on every query/mutation helper.
3. Add unit tests with mocked Supabase calls or type-focused tests where runtime DB is unavailable.
4. Document which operations are stub/local-only.
5. Run web typecheck and focused tests.
6. Update the packet-specific report.

## Acceptance criteria

- Helpers compile and are tenant-scoped.
- No live legal/provider side effects.
- Tests or typecheck prove the scaffold imports cleanly.

## Proof required

- Web typecheck output after required workspace builds.
- Focused test output or explicit type-only proof.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
