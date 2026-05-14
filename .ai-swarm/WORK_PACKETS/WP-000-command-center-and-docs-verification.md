# WP-000 — Command center and docs verification

## Objective

Confirm the `.ai-swarm/` command center and the **ecosystem** documentation tree are present, readable, and internally consistent enough for agents to execute WP-001+ without hunting legacy paths.

## Background

- Design source: `docs/ecosystem/design/`
- Execution plan: `docs/ecosystem/development-plan/`
- Legacy (reference only): `docs/archive/legacy-pre-ecosystem/`

## Tasks

1. Verify folders exist: `.ai-swarm/`, `.ai-swarm/WORK_PACKETS/`, `.ai-swarm/AGENT_REPORTS/`.
2. Verify core command files exist: `MASTER_PLAN.md`, `ARCHITECTURE_RULES.md`, `AGENT_COORDINATION.md`, `REPO_INVENTORY.md`, `CONTRACTS_MVO.md`, `DECISIONS.md`, `INTEGRATION_QUEUE.md`, `MERGE_QUEUE.md`.
3. Spot-check that ecosystem docs paths referenced in `MASTER_PLAN.md` resolve (files exist).
4. Confirm `AGENT_COORDINATION.md` lists WP-000–WP-004 and links to agent report filenames.

## Acceptance criteria

- [ ] All paths in **Tasks** exist on disk.
- [ ] At least one file is present under `docs/ecosystem/design/` and `docs/ecosystem/development-plan/`.
- [ ] No instruction in this packet requires modifying application code.

## Required proof

- Paste a short directory listing (or bullet list of paths verified) into the owning agent report under **Tests / Proof**.
- Update `AGENT_COORDINATION.md` → **Latest Updates** with date + “WP-000 verified”.

## Out of scope

Implementation, dependency changes, or moving/renaming repo files outside `.ai-swarm/` unless fixing a broken reference introduced by this packet.
