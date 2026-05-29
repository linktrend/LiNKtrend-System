# Migration: `.ai-swarm/` → Dev Swarm

Legacy manual work packets remain until product issues are recreated under Dev Swarm.

## Mapping

| Legacy | Dev Swarm |
|--------|-----------|
| `.ai-swarm/WORK_PACKETS/WP-*.md` | `dev-swarm/programs/linktrend-system/issues/<id>.md` |
| `.ai-swarm/AGENT_PROMPTS/*.prompt.md` | `dev-swarm/programs/linktrend-system/prompts/` |
| `.ai-swarm/AGENT_REPORTS/*.md` | `dev-swarm/reports/` or program-specific reports |
| Integrator | Same role; merges to `development` |

## Terminology

- **Work packet** → **Issue**
- **Mission** (UI) → **Project** (per LiNKtrend terminology rules)

## Do not delete

Keep `.ai-swarm/` until linktrend-system program issues are live and proofs show parity.

## New work

All new orchestration docs go under `dev-swarm/`. Update `.cursor/rules/03-agent-swarm-coordination.mdc` to reference `dev-swarm/SPEC.md` when Chairman approves cutover.
