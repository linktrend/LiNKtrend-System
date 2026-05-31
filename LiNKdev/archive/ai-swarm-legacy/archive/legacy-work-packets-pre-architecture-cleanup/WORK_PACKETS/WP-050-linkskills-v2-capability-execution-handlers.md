# WP-050 - LinkSkills v2 capability execution handlers

## Objective

Implement mock/shadow-safe LinkSkills execution handlers for the LinkSites v2 capability set so kernel stages can request, grant, and execute governed capabilities without live external writes.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-050-linkskills-v2-capability-execution-handlers`

## Allowed files

- `LiNKskills/services/logic-engine/**`
- `services/migrations/*.sql` only if additive and uniquely numbered
- `packages/linklogic-sdk/src/**` only for narrow imports after WP-046
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Do not perform live Zulip/Odoo/Payload/Supabase/Plane/Postiz writes.
- Do not define Odoo chart of accounts, CRM stages, Payload schemas, Supabase mirror schemas, Zulip stream taxonomy, or Plane workspace setup.
- Do not bypass leases, idempotency, kill switches, or audit.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` sections `0.A.5.1`, `5.4`, `6.2`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/WORK_PACKETS/WP-050-linkskills-v2-capability-execution-handlers.md`
- `LiNKskills/services/logic-engine/src/**`

## Steps

1. Extend the logic-engine handler routing for the seven LinkSites v2 capabilities.
2. For each capability, implement mock/shadow-safe execution outputs matching the contract surface.
3. Enforce live-mode refusal for write-capable capabilities unless a future explicit live configuration exists.
4. Preserve idempotent replay, kill-switch behavior, and canonical failure mapping.
5. Emit or return audit/output refs consistently with the existing lease execution model.
6. Add tests for happy path, live-mode refusal, kill switch, idempotent replay, and canonical failure mapping.
7. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- LinkSites v2 capability executions work in mock/shadow-safe mode.
- Live writes remain disabled by default.
- Tests prove lease governance and idempotency.
- No target-app business configuration is introduced.

## Proof required

- Relevant LinkSkills logic-engine tests and typecheck pass.
