# GitHub labels (Dev Swarm)

Apply on **issues** and/or **PRs** as noted. Colors are suggestions for GitHub UI setup during wire.

## Orchestration

| Label | Meaning | Who sets | Who clears |
|-------|---------|----------|------------|
| `swarm:planned` | Issue spec committed; not ready for execution | Planner / Integrator | Orchestrator when ready |
| `swarm:ready` | Executor may start (automation trigger) | Orchestrator | Executor when branch work starts |
| `swarm:in-progress` | Executor active | Executor | Executor |
| `swarm:review-ready` | PR or report ready for Reviewer | Executor | Reviewer |
| `swarm:merge-ready` | Verify passed; Integrator may merge to `development` | Executor (after verify) | Integrator |
| `swarm:blocked` | Stop line; Chairman or Orchestrator decision needed | Any role | Orchestrator after resolution |
| `swarm:done` | Issue closed on `development` | Integrator | — |

## Runtime (executor selection)

| Label | Meaning |
|-------|---------|
| `runtime:cursor` | Cursor cloud or manual Cursor executor |
| `runtime:codex` | Codex automation or session |

Filter automations: fire only when `swarm:ready` **and** matching `runtime:*`.

## Tier (optional)

| Label | Meaning |
|-------|---------|
| `tier:standard` | Default verify bundle |
| `tier:critical` | Expanded verify bundle (see `scripts/verify.sh`) |

## Program control

| Label | Meaning |
|-------|---------|
| `swarm:program-active` | Program running (on tracking issue or STATE PR) |
| `swarm:chairman-stop` | Scheduled briefing checkpoint; automations pause new `swarm:ready` until Continue |

## Promotion (Chairman only)

| Label | Meaning |
|-------|---------|
| `swarm:promote-staging` | Chairman authorized staging promotion (informational) |
| `swarm:promote-main` | Chairman authorized main promotion (informational) |

Integrator **never** merges to `staging` or `main` without Chairman action.
