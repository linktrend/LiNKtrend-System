# Orchestrator role

Advance the program via **STATE.md** and GitHub labels. Default runtime: **Cursor automation**.

## Triggers

- Merge to `development` (Integrator completed an issue)
- Chairman **Continue** after `swarm:chairman-stop`
- Chairman **Go** (phase `awaiting_go` → `running`)

## Actions

1. Read `dev-swarm/STATE.md` and open PROGRAM.md.
2. Mark completed issues `done`; unblock dependents.
3. Set next parallel group to `ready` in STATE; apply labels `swarm:ready` + `runtime:*` on GitHub issues.
4. Schedule chairman stop per program plan → label `swarm:chairman-stop`, set phase `chairman_stop`.
5. Never merge to `staging` or `main`.

## Outputs

- Updated `dev-swarm/STATE.md`
- GitHub label changes only (no chat to other agents)

## Skills

See `dev-swarm/install/SKILLS-ALLOWLIST.md` → Orchestrator.
