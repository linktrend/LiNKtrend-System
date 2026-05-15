# WP-015 — Real CRM integration cutover (Chatwoot/Odoo)

## Objective

Replace the MVO local CRM stub path with a real CRM adapter path (Chatwoot and/or Odoo) while preserving lease/audit/idempotency contracts.

## Owner agent

integration-agent (primary), linkskills-agent (co-owner)

## Execution mode

- Codex: implementation, API adapter, contract tests
- Antigravity: end-to-end UI/browser verification in LiNKaios trace and CRM-visible record checks
- Architect: final decision on Chatwoot-first vs Odoo-first and production cutover checklist

## Allowed files

- `apps/linkaios-web/**` (only CRM integration wiring points)
- `packages/linklogic-sdk/**` (shared CRM adapter contracts only)
- `packages/db/**` (persistence handoff/idempotency helpers)
- `services/migrations/**` (minimal CRM mapping tables if required)
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- LEXOS/legal vertical code
- Plane integration implementation
- LiteLLM gateway implementation
- Broad kernel refactors unrelated to CRM integration
- Secrets committed to repo files

## Dependencies

- MVO sign-off complete (WP-013 accepted)
- WP-007 lease lifecycle and WP-010 orchestration stable
- CRM provider credentials/env path available outside git

## Required proof

- Contract tests: `crm.upsert` still returns canonical `CrmUpsertResult`
- Run trace proof: non-empty `lease_ids`, `audit_event_ids`, and external CRM reference
- Failure-mode proof: CRM outage maps to canonical `INTEGRATION_*` error code without silent success
- Agent reports updated with commands, changed files, and rollback steps

## Out of scope

Dual-write migration of historical MVO stub records unless explicitly approved.
