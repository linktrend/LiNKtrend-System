# Dev Swarm Track A + B completion

- **Date:** 2026-05-29
- **Branch:** development
- **Commit:** `099ac10`

## Track A — Consolidation (transcript spec)

| Requirement | Proof |
|-------------|-------|
| Single active skills tree | `dev-swarm/skills/` only; `.cursor/skills/README.md` pointer |
| Legacy skills archived, not deleted | `dev-swarm/archive/cursor-skills-legacy/` |
| Legacy `.ai-swarm` in dev-swarm archive | `dev-swarm/archive/ai-swarm-legacy/` |
| Generic rules in dev-swarm | `dev-swarm/rules/` (14 files incl. `08-ui-and-frontend-standards.mdc`) |
| Product rules in .cursor only | 9 `.mdc` + `00-dev-swarm-bootstrap.mdc` |
| All agents in dev-swarm | `dev-swarm/agents/` (18); `.cursor/agents/README.md` |
| No redirect stubs in .cursor/skills | Entire tree archived |
| Bootstrap rule | `.cursor/rules/00-dev-swarm-bootstrap.mdc` |

## Track B — Bootstrap pack

| Item | Status |
|------|--------|
| SPEC, contracts, templates, prompts | Present |
| Bootstrap program DS-001..046 | STATE phase `complete` |
| `scripts/verify.sh`, `validate-dag.sh` | Run below |
| `scripts/install-labels.sh` | Wire agent runs via gh |
| Automations | Chairman configures Cursor/Codex UIs |

## Chairman only

- Register Cursor + Codex automations per `dev-swarm/automations/*/README.md`
- Say **Go** on first product program after wire

## Commands (proof)

```bash
dev-swarm/scripts/validate-dag.sh dev-swarm/programs/bootstrap/PROGRAM.md
DEV_SWARM_SCOPE=dev-swarm dev-swarm/scripts/verify.sh
dev-swarm/scripts/install-labels.sh
test ! -f .cursor/skills/gstack-browse/SKILL.md
test -f dev-swarm/skills/gstack/browse/SKILL.md
```
