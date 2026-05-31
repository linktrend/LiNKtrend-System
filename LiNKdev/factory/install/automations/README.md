# LiNKdev automations

GitHub is the sync layer. Cursor and Codex automations listen to the **same labels**; they do not message each other.

## Trigger matrix

| Role | Labels / event | Runtime |
|------|----------------|---------|
| Orchestrator | Merge to `development` | Cursor |
| Reviewer | `linkdev:review-ready` | Cursor |
| Integrator | `linkdev:merge-ready` | Cursor |
| Executor | `linkdev:ready` + `runtime:cursor` | Cursor |
| Executor | `linkdev:ready` + `runtime:codex` | Codex |

## Setup

- [cursor/README.md](cursor/README.md) — four Cursor automations + draft `.spec.md` files
- [codex/README.md](codex/README.md) — Codex executor + draft `.spec.md`
- [CHECKLIST.md](../CHECKLIST.md)
- Wire log: `LiNKdev/product/reports/wire/wire-automation-setup.md`

## Benchmark hook (DS-B11)

Post-program Integrator gate:

```bash
LiNKdev/factory/scripts/replay-merge-verify.sh <program-id>
```

Verifies each `done` issue id from STATE (or complete PROGRAM) appears in `development` merge/oneline history. `bootstrap` exits 0 without checking.

## Dry-run proof

See `LiNKdev/factory/reports/bootstrap/DS-043.md` after bootstrap Wave 4.
