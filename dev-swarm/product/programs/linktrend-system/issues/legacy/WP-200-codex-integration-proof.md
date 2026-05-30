# WP-200 — Cross-System Integration And Proof

## Objective

Verify and harden the repo after cleanup so the MVO can move toward 90-95% operational completion across LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LiNKbot, LinkSites, LEXOS, LiNKapps, and LiNKguard.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-200-codex-integration-proof`
- Branch: `wp-200-codex-integration-proof`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- Cross-system integration fixes in `LiNKaios/`, `LiNKbrain/`, `LiNKskills/`, `LiNKautowork/`, `LiNKbot/`, `LiNKguard/`, `modules/`, `packages/`, `services/migrations/`, `scripts/`
- Verification docs under `dev-swarm/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files

- External repos under `/Users/linktrend/Projects/*`
- Real secrets or `.env`
- Archived work packets/prompts except for read-only reference

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `dev-swarm/product/grounding/MASTER_PLAN.md`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md`
- `dev-swarm/product/grounding/DECISIONS.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`

## Steps

1. Run package discovery and verify active package homes match `pnpm-workspace.yaml`.
2. Run targeted typechecks/tests/builds for moved and cross-plane packages.
3. Identify broken contracts between LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LiNKbot, modules, and LiNKguard.
4. Fix only integration blockers required for the MVO to execute or prove status.
5. Produce a final proof matrix with pass/fail commands and remaining UI/UX-check items.

## Acceptance Criteria

- No active code refers to removed top-level `apps/`, `plugins/`, or `infra/` paths.
- Core package typechecks pass or any failure has a concrete root-cause note.
- LiNKaios production build is attempted and result recorded.
- MVO integration blockers are fixed or clearly listed with file-level evidence.

## Proof Required

- Commands run and outputs summarized.
- `git status --short` from the packet worktree.
- Any remaining blocker must include exact command, failing file, and next action.

## Report File

Update `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-200-codex-integration-proof.md`.
