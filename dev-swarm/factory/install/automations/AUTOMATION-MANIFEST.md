# Dev Swarm automation manifest

Chairman registers these after **wire** (local agent) using **Codex computer use** ([CURSOR-CREATE-AUTOMATIONS.md](CURSOR-CREATE-AUTOMATIONS.md), [CODEX-CREATE-AUTOMATIONS.md](CODEX-CREATE-AUTOMATIONS.md)).

## Cursor cloud automations

| Name | Role | Trigger | Reads |
|------|------|---------|-------|
| `dev-swarm-orchestrator` | Orchestrator | Push/merge to `development` | `factory/prompts/orchestrator/ROLE.md`, `factory/STATE.md`, active `product/programs/*/PROGRAM.md` |
| `dev-swarm-reviewer` | Reviewer | Label `swarm:review-ready` | `factory/prompts/reviewer/ROLE.md`, issue + `report_path` |
| `dev-swarm-integrator` | Integrator | Label `swarm:merge-ready` | `factory/prompts/integrator/ROLE.md`, issue + report |
| `dev-swarm-executor-cursor` | Executor | Labels `swarm:ready` + `runtime:cursor` | `factory/prompts/executor-cursor/ROLE.md`, issue spec only |

## Codex cloud automations

| Name | Role | Trigger | Reads |
|------|------|---------|-------|
| `dev-swarm-executor-codex` | Executor | Labels `swarm:ready` + `runtime:codex` | `factory/prompts/executor-codex/ROLE.md`, issue spec only |

Create additional Codex automations per rows in `product/programs/*/PROGRAM.md` Codex checklist.

## Planner (Go)

Not a standing automation on virgin repo. Chairman starts **cloud Cursor** with command **Dev Swarm Go** (`.cursor/commands/dev-swarm-go.md`) → `factory/prompts/planner/ROLE.md`.

After program exists, Orchestrator runs **automatically** on merge to `development`.
