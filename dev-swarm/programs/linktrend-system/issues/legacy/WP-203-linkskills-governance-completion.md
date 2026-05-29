# WP-203 — LinkSkills Governance Completion

## Objective

Complete LinkSkills capability governance for the MVO: connector catalog coverage, lease lifecycle visibility, approval/denial/kill-switch behavior, connector validation, and runtime execution proof.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-203-linkskills-governance-completion`
- Branch: `wp-203-linkskills-governance-completion`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `LiNKskills/`
- `packages/linklogic-sdk/src/*skill*`
- `packages/linklogic-sdk/src/*capability*`
- Related LinkSkills migrations under `services/migrations/`
- LiNKaios display-only surfaces if needed for lease status
- `dev-swarm/reports/legacy-ai-swarm/`

## Prohibited Files

- External fork code
- Live side-effect calls without explicit stubs/leases
- LiNKautowork deterministic workflow ownership
- Real secrets or `.env`

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/command-center/LINKSKILLS_COMPLETION_PLAN.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`

## Steps

1. Inventory current capability connectors and lease runtime.
2. Add or complete missing connector metadata for MVO/immediate modules.
3. Harden lease lifecycle: request, approval, denial, execution, kill switch, audit ref.
4. Ensure LinkSkills exposes clear status to LiNKaios and LiNKbot without owning workflows or memory.
5. Verify logic-engine and SDK tests.

## Acceptance Criteria

- LinkSkills can govern connector use across MVO modules.
- Side-effect permissions are represented as leases and auditable.
- Kill-switch/deny paths fail closed and are visible.

## Proof Required

- `pnpm --filter @linktrend/linkskills-logic-engine typecheck`
- `pnpm --filter @linktrend/linkskills-logic-engine test`
- Relevant `@linktrend/linklogic-sdk` tests
- Connector catalog summary

## Report File

Update `dev-swarm/reports/legacy-ai-swarm/WP-203-linkskills-governance-completion.md`.
