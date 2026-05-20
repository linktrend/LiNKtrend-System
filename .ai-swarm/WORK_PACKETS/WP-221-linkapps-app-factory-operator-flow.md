# WP-221 — LiNKapps App Factory Operator Flow

## Objective
Bring LiNKapps close to operational MVO by implementing the operator-facing app-factory workflow surface with squad, provider stub, task, and trace proof.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-221-linkapps-app-factory-operator-flow`
- Branch: `wp-221-linkapps-app-factory-operator-flow`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `modules/linkapps/`
- `LiNKaios/linkaios-web/src/**` for LiNKapps routes/UI/server helpers
- LiNKapps role/capability/event contracts in owning planes as thin adapters
- Tests and report

## Prohibited Files
- External `/Users/linktrend/Projects/LiNKapps` edits
- Real Stripe/GitHub/Supabase/Vercel provisioning
- Paid or live provider calls

## Required Context
- `modules/linkapps/workflow.*`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `docs/architecture/repo-architecture-target.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.worktrees/WP-216-linkaios-cockpit-proof-surface/.ai-swarm/AGENT_REPORTS/WP-216-linkaios-cockpit-proof-surface.md` if present
- `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/.ai-swarm/AGENT_REPORTS/WP-218-linksites-proof-runbook-and-local-preview.md` if present

## Steps
1. Verify the packet worktree has the current `LiNKaios/linkaios-web` topology before editing; if it still has legacy `apps/linkaios-web` only, stop and report that WP-219/WP-222 integration baseline must run first.
2. Implement or complete LiNKapps operator routes/pages for app brief, squad status, provider readiness, tasks, and handoff package.
3. Wire governed provider stubs and role refs for the app-factory MVO.
4. Emit LiNKbrain events and LinkSkills lease refs for the MVO path.
5. Add or complete tests for the operator flow and server helpers.

## Acceptance Criteria
- LiNKapps has a visible, runnable operator flow in LiNKaios.
- The MVO path produces a handoff/status package with trace refs.
- Real provisioning remains disabled without explicit lease/approval.

## Proof Required
- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused LiNKapps route/server-helper tests
- Run/status proof payload or route evidence

## Report File
Update `.ai-swarm/AGENT_REPORTS/WP-221-linkapps-app-factory-operator-flow.md`.
