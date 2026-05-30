# Dev Swarm skills routing

**gstack:** `dev-swarm/skills/gstack/` — required on every repo  
**host:** `dev-swarm/skills/host/` — this repo only; **wins** over gstack on conflict  
**Catalog:** `dev-swarm/skills/SKILLS_CATALOG.md`  
**Merge history:** `dev-swarm/skills/MERGE-LOG.md`

Open **one** skill body per task. Do not read the full catalog.

## By role

| Role | Skills (under `dev-swarm/skills/`) |
|------|-------------------------------------|
| Planner | `gstack/office-hours`, `gstack/plan-ceo-review`, `gstack/plan-eng-review`, `host/plan-writing`, `host/architecture`, `host/brainstorming` |
| Orchestrator | `host/plan-writing`, `host/parallel-agents` |
| Executor | Per issue `read_first`; default `host/clean-code`, `host/bash-linux`; `gstack/investigate` when debugging |
| Reviewer | `gstack/review`, `host/code-review-checklist` |
| Integrator | `host/architecture`, `gstack/review` (merge safety only) |

Planner/Orchestrator/Integrator do **not** use `gstack/ship` or `gstack/qa` unless a **release** issue explicitly requires it.

## Conflict

Issue spec → **host** → **gstack**.
