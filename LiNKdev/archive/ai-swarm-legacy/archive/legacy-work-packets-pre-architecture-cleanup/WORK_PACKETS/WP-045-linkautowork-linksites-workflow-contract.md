# WP-045 — LiNKautowork LinkSites workflow contract

## Objective

Define deterministic LiNKautowork workflows required for the LinkSites MVO v2: local artifact write, Supabase mirror update, Payload sync, preview checks, and CRM ready-to-contact update.

## Owner agent

LiNKautowork agent with LinkSkills and Architect review.

## Execution mode

- Codex: contract docs/types and workflow-handle mapping after WP-040/WP-041.
- No n8n/live workflow implementation until contracts are approved.

## Required context

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `LiNKautowork/gateway`

## Allowed files

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`
- LiNKautowork contract/type files only if required and in scope.

## Prohibited files

- Real VPS deployment.
- Real outreach.
- New Payload schema or Supabase mirror schema invention.
- Direct external side effects outside LinkSkills lease policy.

## Tasks

1. Define workflow handles for local artifact write, Supabase mirror update, Payload sync, preview checks, and CRM status update.
2. Define deterministic inputs/outputs for each workflow.
3. Define run ledger refs and audit events.
4. Define local artifact folder behavior for development mode and cloud cold-storage direction for production.
5. Define failure mapping and retry/idempotency rules.
6. Define preview check minimums: required pages, navigation, content blocks, media references, provenance, Payload sync status, and preview readiness.

## Acceptance criteria

- LiNKautowork owns deterministic transformations/checks, not LiNKbot or LiNKaios.
- All side-effecting writes are lease-gated through LinkSkills where applicable.
- Local artifact storage is clearly development-only.
- Production cold storage is documented as future direction, not implemented.

## Required proof

- Files changed.
- Commands run.
- Tests passing if shared SDK contracts change.
- Agent report updated with proof and blockers.
