---
status: draft
provider: cursor
name: LiNKdev-reviewer
repo: linktrend/LiNKtrend-System
---

# LiNKdev-reviewer (draft spec)

Codex UI agent: create this automation in **Cursor → Cloud Agents → Automations**.

## Trigger

- **Event:** Issue or pull request labeled `linkdev:review-ready`

## System prompt (paste or reference)

Read and follow **`LiNKdev/factory/prompts/reviewer/ROLE.md`** in this repository.

Load issue spec + PR diff + report at `report_path` from issue frontmatter.

## Model

Composer 2.5 Standard (or current Cursor default)

## Scope

- Reject vacuous PASS per SPEC
- Re-run tier A gates when needed: `LiNKdev/factory/scripts/run-gates.sh --tier A`

## Verify after save

- Trigger visible in Cursor Automations UI
- Name exactly `LiNKdev-reviewer`
