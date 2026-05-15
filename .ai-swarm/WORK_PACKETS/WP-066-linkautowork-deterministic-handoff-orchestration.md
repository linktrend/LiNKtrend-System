# WP-066 - LiNKautowork deterministic handoff orchestration

## Objective

Implement deterministic handoff from LinkBot stage outputs into LiNKautowork workflow handles with lease + idempotency propagation.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-066-linkautowork-deterministic-handoff-orchestration`

## Allowed files

- `apps/linkaios-web/**`
- `apps/bot-runtime/**` (handoff request emission only)
- `packages/shared-types/**`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`

## Prohibited files

- No workflow-state ownership in LinkBot
- No non-idempotent write path

## Required context

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.10.1

## Acceptance criteria

- Required `autowork.linksites.*` handles invoked with stable idempotency keys
- Lease-gated handles fail closed without valid lease

## Proof required

- Workflow tests for retries/idempotency and lease refs
