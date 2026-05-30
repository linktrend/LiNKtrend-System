# WP-212 — LinkSites Runtime Spine

## Objective
Make the LinkSites / WebsiteFactory lead-to-preview-site flow runnable from LiNKaios through all core planes.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-212-linksites-runtime-spine`
- Branch: `wp-212-linksites-runtime-spine`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `modules/linksites/`
- `LiNKaios/linkaios-web/src/**` for LinkSites run start/status integration
- Thin contract calls to `LiNKautowork/`, `LiNKskills/`, `LiNKbot/`, `LiNKbrain/`
- Related tests and report

## Prohibited Files
- External `/Users/linktrend/Projects/LiNKsites` edits
- Live outreach, live publishing, or real side effects without explicit lease/stub
- Broad unrelated cockpit or module work

## Required Context
- `modules/linksites/workflow.*`
- If `modules/linksites/workflow.md` is not present in the checkout, read/copy it from `.worktrees/WP-211-module-workflow-map-gap-prep/modules/linksites/workflow.md` before implementing runtime behavior.
- `.worktrees/WP-210-baseline-fix-and-build-gate/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-210-baseline-fix-and-build-gate.md` if present
- `.worktrees/WP-211-module-workflow-map-gap-prep/dev-swarm/product/reports/archive/legacy-ai-swarm/WP-211-module-workflow-map-gap-prep.md` if present
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`
- `dev-swarm/product/grounding/LINKSITES_COMPLETION_PLAN.md`
- `dev-swarm/product/grounding/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `docs/architecture/system-completion-targets.md`

## Steps
1. Start by applying the in-scope WP-210 web fixes required for `@linktrend/linkaios-web` typecheck/build if still present in this checkout, especially kernel typing and `node:` import leakage through client-bundled paths.
2. Ensure `modules/linksites/workflow.md` exists and is the canonical source for the runtime spine.
3. Implement a LiNKaios entrypoint to start a LinkSites run from the canonical module workflow.
4. Route stage execution through the existing kernel/orchestrator patterns.
5. Ensure the run records stage refs for LiNKbot, LinkSkills, LiNKautowork, LiNKbrain, CRM/Plane stubs, and preview URL.
6. Keep all live side effects disabled unless lease/stub rules allow them.
7. Add focused tests for run creation, stage dispatch, and preview output.

## Acceptance Criteria
- A local command or API call can start the LinkSites flow.
- The flow returns a run id and preview/status payload.
- Stage outputs include traceable refs for all core planes.

## Proof Required
- `pnpm --filter @linktrend/linkaios-web typecheck`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk_test_public pnpm --filter @linktrend/linkaios-web build`
- Focused LinkSites/kernel tests
- A command/API proof showing run creation and resulting status/preview fields

## Report File
Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-212-linksites-runtime-spine.md`.
