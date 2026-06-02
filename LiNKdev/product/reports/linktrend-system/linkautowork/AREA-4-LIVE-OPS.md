# Area 4 — LiNKautowork / n8n live operational

**Date:** 2026-06-02  
**GSM project:** `linkbot-901208`

## LinkSites workflow handles → n8n webhook paths

| Handle | n8n webhook path | Template file |
|--------|------------------|---------------|
| `autowork.linksites.artifact_write_local` | `/webhook/linksites-artifact_write_local` | `LiNKautowork/automations/templates/linksites-artifact_write_local.json` |
| `autowork.linksites.supabase_mirror_upsert` | `/webhook/linksites-supabase_mirror_upsert` | `linksites-supabase_mirror_upsert.json` |
| `autowork.linksites.payload_sync_local` | `/webhook/linksites-payload_sync_local` | `linksites-payload_sync_local.json` |
| `autowork.linksites.preview_readiness_check` | `/webhook/linksites-preview_readiness_check` | `linksites-preview_readiness_check.json` |
| `autowork.linksites.crm_ready_to_contact_mark` | `/webhook/linksites-crm_ready_to_contact_mark` | `linksites-crm_ready_to_contact_mark.json` |

Import prod templates:

```bash
cd /Users/linktrend/Projects/LiNKautowork
GCP_PROJECT_ID=linkbot-901208 ops/import-templates-to-n8n.sh prod
ops/export-live-from-n8n.sh prod
```

Record returned workflow **IDs** from export under `automations/live/prod/`.

## Runtime env (staging / prod)

| Variable | Where | Purpose |
|----------|-------|---------|
| `LINKAUTOWORK_MVO_MODE=live` | linkaios + autowork | Real Payload + Supabase (not mock client) |
| `LINKAUTOWORK_DISPATCH_MODE=live` | linkaios | Kernel uses `invokeWorkflow` (UUID `workflow_run_id`) |
| `AUTOWORK_MODE=n8n` | optional gateway | `invokeWorkflow` → n8n webhook → LiNKaios internal invoke |
| `AUTOWORK_MODE=handler` | linkaios default | In-process SDK handlers |
| `LINKAUTOWORK_PAYLOAD_BASE_URL` | both | `https://cms.linktrend.internal` |
| `LINKAUTOWORK_PAYLOAD_API_KEY` | GSM `LINKTREND_LINKSITES_PROD_PAYLOAD_API_KEY` | Payload CMS |
| `LINKAUTOWORK_SUPABASE_URL` | linkaios | AdminDB URL |
| `LINKAUTOWORK_SUPABASE_SERVICE_ROLE_KEY` | GSM `LINKTREND_AIOS_PROD_SUPABASE_SERVICE_ROLE` | Mirror upsert |
| `LINKAUTOWORK_ARTIFACT_ROOT` | VPS path | Production artifact writes |
| `LINKAIOS_AUTOWORK_INVOKE_URL` | n8n container | `https://linkaios.linktrend.internal/api/internal/autowork/workflows/invoke` |
| `LINKAUTOWORK_INVOKE_SECRET` | GSM `LINKTREND_AIOS_PROD_AUTOWORK_INVOKE_TOKEN` | Internal invoke auth |
| `N8N_BASE_URL` | linkaios / gateway | `https://n8n.linktrend.internal` |
| `N8N_API_KEY` | GSM `LINKAUTOWORK_N8N_API_KEY_PROD` | n8n Admin API |

## Kernel dispatch

`LiNKaios/linkaios-web/src/lib/kernel/dispatch.ts` calls `invokeLinkAutoworkWorkflow` when `LINKAUTOWORK_DISPATCH_MODE` is `live` (default outside `NODE_ENV=test`).

Audit: `workflow.invoked` / `workflow.completed|failed` via gateway `audit-emitter` → LiNKbrain RPC.

Persisted runs: `linkautowork.workflow_runs` (migration `20260602140000_linkautowork_workflow_runs.sql`).

## Verification

```bash
export LINKAUTOWORK_INVOKE_SECRET="$(gcloud secrets versions access latest --project linkbot-901208 --secret LINKTREND_AIOS_PROD_AUTOWORK_INVOKE_TOKEN)"
export N8N_API_KEY="$(gcloud secrets versions access latest --project linkbot-901208 --secret LINKAUTOWORK_N8N_API_KEY_PROD)"
./scripts/verify-linkautowork-live.sh
```

Optional n8n path:

```bash
VERIFY_N8N_WEBHOOK=1 ./scripts/verify-linkautowork-live.sh
```

## GSM secrets to ensure exist

- `LINKAUTOWORK_N8N_API_KEY_PROD`
- `LINKAUTOWORK_LINK_SERVICE_TOKEN_N8N_PROD`
- `LINKTREND_AIOS_PROD_AUTOWORK_INVOKE_TOKEN` (new — shared with `BOT_KERNEL_API_SECRET` if unified)
- `LINKTREND_LINKSITES_PROD_PAYLOAD_API_KEY`
- `LINKTREND_AIOS_PROD_SUPABASE_SERVICE_ROLE`
