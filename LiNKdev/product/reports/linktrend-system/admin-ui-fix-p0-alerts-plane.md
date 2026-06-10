# Admin UI P0 — Alerts, Plane, LiNKsuitegen

**Branch:** `issue/admin-ui-fix`  
**Date:** 2026-06-10  
**AdminDB Supabase project:** `ilxzgfyllipkwrgrviof`

## Summary

Three P0 Admin UI blockers fixed: Work → Alerts server crash, Plane open 404 / confirmation modal, and `/admin/linksuitegen` 404.

## Root causes

### 1. Work → Alerts crash

| Cause | Detail |
|-------|--------|
| **Primary (historical)** | Alerts page queried `mission_id` on `linkaios.traces`; migrated schema uses `project_id`. All Work already used `fetchRecentTraces()`. |
| **Residual risk** | `loadSupportTicketsFromDb()` Chatwoot sync could throw when service-role client or sync module failed, crashing the server component. |
| **Suspense** | `AlertsInbox` uses `useSearchParams()`; boundary moved to dedicated client wrapper `alerts-inbox-boundary.tsx`. |

### 2. Plane open 404

| Cause | Detail |
|-------|--------|
| **URL construction** | `getPlaneBridgeConfig()` only read `NEXT_PUBLIC_PLANE_WORKSPACE_SLUG`; server-rendered hrefs missed `PLANE_WORKSPACE_SLUG` → URLs like `https://plane…/projects/ID/` (no workspace segment) → 404. |
| **Identifier fallback** | When Plane API lookup failed, bridge used first 8 chars of UUID (`D40DC562`) instead of real identifier (`ADMINPLAAC38`) or full project UUID. |
| **Href source** | Admin project rows used `planeProjectBoardHref` only; live mappings should prefer `buildPlaneProjectUrl` via `planeHrefFromBridge`. |
| **UX** | `PlaneOpenModal` added an extra confirmation step; Zulip opens directly via `openExternalPopup`. |

**Proof mapping (live):** Admin project `ac3860fe-ef89-4ccd-bde5-6451bfc21af3` → Plane `ADMINPLAAC38` at `https://plane.linktrend.internal/linkprojects/projects/ADMINPLAAC38/`.

### 3. LiNKsuitegen 404

| Cause | Detail |
|-------|--------|
| **Missing routes** | Wave 6 LiNKsuitegen Admin surface (`admin/linksuitegen/*`, API routes, dashboard components) was removed from branch; sidebar still linked `/admin/linksuitegen`. |
| **Broken candidate links** | Dashboard linked `/admin/admin/linksuitegen/...` (double admin prefix). |

## Fixes applied

| Area | Change |
|------|--------|
| Alerts | `fetchRecentTraces` + try/catch around support-ticket load; `AlertsInboxBoundary` Suspense wrapper; hardened `support-tickets-db.server.ts` Chatwoot path |
| Plane | `openPlaneExternalUrl`; removed `PlaneOpenModal` from admin/client project tables; `planeHrefFromBridge` in `admin-projects-data`; slug fallback + identifier fix in `plane-links` / `plane-project-bridge` |
| LiNKsuitegen | Restored routes/components/API from commit `8fd1b40`; fixed candidate detail href |

## Required DO env (linkdroplet-00)

```env
# Supabase AdminDB
NEXT_PUBLIC_SUPABASE_URL=https://ilxzgfyllipkwrgrviof.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from GSM>
SUPABASE_SERVICE_ROLE_KEY=<from GSM — server only>

# Licensor tenant (Admin projects scope)
LICENSOR_TENANT_ID=da570876-176d-452a-a428-6536d48303e9

# Plane (live — both public and server slug required for correct hrefs)
LINKSKILLS_PLANE_MODE=live
PLANE_API_BASE_URL=https://plane.linktrend.internal
PLANE_WORKSPACE_SLUG=linkprojects
NEXT_PUBLIC_PLANE_URL=https://plane.linktrend.internal
NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=linkprojects
PLANE_API_KEY_SECRET_NAME=LINKTREND_AIOS_PROD_PLANE_API_KEY

# Optional — LiNKsuitegen candidate API from dashboard
NEXT_PUBLIC_LINKAIOS_ADMIN_SERVICE_TOKEN=<from GSM if gated>
```

Re-render runtime env from GSM and recreate `linkaios` container after merge. Ensure `plane.linktrend.internal` resolves inside the container (see `fix(deploy): map plane.linktrend.internal`).

## Verification

```bash
cd LiNKaios/linkaios-web
pnpm exec vitest run src/lib/plane-links.test.ts src/lib/admin-projects-data.test.ts
```

Manual:

1. `/admin/work/alerts` — page loads (empty or populated inbox, no Server Components error)
2. `/admin/projects` → Open in Plane — new tab, URL `…/linkprojects/projects/<identifier>/`
3. `/admin/linksuitegen` — dashboard loads; candidate links go to `/admin/linksuitegen/candidates/:id`

## Files touched

- `src/app/(shell)/work/alerts/page.tsx`
- `src/app/(shell)/work/alerts-inbox-boundary.tsx`
- `src/lib/support-tickets-db.server.ts`
- `src/lib/plane-links.ts`, `plane-links.test.ts`
- `src/lib/plane-project-bridge.ts`
- `src/lib/admin-projects-data.ts`
- `src/components/admin/admin-projects-index-table.tsx`
- `src/components/admin/admin-projects-page.tsx`
- `src/components/projects-index-table.tsx`
- `src/components/admin/linksuitegen-dashboard.tsx`
- Restored `admin/linksuitegen/*`, `api/admin/linksuitegen/*`, `lib/admin/linksuitegen/*`
