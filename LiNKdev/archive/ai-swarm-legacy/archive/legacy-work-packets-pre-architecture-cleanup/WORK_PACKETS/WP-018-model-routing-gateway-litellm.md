# WP-018 — Model routing gateway (LiteLLM) adoption

## Objective

Introduce LiteLLM as a centralized model routing gateway behind existing LiNKbot reasoning interfaces, with no contract changes to LiNKaios kernel/plugin flow.

## Owner agent

linkbot-agent (primary), architect (co-owner)

## Execution mode

- Codex: gateway client integration and adapter hardening
- Antigravity: not primary (optional UI smoke only)
- Architect: policy/cost/routing decision and rollout controls

## Allowed files

- `LiNKbot/runtime-adapters/openclaw/bot-runtime/**`
- `packages/linklogic-sdk/**` (routing config types only if needed)
- `packages/observability/**` (model usage telemetry)
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

## Prohibited files

- LiNKaios kernel stage lifecycle code
- CRM/Plane/preview provider implementation
- LEXOS implementation
- Breaking changes to `bot.reason` contract shapes

## Dependencies

- OpenRouter baseline metrics available for cost/latency comparison
- WP-009 reasoning dispatch stable
- LiteLLM environment path available outside git

## Required proof

- A/B run evidence: OpenRouter baseline vs LiteLLM path with same reasoning kinds
- No contract drift in `BotReasonResult` outputs
- Failure mapping proof for gateway outage/timeouts
- Agent report includes rollback switch to prior OpenRouter direct path

## Out of scope

Multi-provider optimization research beyond the MVO reasoning kinds.
