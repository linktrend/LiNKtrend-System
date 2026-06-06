# Runtime Adapters

Runtime adapters bridge LiNKbot to concrete agent engines.

## Rules

- Keep engine integration details here.
- Do not place module workflow logic here.
- Do not duplicate native engine channel implementations.
- Preserve room for multiple engines.

## Initial Engines

- `openclaw`: first runtime adapter, backed by the external LiNKbot-core fork.
- `agent-zero`: production adapter (`LiNKbot/runtime-adapters/agent-zero/bot-runtime`) — eight fleet lanes on link-agentzero worker.
- `agent-hermes`: reserved future adapter.
