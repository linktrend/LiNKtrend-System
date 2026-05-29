---
program_id: example-program
title: Example Program
status: draft
chairman_review_schedule:
  - after_wave: 1
  - after_module: linksites-mvo
---

# Program plan: Example Program

## Modules

### module-id — Module title

#### Phase 1 — Phase title

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| DS-001 | … | cursor | standard | [] | A |

## Parallel groups

- **A:** DS-001, DS-003 (may run together)
- **B:** DS-002 (after DS-001)

## Codex automation checklist

For each issue with `runtime: codex`, create or verify a Codex automation:

| Issue | Trigger labels | Repo paths filter | Automation name |
|-------|----------------|-------------------|-------------------|
| DS-003 | `swarm:ready`, `runtime:codex` | `dev-swarm/contracts/**` | dev-swarm-codex-contracts |

## Cursor automation checklist

| Role | Trigger | Automation name |
|------|---------|-------------------|
| Orchestrator | Merge to `development` | dev-swarm-orchestrator |
| Reviewer | Label `swarm:review-ready` | dev-swarm-reviewer |
| Integrator | Label `swarm:merge-ready` | dev-swarm-integrator |
| Executor (cursor) | `swarm:ready` + `runtime:cursor` | dev-swarm-executor-cursor |

## DAG notes

Validator command: `dev-swarm/scripts/validate-dag.sh dev-swarm/programs/<program>/PROGRAM.md`
