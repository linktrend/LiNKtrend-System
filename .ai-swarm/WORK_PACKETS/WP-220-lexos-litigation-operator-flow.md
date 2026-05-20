# WP-220 — LEXOS Litigation Operator Flow

## Objective
Bring LEXOS Litigation close to operational MVO by implementing the operator-facing matter/case workflow surface with governed capability and trace refs.

## Repo / Worktree
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-220-lexos-litigation-operator-flow`
- Branch: `wp-220-lexos-litigation-operator-flow`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files
- `modules/lexos/litigation/`
- `LiNKaios/linkaios-web/src/**` for LEXOS routes/UI/server helpers
- LEXOS role/capability/event contracts in owning planes as thin adapters
- Tests and report

## Prohibited Files
- Real client legal data
- External `/Users/linktrend/Projects/LiNKtrend-LEXOS` edits
- Unapproved live legal research provider calls

## Required Context
- `modules/lexos/litigation/workflow.*`
- Existing LEXOS source-map docs
- `docs/architecture/repo-architecture-target.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.worktrees/WP-216-linkaios-cockpit-proof-surface/.ai-swarm/AGENT_REPORTS/WP-216-linkaios-cockpit-proof-surface.md` if present
- `.worktrees/WP-218-linksites-proof-runbook-and-local-preview/.ai-swarm/AGENT_REPORTS/WP-218-linksites-proof-runbook-and-local-preview.md` if present

## Steps
1. Verify the packet worktree has the current `LiNKaios/linkaios-web` topology before editing; if it still has legacy `apps/linkaios-web` only, stop and report that WP-219/WP-222 integration baseline must run first.
2. Implement or complete LEXOS Litigation operator routes/pages for matter intake, evidence/research status, tasks, and trace proof.
3. Wire governed stubs or shadow calls for legal research and document/evidence handling.
4. Emit LiNKbrain events and LinkSkills lease refs for the MVO path.
5. Add or complete tests for the operator flow and server helpers.

## Acceptance Criteria
- LEXOS Litigation has a visible, runnable operator flow in LiNKaios.
- The MVO path has status, task, and trace proof.
- External repo/runtime gaps are documented precisely.

## Proof Required
- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused LEXOS route/server-helper tests
- Run/status proof payload or route evidence

## Report File
Update `.ai-swarm/AGENT_REPORTS/WP-220-lexos-litigation-operator-flow.md`.
