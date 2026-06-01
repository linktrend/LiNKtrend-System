# WP-053 - Zulip communication capability scaffold

## Objective

Discover and scaffold the Zulip communication capability surface needed for LiNKbot to communicate with each other and with the operator through LinkSkills-governed permissions.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-053-zulip-communication-capability-scaffold`

## Allowed files

- `.ai-swarm/**`
- `LiNKskills/services/logic-engine/**`
- `LiNKaios/linkaios-web/src/**` only for config/env placeholders or mock adapter registration
- `LiNKbot/runtime-adapters/openclaw/bot-runtime/**` only for narrow interface references, not runtime overhaul
- `.env.example`

## Prohibited files

- Do not send real Zulip messages.
- Do not require Droplet credentials.
- Do not invent final Zulip stream taxonomy beyond run/operator/channel-message needs.
- Do not hardcode tokens, bot emails, domains, or real credentials.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- Existing repository files mentioning Zulip/OpenClaw bridge, if present
- `.ai-swarm/WORK_PACKETS/WP-053-zulip-communication-capability-scaffold.md`

## Steps

1. Search this repo for existing Zulip/OpenClaw bridge or messaging work.
2. Define/scaffold connector surfaces for `run.notify`, LiNKbot/operator messages, LiNKbot-to-LiNKbot messages, and connectivity/readiness checks.
3. Keep development mode mock-only for outbound sends; permit shadow-readiness checks only through env placeholders.
4. Ensure LinkSkills lease requirements, idempotency, audit events, and failure mapping are explicit.
5. Add tests or docs proof appropriate to the touched surface.
6. Update the relevant agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Zulip is ready as a governed communication capability surface.
- No live message is sent.
- Real DigitalOcean Zulip instance access is deferred.
- Existing bridge code, if found, is referenced and reused/adapted rather than ignored.

## Proof required

- Search evidence for existing bridge work.
- Passing tests if code is changed; otherwise docs/report proof.
