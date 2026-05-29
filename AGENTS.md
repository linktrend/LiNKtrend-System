# Agent brief (portable)

Read **`dev-swarm/SPEC.md`** first for factory rules. This file is the thin cross-IDE layer (DS-B8); Cursor also loads `.cursor/rules/`.

## Non-negotiables

- Coordination via **GitHub labels + `dev-swarm/STATE.md` + reports** — agents do not share one chat session.
- **Cursor-primary:** Orchestrator, Reviewer, Integrator; many executors.
- **Codex peer automations** on `swarm:ready` + `runtime:codex` — not Chairman-triggered per issue.
- Integrator merges to **`development` only**. Chairman owns **`staging`** and **`main`**.
- Before `swarm:merge-ready`: `dev-swarm/scripts/verify.sh` must exit 0.
- Reports must include a **proof block** — no vacuous PASS.

## LiNKtrend-System

Product code and boundaries: `.cursor/rules/00-linktrend-master-rule.mdc`, `docs/architecture/repo-architecture-target.md`.

Dev Swarm pack: `dev-swarm/` (copy this folder to other repos).

## Skills

`dev-swarm/install/SKILLS-ALLOWLIST.md` — read catalog, load only listed skills.

## Wire new repo

Say **Wire Dev Swarm** → agent runs `dev-swarm/install/WIRE-PROMPT.md`.
