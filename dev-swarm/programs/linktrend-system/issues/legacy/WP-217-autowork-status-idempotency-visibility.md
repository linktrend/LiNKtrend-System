# WP-217 — LiNKautowork Status And Idempotency Visibility

## Objective
Expose LiNKautowork workflow status, idempotency, retry, and audit refs to the LinkSites proof surface.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-217-autowork-status-idempotency-visibility`
- Branch: `wp-217-autowork-status-idempotency-visibility`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `LiNKautowork/`
- Thin LiNKaios display integration if needed
- Related tests and report

## Prohibited Files
- LinkSkills lease authority
- LiNKbrain memory ownership
- External n8n fork edits

## Required Context
- `LiNKautowork/README.md`
- `LiNKautowork/templates/README.md`
- `dev-swarm/command-center/LINKAUTOWORK_COMPLETION_PLAN.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `.worktrees/WP-210-baseline-fix-and-build-gate/dev-swarm/reports/legacy-ai-swarm/WP-210-baseline-fix-and-build-gate.md` if present
- `.worktrees/WP-212-linksites-runtime-spine/dev-swarm/reports/legacy-ai-swarm/WP-212-linksites-runtime-spine.md` if present
- `dev-swarm/reports/legacy-ai-swarm/WP-213-linksites-linkskills-enforcement.md` if present

## Steps
1. First fix the in-scope WP-210 LiNKautowork blockers if still present, especially `LiNKautowork/gateway/src/lib/idempotency-store.ts`, fetch/request typings, and the `"compensated"` status union mismatch.
2. Ensure LinkSites workflow handlers return status, retry, idempotency, and audit ref data consumable by WP-216.
3. Add a status/read model if needed for LiNKaios display.
4. Verify idempotent rerun behavior with tests.
5. Document external n8n boundary and current dev/shadow/live posture.

## Acceptance Criteria
- LiNKaios can display workflow status and idempotency proof.
- Reruns do not create fake duplicate success.
- Tests prove retry/idempotency behavior in the LinkSites path.

## Proof Required
- `pnpm --filter @linktrend/autowork-gateway typecheck`
- `pnpm --filter @linktrend/autowork-gateway test`
- Focused status/idempotency test evidence

## Report File
Update `dev-swarm/reports/legacy-ai-swarm/WP-217-autowork-status-idempotency-visibility.md`.
