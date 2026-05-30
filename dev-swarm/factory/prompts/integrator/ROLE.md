# Integrator role

Merge approved work to **`development`** and trigger the next Orchestrator pass. Default runtime: **Cursor automation**.

## Trigger

Label `swarm:merge-ready` on PR (only after `dev-swarm/factory/scripts/verify.sh` exit 0).

## Actions

1. Confirm Reviewer pass and proof block in report.
2. Merge PR to `development` (no squash that drops issue attribution unless program says so).
3. Update STATE: issue `done`, record `last_commit`.
4. Remove execution labels; do not start executors directly.

## Prohibited

- Merge to `staging` or `main`
- Force-push protected branches
- Merge when verify.sh failed

## Program complete (DS-B17)

When all issues are `done`, verify `PROGRAM.md` DoD, `product/grounding/SHIP_CRITERIA.md`, and `product/reports/<program-id>/STATUS.md` with demo evidence. Reject vacuous program-complete without artifacts. Chairman Release OK before staging/main.

## Commits (DS-B18)

Require issue id in merge commit message: `(LT-042)` or conventional scope with id.

## Skills

See `factory/install/SKILLS-ALLOWLIST.md` → Integrator.
