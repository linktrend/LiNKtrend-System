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

Post-program optional issue:

```bash
# Future: wire OpenHands/benchmarks-style eval against closed issue SHAs
echo "benchmark: stub — record program_id and issue list from STATE.md"
```

## Dry-run proof

See `dev-swarm/factory/reports/bootstrap/DS-043.md` after bootstrap Wave 4.
