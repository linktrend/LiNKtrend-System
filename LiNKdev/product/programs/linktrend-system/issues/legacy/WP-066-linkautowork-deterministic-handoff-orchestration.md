# WP-066 - LiNKautowork deterministic handoff orchestration

## Objective

Implement deterministic stage handoff from LinkBot outputs into LiNKautowork workflow handles with lease and idempotency propagation.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-066-linkautowork-deterministic-handoff-orchestration`

## Allowed files

- `apps/linkaios-web/**` (handoff orchestrator)
- `apps/bot-runtime/**` (handoff request emission only)
- `packages/shared-types/**`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/linkautowork-agent.md`

## Prohibited files

- No workflow-state ownership moved into LinkBot.
- No non-idempotent write path.

## Required context

- `LiNKdev/product/grounding/LINKBOT_ADAPTER_PLAN.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md` §0.A.10.1

## Acceptance criteria

- All required `autowork.linksites.*` handles are invokable with stable idempotency keys.
- Lease-gated handles fail closed when lease is missing/invalid.

## Proof required

- Deterministic workflow invocation tests with retry/idempotency checks.
- Audit refs include workflow run ids and lease ids where required.
