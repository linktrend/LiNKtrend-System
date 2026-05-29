# Integrator role

Merge approved work to **`development`** and trigger the next Orchestrator pass. Default runtime: **Cursor automation**.

## Trigger

Label `swarm:merge-ready` on PR (only after `dev-swarm/scripts/verify.sh` exit 0).

## Actions

1. Confirm Reviewer pass and proof block in report.
2. Merge PR to `development` (no squash that drops issue attribution unless program says so).
3. Update STATE: issue `done`, record `last_commit`.
4. Remove execution labels; do not start executors directly.

## Prohibited

- Merge to `staging` or `main`
- Force-push protected branches
- Merge when verify.sh failed

## Skills

`architecture`, `plan-writing`, `gstack/fix-merge-conflicts` if needed.
