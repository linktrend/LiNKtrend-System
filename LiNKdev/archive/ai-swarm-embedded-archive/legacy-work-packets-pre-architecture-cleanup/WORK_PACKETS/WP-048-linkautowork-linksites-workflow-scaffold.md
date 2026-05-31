# WP-048 - LiNKautowork LinkSites workflow scaffold

## Objective

Implement safe development-mode scaffolds for the five LinkSites v2 deterministic workflow handles defined in WP-045.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-048-linkautowork-linksites-workflow-scaffold`

## Allowed files

- `LiNKautowork/gateway/**`
- `packages/linklogic-sdk/src/**` only if needed to import WP-046 types after they exist
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`

## Prohibited files

- Do not deploy to VPS, DigitalOcean, or any public host.
- Do not write to real Odoo, Payload Cloud, Plane, Zulip, or external asset providers.
- Do not invent Payload or Supabase schemas.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` section `0.A.10.1`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-048-linkautowork-linksites-workflow-scaffold.md`

## Steps

1. Add scaffold handlers for:
   - `autowork.linksites.artifact_write_local`
   - `autowork.linksites.supabase_mirror_upsert`
   - `autowork.linksites.payload_sync_local`
   - `autowork.linksites.preview_readiness_check`
   - `autowork.linksites.crm_ready_to_contact_mark`
2. Enforce lease presence for side-effecting write handles.
3. Make local artifact writing development-only and idempotent.
4. Return stable workflow run ids and deterministic outputs on replay.
5. Add tests for happy path, replay, missing lease, and readiness failure.
6. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- All five handles are callable in development mode.
- Replays do not duplicate side effects.
- Missing or invalid leases fail closed for write handles.
- No real external integration is contacted.

## Proof required

- Relevant LiNKautowork gateway tests pass.
