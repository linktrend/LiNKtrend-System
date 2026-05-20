# WP-067 - Zulip run messaging governance adapter

## Objective

Route run/status messaging through LinkSkills-governed Zulip capability with `mock`/`shadow` defaults.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-067-zulip-run-messaging-governance-adapter`

## Allowed files

- `LiNKaios/linkaios-web/**`
- `LiNKbot/runtime-adapters/openclaw/bot-runtime/**`
- `packages/shared-types/**`
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

## Prohibited files

- No live outbound sends by default
- No direct Zulip API path in LiNKbot bypassing capability governance

## Required context

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md` (`cap.zulip.run_messaging`)

## Acceptance criteria

- `run.notify` is lease-gated and mode-aware
- Stream/topic policy comes from LiNKaios/plugin config
- Replay is idempotent

## Proof required

- Tests for mode gating and idempotency behavior
