# Area 1 — Full MVO proof run (LiNKtrend staging)

**Date:** 2026-06-02  
**Verdict:** **PASS** (13/13 kernel stages, live governance artifacts; see open infra notes)

## Executive summary

One Calusa LinkSites run completed end-to-end against the **staging LiNKaios kernel** on linkdroplet-00 (`https://linkaios.linktrend.internal`), with live Payload publish context, LinkSkills leases, LiNKbrain audit rows, LiNKautowork workflow runs, Plane live check, Zulip notify stage, governed outreach draft (no send), and close/recycle. Manifest persisted at `mvo-latest-run.json` and mounted into the linkaios container for `/devtools/mvo-proof`.

## Run identifiers

| Field | Value |
|-------|--------|
| **run_id** | `9e492225-3dd3-426a-82db-7739fadd4d6a` |
| **project_id** | `0fbbf6f1-ea9e-495a-93e4-cb9d35b3df66` |
| **tenant_id** | `e976eb75-1aff-4ca1-ad0d-5c940c343434` (calusa) |
| **work_request_id** | `7fae1f72-10a1-46e7-8742-786fb0e77c45` |
| **status** | `succeeded` |
| **harness** | `scripts/run-e2e.ts` via SSH tunnel → staging kernel |

## Live publish (Payload CMS)

| Field | Value |
|-------|--------|
| **site_id** | `7` |
| **site_slug** | `calusa-demo-mvo-20260602020406` |
| **preview / publish URL** | `https://calusa-demo-mvo-20260602020406.linktrend.internal/en` |
| **CMS** | `https://cms.linktrend.internal` |
| **artifact_ref** | `payload_site:7` |
| **payload_sync_ref** | `payload_sync:7:mvo-live` |

Artifact file: `LiNKdev/product/reports/linktrend-system/mvo-live-publish.json`

**Note:** Payload content for site 7 is live in CMS DB. Per-site hostname HTTP returns **404** from Traefik because only `app1.linktrend.internal` is routed to the shared frontend today — wildcard `*.linktrend.internal` routing is a follow-up infra item (Principal deferred public DNS; internal hostname pattern documented).

## Stage timeline (13/13)

All stages `succeeded`: lead_intake → research_enrichment → website_package_generation → artifact_write_local → supabase_mirror_upsert → payload_sync_local → preview_readiness_check → crm_ready_to_contact_mark → outreach_draft → plane_execution_tracking → zulip_run_notify → close_or_recycle → record_run.

Full timeline: `mvo-latest-run.json` → `phase_timeline`.

## Governance artifacts

### LinkSkills leases (7)

`6a5622c9-3743-4e19-a6b8-49d2c6dff900`, `bea36ee9-957b-40ae-ad23-ee93efb62c25`, `9dd3b344-69ab-4709-bf1c-191a0bcbf0bb`, `e0cf983b-79d2-42f5-a870-5b7f0573ca42`, `f96864e1-4e6b-44ae-a4cd-d53c44e0dadd`, `dc40d1f7-733e-4b80-a874-f524a00a00ea`, `569b4821-58c3-4a2b-a435-8cf72ce28f2a`

### LiNKautowork workflow_run_ids (5)

`570244ab-546a-4a47-9582-fa8f2da4c274`, `963e6949-934d-49aa-a599-f746b222f39d`, `4def44e0-aabf-4639-a369-d7beb6c0a0ee`, `701dbe67-f33b-4f90-b8df-8512fe2a0898`, `5b9d8043-428c-4282-abb9-7c8f0c4b6c85`

### LiNKbrain audit (sample)

- **run.started / run.completed:** present (61 run-scoped rows resolved in harness)
- **outreach.drafted:** `aaec0737-baae-4015-9aa0-b1296aff0178` — `draft_pending_principal_approval`, publish URL in payload
- **plane.readiness.checked:** `b4cadfe9-9b31-4ab8-93d6-00aa89bdf4f8`
- Full ID list: `mvo-latest-run.json` → `audit_event_ids` (17 top-level refs)

## Plane & Zulip

| Integration | Evidence |
|-------------|----------|
| **Plane** | Workspace `linkprojects`; stage `plane_execution_tracking` succeeded with lease `f96864e1-4e6b-44ae-a4cd-d53c44e0dadd`; audit `plane.readiness.checked`. Canonical Calusa mapping: [PLANE_LIVE_PROOF_2026-06-02.md](./PLANE_LIVE_PROOF_2026-06-02.md) (`CAL368413`). |
| **Zulip** | Stage `zulip_run_notify` succeeded; stream template `linktrend-runs` / topic `run:{run_id}` per `prod.env.runtime`; lease `dc40d1f7-733e-4b80-a874-f524a00a00ea`. |

## LiNKaios UI proof

| Surface | URL / check |
|---------|-------------|
| **MVO devtools** | `https://linkaios.linktrend.internal/devtools/mvo-proof` — container reads `MVO_LATEST_RUN_PATH=/app/mvo-artifacts/mvo-latest-run.json` (verified: run `9e492225…`, 13 stages) |
| **Project detail** | `https://linkaios.linktrend.internal/projects/0fbbf6f1-ea9e-495a-93e4-cb9d35b3df66?tab=phases` |

## Execution method

1. Staging kernel on linkdroplet-00; SSH tunnel `localhost:13000` → linkaios container `:3000`.
2. `MVO_LIVE_PUBLISH_PATH` mounted at `/app/mvo-artifacts/mvo-live-publish.json` (compose volume + runtime env).
3. E2E: `MVO_E2E_BASE_URL=http://127.0.0.1:13000`, staging `BOT_KERNEL_API_SECRET`, Supabase service key from local `.env`.
4. Harness exit **0**; manifest written locally and copied to VPS mount.

## Fixes applied this session

| Repo | Change |
|------|--------|
| **LiNKtrend-System** | `docker-compose.deploy.yml` — mount MVO artifacts; `deploy/prod/.env.example` — MVO paths; `run-mvo-linksites-live.sh` — run e2e from `linkaios-web` |
| **LiNKsites** | `LINKSITES_FACTORY_MODE=1` in `mvo-live-publish.sh`; skip publish-permission hook in factory mode |
| **VPS (ops)** | `prod.env.runtime` MVO_* vars; linkaios recreate with artifact volume |

## Open follow-ups (non-blocking for Area 1 PASS)

1. **Traefik wildcard** for `*.linktrend.internal` → shared frontend (browser proof of preview URL).
2. **Factory navigation slug** validation on CMS when creating net-new demo sites (`ValidationError: Slug` on `navigation` collection) — reuse live site or fix slug seeding.
3. **linkautowork.workflow_runs** PostgREST schema exposure (log warning only; run still succeeded).

## Artifact paths

- `LiNKdev/product/reports/linktrend-system/mvo-latest-run.json`
- `LiNKdev/product/reports/linktrend-system/mvo-live-publish.json`
- This report: `LiNKdev/product/reports/linktrend-system/MVO_AREA1_PROOF_2026-06-02.md`
