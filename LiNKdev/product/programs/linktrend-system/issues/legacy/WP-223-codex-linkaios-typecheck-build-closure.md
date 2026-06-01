# WP-223 — Codex LiNKaios Typecheck Build Closure

## Objective
Finish the incomplete Waves 1-4 integration by fixing the remaining `@linktrend/linkaios-web` TypeScript/build blockers in the WP-222 integrated state.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Source worktree to continue from: `.worktrees/WP-222-final-integration-proof-and-percentage-audit`
- Branch: `wp-223-codex-linkaios-typecheck-build-closure`

Use the WP-222 integration branch/worktree as the base because it already merged/reconciled WP-213, WP-214, WP-217, WP-215 worktree artifacts, and WP-218 worktree artifacts. Do not start from the stale `4f3f7ba` HEAD that lacks the current topology.

## Allowed Files
- `LiNKaios/linkaios-web/src/**`
- `apps/linkaios-web/src/**` only if it exists as an integration compatibility path/symlink from WP-222
- `packages/linklogic-sdk/src/**` only for type compatibility required by LiNKaios
- `packages/shared-*`, `packages/db`, `packages/ui` only for type compatibility required by LiNKaios
- `LiNKdev/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files
- External repos under `/Users/linktrend/Projects/*`
- Real secrets or `.env`
- New feature scope beyond clearing LiNKaios typecheck/build blockers
- Live publishing, outreach, billing, provider provisioning, or production side effects

## Required Context
- `.worktrees/WP-222-final-integration-proof-and-percentage-audit/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-222-final-integration-proof-and-percentage-audit.md`
- `.worktrees/WP-212-linksites-runtime-spine/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-212-linksites-runtime-spine.md`
- `.worktrees/WP-216-linkaios-cockpit-proof-surface/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md`
- `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md`
- `docs/architecture/repo-architecture-target.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`

## Known Blockers To Fix
From WP-222:
- `apps/linkaios-web/src/lib/kernel/api-auth.test.ts`
- `apps/linkaios-web/src/lib/kernel/context-assembler.test.ts`
- `apps/linkaios-web/src/lib/kernel/dispatch.ts`
- `apps/linkaios-web/src/lib/kernel/plane-adapter.ts`
- `apps/linkaios-web/src/lib/kernel/plane-adapter.test.ts`
- `apps/linkaios-web/src/lib/plugins/websitefactory/stage-handlers.ts`
- `apps/linkaios-web/src/lib/plugins/websitefactory/template-registry-discovery.test.ts`

If the integrated topology exposes these files under `LiNKaios/linkaios-web`, fix them there.

## Steps
1. Create a new branch from the WP-222 integration worktree state or continue in a copied worktree from that state.
2. Reproduce `pnpm --filter @linktrend/linkaios-web typecheck`.
3. Fix the listed TypeScript blockers with narrow, type-safe changes.
4. Run focused kernel/WebsiteFactory tests.
5. Run production build with public placeholder Supabase env vars.
6. Update the report with exact proof output.

## Acceptance Criteria
- `@linktrend/linkaios-web` typecheck passes.
- Production build passes with placeholder public Supabase env vars.
- Focused kernel/WebsiteFactory tests pass or any remaining failure is clearly unrelated and file-level documented.

## Proof Required
- `pnpm install`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/kernel.test.ts src/lib/kernel/dispatch.test.ts src/lib/plugins/websitefactory/plugin.test.ts`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk_test_public pnpm --filter @linktrend/linkaios-web build`

## Report File
Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-223-codex-linkaios-typecheck-build-closure.md`.
