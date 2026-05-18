# WP-218 — LinkSites Proof Runbook And Local Preview

## Objective
Prepare the LinkSites proof checklist and local preview path so Codex computer and human UI/UX testing can verify the MVO without guessing steps.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-218-linksites-proof-runbook-and-local-preview`
- Branch: `wp-218-linksites-proof-runbook-and-local-preview`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `modules/linksites/`
- LinkSites preview route/helpers in `LiNKaios/linkaios-web/`
- `.ai-swarm/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `.ai-swarm/*LINKSITES*`
- `.ai-swarm/AGENT_REPORTS/`

## Prohibited Files
- External `/Users/linktrend/Projects/LiNKsites` edits
- Live publishing
- Secrets or provider credentials

## Required Context
- `modules/linksites/workflow.*`
- `.ai-swarm/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `.ai-swarm/LINKSITES_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.worktrees/WP-212-linksites-runtime-spine/.ai-swarm/AGENT_REPORTS/WP-212-linksites-runtime-spine.md` if present
- `.ai-swarm/AGENT_REPORTS/WP-213-linksites-linkskills-enforcement.md` if present
- `.ai-swarm/AGENT_REPORTS/WP-214-linksites-linkbot-role-execution.md` if present
- `.ai-swarm/AGENT_REPORTS/WP-215-linksites-linkbrain-trace-proof.md` if present

## Steps
1. Reflect Wave 2 reality in the proof runbook: WP-213 and WP-214 are committed/passing, WP-215 may need integration from its worktree, and WP-212 reported workspace topology proof blockers.
2. Ensure local preview route/checklist reflects the runtime spine and clearly marks any topology/build blocker that prevents local preview.
3. Separate local/static proof from Supabase/Payload proof and human UI/UX review.
4. Add exact commands, URLs, expected visible outputs, and screenshot checklist.
5. Verify WebsiteFactory tests still pass where the current workspace topology allows; if blocked, document the exact proof command and file-level blocker.

## Acceptance Criteria
- A tester can run the LinkSites proof without reading source code.
- Deferred live proof items are explicit and bounded.
- Local preview path is reachable from the run trace.

## Proof Required
- LinkSites focused tests
- Runbook/checklist path and summary
- Any preview route verification available without live services

## Report File
Update `.ai-swarm/AGENT_REPORTS/WP-218-linksites-proof-runbook-and-local-preview.md`.
