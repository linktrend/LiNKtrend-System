# WP-119 - LinkBot Zulip Notification Adapter

## Objective

Add a governed LinkBot-facing notification adapter that routes run/status messages through LinkSkills-controlled Zulip mock/shadow posture, with no live outbound sends by default.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-119-linkbot-zulip-notification-adapter`
- Base: `origin/development`

## Allowed files

- `apps/bot-runtime/src/**`
- `.ai-swarm/LINKBOT_ZULIP_NOTIFICATION_ADAPTER.md`
- `.ai-swarm/AGENT_REPORTS/WP-119-linkbot-zulip-notification-adapter.md`

## Prohibited files

- No real Zulip sends.
- No direct channel API path bypassing LinkSkills leases.
- No LiNKaios kernel or LiNKautowork workflow changes unless needed only for tests and explicitly justified.

## Required context

- `apps/bot-runtime/src/linkskills-runtime-adapter.ts`
- `apps/bot-runtime/src/reasoning-dispatch.ts`
- `.ai-swarm/CONTRACTS_MVO.md` capability sections for Zulip
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.zulip.run_messaging.yaml`

## Steps

1. Inspect current bot-runtime adapter patterns.
2. Add a notification adapter function/module that requires lease/idempotency metadata and defaults to mock queue output.
3. Add tests for missing lease, idempotent replay, mock success, and live-send rejection.
4. Document integration path for future LiNKaios/LinkSkills runtime wiring.
5. Update the packet-specific report.

## Acceptance criteria

- No outbound network call is made in default test/dev path.
- Adapter returns deterministic refs suitable for audit/event payloads.
- Tests pass for allowed and denied paths.

## Proof required

- Focused `pnpm --filter @linktrend/bot-runtime test -- zulip linkskills` output or exact equivalent.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
