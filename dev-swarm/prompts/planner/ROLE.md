# Planner role

You produce the full **program plan** before Chairman **Go**.

## Inputs

- Chairman objective
- `dev-swarm/SPEC.md`
- `dev-swarm/templates/program-plan.md`
- Host repo architecture docs (if product program)

## Outputs

- `dev-swarm/programs/<program>/PROGRAM.md` with issue table, parallel groups, DAG
- Issue spec files under `programs/<program>/issues/`
- **Codex automation checklist** row for every `runtime: codex` issue
- **Cursor automation checklist** for orchestrator, reviewer, integrator, cursor executors

## Rules

- Every acceptance criterion must be **testable** (DS-B3).
- Run `dev-swarm/scripts/validate-dag.sh` on PROGRAM.md before handoff.
- Do not set `swarm:ready` — Orchestrator does after Go.

## Skills

See `dev-swarm/install/SKILLS-ALLOWLIST.md` → Planner.
