# WP-036 Focused Security Review - Integration Scaffold Hardening

Date: 2026-05-15
Reviewer: Codex security audit
Scope:
- `.env.example`
- `packages/shared-config/src/index.ts`
- `LiNKaios/linkaios-web/src/lib/kernel/dispatch.ts`
- `LiNKaios/linkaios-web/src/lib/kernel/plane-adapter.ts`
- `services/migrations/028_linkskills_plane_external_mappings.sql`

## Executive Summary

Scaffold defaults remain fail-safe for external integrations: CRM defaults to `stub/stub_write`, Plane adapter stays local-stub across all modes, and DigitalOcean preview mode is opt-in with an explicit enable gate. Chatwoot readiness probe remains a read-only `GET`.

One high finding was fixed in-scope: Plane mapping tables granted broad `authenticated` read access with `USING (true)`, which could expose cross-tenant external mappings. The migration now revokes authenticated access and applies `service_role`-only RLS policies.

Merge recommendation: Ready after this RLS hardening and focused test pass.

## Findings

### High

#### SEC-036-001: Cross-tenant exposure risk in Plane mapping table policies

Impact: Any authenticated user could read all rows from `linkskills.plane_project_mappings` and `linkskills.plane_work_item_mappings`, exposing tenant-linked external IDs.

Affected logic:
- `services/migrations/028_linkskills_plane_external_mappings.sql`

Why this is a vulnerability:
- Tables enable RLS but granted `SELECT` to `authenticated` and used `USING (true)`, making the policy effectively global-read for authenticated users.
- Mapping tables contain tenant linkage and external object identifiers that should remain internal integration state.

Fix applied:
- Revoked authenticated table privileges.
- Removed authenticated-wide select policies.
- Added `service_role`-only RLS policies for required read/write operations.

Status: Fixed.

### Medium

None.

### Low

None.

## Checks Against Requested Goals

1. External writes disabled by default: Pass (`CRM_PROVIDER=stub`, `CRM_MODE=stub_write`, Plane adapter remains stub behavior in all modes).
2. DigitalOcean mode cannot call APIs accidentally: Pass (no API client/call path exists; mode is additionally gated by `PREVIEW_PUBLISH_DIGITALOCEAN_ENABLED`).
3. Plane mapping tables avoid unnecessary cross-tenant exposure: Pass after fix (authenticated access removed; service-role only).
4. Chatwoot readiness is read-only GET: Pass (`fetch(..., { method: "GET" })` against account endpoint).
5. Failure codes map to canonical `INTEGRATION_*`: Pass (`INTEGRATION_UNAVAILABLE`, `INTEGRATION_AUTH_FAILED`, `INTEGRATION_TIMEOUT`; helper now typed to integration code set).
6. No secrets committed: Pass in scoped files (`.env.example` uses placeholders/empty values only).

## Proof

Commands run:

```bash
pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/dispatch.test.ts src/lib/kernel/plane-adapter.test.ts
```

Validation results:
- Focused dispatch/plane scaffold tests passed.

## Final Verdict

- Critical findings: 0
- High findings: 1 found, fixed
- Medium findings: 0
- Low findings: 0
- Blocks merge: No after fix and passing focused tests

# WP-024 Focused Security Review - MVO Kernel API Hardening

Date: 2026-05-15
Reviewer: Codex security audit
Scope:
- `LiNKaios/linkaios-web/src/lib/kernel/api-auth.ts`
- `LiNKaios/linkaios-web/src/app/api/kernel/**`
- `LiNKaios/linkaios-web/src/middleware.ts`
- `.env.example`
- `scripts/run-e2e.ts`

## Executive Summary

Initial review found one merge-blocking authorization issue in the new MVO kernel auth hardening. The integrator subsequently patched SEC-001 and re-ran focused auth/kernel tests plus the MVO E2E harness successfully.

The service bypass is now correctly double-gated by both `BOT_KERNEL_API_SECRET` and `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS`, request bodies no longer control `requested_by` / `decided_by`, and `.env.example` contains placeholders rather than committed secrets.

The service bypass is correctly double-gated, request bodies do not control actor fields, `.env.example` contains placeholders rather than committed secrets, and non-service/non-operator user access no longer falls back from run/approval scope to broad same-tenant history.

Merge recommendation: Ready from this focused security review after the SEC-001 fix and proof below.

## Findings

### High

#### SEC-001: Same-tenant users can cross run and approval scope

Impact: Any authenticated user who has ever created a work request in tenant `T` can execute another user's run, inspect its trace, list pending approvals for the tenant, and decide approvals for runs they did not request.

Affected logic:
- `LiNKaios/linkaios-web/src/lib/kernel/api-auth.ts:77`
- `LiNKaios/linkaios-web/src/lib/kernel/api-auth.ts:84`
- `LiNKaios/linkaios-web/src/app/api/kernel/run/[runId]/execute/route.ts:28`
- `LiNKaios/linkaios-web/src/app/api/kernel/run/[runId]/trace/route.ts:28`
- `LiNKaios/linkaios-web/src/app/api/kernel/approvals/route.ts:29`
- `LiNKaios/linkaios-web/src/app/api/kernel/approvals/route.ts:127`

Why this is a vulnerability:
- `canAccessKernelScope()` grants run access when the caller is either the original requester or `userOwnsTenantScope(actorId, runScope.tenantId)`.
- It grants approval access when the caller requested the approval, requested the parent run, or again satisfies `userOwnsTenantScope(...)`.
- In every scoped route, `userOwnsTenantScope()` is implemented as "does any `work_requests` row exist for this `(tenant_id, requested_by_actor_id)` pair".
- That means prior participation in a tenant is treated as blanket authorization for unrelated runs and approvals inside that tenant.

Why this fails the review goal:
- Requirement 4 was that trace / execute / approval routes cannot cross tenant/run scope.
- The current fallback explicitly allows cross-run and cross-approval access inside the same tenant.

Recommended minimal fix:
- For run and approval routes, require direct ownership of the run / approval unless the caller is the env-gated service actor or an intentional MVO bypass path.
- Do not use "has any prior work request in tenant" as a substitute for run- or approval-level authorization.

Status: Fixed after review.

Fix:
- `canAccessKernelScope()` no longer grants run or approval access through `userOwnsTenantScope(...)`.
- Run access requires direct run requester ownership unless the actor is service or operator-allowlisted.
- Approval access requires direct approval requester or parent-run requester ownership unless the actor is service or operator-allowlisted.
- Tenant-level approval listing filters ordinary users to their own approvals instead of exposing all tenant approvals.

Proof:
- `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/api-auth.test.ts src/lib/kernel/kernel.test.ts` passed (`3 files`, `70 tests`).
- `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e` passed with run `63d6e532-4aaa-40da-952c-25d83fb244b9`.

Merge blocker: No.

### Medium

None.

### Low

#### SEC-002: Focused auth tests do not exercise route-level cross-scope denial

Affected logic:
- `LiNKaios/linkaios-web/src/lib/kernel/api-auth.test.ts:76`

Notes:
- The helper tests prove the intended boolean logic in isolation.
- They do not include route-level cases showing `403` for cross-run or cross-approval requests, so the over-broad `userOwnsTenantScope()` implementations in the route handlers were not caught.

This is not the primary vulnerability, but it increases regression risk in the exact area this packet is hardening.

Merge blocker: No by itself.

## Checks Against Requested Goals

1. Service bypass requires both `BOT_KERNEL_API_SECRET` and `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS`:
   - Verified in `LiNKaios/linkaios-web/src/lib/kernel/api-auth.ts:58` and `LiNKaios/linkaios-web/src/middleware.ts:44`.
   - Pass.

2. User access denies by default when ownership cannot be proven:
   - Helper defaults to deny on missing run / approval scope and false ownership checks.
   - Pass at helper level, but route behavior is still too broad because tenant history is treated as ownership proof for unrelated runs.

3. Request body cannot spoof `actor` / `requested_by`:
   - `work-request` ignores body-level `requested_by` and derives `requestedBy` from the resolved actor in `LiNKaios/linkaios-web/src/app/api/kernel/work-request/route.ts:79`.
   - `approvals` writes `decided_by_actor_id` from resolved actor in `LiNKaios/linkaios-web/src/app/api/kernel/approvals/route.ts:210`.
   - Pass.

4. Trace / execute / approval routes cannot cross tenant/run scope:
   - Fail because of `userOwnsTenantScope()` fallback described in SEC-001.

5. No secrets are committed or documented unsafely:
   - Reviewed `.env.example`; added values are placeholders only (`your_publishable_key`, `your_secret_key`, empty MVO envs).
   - `scripts/run-e2e.ts` now reads secrets from env instead of embedding a literal token.
   - Pass.

6. MVO-only bypass is clearly env-gated and not default:
   - Verified in `LiNKaios/linkaios-web/src/lib/kernel/api-auth.ts:35`, `LiNKaios/linkaios-web/src/middleware.ts:45`, and `.env.example:20`.
   - Pass.

## Proof

Commands run:

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/api-auth.test.ts
git diff -- LiNKaios/linkaios-web/src/lib/kernel/api-auth.ts LiNKaios/linkaios-web/src/app/api/kernel LiNKaios/linkaios-web/src/middleware.ts .env.example scripts/run-e2e.ts
```

Validation results:
- Focused auth tests passed.
- Vitest output also reported existing kernel/plugin tests in the package as passing during the filtered run.
- `.env.example` contains no real secret material.

## Final Verdict

- Critical findings: 0
- High findings: 1 found, fixed
- Medium findings: 0
- Low findings: 1
- Blocks merge: No after SEC-001 fix and passing proof
