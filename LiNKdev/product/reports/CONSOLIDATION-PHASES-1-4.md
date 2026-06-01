# LiNKdev consolidation Phases 1–4

- **Date:** 2026-05-29
- **Status:** complete (repo); Principal UI pending for automations

## Phase 1 — Skills curator

| Proof | Result |
|-------|--------|
| `LiNKdev/skills/gstack/` | Full gstack tree (58 SKILL.md files) |
| `LiNKdev/skills/host/` | LiNKtrend project skills (52 SKILL.md files) |
| `LiNKdev/skills/MERGE-LOG.md` | 99 merge/adopt entries |
| `LiNKdev/skills/SKILLS_CATALOG.md` | Routing catalog |
| Flat `.cursor/skills/gstack-*` | Replaced with redirect stubs → canonical paths |

**Policy:** Nested `LiNKdev/skills/gstack/<name>/` kept over flat `gstack-<name>` when both existed; flat-only skills copied into nested path.

## Phase 2 — Replace `.ai-swarm`

| Proof | Result |
|-------|--------|
| `LiNKdev/product/grounding/` | 43 root docs from `.ai-swarm` |
| `programs/linktrend-system/issues/legacy/` | 79 work packets |
| `programs/linktrend-system/prompts/legacy/` | 61 prompts |
| `reports/legacy-ai-swarm/` | 75+ reports |
| `Archive/.ai-swarm-legacy/` | Original tree preserved |

## Phase 3 — Factory under `LiNKdev/`

| Proof | Result |
|-------|--------|
| `LiNKdev/factory/agents/` | architect-integrator, project-planner |
| `LiNKdev/factory/rules/` | swarm coordination, git, handoff, testing |
| `.cursor/rules/03-agent-swarm-coordination.mdc` | Updated to point at `LiNKdev/` |
| `LiNKdev/AGENTS.md` | Portable brief inside pack |

## Phase 4 — Wire + proof

| Proof | Result |
|-------|--------|
| GitHub labels | 13 labels on `linktrend/LiNKtrend-System` via `gh label create --force` (2026-05-29) |
| `LiNKdev/factory/scripts/verify.sh` | Run after commit |
| `LiNKdev/factory/scripts/validate-dag.sh` | bootstrap PROGRAM DAG |
| Cursor/Codex automations | **Principal:** `automations/cursor/README.md`, `automations/codex/README.md` |

## Copy test (portability)

```bash
cp -R LiNKdev /tmp/LiNKdev-copy-test
ls /tmp/LiNKdev-copy-test/skills/gstack/browse/SKILL.md
```

## Principal next steps

1. Wire session: `Execute LiNKdev/factory/install/WIRE-PROMPT.md`
2. Register Cursor + Codex automations (UI only)
3. Plan `linktrend-system` program with new issue templates (not legacy WP paths)
