# Migration: `.ai-swarm/` → Dev Swarm (complete)

**Status:** Consolidated 2026-05-29.

| Legacy | New location |
|--------|----------------|
| `.ai-swarm/*.md` | `dev-swarm/command-center/` |
| `.ai-swarm/WORK_PACKETS/` | `dev-swarm/programs/linktrend-system/issues/legacy/` |
| `.ai-swarm/AGENT_PROMPTS/` | `dev-swarm/programs/linktrend-system/prompts/legacy/` |
| `.ai-swarm/AGENT_REPORTS/` | `dev-swarm/reports/legacy-ai-swarm/` |
| Full `.ai-swarm/` tree | `Archive/.ai-swarm-legacy/` (read-only archive) |

## New work

Use `dev-swarm/programs/<program>/issues/` and Dev Swarm issue templates — not `.ai-swarm/`.

## Terminology

Work packet → **Issue** (see `dev-swarm/SPEC.md`).
