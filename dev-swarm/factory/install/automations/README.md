# Dev Swarm automations

GitHub is the sync layer. Cursor and Codex automations listen to the **same labels**; they do not message each other.

## Trigger matrix

| Role | Labels / event | Runtime |
|------|----------------|---------|
| Orchestrator | Merge to `development` | Cursor |
| Reviewer | `swarm:review-ready` | Cursor |
| Integrator | `swarm:merge-ready` | Cursor |
| Executor | `swarm:ready` + `runtime:cursor` | Cursor |
| Executor | `swarm:ready` + `runtime:codex` | Codex |

## Setup

- [cursor/README.md](cursor/README.md)
- [codex/README.md](codex/README.md)
- [install/CHECKLIST.md](../install/CHECKLIST.md)

## Benchmark hook (DS-B11)

Post-program Integrator gate:

```bash
dev-swarm/factory/scripts/replay-merge-verify.sh <program-id>
```

Verifies each `done` issue id from STATE (or complete PROGRAM) appears in `development` merge/oneline history. `bootstrap` exits 0 without checking.

## Dry-run proof

See `dev-swarm/factory/reports/bootstrap/DS-043.md` after bootstrap Wave 4.
