# WP-091 Agent Prompt - LinkSites Supabase Mirror and Payload Sync

Recommended model/tool: Cursor Kimi K2.5 or Gemini 3.1 Pro. Do not use Codex unless the user explicitly spends the remaining Codex budget. Do not use Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-091-linksites-supabase-payload-sync.md`, but reconcile with the current post-WP-071/WP-090 implementation before editing.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-091 -b dev/cursor/WP-091-linksites-supabase-payload-sync origin/development
cd ../LiNKtrend-System-WP-091
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_COMPLETION_PLAN.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-091-linksites-supabase-payload-sync.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` WP-071 and WP-090 sections
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `LiNKautowork/gateway/src/lib/supabase-client.ts`
- `LiNKautowork/gateway/src/lib/payload-client.ts`
- `LiNKautowork/gateway/src/workflows/linksites-v2.test.ts`
- `LiNKautowork/gateway/src/lib/linksites-v2.integration.test.ts`
- `/Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json` if present
- `/Users/linktrend/Projects/LiNKsites/supabase/schemas/lsites_core.schema.json` if present

## Mission

Harden the existing `autowork.linksites.supabase_mirror_upsert` and `autowork.linksites.payload_sync_local` handlers so their mapping and lease/idempotency behavior are grounded in the discovered LinkSites Supabase/Payload schema evidence.

## Current-State Reconciliation

WP-071 already added these handles in `LiNKautowork/gateway/src/workflows/linksites-v2.ts` plus typed adapter clients. Do not create duplicate workflow files under obsolete packet paths. Improve the current gateway implementation and tests.

## Scope

Allowed:

- Update `LiNKautowork/gateway/src/workflows/linksites-v2.ts`.
- Update `LiNKautowork/gateway/src/lib/supabase-client.ts` and `LiNKautowork/gateway/src/lib/payload-client.ts`.
- Add small mapping helpers under `LiNKautowork/gateway/src/lib/` if needed.
- Add or extend focused tests under `LiNKautowork/gateway/src/`.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.

Hard boundaries:

- Do not invent new Supabase or Payload schemas.
- Do not modify `/Users/linktrend/Projects/LiNKsites`.
- Do not use production credentials.
- Do not loosen LinkSkills `lease_id` requirements.
- Do not edit preview readiness or CRM handlers except to keep shared tests passing.

## Required Behavior

- `supabase_mirror_upsert` must require `lease_id`.
- `payload_sync_local` must require `lease_id`.
- Missing lease must return canonical lease failure (`LEASE_REQUEST_INVALID` or equivalent existing contract).
- Mapping defaults must be traceable to WP-042 discovery (`lsites_core`, `cms-mapping.json`, Payload collection names).
- Deterministic dev fallback remains allowed when local services are not configured, but must be explicit and tested.
- Idempotency/replay behavior must remain intact through the existing workflow runner.

## Proof Required

- `pnpm --filter @linktrend/autowork-gateway test -- src/workflows/linksites-v2.test.ts src/lib/linksites-v2.integration.test.ts`
- Report exactly which discovered schema/mapping file(s) informed the adapter defaults.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `fix: align LinkSites sync adapters with discovered schemas`
Push branch to GitHub.
