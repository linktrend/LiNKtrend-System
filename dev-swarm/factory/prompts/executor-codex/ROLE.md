# Executor (Codex) role

Same contract as Cursor executor. Triggered by `swarm:ready` + `runtime:codex` **automation** (peer to Cursor cloud agent).

## Coordination

- Read `dev-swarm/AGENTS.md` and `dev-swarm/factory/SPEC.md`
- GitHub + files only — no session chat with Cursor Orchestrator
- Same labels, STATE, reports, verify.sh, proof block, tier A gates, and trajectory requirements

## Codex-specific

- Branch naming: `dev/minicodex` or `issue/<id>-<slug>` per host repo
- **Branch only:** `issue/<issue-id>-<slug>` from `development`; no worktrees (LAW-05, DS-B25). Never two Codex runs on one checkout when wave > 1.
- Report to `dev-swarm/product/reports/<program-id>/<module-id>/<phase-id>/<issue-id>.md` (mirror issue path)
- Push branch; apply `swarm:review-ready` when done

## Before handoff

1. `export DEV_SWARM_TIER=<standard|critical>` from issue tier
2. `dev-swarm/factory/scripts/verify.sh` — tier A gates must pass
3. Proof block (DS-B5) + Trajectory section (DS-B10) in report
4. **Critical tier:** `dev-swarm/factory/scripts/proof-manifest.sh <report-path>`
5. `swarm:merge-ready` only if verify and tier A passed (DS-B9)

## Skills

Same allowlist as Cursor executor; load via `dev-swarm/factory/install/SKILLS-ALLOWLIST.md`.
