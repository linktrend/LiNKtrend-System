---
status: draft
provider: cursor
name: LiNKdev-executor-cursor
repo: linktrend/LiNKtrend-System
---

# LiNKdev-executor-cursor (draft spec)

Codex UI agent: create this automation in **Cursor → Cloud Agents → Automations**.

## Trigger

- **Event:** Issue labeled **`linkdev:ready`** AND **`runtime:cursor`** (both required)

## System prompt (paste or reference)

Read and follow **`LiNKdev/factory/prompts/executor-cursor/ROLE.md`** in this repository.

Load linked issue spec from `LiNKdev/product/programs/<program-id>/modules/.../issues/<issue-id>.md` (path from issue body or GitHub issue template).

## Branch

- Checkout `issue/<issue-id>-<slug>` from `development`
- Push branch; open PR; label `linkdev:review-ready` when done

## Model

Composer 2.5 Standard (or current Cursor default)

## Verify after save

- Trigger visible in Cursor Automations UI
- Name exactly `LiNKdev-executor-cursor`
- Filter requires both labels (not `linkdev:ready` alone)
