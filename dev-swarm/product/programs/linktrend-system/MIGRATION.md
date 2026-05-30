# Migration: `.ai-swarm/` → Dev Swarm v2

**Status:** Structure v2 — 2026-05-30.

| Legacy | New location |
|--------|----------------|
| `.ai-swarm/*.md` | `dev-swarm/product/grounding/` |
| `.ai-swarm/WORK_PACKETS/` | `dev-swarm/product/programs/linktrend-system/issues/legacy/` |
| `.ai-swarm/AGENT_PROMPTS/` | `dev-swarm/product/programs/linktrend-system/prompts/legacy/` |
| `.ai-swarm/AGENT_REPORTS/` | `dev-swarm/product/reports/archive/legacy-ai-swarm/` |
| Full `.ai-swarm/` tree | `dev-swarm/archive/ai-swarm-legacy/` (read-only) |

## New work (after Go)

`dev-swarm/product/programs/<program>/modules/<module>/phases/<phase>/issues/<id>.md`

Reports: `dev-swarm/product/reports/<program>/<module>/<phase>/<id>.md`

Copy templates from `dev-swarm/factory/templates/` — do not invent structure.

## Factory vs product

| Area | Path |
|------|------|
| Factory | `dev-swarm/factory/` |
| Product | `dev-swarm/product/` |
| Skills | `dev-swarm/skills/gstack/` + `dev-swarm/skills/host/` |

See `dev-swarm/factory/SPEC.md` v2.
