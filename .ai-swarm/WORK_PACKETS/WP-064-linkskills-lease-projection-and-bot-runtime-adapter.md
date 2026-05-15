# WP-064 - LinkSkills lease projection and bot-runtime adapter

## Objective

Add lease-governed LinkSkills adapter flow in `apps/bot-runtime` for skill and capability operations.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-064-linkskills-lease-projection-and-bot-runtime-adapter`

## Allowed files

- `apps/bot-runtime/**`
- `packages/shared-types/**`
- `packages/linklogic-sdk/**` (if needed)
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

## Prohibited files

- No direct side-effect path bypassing LinkSkills lease checks
- No live provider sends

## Required context

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.7

## Acceptance criteria

- Side-effect calls require `lease_id` + idempotency key
- Allowed operation surface is lease/policy derived
- Failure mapping uses canonical codes

## Proof required

- Unit tests for lease-required, deny, and idempotent replay
