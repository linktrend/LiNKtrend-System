# WP-047 - LinkSkills LinkSites capability catalog

## Objective

Extend LinkSkills capability catalog and lease handling for the LinkSites v2 capability plugin set without enabling live external writes.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-047-linkskills-linksites-capability-catalog`

## Allowed files

- `LiNKskills/services/logic-engine/**`
- `services/migrations/*.sql`
- `packages/linklogic-sdk/src/**` only if needed to import WP-046 types after they exist
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Do not configure Odoo, Payload, Supabase, Zulip, Plane, or asset providers.
- Do not add real external write behavior.
- Do not invent Payload/Supabase schemas.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-047-linkskills-linksites-capability-catalog.md`

## Steps

1. Add catalog entries for `cap.crm.odoo_shadow`, `cap.payload.local_sync`, `cap.supabase.mirror_content`, `cap.zulip.run_messaging`, `cap.research.public_web`, `cap.asset.generation`, and `cap.plane.execution_tracking`.
2. Default all write-capable capabilities to mock/shadow-safe policies.
3. Ensure lease idempotency and kill-switch behavior applies to the new capabilities.
4. Add or update tests around lease request, denial, idempotency replay, and live-mode refusal.
5. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- New LinkSites capabilities can be requested through LinkSkills in safe modes.
- Live external writes are disabled by default.
- Tests prove policy, idempotency, and kill-switch behavior.
- No target-app business setup is introduced.

## Proof required

- Relevant LinkSkills tests pass.
