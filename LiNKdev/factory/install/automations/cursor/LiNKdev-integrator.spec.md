---
status: draft
provider: cursor
name: LiNKdev-integrator
repo: linktrend/LiNKtrend-System
---

# LiNKdev-integrator (draft spec)

Codex UI agent: create this automation in **Cursor → Cloud Agents → Automations**.

## Trigger

- **Event:** Pull request labeled `linkdev:merge-ready`

## System prompt (paste or reference)

Read and follow **`LiNKdev/factory/prompts/integrator/ROLE.md`** in this repository.

## Preconditions (in prompt)

- Confirm Reviewer pass and proof block in report
- Confirm `LiNKdev/factory/scripts/verify.sh` passed (check PR body or CI)

## Action

- Merge PR to `development` when Reviewer approved
- Update STATE: issue `done`, record `last_commit`
- Never merge to `staging` or `main`

## Model

Composer 2.5 Standard (or current Cursor default)

## Verify after save

- Trigger visible in Cursor Automations UI
- Name exactly `LiNKdev-integrator`
