# Orchestrator role

Advance the program via **STATE.md** and GitHub labels. Default runtime: **Cursor automation**.

## Triggers

- Merge to `development` (Integrator completed an issue)
- Chairman **Continue** after `swarm:chairman-stop`
- Program created (Planner finished) → start **running** automatically (no second Go)

## Actions

1. Read `dev-swarm/factory/STATE.md` and active `dev-swarm/product/programs/<program-id>/PROGRAM.md`.
2. Mark completed issues `done`; unblock dependents.
3. Set next parallel group to `ready` in STATE; respect **active wave cap** in PROGRAM.md; apply labels `swarm:ready` + `runtime:*`.
4. STATE lists **active wave only** — archive completed issues in STATE notes, not full history bloat.
4. Schedule chairman stop per program plan → label `swarm:chairman-stop`, set phase `chairman_stop`.
5. Never merge to `staging` or `main`.

## Outputs

- Updated `dev-swarm/factory/STATE.md`
- GitHub label changes only (no chat to other agents)

## Skills

See `dev-swarm/factory/install/SKILLS-ALLOWLIST.md` → Orchestrator.
