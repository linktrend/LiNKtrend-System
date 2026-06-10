# Admin UI Fix — Gap Closure (Routes, Leases, Messages, Seeds)

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Scope:** Close post-integration gaps 1–5 from `admin-ui-fix-p0-admin-client.md`

---

## Summary

Closed all five post-integration gaps: shared shell components now respect Admin `/admin` prefix via `useAppSurface().href()`, LiNKskills leases load across tenants for the sidebar View filter, Work Messages threads are tenant-keyed and filtered by View, dead chrome components were removed, and Admin LiNKbrain/LiNKskills TypeScript seed overlays were deleted in favor of live-data empty states.

---

## Gap 1 — Shared component route bleed (fixed)

All listed components now use `useAppSurface().href()`:

| Component | Change |
|-----------|--------|
| `cockpit-dashboard.tsx` | All `/work`, `/projects`, `/suites/*`, `/skills/leases` links surface-prefixed |
| `overview-home.tsx` | Workforce, projects, suites, quick-action links surface-prefixed |
| `overview-projects-summary-grid.tsx` | Metric card hrefs use `appHref("/projects")` |
| `overview-workforce-summary-grid.tsx` | Metric card hrefs use `appHref("/workers")` |
| `metrics-hub-footer.tsx` | Converted to client component; footer links surface-prefixed |
| `role-gated-ui.tsx` | `AddProjectHeaderAction` and `ModuleAccessRequestPanel` use surface paths |

---

## Gap 2 — Multi-tenant lease LOAD (fixed)

- Added `loadLeaseStatusForTenants()` in `cockpit/cockpit-data.ts` — single query with `.in("tenant_id", …)` for multi-tenant aggregation.
- Added `resolveTenantIdsForViewScope()` and `loadLeasesForAdminView()` in `admin-linkskills-tenant.ts` — resolves licensor + licensee tenant UUIDs from `linkaios_kernel.tenants` (with registry slug fallbacks).
- Wired into:
  - `linkskills-leases-panel.tsx`
  - `(shell)/skills/page.tsx` hub stats
  - `admin-linkskills-governance-panel.tsx`

Admin View modes now **load** the correct tenant set (All / Admin / All licensees / specific licensee), not only filter a single licensor query.

---

## Gap 3 — Work Messages tenant-keying (fixed)

- Extended `ChannelMessageThread` with optional `tenantKey`.
- Added `enrichChannelThreadsWithTenantKey()` and `filterChannelThreadsForViewScope()` in `work-messages.ts`.
- `(shell)/work/messages/page.tsx` loads `projects.tenant_id`, enriches threads, and filters on Admin surface using sidebar `?scope=` param.

---

## Gap 4 — Dead code removal (fixed)

Deleted unused files (toolbar chrome removed in prior pass):

- `components/app-surface-switch.tsx`
- `components/sidebar-role-preview.tsx`

---

## Gap 5 — Admin seed fallbacks removed (fixed)

| Removed | Replacement |
|---------|-------------|
| `ADMIN_LINKSKILLS_LEASE_SEED` + `admin-linkskills-seed.ts` | Empty lease tables; `loadLeasesForAdminView` from `lease_registry` |
| `buildAdminCollectiveBrainSeed()` + `admin-collective-brain-seed.ts` | `enrichAdminCollectiveBrainPageData` filters live rows only |
| `buildAdminCollectiveAuditSeed()` fallback in audit panel | Empty audit table with “Live — no vendor audit traces in range yet.” |

Client dev mocks (`LINKAIOS_UI_MOCKS` on licensee surface) unchanged.

---

## Verification

```bash
cd LiNKaios/linkaios-web
pnpm test src/lib/work-messages-scope.test.ts src/lib/cockpit/cockpit-data.test.ts src/lib/licensor-view-scope.test.ts
# 23 passed
```

`pnpm typecheck` — pre-existing failures in unrelated modules (`handoff-publish`, `authorize-service`, `session-stop-policy`); no new errors in touched Admin gap-closure files.

---

## Manual smoke (DO Admin, `LINKAIOS_UI_MOCKS=0`)

1. `/admin` Overview — quick actions and summary grids stay under `/admin/*`
2. `/admin/skills` + `/admin/skills/leases?scope=xyz-marketing` — lease counts/rows change with View
3. `/admin/work/messages?scope=admin` vs `?scope=xyz-marketing` — thread list scopes to tenant
4. `/admin/memory` — empty inbox/files when no live brain rows (no demo seed overlay)
5. Toolbar — no Client/Admin switcher or role preview dropdown

---

## Remaining risks

| Risk | Notes |
|------|--------|
| Licensee tenant UUID resolution | Depends on `linkaios_kernel.tenants` rows matching `LICENSEE_REGISTRY` slugs; slug string fallbacks included for lease queries |
| Threads without `mission_id` | Hidden in scoped Admin views (only visible in All) |
| Pre-existing typecheck debt | Unrelated API modules still fail `tsc --noEmit` repo-wide |
