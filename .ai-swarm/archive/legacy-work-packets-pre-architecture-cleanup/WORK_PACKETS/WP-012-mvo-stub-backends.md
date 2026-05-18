# WP-012 — MVO stub backend reconciliation and preview artifact support

## Objective

Reconcile and validate the MVO stub backends after WP-007, then add any missing preview artifact support needed for the integrated demo. WP-007 already implemented CRM/Plane stub tables and RPCs in `services/migrations/024_linkskills_capability_lease.sql`; this packet must not duplicate that work.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` §11
- `.ai-swarm/DECISIONS.md` D-01, D-02, D-03
- `.ai-swarm/INTEGRATION_QUEUE.md` INT-020, INT-021, INT-022
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`
- `services/migrations`
- `packages/db`
- `services/migrations/024_linkskills_capability_lease.sql`

## Allowed files

- `services/migrations/**`
- `packages/db/**`
- backend/helper files needed by LinkSkills stub backends in this repo
- preview artifact storage/route helpers owned by LiNKaios if WP-010 defines them
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

## Prohibited files

- Real Chatwoot/Odoo clients
- Real Plane API clients
- DigitalOcean/Payload publish integrations
- LiNKbot reasoning
- LiNKautowork workflow bodies except agreed storage handoff interfaces
- Secrets, env files, deployment config

## Dependencies

- Coordinate with WP-006 for audit event writing.
- Start after WP-007 and the WP-008 follow-up fix pass are complete.
- Treat WP-007 as the source of the existing CRM/Plane stub implementation unless a blocking defect is found.
- Coordinate with WP-008/WP-010 for preview artifact handoff.

## Tasks

1. Inspect and validate the WP-007 stub backend implementation in `services/migrations/024_linkskills_capability_lease.sql`:
   - `mvo_crm_contacts`
   - `mvo_crm_records`
   - `mvo_projects`
   - `mvo_tasks`
2. Verify the tables/RPCs satisfy `CONTRACTS_MVO.md` §11:
   - CRM idempotent per `(tenant_id, lead_id)`.
   - Plane project idempotent per `(tenant_id, lead_id)`.
   - Plane task idempotent per `(project_id, title_normalized)`.
   - CRM email/phone are hashed and plaintext contact PII is not stored.
   - Helpers return canonical result shapes from §7.
3. If a blocking defect exists in the WP-007 stub implementation, patch it in place with the smallest migration/helper change possible. Do not create duplicate tables.
4. Add preview artifact storage support required for `preview_artifact_ref` only if it is not already covered by the WP-008 workflow and WP-010 route/storage design.
5. Add tests or migration validation for the reconciled stub behavior.
6. Update `.ai-swarm/AGENT_REPORTS/integration-agent.md`.
7. If WP-007 already fully satisfies CRM/Plane stub requirements, mark those portions as accepted/reused and focus only on preview artifact handoff gaps.

## Acceptance criteria

- Existing WP-007 stub tables are validated or minimally patched; no duplicate CRM/Plane tables are introduced.
- Stub tables exist with uniqueness/idempotency constraints.
- CRM and Plane stubs do not call external services.
- Preview artifact support can return a stable `preview_artifact_ref`.
- All side effects are designed to run behind LinkSkills leases.

## Required proof

- Migration/test command output or SQL validation output.
- Agent report includes table names, uniqueness constraints, sample result shapes, and whether each stub was reused from WP-007 or patched in WP-012.
- Agent report explicitly states whether preview artifact support is already satisfied by WP-008/WP-010 or what was added here.

## Out of scope

Real CRM/Plane/DigitalOcean/Payload integration, UI, LiNKbot reasoning, n8n workflow implementation.
