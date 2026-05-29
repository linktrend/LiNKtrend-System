# WP-222 — Final Integration Proof And Percentage Audit

## Objective
Integrate the four closure waves, run cross-system proof, document remaining UI/UX-only gaps, and prepare the completion percentage update.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-222-final-integration-proof-and-percentage-audit`
- Branch: `wp-222-final-integration-proof-and-percentage-audit`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- Integration fixes across current repo only
- `.ai-swarm/AGENT_REPORTS/`
- `.ai-swarm/*COMPLETION*`, `.ai-swarm/*PROOF*`, `.ai-swarm/*RUNBOOK*`
- Focused docs needed to record remaining blockers

## Prohibited Files
- External repos
- Real secrets
- Unapproved live side effects
- Broad rewrites after proof gates pass

## Required Context
- Reports for WP-210 through WP-221
- `docs/architecture/system-completion-targets.md`
- `docs/architecture/repo-architecture-target.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/MASTER_PLAN.md`
- Worktree reports that may not exist in the main checkout:
  - `.worktrees/WP-216-linkaios-cockpit-proof-surface/.ai-swarm/AGENT_REPORTS/WP-216-linkaios-cockpit-proof-surface.md`
  - `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/.ai-swarm/AGENT_REPORTS/WP-218-linksites-proof-runbook-and-local-preview.md`
  - `.worktrees/WP-215-linksites-linkbrain-trace-proof/.ai-swarm/AGENT_REPORTS/WP-215-linksites-linkbrain-trace-proof.md`

## Steps
1. Merge/reconcile the prior closure-wave branches and uncommitted worktree outputs in a clean integration branch, including WP-213, WP-214, WP-217 committed branches and WP-215/WP-218 worktree-only artifacts if not already committed.
2. Fix the recurring repo topology blocker first: the integration branch must use the current canonical layout where `@linktrend/linkaios-web` resolves to `LiNKaios/linkaios-web`, not legacy `apps/linkaios-web`.
3. Run cross-system proof commands.
4. Fix integration-only issues that block proof, especially LiNKaios kernel/typecheck/build blockers carried by WP-212/WP-216/WP-218.
5. Document exact remaining gaps for Codex computer UI/UX check and human UI/UX check.
6. Produce a plain-English percentage audit for LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LiNKbot, LinkSites, LEXOS, LiNKapps, and LiNKguard.

## Acceptance Criteria
- Build/typecheck/test proof is current.
- Remaining gaps are either UI/UX/live-environment proof items or clearly called out as true blockers.
- Percentage audit is evidence-based and references proof artifacts.

## Proof Required
- `pnpm install`
- `pnpm --filter @linktrend/linkskills-logic-engine typecheck`
- `pnpm --filter @linktrend/linkskills-logic-engine test`
- `pnpm --filter @linktrend/autowork-gateway typecheck`
- `pnpm --filter @linktrend/autowork-gateway test`
- `pnpm --filter @linktrend/bot-runtime typecheck`
- `pnpm --filter @linktrend/bot-runtime test`
- `pnpm --filter @linktrend/linklogic-sdk typecheck`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk_test_public pnpm --filter @linktrend/linkaios-web build`

## Report File
Update `.ai-swarm/AGENT_REPORTS/WP-222-final-integration-proof-and-percentage-audit.md`.
