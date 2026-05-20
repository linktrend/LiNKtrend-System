# WP-097 Agent Prompt - LEXOS TypeScript Types

Recommended model/tool: Cursor Kimi K2.5 or Gemini 3.1 Pro. Do not use Codex unless the user explicitly spends the preserved Codex budget. Do not use Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-097-lexos-types-generation.md`, using the integrated WP-094 output on `origin/development`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-097 -b dev/cursor/WP-097-lexos-types-generation origin/development
cd ../LiNKtrend-System-WP-097
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-097-lexos-types-generation.md`
- `packages/db/migrations/lexos/*.sql`
- `packages/db/schema/lexos/*.sql`
- `packages/linklogic-sdk/src/index.ts`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/database.ts` if present
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/domain.ts` if present
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/intake.ts` if present

## Mission

Generate/adapt TypeScript types for the adapted LEXOS schema and expose safe contract types through `@linktrend/linklogic-sdk`.

## Current-State Reconciliation

WP-094 landed adapted SQL under `packages/db/migrations/lexos/` and `packages/db/schema/lexos/` rather than the stale `packages/linkaios-db` path from the original packet. Use the integrated repo paths; do not create a new `packages/linkaios-db` package.

## Scope

Allowed:

- Create `packages/db/types/lexos/*.ts`.
- Create `packages/linklogic-sdk/src/lexos-*.ts` or another existing SDK pattern if more appropriate.
- Update `packages/linklogic-sdk/src/index.ts`.
- Add focused type/contract tests in `packages/linklogic-sdk/src/` if useful.
- Update `.ai-swarm/AGENT_REPORTS/integration-agent.md`.

Hard boundaries:

- No application logic.
- No UI components.
- No server/runtime implementation.
- Do not modify `/Users/linktrend/Projects/LiNKtrend-LEXOS`.
- Do not run live Supabase type generation against production or remote DB credentials.

## Required Behavior

- Types cover all adapted LEXOS tables from WP-094.
- Work request/response types follow `CONTRACTS_MVO.md` patterns.
- SDK exports do not collide with existing names.
- Type generation/adaptation is deterministic and reviewable.

## Proof Required

- File listing of generated/adapted type files.
- `pnpm --filter @linktrend/linklogic-sdk build`
- `pnpm --filter @linktrend/linklogic-sdk test -- lexos` if tests are added; otherwise report why no runtime tests were added.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `feat: add LEXOS schema types`
Push branch to GitHub.
