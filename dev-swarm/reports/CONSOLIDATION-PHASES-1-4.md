# Dev Swarm consolidation Phases 1–4

- **Date:** 2026-05-29
- **Status:** complete (repo); Chairman UI pending for automations

## Phase 1 — Skills curator

| Proof | Result |
|-------|--------|
| `dev-swarm/skills/gstack/` | Full gstack tree (58 SKILL.md files) |
| `dev-swarm/skills/linktrend/` | LiNKtrend project skills (52 SKILL.md files) |
| `dev-swarm/skills/MERGE-LOG.md` | 99 merge/adopt entries |
| `dev-swarm/skills/SKILLS_CATALOG.md` | Routing catalog |
| Flat `.cursor/skills/gstack-*` | Replaced with redirect stubs → canonical paths |

**Policy:** Nested `dev-swarm/skills/gstack/<name>/` kept over flat `gstack-<name>` when both existed; flat-only skills copied into nested path.

## Phase 2 — Replace `.ai-swarm`

| Proof | Result |
|-------|--------|
| `dev-swarm/command-center/` | 43 root docs from `.ai-swarm` |
| `programs/linktrend-system/issues/legacy/` | 79 work packets |
| `programs/linktrend-system/prompts/legacy/` | 61 prompts |
| `reports/legacy-ai-swarm/` | 75+ reports |
| `Archive/.ai-swarm-legacy/` | Original tree preserved |

## Phase 3 — Factory under `dev-swarm/`

| Proof | Result |
|-------|--------|
| `dev-swarm/agents/` | architect-integrator, project-planner |
| `dev-swarm/rules/` | swarm coordination, git, handoff, testing |
| `.cursor/rules/03-agent-swarm-coordination.mdc` | Updated to point at `dev-swarm/` |
| `dev-swarm/AGENTS.md` | Portable brief inside pack |

## Phase 4 — Wire + proof

| Proof | Result |
|-------|--------|
| GitHub labels | 13 labels on `linktrend/LiNKtrend-System` via `gh label create --force` (2026-05-29) |
| `dev-swarm/scripts/verify.sh` | Run after commit |
| `dev-swarm/scripts/validate-dag.sh` | bootstrap PROGRAM DAG |
| Cursor/Codex automations | **Chairman:** `automations/cursor/README.md`, `automations/codex/README.md` |

## Copy test (portability)

```bash
cp -R dev-swarm /tmp/dev-swarm-copy-test
ls /tmp/dev-swarm-copy-test/skills/gstack/browse/SKILL.md
```

## Chairman next steps

1. Wire session: `Execute dev-swarm/install/WIRE-PROMPT.md`
2. Register Cursor + Codex automations (UI only)
3. Plan `linktrend-system` program with new issue templates (not legacy WP paths)
