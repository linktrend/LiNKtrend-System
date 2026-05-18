# WP-214 — LinkSites LiNKbot Role Execution

## Objective
Make LinkSites use LiNKbot roles in the actual runtime path: research enrichment and website builder roles must request context, produce outputs, and emit audit/session refs.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-214-linksites-linkbot-role-execution`
- Branch: `wp-214-linksites-linkbot-role-execution`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `LiNKbot/`
- LinkSites role references in `modules/linksites/`
- Thin LiNKaios integration hooks for role invocation
- Related tests

## Prohibited Files
- External OpenClaw repo edits
- Direct capability side effects outside LinkSkills
- Direct deterministic workflow execution outside LiNKautowork

## Required Context
- `modules/linksites/workflow.*`
- If `modules/linksites/workflow.md` is not present in the checkout, read/copy it from `.worktrees/WP-211-module-workflow-map-gap-prep/modules/linksites/workflow.md` before wiring roles.
- `.worktrees/WP-210-baseline-fix-and-build-gate/.ai-swarm/AGENT_REPORTS/WP-210-baseline-fix-and-build-gate.md` if present
- `LiNKbot/README.md`
- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`

## Steps
1. Check for WP-210 web/kernel blocker overlap before editing LiNKaios integration hooks; fix only role-execution blockers that are in this packet's scope.
2. Ensure LinkSites role definitions include enabled MVO roles and disabled lead/outreach roles from the canonical workflow map.
3. Wire research and website-builder role execution into the LinkSites runtime path.
4. Request LiNKbrain context and LinkSkills leases through adapters.
5. Emit role/session/provenance refs for LiNKaios trace.
6. Add focused role execution tests.

## Acceptance Criteria
- LinkSites run includes LiNKbot role/session refs.
- Role outputs feed downstream research/copy/template stages.
- Disabled roles cannot execute in MVO.

## Proof Required
- `pnpm --filter @linktrend/bot-runtime typecheck`
- `pnpm --filter @linktrend/bot-runtime test`
- Focused LinkSites role execution proof

## Report File
Update `.ai-swarm/AGENT_REPORTS/WP-214-linksites-linkbot-role-execution.md`.
