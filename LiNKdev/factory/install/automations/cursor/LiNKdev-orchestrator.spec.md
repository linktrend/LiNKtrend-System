---
status: draft
provider: cursor
name: LiNKdev-orchestrator
repo: linktrend/LiNKtrend-System
---

# LiNKdev-orchestrator (draft spec)

Codex UI agent: create this automation in **Cursor → Cloud Agents → Automations**.

## Trigger

- **Event:** Pull request merged to branch `development`

## System prompt (paste or reference)

Read and follow **`LiNKdev/factory/prompts/orchestrator/ROLE.md`** in this repository.

Also read:

- `LiNKdev/factory/STATE.md`
- Active `LiNKdev/product/programs/linktrend-system/PROGRAM.md`

## Model

Composer 2.5 Standard (or current Cursor default)

## Scope

- May edit `LiNKdev/factory/STATE.md`
- May apply GitHub labels via `gh` CLI per ROLE.md
- Default branch context: `development`

## Verify after save

- Trigger visible in Cursor Automations UI
- Name exactly `LiNKdev-orchestrator`
