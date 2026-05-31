---
status: draft
provider: codex
name: LiNKdev-executor-codex
repo: linktrend/LiNKtrend-System
---

# LiNKdev-executor-codex (draft spec)

Codex UI agent: create this automation in **Codex → Automations** for `linktrend/LiNKtrend-System`.

## Trigger

- **Event:** GitHub issue labeled **`linkdev:ready`** AND **`runtime:codex`** (both required)

## System prompt (paste or reference)

Read and follow **`LiNKdev/factory/prompts/executor-codex/ROLE.md`** in this repository.

Load issue spec from `LiNKdev/product/programs/<program-id>/modules/<module>/phases/<phase>/issues/<issue-id>.md` (path from issue body or branch spec).

## Branch

- `dev/minicodex` or `issue/<issue-id>-<slug>` per host SOP
- Push branch; apply `linkdev:review-ready` when done

## Verify after save

- Trigger visible in Codex Automations UI
- Name exactly `LiNKdev-executor-codex`
- Filter requires both labels (not `linkdev:ready` alone)
- Record automation ID in this folder after save (no secrets)
