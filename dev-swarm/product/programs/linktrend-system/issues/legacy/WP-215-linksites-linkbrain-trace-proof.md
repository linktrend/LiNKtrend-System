# WP-215 — LinkSites LiNKbrain Trace Proof

## Objective
Make LinkSites runs write and expose real LiNKbrain audit/memory/trace proof for every meaningful runtime stage.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-215-linksites-linkbrain-trace-proof`
- Branch: `wp-215-linksites-linkbrain-trace-proof`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `LiNKbrain/`
- `packages/linklogic-sdk/src/brain-*`
- `packages/linklogic-sdk/src/context-*`
- LiNKbrain display helpers under `LiNKaios/linkaios-web/`
- LinkSites event mapping in `modules/linksites/`

## Prohibited Files
- LinkSkills lease ownership
- LiNKautowork workflow ownership
- External repos

## Required Context
- `modules/linksites/workflow.*`
- If `modules/linksites/workflow.md` is not present in the checkout, read/copy it from `.worktrees/WP-211-module-workflow-map-gap-prep/modules/linksites/workflow.md` before defining the event map.
- `.worktrees/WP-210-baseline-fix-and-build-gate/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-210-baseline-fix-and-build-gate.md` if present
- `LiNKbrain/source-map.md`
- `dev-swarm/product/grounding/LINKBRAIN_COMPLETION_PLAN.md`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`

## Steps
1. Check for WP-210 SDK/web type blocker overlap before editing shared LiNKbrain SDK helpers; fix only trace/event blockers that are in this packet's scope.
2. Define LinkSites audit/memory event map if missing, grounded in the canonical LinkSites workflow map.
3. Ensure LinkSites runtime emits canonical audit envelopes for run, stage, lease, workflow, role, preview, CRM/Plane stub, and failure events.
4. Promote or reference memory objects for lead, research, copy package, preview artifact, and run summary.
5. Expose MVO completeness/trace helper for LiNKaios.
6. Add focused tests for event completeness and trace assembly.

## Acceptance Criteria
- A LinkSites run has enough LiNKbrain events to reconstruct the flow.
- Memory/context proof exists for LiNKbot handoff.
- LiNKaios can query a trace summary without raw DB spelunking.

## Proof Required
- `pnpm --filter @linktrend/linklogic-sdk typecheck`
- Relevant LinkBrain/trace tests
- LinkSites run trace fixture/proof summary

## Report File
Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-215-linksites-linkbrain-trace-proof.md`.
