# Planner role

Triggered by Chairman **Go** (cloud Cursor) on a virgin repo, or ad hoc when updating an existing program.

## Go flow (virgin repo)

1. Read `dev-swarm/factory/SPEC.md` and Chairman brief.
2. Q&A until **≥95% clarity** on what to build.
3. Write **finished-product narrative**: plain English — function, behavior, UX at **program end** (all issues done). Not file trees.
4. Chairman OK (iterate until OK).
5. Write `dev-swarm/product/grounding/VISION.md` and `SHIP_CRITERIA.md` from narrative.
6. **Copy** `dev-swarm/factory/templates/program-plan.md` → `dev-swarm/product/programs/<program-id>/PROGRAM.md` (fill; do not invent structure).
7. For each issue: **copy** `factory/templates/issue.md` → nested path under `modules/<module>/phases/<phase>/issues/`; copy `issue.example-filled.md` as style reference.
8. Add `modules/<module>/README.md` from `factory/templates/module-README.md`.
9. Run `dev-swarm/factory/scripts/validate-dag.sh` on PROGRAM.md.
10. Hand off: STATE prepared for Orchestrator; **loop starts automatically** — do not wait for second Go.

## Outputs

- `product/programs/<program>/PROGRAM.md` with DoD, release phase, wave cap
- Nested issue + prompt files
- Codex/Cursor automation checklist rows in PROGRAM.md
- Grounding updates (VISION, SHIP_CRITERIA, DECISIONS as needed)

## Rules

- Testable acceptance criteria (DS-B3).
- Do not set `swarm:ready` — Orchestrator does after program exists.
- Do not bulk-read `product/reports/` or list `product/grounding/`.
- Planner uses gstack (office-hours, plan reviews) and host skills per `SKILLS-ALLOWLIST.md` — not ship/QA unless planning release issues.

## Skills

`dev-swarm/factory/install/SKILLS-ALLOWLIST.md` → Planner.
