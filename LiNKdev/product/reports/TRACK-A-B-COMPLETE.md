# LiNKdev Track A + B completion

- **Date:** 2026-05-29
- **Branch:** development
- **Commit:** `099ac10`

## Track A — Consolidation (transcript spec)

| Requirement | Proof |
|-------------|-------|
| Single active skills tree | `LiNKdev/skills/` only; `.cursor/skills/README.md` pointer |
| Legacy skills archived, not deleted | `LiNKdev/archive/cursor-skills-legacy/` |
| Legacy `.ai-swarm` in LiNKdev archive | `LiNKdev/archive/ai-swarm-legacy/` |
| Generic rules in LiNKdev | `LiNKdev/factory/rules/` (14 files incl. `08-ui-and-frontend-standards.mdc`) |
| Product rules in .cursor only | 9 `.mdc` + `00-linkdev-bootstrap.mdc` |
| All agents in LiNKdev | `LiNKdev/factory/agents/` (18); `.cursor/agents/README.md` |
| No redirect stubs in .cursor/skills | Entire tree archived |
| Bootstrap rule | `.cursor/rules/00-linkdev-bootstrap.mdc` |

## Track B — Bootstrap pack

| Item | Status |
|------|--------|
| SPEC, contracts, templates, prompts | Present |
| Bootstrap program DS-001..046 | STATE phase `complete` |
| `scripts/verify.sh`, `validate-dag.sh` | Run below |
| `scripts/install-labels.sh` | Wire agent runs via gh |
| Automations | Principal configures Cursor/Codex UIs |

## Principal only

- Register Cursor + Codex automations per `LiNKdev/factory/install/automations/*/README.md`
- Say **Go** on first product program after wire

## Commands (proof)

```bash
LiNKdev/factory/scripts/validate-dag.sh LiNKdev/factory/programs/bootstrap/PROGRAM.md
LINKDEV_SCOPE=LiNKdev LiNKdev/factory/scripts/verify.sh
LiNKdev/factory/scripts/install-labels.sh
test ! -f .cursor/skills/gstack-browse/SKILL.md
test -f LiNKdev/skills/gstack/browse/SKILL.md
```
