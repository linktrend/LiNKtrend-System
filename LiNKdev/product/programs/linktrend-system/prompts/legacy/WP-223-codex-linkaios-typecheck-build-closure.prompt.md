# WP-223 Codex Prompt — LiNKaios Typecheck Build Closure

Model: Codex

Execute `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-223-codex-linkaios-typecheck-build-closure.md` exactly.

Important: do not start from the stale repo HEAD that still has legacy `apps/linkaios-web` topology only. Start from the WP-222 integration worktree/branch state:

- Worktree: `.worktrees/WP-222-final-integration-proof-and-percentage-audit`
- Branch: `wp-222-final-integration-proof-and-percentage-audit`

Create a new branch/worktree from that integrated state named `wp-223-codex-linkaios-typecheck-build-closure`.

Before editing, read:

- `.worktrees/WP-222-final-integration-proof-and-percentage-audit/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-222-final-integration-proof-and-percentage-audit.md`
- `.worktrees/WP-212-linksites-runtime-spine/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-212-linksites-runtime-spine.md`
- `.worktrees/WP-216-linkaios-cockpit-proof-surface/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-216-linkaios-cockpit-proof-surface.md`
- `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/LiNKdev/product/reports/archive/legacy-ai-swarm/WP-218-linksites-proof-runbook-and-local-preview.md`
- `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-223-codex-linkaios-typecheck-build-closure.md`
- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `docs/architecture/repo-architecture-target.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`

Fix, do not merely document, the remaining `@linktrend/linkaios-web` TypeScript/build blockers if they are in scope. Keep changes narrow and type-safe. Do not edit `.env`, do not use real secrets, and do not perform live side effects.

Required proof:

- `pnpm install`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/kernel.test.ts src/lib/kernel/dispatch.test.ts src/lib/plugins/websitefactory/plugin.test.ts`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk_test_public pnpm --filter @linktrend/linkaios-web build`

Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-223-codex-linkaios-typecheck-build-closure.md` before stopping with files changed, commands run, proof produced, blockers, and next step.
