---
program_id: example-program
title: Example Program
status: draft
chairman_review_schedule:
  - after_wave: 1
---

# Program plan: Example Program

## Finished product (plain English)

Written after Chairman Go Q&A. Describe what the product **does**, how it **behaves**, and what users **see** when **all issues in this program** are complete. Not a file tree.

## Program Definition of Done (DS-B14)

- [ ] All issues `done` in STATE
- [ ] Release phase critical issues passed verify + proof manifest
- [ ] `dev-swarm/product/grounding/SHIP_CRITERIA.md` satisfied
- [ ] Demo evidence path recorded in `dev-swarm/product/reports/<program-id>/STATUS.md`
- [ ] Chairman Release OK recorded (staging/main remain Chairman-only)

## Modules

### example-module — Module title

**README:** `modules/example-module/README.md` (5–15 lines: goal, out of scope)

#### Phase 1 — Phase title

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| PR-001 | … | cursor | standard | [] | A |

### release — Ship

#### Phase ship — Release

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| PR-900 | Program release verify | cursor | critical | [all module issues] | — |

## Parallel groups

- **A:** PR-001, PR-003
- **B:** PR-002 (after PR-001)

## Active wave cap

Orchestrator sets at most **3** concurrent `swarm:ready` issues (adjust per Chairman).

## Codex automation checklist

| Issue | Trigger labels | Paths filter | Automation name |
|-------|----------------|--------------|-----------------|
| PR-003 | `swarm:ready`, `runtime:codex` | `dev-swarm/factory/contracts/**` | dev-swarm-codex-example |

## Cursor automation checklist

| Role | Trigger | Automation name |
|------|---------|-----------------|
| Orchestrator | Merge to `development` | dev-swarm-orchestrator |
| Reviewer | `swarm:review-ready` | dev-swarm-reviewer |
| Integrator | `swarm:merge-ready` | dev-swarm-integrator |
| Executor (cursor) | `swarm:ready`, `runtime:cursor` | dev-swarm-executor-cursor |

## DAG notes

`dev-swarm/factory/scripts/validate-dag.sh dev-swarm/product/programs/<program-id>/PROGRAM.md`
