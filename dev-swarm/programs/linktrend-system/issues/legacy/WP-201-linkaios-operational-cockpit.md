# WP-201 — LiNKaios Operational Cockpit

## Objective

Complete LiNKaios as an operational cockpit for the MVO: module activation/status, worker/session visibility, LinkSkills lease status, LiNKautowork run controls, LiNKbrain audit/memory views, and operator trace visibility.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-201-linkaios-operational-cockpit`
- Branch: `wp-201-linkaios-operational-cockpit`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `LiNKaios/`
- `packages/linkaios-kernel/`
- LiNKaios-facing shared contracts in `packages/linklogic-sdk/`
- Related tests in the same packages
- `dev-swarm/reports/legacy-ai-swarm/`

## Prohibited Files

- External repos
- LinkSkills, LiNKautowork, LiNKbot, or LiNKbrain runtime ownership changes outside thin integration contracts
- Real secrets or `.env`

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `dev-swarm/command-center/LINKAIOS_KERNEL_MANIFEST.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`

## Steps

1. Inspect current cockpit routes/components under `LiNKaios/linkaios-web`.
2. Wire or complete operator-visible status for modules, workers, sessions, leases, workflow runs, memory/audit, and traces.
3. Keep cross-plane logic thin: LiNKaios displays and routes; owning planes retain authority.
4. Add focused tests for any new cockpit data helpers or integration mappers.
5. Verify typecheck/build for `@linktrend/linkaios-web`.

## Acceptance Criteria

- Operator can understand MVO status from LiNKaios without reading raw database tables.
- Cockpit links core planes together without absorbing their ownership.
- New or changed UI/data helpers have focused tests where practical.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- `pnpm --filter @linktrend/linkaios-web build`
- Any focused test command added or run
- Summary of routes/panels changed

## Report File

Update `dev-swarm/reports/legacy-ai-swarm/WP-201-linkaios-operational-cockpit.md`.
