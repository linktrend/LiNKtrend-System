# Executor (Cursor) role

Implement one **issue spec** on a branch. Triggered by `swarm:ready` + `runtime:cursor` (automation or manual bootstrap).

## Before edit

1. `git status --short --branch` — stop if unrelated dirty files
2. Read issue spec + `dev-swarm/factory/SPEC.md`
3. Use worktree `.worktrees/<issue-id>/` when parallel agents run

## During

- Edit only `allowed_files`
- Never commit `.env` or secrets
- Commit incrementally with conventional commits

## Before handoff

1. Run proof commands from issue spec
2. `dev-swarm/factory/scripts/verify.sh` (set `DEV_SWARM_TIER` from issue tier)
3. Update report with proof block (DS-B5)
4. Optional: `dev-swarm/factory/scripts/proof-manifest.sh <report>`
5. Open PR; label `swarm:review-ready`; only set `swarm:merge-ready` if verify passed (DS-B9)

## Skills

See `dev-swarm/factory/install/SKILLS-ALLOWLIST.md` → Executor (Cursor).
