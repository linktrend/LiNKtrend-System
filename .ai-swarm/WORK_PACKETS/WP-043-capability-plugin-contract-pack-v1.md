# WP-043 — Capability plugin contract pack v1

## Objective

Define connector-only capability plugin contracts required by LinkSites v1: Odoo/CRM shadow-readiness, Payload CMS, Supabase mirror/content, Zulip, public web research, asset generation, and Plane.

## Owner agent

LinkSkills agent with Architect review.

## Execution mode

- Codex: contract definitions and tests after WP-040/WP-041 are stable.
- Architect: boundary review.

## Required context

- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/INTEGRATION_QUEUE.md`

## Allowed files

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/DECISIONS.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`
- LinkSkills catalog/config files only if already established in the repo.

## Prohibited files

- Odoo chart of accounts or accounting configuration.
- Payload schema creation.
- Plane workspace/project policy invention.
- Zulip stream taxonomy invention beyond connector/run-message needs.
- Real outbound sends unless explicitly approved.

## Tasks

1. Define a generic capability plugin manifest shape.
2. Define per-capability operations, modes, auth/config surfaces, idempotency, leases, audit events, and failure mappings.
3. Ensure all capabilities can run in `mock` or `shadow` mode by default.
4. Define Zulip as reusable communication capability usable by LiNKaios, vertical plugins, and LinkBots.
5. Define Odoo/CRM as local/mock write plus Odoo readiness/shadow by default.
6. Define Payload and Supabase mirror as connector contracts pending WP-042 concrete schema discovery.

## Acceptance criteria

- Capability contracts are connector/governance contracts only.
- Each capability declares what it does not own inside the target software.
- LinkSkills lease and audit requirements are explicit.
- No live external side effect is enabled by default.

## Required proof

- Files changed.
- Commands run.
- Tests passing if shared SDK contracts change.
- Agent report updated with proof and blockers.
