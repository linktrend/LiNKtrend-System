# Cursor automations

Create four automations in Cursor (Cloud Agents) for this repository.

## 1. dev-swarm-orchestrator

- **Trigger:** Pull request merged to branch `development`
- **Prompt file:** Load `dev-swarm/factory/prompts/orchestrator/ROLE.md` + read `dev-swarm/factory/STATE.md` + active `programs/*/PROGRAM.md`
- **Model:** Composer 2.5 Standard (or current default)
- **Scope:** May edit `dev-swarm/factory/STATE.md`, apply GitHub labels via `gh` CLI in instructions

## 2. dev-swarm-reviewer

- **Trigger:** Issue or PR labeled `swarm:review-ready`
- **Prompt:** `dev-swarm/factory/prompts/reviewer/ROLE.md` + issue spec + PR diff
- **Reject vacuous PASS** per SPEC

## 3. dev-swarm-integrator

- **Trigger:** PR labeled `swarm:merge-ready`
- **Precondition in prompt:** verify `dev-swarm/factory/scripts/verify.sh` passed (check PR body or CI)
- **Action:** Merge to `development` if Reviewer approved

## 4. dev-swarm-executor-cursor

- **Trigger:** Issue labeled `swarm:ready` and `runtime:cursor`
- **Prompt:** `dev-swarm/factory/prompts/executor-cursor/ROLE.md` + linked issue spec under `dev-swarm/product/programs/`

## Chairman UI checklist (one-time)

1. Open **Cursor → Settings → Cloud Agents → Automations** for repo `linktrend/LiNKtrend-System`.
2. Confirm GitHub labels exist (agent created 13 `swarm:*`, `runtime:*`, `tier:*` labels via `gh`).
3. Create four automations per sections 1–4 above; paste prompts from `dev-swarm/factory/prompts/*/ROLE.md`.
4. Set default branch context to `development` for orchestrator/integrator triggers.
5. Export automation names or screenshots into this folder (no secrets).

## Export

Store automation JSON or screenshots in this folder when configured (no secrets).
