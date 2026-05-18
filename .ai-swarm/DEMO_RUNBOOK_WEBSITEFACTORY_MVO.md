# WebsiteFactory MVO Demo Runbook (WP-018)

## Purpose

Reproduce the `websitefactory.lead_to_preview` MVO flow end-to-end on local LiNKaios with real Supabase-backed state and stubbed CRM/Plane/preview integrations.

## 1) Setup prerequisites

### Supabase project and schema exposure

1. Use a Supabase project with valid API keys and DB connection string.
2. In Supabase Dashboard, expose these PostgREST schemas (Project Settings -> Data API/API -> Exposed schemas):
   - `linkaios`
   - `bot_runtime`
   - `prism`
   - `gateway`
   - `linkaios_kernel`
   - `linkskills`
   - `linkbrain`
3. If `pnpm db:migrate` fails with `ENOTFOUND` on `db.<project>.supabase.co`, switch `DATABASE_URL` to the Session pooler URI.

### Required env var names

Set in repo-root `.env` (from `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `BOT_KERNEL_API_SECRET`
- `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true` for automation using `BOT_KERNEL_API_SECRET`
- `MVO_E2E_BASE_URL` (optional; set when dev server is not on `http://localhost:3000`, for example `http://localhost:3001`)

### Migration command

```bash
pnpm db:migrate
```

### Dev server command

```bash
pnpm --filter @linktrend/linkaios-web dev
```

For fresh clean UI/UX worktrees, run this once before `dev` to build internal workspace packages required by `@linktrend/linkaios-web`:

```bash
pnpm dev:uiux:prepare
```

If your local `3000` is occupied, start with an explicit port (example `3001`) and export the same base URL for E2E:

```bash
PORT=3001 LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm --filter @linktrend/linkaios-web dev
```

### E2E command

In a second terminal, run:

```bash
LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e
```

When using a non-default dev port, include `MVO_E2E_BASE_URL`:

```bash
MVO_E2E_BASE_URL=http://localhost:3001 LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e
```

`scripts/run-e2e.ts` uses `Authorization: Bearer $BOT_KERNEL_API_SECRET`; set `BOT_KERNEL_API_SECRET` and `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true` in the dev server environment.

Local secret-safe probe path (never echo secret in logs):

```bash
set -a && source .env && set +a
curl -i -H "Authorization: Bearer $BOT_KERNEL_API_SECRET" "http://localhost:3000/api/kernel/approvals?tenant_id=test"
```

## 2) Demo flow (operator actions)

1. Submit lead: `POST /api/kernel/work-request` creates work request + `run_id`.
2. Execute run: `POST /api/kernel/run/{run_id}/execute` until status is terminal.
3. Approve preview publish: when status is `awaiting_approval`, list via `GET /api/kernel/approvals?tenant_id=...`, then grant via `POST /api/kernel/approvals?approval_id=...`.
4. Inspect trace: `GET /api/kernel/run/{run_id}/trace`.
5. Open preview URL: use `preview_output.preview_url` from trace.

The provided E2E script automates steps 1-4.

## 3) Expected proof in trace output

From `GET /api/kernel/run/{run_id}/trace`:

- `run.run_id`
- `preview_output.preview_artifact_ref`
- `preview_output.lease_ids` (non-empty for successful full flow)
- `preview_output.workflow_run_ids`
- `preview_output.audit_event_ids`

Also confirm terminal `run.status` is `succeeded` for full demo proof.

## 4) Known MVO stubs and boundaries

- CRM stub (`DECISIONS.md` D-01 / `INTEGRATION_QUEUE.md` INT-020):
  - Local `linkskills` tables (`mvo_crm_contacts`, `mvo_crm_records`) and lease-gated `crm.upsert`.
- Plane stub (`DECISIONS.md` D-02 / INT-021):
  - Local `linkskills` tables (`mvo_projects`, `mvo_tasks`) and lease-gated project/task creation.
- Preview stub (`DECISIONS.md` D-03 / INT-022):
  - Static/local preview route served by LiNKaios; no DigitalOcean-hosted preview or full Payload publish in MVO.
- LiNKbot/OpenRouter:
  - MVO uses OpenRouter routing decision (D-06), but behavior may be mocked/stubbed in test paths; demo acceptance is based on contract outputs, refs, and audit trail rather than model quality.

## 5) Demo command checklist

- [ ] `pnpm install`
- [ ] `pnpm db:migrate`
- [ ] `pnpm --filter @linktrend/linkaios-web dev`
- [ ] `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e`
- [ ] `curl -H "Authorization: Bearer $BOT_KERNEL_API_SECRET" http://localhost:3000/api/kernel/run/<run_id>/trace`

## 6) WP-052 LinkSites v2 harness proof snapshot (2026-05-15)

- Command:
  - `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e`
- Observed output:
  - `✅ Created run: d0cc222f-2cf7-4c65-b924-b929f1f1d867`
  - `⏳ Execute returned status: succeeded`
  - `4. Assertions passed`
  - `required_v2_stages_verified: 11`
  - `crm_ready_to_contact_verified: true`
- Notes:
  - Harness now proves development-mode v2 flow end-to-end with trace refs and `ready_to_contact`.
