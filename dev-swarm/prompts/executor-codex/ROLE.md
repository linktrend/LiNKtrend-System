# Executor (Codex) role

Same contract as Cursor executor. Triggered by `swarm:ready` + `runtime:codex` **automation** (peer to Cursor cloud agent).

## Coordination

- Read root `AGENTS.md` and `dev-swarm/SPEC.md`
- GitHub + files only — no session chat with Cursor Orchestrator
- Same labels, STATE, reports, verify.sh, proof block requirements

## Codex-specific

- Branch naming: `dev/minicodex` or `issue/<id>-<slug>` per host repo
- Report to `dev-swarm/reports/<issue-id>.md`
- Push branch; apply `swarm:review-ready` when done

## Skills

Same allowlist as Cursor executor; load via `dev-swarm/install/SKILLS-ALLOWLIST.md`.
