# WP-213 — LinkSites LinkSkills Runtime Enforcement

## Objective
Make LinkSkills enforce LinkSites runtime side-effect permissions in the actual LinkSites path, not only in standalone tests or docs.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-213-linksites-linkskills-enforcement`
- Branch: `wp-213-linksites-linkskills-enforcement`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `LiNKskills/`
- LinkSites connector metadata under `LiNKskills/capability-connectors/`
- LinkSkills SDK/contracts in `packages/linklogic-sdk/`
- Thin LinkSites integration test hooks if needed

## Prohibited Files
- LiNKautowork workflow ownership
- LiNKbot role execution ownership
- External repos or real side effects

## Required Context
- `modules/linksites/workflow.*`
- If `modules/linksites/workflow.md` is not present in the checkout, read/copy it from `.worktrees/WP-211-module-workflow-map-gap-prep/modules/linksites/workflow.md` before mapping capability leases.
- `.worktrees/WP-210-baseline-fix-and-build-gate/dev-swarm/reports/legacy-ai-swarm/WP-210-baseline-fix-and-build-gate.md` if present
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `docs/architecture/repo-architecture-target.md`

## Steps
1. Start by fixing the in-scope LinkSkills WP-210 blockers if still present, especially `LiNKskills/services/logic-engine/src/disclosure.ts`, `disclosure.test.ts`, strict optional typing, env typing, and lease object shape mismatches.
2. Map each side-effecting LinkSites stage to a LinkSkills capability connector and lease policy from the canonical LinkSites workflow map.
3. Implement readiness/mode validation for the LinkSites runtime path.
4. Ensure deny/kill-switch/idempotency behavior fails closed.
5. Expose enough lease status for LiNKaios to display.
6. Add tests proving LinkSites stages cannot execute side effects without valid leases.

## Acceptance Criteria
- LinkSites runtime path creates/uses lease records for governed stages.
- Kill-switch and denial paths are tested.
- No live outreach/publish occurs in MVO.

## Proof Required
- `pnpm --filter @linktrend/linkskills-logic-engine typecheck`
- `pnpm --filter @linktrend/linkskills-logic-engine test`
- Focused LinkSites lease enforcement tests

## Report File
Update `dev-swarm/reports/legacy-ai-swarm/WP-213-linksites-linkskills-enforcement.md`.
