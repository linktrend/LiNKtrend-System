# WP-067 - Zulip run messaging governance adapter

## Objective

Wire run/status messaging to Zulip exclusively through LinkSkills capability governance with `mock`/`shadow` defaults.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-067-zulip-run-messaging-governance-adapter`

## Allowed files

- `apps/linkaios-web/**` (policy and dispatch integration)
- `apps/bot-runtime/**` (status emission only)
- `packages/shared-types/**`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/linkbot-agent.md`

## Prohibited files

- No live outbound sends by default.
- No direct Zulip API call from LinkBot runtime bypassing capability governance.

## Required context

- `dev-swarm/product/grounding/LINKBOT_ADAPTER_PLAN.md`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md` (`cap.zulip.run_messaging` contract)

## Acceptance criteria

- `run.notify` path is lease-governed and mode-aware.
- Stream/topic policy resolved from LiNKaios/plugin config.
- Duplicate replay behavior is idempotent.

## Proof required

- Tests for mode gating (`mock`, `shadow`, blocked `live`).
- Tests for stream/topic validation and idempotency keys.
