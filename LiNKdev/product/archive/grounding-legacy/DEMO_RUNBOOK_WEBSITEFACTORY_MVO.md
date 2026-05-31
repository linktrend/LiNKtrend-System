# WebsiteFactory MVO Demo Runbook (WP-018 + WP-113 Hardened)

## Purpose

Reproduce the `websitefactory.lead_to_preview` MVO flow end-to-end on local LiNKaios with hardened WP-090 through WP-093 behavior:
- WP-090: Audit persistence verification
- WP-091: Deterministic workflow execution tracking
- WP-092: Fail-closed readiness + CRM gate
- WP-093: Development-only boundaries (no live outreach/VPS)

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

**Note:** No production credentials, VPS config, or live outreach credentials are required. This is development-mode only.

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

### E2E command (Hardened)

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
3. Approve capability leases: when status is `awaiting_approval`, list via `GET /api/kernel/approvals?tenant_id=...`, then grant via `POST /api/kernel/approvals?approval_id=...`.
4. Inspect trace: `GET /api/kernel/run/{run_id}/trace`.
5. Verify hardened assertions:
   - All required v2 stages present (11 stages)
   - Audit refs present for all side-effect stages
   - Workflow refs present for deterministic stages
   - Lease IDs present for capability-gated stages
   - `preview_readiness_check` has `checks_passed: true`
   - `crm_ready_to_contact_mark` has `lead_status: ready_to_contact`
6. Open preview URL: use `preview_output.preview_url` from trace (local dev mode only).

The provided E2E script automates steps 1-5 with hardened assertions.

## 3) Expected proof in trace output

From `GET /api/kernel/run/{run_id}/trace`:

- `run.run_id`
- `preview_output.preview_artifact_ref`
- `preview_output.lease_ids` (non-empty for successful full flow)
- `preview_output.workflow_run_ids`
- `preview_output.audit_event_ids`
- `stages[].refs.audit_event_ids` for each side-effect stage
- `stages[].refs.workflow_run_ids` for each deterministic stage
- `stages[].refs.lease_ids` for each capability-gated stage

### Hardened v2 Stage Trace

| # | Stage | Plane | Side Effect? | Lease Required? | Workflow? | Audit Events |
|---|-------|-------|--------------|-----------------|-----------|--------------|
| 1 | `lead_intake` | linkaios | No | — | — | `run.started`, `stage.started`, `stage.completed` |
| 2 | `research_enrichment` | linkbot | No | — | — | `stage.started`, `stage.completed` |
| 3 | `website_package_generation` | linkbot | No | — | — | `stage.started`, `stage.completed` |
| 4 | `artifact_write_local` | linkautowork | No | — | Yes | `stage.started`, `workflow.invoked`, `workflow.completed`, `stage.completed` |
| 5 | `supabase_mirror_upsert` | linkautowork | **Yes** | **Yes** | Yes | `stage.started`, `lease.requested`, `lease.granted`, `lease.executed`, `workflow.invoked`, `workflow.completed`, `stage.completed` |
| 6 | `payload_sync_local` | linkautowork | **Yes** | **Yes** | Yes | `stage.started`, `lease.requested`, `lease.granted`, `lease.executed`, `workflow.invoked`, `workflow.completed`, `stage.completed` |
| 7 | `preview_readiness_check` | linkautowork | No | — | Yes | `stage.started`, `workflow.invoked`, `preview.readiness.checked`, `workflow.completed`, `stage.completed` |
| 8 | `crm_ready_to_contact_mark` | linkautowork | **Yes** | **Yes** | Yes | `stage.started`, `lease.requested`, `lease.granted`, `lease.executed`, `workflow.invoked`, `workflow.completed`, `crm.lead.status.updated`, `stage.completed` |
| 9 | `plane_execution_tracking` | linkautowork | **Yes** (mock) | **Yes** | — | `stage.started`, `lease.executed`, `plane.project.upserted`, `plane.task.upserted`, `stage.completed` |
| 10 | `zulip_run_notify` | linkautowork | **Yes** (mock) | **Yes** | — | `stage.started`, `lease.executed`, `zulip.notification.queued`, `stage.completed` |
| 11 | `record_run` | linkbrain | No (persist) | — | — | `run.completed` with full ref closure |

Also confirm terminal `run.status` is `succeeded` for full demo proof.

## 4) Known MVO stubs and boundaries (WP-093)

- **CRM stub** (`DECISIONS.md` D-01 / `INTEGRATION_QUEUE.md` INT-020):
  - Local `linkskills` tables (`mvo_crm_contacts`, `mvo_crm_records`) and lease-gated `crm.upsert`.
  - **No live Chatwoot/Odoo writes in development mode.**
- **Plane stub** (`DECISIONS.md` D-02 / INT-021):
  - Local `linkskills` tables (`mvo_projects`, `mvo_tasks`) and lease-gated project/task creation.
  - **No outbound HTTP to Plane API in development mode.**
- **Preview stub** (`DECISIONS.md` D-03 / INT-022):
  - Static/local preview route served by LiNKaios; **no DigitalOcean-hosted preview, no VPS, no DNS, no TLS.**
  - Preview URL is `http://localhost:3000/...` or similar local development URL only.
- **Supabase mirror** (`INTEGRATION_QUEUE.md` INT-040):
  - Uses local Supabase project; **no production mirror writes.**
- **Payload sync** (`INTEGRATION_QUEUE.md` INT-041):
  - Uses local Payload CMS if configured; graceful degradation to mock mode if not running.
- **Zulip notifications** (`INTEGRATION_QUEUE.md` INT-042):
  - Mock mode by default; **no live Zulip messages in development mode.**
- **Lead Scout Bot**: Declared but **disabled** (WP-093 boundary).
- **Outreach Bot**: Declared but **disabled** (WP-093 boundary).
- **LinkBot/OpenRouter**:
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

## 7) WP-113 Hardened E2E Harness proof snapshot (2026-05-17)

- Command:
  - `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e`
- Expected output:
  - `=================================================================`
  - `LinkSites v2 Hardened E2E Harness (WP-090 through WP-093)`
  - `=================================================================`
  - `[WP-090] Phase 1: Submitting deterministic Work Request...`
  - `✅ Created run: <uuid>`
  - `   Idempotency key: e2e-hardened-<timestamp>`
  - `[WP-091] Phase 2: Executing deterministic Run Loop...`
  - `⏳ Execute returned status: running (attempt 1)`
  - `⏳ Execute returned status: awaiting_approval (attempt N)`
  - `   Approving <capability_id> (ID: <approval_id>)...`
  - `⏳ Execute returned status: succeeded (attempt M)`
  - `[WP-092] Phase 3: Hardened Trace Data Verification...`
  - `   Found 11 stages in trace`
  - `   Verifying required v2 stages...`
  - `   ✓ lead_intake`
  - `   ✓ research_enrichment`
  - `   ✓ website_package_generation`
  - `   ✓ artifact_write_local`
  - `   ✓ supabase_mirror_upsert`
  - `   ✓ payload_sync_local`
  - `   ✓ preview_readiness_check`
  - `   ✓ crm_ready_to_contact_mark`
  - `   ✓ plane_execution_tracking`
  - `   ✓ zulip_run_notify`
  - `   ✓ record_run`
  - `   Verifying forbidden stages absent (fail-closed)...`
  - `   ✓ lead_scout absent`
  - `   ✓ outreach absent`
  - `   ✓ publish_live absent`
  - `   ✓ deploy_vps absent`
  - `   Verifying audit refs (WP-090 hardened)...`
  - `   ✓ artifact_write_local: N audit events`
  - `   ✓ supabase_mirror_upsert: N audit events`
  - `   ... (all side-effect stages)`
  - `   Verifying workflow refs (WP-091 deterministic)...`
  - `   ✓ artifact_write_local: N workflow runs`
  - `   ... (all deterministic stages)`
  - `   Verifying lease refs (WP-092 fail-closed)...`
  - `   ✓ supabase_mirror_upsert: N lease(s)`
  - `   ... (all capability-gated stages)`
  - `   ✓ preview_url is development-mode only`
  - `   Verifying preview readiness gate (WP-092)...`
  - `   ✓ Readiness checks passed`
  - `   ✓ Validated N pages, N content blocks`
  - `   Verifying CRM gate (WP-092 fail-closed)...`
  - `   ✓ CRM status promoted to ready_to_contact with valid check_report_ref`
  - `   Verifying final outputs...`
  - `   ✓ All final outputs present`
  - `[WP-090] Phase 4: LiNKbrain Audit Persistence Verification...`
  - `   ✓ Resolved N audit events by ID`
  - `   ✓ Resolved N run-scoped audit events`
  - `   ✓ Found audit action: run.started`
  - `   ✓ Found audit action: run.completed`
  - `   ✓ Found audit action: workflow.invoked`
  - `   ✓ Found audit action: workflow.completed`
  - `=================================================================`
  - `HARDENED E2E ASSERTIONS PASSED`
  - `=================================================================`
  - `Run ID: <uuid>`
  - `Preview URL: http://localhost:3000/...`
  - `Preview Artifact: <ref>`
  - `Lease IDs: N`
  - `Workflow Run IDs: N`
  - `Audit Event IDs: N`
  - `Required v2 Stages: 11`
  - `CRM Ready to Contact: true`
  - `Readiness Checks Passed: true`
  - `Run-scoped Audit Rows: N`
  - `=================================================================`
  - `WP-090: Audit persistence - VERIFIED`
  - `WP-091: Deterministic workflow execution - VERIFIED`
  - `WP-092: Fail-closed readiness + CRM gate - VERIFIED`
  - `WP-093: Development-only boundaries - VERIFIED`
  - `✅ All hardened E2E assertions passed`

## 8) Canonical Blocker Outputs (Expected Failures)

If the E2E harness produces a failure, it will be one of these canonical blockers:

### `WORKFLOW_STEP_FAILED` (Readiness Check Failed)
- **Cause**: `preview_readiness_check` determined the site is not ready.
- **WP-092 Behavior**: This is the fail-closed behavior working correctly.
- **Resolution**: Ensure earlier stages produce valid outputs that meet readiness criteria.

### `LEASE_REQUEST_INVALID` (Missing Lease)
- **Cause**: A side-effecting stage was invoked without a valid LinkSkills lease.
- **WP-092 Behavior**: Fail-closed enforcement - all capability-gated actions require a lease.
- **Resolution**: Ensure LinkSkills lease is requested and granted before capability execution.

### `INTEGRATION_UNAVAILABLE` (Service Not Configured)
- **Cause**: Local Supabase or Payload CMS is not running or not configured.
- **WP-093 Behavior**: Development-mode services may be absent; harness should handle gracefully.
- **Resolution**: Start local Supabase (`supabase start`) and/or Payload CMS if testing full integration.

### `KERNEL_DISPATCH_FAILED` (Kernel Error)
- **Cause**: Kernel could not dispatch to a plane or service.
- **Resolution**: Check kernel logs and ensure all required services are registered.

## 9) Evidence of No Production Config

To verify no production credentials or services are required:

1. **Check `.env` variables**: Only `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, etc. for local Supabase.
2. **Check preview URL**: Must be `http://localhost:*` or similar local URL, never `https://*.linktrend.com` or DigitalOcean.
3. **Check lease destinations**: All capability leases are mock/shadow mode; no live Odoo, Plane, Zulip, or Postiz.
4. **Check CRM status**: Mock/local tables only; no Chatwoot/Odoo API calls.
5. **Check deployment**: No VPS, DNS, or TLS configuration required.

## 10) Files Changed in WP-113

- `scripts/run-e2e.ts` - Updated with hardened WP-090 through WP-093 assertions
- `LiNKdev/product/grounding/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md` - Updated with hardened flow documentation
