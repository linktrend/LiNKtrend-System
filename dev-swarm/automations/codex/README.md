# Codex automations

Codex executors are **peer automations** to Cursor cloud agents. Same GitHub labels; separate Codex automation entries.

## dev-swarm-executor-codex

- **Trigger:** GitHub issue labeled `swarm:ready` AND `runtime:codex`
- **Filter:** Issue body or path references `dev-swarm/programs/` (optional narrow filter)
- **Prompt:** `dev-swarm/prompts/executor-codex/ROLE.md` + issue spec from `dev-swarm/programs/bootstrap/issues/<id>.md`
- **Branch:** `dev/minicodex` or `issue/<id>-*`

## Planner checklist

For each Codex issue group in PROGRAM.md, duplicate trigger with same label contract — do not rely on Chairman manual launch.

## Proof

Automation run must update `dev-swarm/reports/<id>.md` and push branch without Chairman starting Codex.

## Export

Document Codex automation IDs in this folder after Chairman configures UI.
