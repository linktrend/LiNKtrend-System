# WP-210 — Baseline Fix And Build Gate

## Objective
Fix the WP-200 blocking typecheck/build failures and establish a clean, buildable integration baseline before runtime feature work continues.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-210-baseline-fix-and-build-gate`
- Branch: `wp-210-baseline-fix-and-build-gate`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- Build/typecheck fixes in `LiNKaios/`, `LiNKskills/`, `LiNKautowork/`, `LiNKbot/`, `LiNKbrain/`, `packages/`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- Report file under `dev-swarm/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files
- External repos under `/Users/linktrend/Projects/*`
- Real secrets, `.env`, service role keys
- New product features unrelated to failing proof gates

## Required Context
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-200-codex-integration-proof.md`
- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`

## Steps
1. Reproduce WP-200 failing commands and capture exact root causes.
2. Fix `@linktrend/linkskills-logic-engine` typecheck.
3. Fix `@linktrend/autowork-gateway` typecheck.
4. Fix `@linktrend/linkaios-web` typecheck and production build, including `node:` imports leaking into client bundles.
5. Verify no active code uses removed top-level `apps/`, `plugins/`, `infra/`, `LinkBrain`, or `LinkBots`.

## Acceptance Criteria
- All required proof commands pass in the packet worktree.
- Failures are fixed, not merely documented.
- Build uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; no service-role key is exposed.

## Proof Required
- `pnpm install`
- `pnpm --filter @linktrend/linkskills-logic-engine typecheck`
- `pnpm --filter @linktrend/linkskills-logic-engine test`
- `pnpm --filter @linktrend/autowork-gateway typecheck`
- `pnpm --filter @linktrend/autowork-gateway test`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `NEXT_PUBLIC_SUPABASE_URL=<public-url> NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key> pnpm --filter @linktrend/linkaios-web build`

## Report File
Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-210-baseline-fix-and-build-gate.md`.
