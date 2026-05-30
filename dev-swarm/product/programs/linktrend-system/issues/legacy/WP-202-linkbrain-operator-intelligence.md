# WP-202 — LiNKbrain Operator Intelligence

## Objective

Complete LiNKbrain as an operator-facing intelligence layer for the MVO: audit/event/memory/context helpers, status views exposed through LiNKaios, and clear ownership mapping for active compatibility code.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-202-linkbrain-operator-intelligence`
- Branch: `wp-202-linkbrain-operator-intelligence`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `LiNKbrain/`
- `packages/linklogic-sdk/src/brain-*`
- `packages/linklogic-sdk/src/context-*`
- LiNKbrain UI/data helpers in `LiNKaios/linkaios-web/src/components/linkbrain/` and `LiNKaios/linkaios-web/src/lib/linkbrain-data.ts`
- Related tests
- `dev-swarm/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files

- LinkSkills lease ownership
- LiNKbot runtime ownership
- LiNKautowork workflow execution ownership
- External repos or real secrets

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/product/grounding/LINKBRAIN_COMPLETION_PLAN.md`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`
- `LiNKbrain/source-map.md`

## Steps

1. Inventory current LiNKbrain audit/memory/context code.
2. Fill gaps needed for operator-facing memory, audit, context, and trace intelligence.
3. Improve LiNKaios visibility into LiNKbrain status without moving ownership into LiNKaios.
4. Update `LiNKbrain/source-map.md` if active compatibility code changes.
5. Add or run focused SDK/web tests for memory, audit, context, and UI data helpers.

## Acceptance Criteria

- Operators can inspect meaningful LiNKbrain intelligence from LiNKaios.
- LiNKbot context handoff and audit/memory provenance are clear.
- LiNKbrain ownership docs match actual active code locations.

## Proof Required

- `pnpm --filter @linktrend/linklogic-sdk typecheck`
- Relevant `@linktrend/linklogic-sdk` tests
- Relevant `@linktrend/linkaios-web` tests or typecheck if UI touched
- Report of remaining LiNKbrain completion gaps

## Report File

Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-202-linkbrain-operator-intelligence.md`.
