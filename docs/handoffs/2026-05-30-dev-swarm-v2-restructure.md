# Handoff: Dev Swarm v2 restructure

- **Date:** 2026-05-30 (morning)
- **Branch:** development
- **IDE/Agent:** Cursor

## What was done

- Split `dev-swarm/` into **`factory/`** (portable) and **`product/`** (this repo)
- Renamed **`command-center/`** → **`product/grounding/`** + stubs (VISION, SHIP_CRITERIA, CONSTRAINTS, GLOSSARY, DECISIONS_INDEX)
- Skills: **`gstack/`** + **`host/`** (was `linktrend/`); no `skills/factory/`
- Reports: bootstrap → `factory/reports/bootstrap/`; product nested path convention documented
- **SPEC v2:** Go → cloud Planner → product narrative OK → create program → automatic Orchestrator loop
- **BORROW-PACK** B14–B18 (program DoD, release phase, traceability)
- Full **templates** + `issue.example-filled.md`, `module-README.md`
- **Automations:** CURSOR/CODEX create guides + manifest under `factory/install/automations/`
- **Cursor commands:** wire, go, ui-automations (also in `factory/install/portable-cursor/`)
- Bulk path updates across repo (~276 files)

## What's next

1. Chairman: wire (local) → Codex UI automations → **Go** (cloud Planner)
2. Planner: real `linktrend-system` program under nested modules/phases (legacy stays archive)
3. Optional Chairman pilot wave before full parallel

## Proof

```bash
dev-swarm/factory/scripts/validate-dag.sh dev-swarm/factory/programs/bootstrap/PROGRAM.md
DEV_SWARM_SCOPE=dev-swarm dev-swarm/factory/scripts/verify.sh
```

## Branch state

- Commit pending on `development` after this handoff file
