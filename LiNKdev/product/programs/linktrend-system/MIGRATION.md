# Migration: `.ai-swarm/` → LiNKdev v2

**Status:** Structure v2 — 2026-05-30.

| Legacy | New location |
|--------|----------------|
| `.ai-swarm/*.md` | `LiNKdev/product/grounding/` |
| `.ai-swarm/WORK_PACKETS/` | `LiNKdev/product/programs/linktrend-system/issues/legacy/` |
| `.ai-swarm/AGENT_PROMPTS/` | `LiNKdev/product/programs/linktrend-system/prompts/legacy/` |
| `.ai-swarm/AGENT_REPORTS/` | `LiNKdev/product/reports/archive/legacy-ai-swarm/` |
| Full `.ai-swarm/` tree | `LiNKdev/archive/ai-swarm-legacy/` (read-only) |

## New work (after Go)

`LiNKdev/product/programs/<program>/modules/<module>/phases/<phase>/issues/<id>.md`

Reports: `LiNKdev/product/reports/<program>/<module>/<phase>/<id>.md`

Copy templates from `LiNKdev/factory/templates/` — do not invent structure.

## Factory vs product

| Area | Path |
|------|------|
| Factory | `LiNKdev/factory/` |
| Product | `LiNKdev/product/` |
| Skills | `LiNKdev/skills/gstack/` + `LiNKdev/skills/host/` |

See `LiNKdev/factory/SPEC.md` v2.
