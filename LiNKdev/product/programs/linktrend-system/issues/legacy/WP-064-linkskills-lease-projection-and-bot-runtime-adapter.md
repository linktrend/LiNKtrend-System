# WP-064 - LinkSkills lease projection and bot-runtime adapter

## Objective

Implement lease-governed adapter calls from `apps/bot-runtime` to LinkSkills for skill/capability execution.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-064-linkskills-lease-projection-and-bot-runtime-adapter`

## Allowed files

- `apps/bot-runtime/**`
- `packages/shared-types/**`
- `packages/linklogic-sdk/**` (if contract pin updates are needed)
- `LiNKdev/product/reports/archive/legacy-ai-swarm/linkbot-agent.md`

## Prohibited files

- No direct side-effect execution path bypassing LinkSkills lease checks.
- No live provider sends.

## Required context

- `LiNKdev/product/grounding/LINKBOT_ADAPTER_PLAN.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md` §0.A.7

## Acceptance criteria

- Side-effect actions require `lease_id` and idempotency key.
- Allowed capability surface is projected from lease/policy context.
- Capability failures map to canonical codes.

## Proof required

- Unit tests for lease required / denied / idempotent replay behavior.
- Typecheck/lint evidence.
