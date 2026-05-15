# WP-052 - LinkSites v2 E2E flow harness

## Objective

Create the first end-to-end harness for the LinkSites v2 development-mode flow, proving the kernel, LinkSkills, LiNKautowork, audit refs, preview readiness, and CRM `ready_to_contact` status work together.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-052-linksites-v2-e2e-flow-harness`

## Allowed files

- `scripts/**`
- `apps/linkaios-web/src/**` only for harness support or test fixtures
- `packages/linklogic-sdk/src/**` only for imports/tests
- `.ai-swarm/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

## Prohibited files

- Do not contact live Zulip/Odoo/Postiz/DigitalOcean services.
- Do not deploy to VPS or public hosting.
- Do not modify real Payload/Odoo/Postiz configuration.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-052-linksites-v2-e2e-flow-harness.md`
- Existing `scripts/run-e2e.ts` or MVO E2E harness

## Steps

1. Extend or add an E2E script for the v2 flow using mock CRM lead input.
2. Assert research/content/package stages, local artifact output, Supabase mirror mock/shadow output, Payload sync mock/local output, preview readiness, and CRM `ready_to_contact`.
3. Assert non-empty `lease_ids`, `workflow_run_ids`, and `audit_event_ids` for all stages that perform work.
4. Assert no real lead acquisition, outreach, VPS deployment, or live external write was attempted.
5. Update runbook/report with exact command and proof output.

## Acceptance criteria

- V2 E2E harness can be run repeatably in development mode.
- Final status is success or a documented expected blocker with canonical failure code.
- Trace/status output contains all required refs.

## Proof required

- Passing E2E command output, or a precise blocker report with canonical failure code and next fix owner.
