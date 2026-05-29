# WP-206 — LinkSites Proof Readiness

## Objective

Prepare LinkSites / WebsiteFactory for final UI/UX check by verifying preview route readiness, template registry discovery, Payload/Supabase proof checklist, deferred live screenshot items, and exact browser steps for Codex computer and human review.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-206-linksites-proof-readiness`
- Branch: `wp-206-linksites-proof-readiness`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `modules/linksites/`
- WebsiteFactory code under `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/`
- LinkSites workflow code under `LiNKautowork/gateway/src/workflows/`
- Proof/runbook docs under `dev-swarm/command-center/`
- `dev-swarm/reports/legacy-ai-swarm/`

## Prohibited Files

- External `/Users/linktrend/Projects/LiNKsites` edits
- Live publishing or DigitalOcean changes
- Real Payload/Supabase mutation outside approved dev/test flow

## Required Context

- `docs/architecture/system-completion-targets.md`
- `dev-swarm/command-center/LINKSITES_COMPLETION_PLAN.md`
- `dev-swarm/command-center/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `modules/linksites/README.md`

## Steps

1. Verify current WebsiteFactory preview route and template registry discovery.
2. Confirm LinkSites module manifest and workflow expectations are current.
3. Document exact dev server and browser steps for final Codex computer UI/UX pass.
4. Mark live Supabase/Payload screenshot proof as deferred end-of-day proof if still not runnable.
5. Add small proof fixes only if needed.

## Acceptance Criteria

- LinkSites is ready for a UI/UX check rather than more architecture work.
- Proof checklist clearly separates local/static preview, Supabase/Payload, and human review.
- No live publish side effects are introduced.

## Proof Required

- Relevant `@linktrend/linkaios-web` WebsiteFactory tests
- Relevant `@linktrend/autowork-gateway` WebsiteFactory tests
- Updated proof/runbook notes

## Report File

Update `dev-swarm/reports/legacy-ai-swarm/WP-206-linksites-proof-readiness.md`.
