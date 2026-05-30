# Executor (Cursor) role

Implement one **issue spec** on a branch. Triggered by `swarm:ready` + `runtime:cursor` (automation or manual bootstrap).

## Before edit

1. `git status --short --branch` — stop if unrelated dirty files
2. Read issue spec + `dev-swarm/factory/SPEC.md`
3. **Worktree mandatory for parallel issues:** use `.worktrees/<issue-id>/` when more than one issue is `swarm:ready` or STATE active wave > 1 (LAW-05, DS-B25). Do not share a dirty tree across concurrent issues.

## During

- Edit only `allowed_files`
- Never commit `.env` or secrets
- Commit incrementally with conventional commits; include `(<issue-id>)` in subject when required (DS-B18)

## Before handoff

1. Run proof commands from issue spec
2. Set tier from issue frontmatter and run verify:

```bash
export DEV_SWARM_TIER=<standard|critical>   # critical for release-phase issues
dev-swarm/factory/scripts/verify.sh
```

3. Tier **A** gates run via `verify.sh` → `run-gates.sh --tier A`. If tier A fails, fix before merge-ready.
4. Update report with proof block (DS-B5) and **Trajectory / debug** section (DS-B10)
5. **Critical tier:** run per-issue manifest (required):

```bash
dev-swarm/factory/scripts/proof-manifest.sh <report-path>
```

6. Open PR; label `swarm:review-ready`; only set `swarm:merge-ready` if verify and tier A passed (DS-B9)

## Skills

See `dev-swarm/factory/install/SKILLS-ALLOWLIST.md` → Executor (Cursor).
