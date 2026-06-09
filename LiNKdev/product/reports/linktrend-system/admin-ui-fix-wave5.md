# LiNKaios Admin UI Fix — Wave 5 (5A + 5B)

**Branch:** `issue/admin-ui-fix`  
**Date:** 2026-06-10  
**Scope:** Admin Projects rename + table; LiNKbrain vendor scope

## Findings closed

| ID | Summary | Status |
|----|---------|--------|
| **29** | Add Project wizard on Admin blocked; vendor projects load from licensor tenant DB | **Partial** — Client wizard still blocked; list uses live `linkaios.projects` for studio tenant |
| **30** | Draft badge on detail | **Deferred** — detail route still redirects (Wave 6 polish) |
| **31** | Project ID UUID wrap | **Deferred** — no admin detail page yet |
| **32** | Project channels dual buttons | **Deferred** — detail blocked |
| **33** | Empty detail tabs | **Deferred** — detail blocked |
| **34** | Runs tab purpose | **Deferred** — detail blocked |
| **58** | Admin programs model | **Closed** — Projects nav + licensor-tenant table with Suite Gen / Librarian Filings types |
| **65** | Client tenant memory bleed on Admin LiNKbrain | **Closed** — vendor tab labels, admin program picker, licensee memory tab |
| **66** | Add Knowledge → collective inbox | **Closed** — Admin header action routes to collective draft flow |
| **67** | Audit tab live vs mock unclear | **Closed** — live/fixture source label + librarian note |

## Wave 5A — Projects

- Renamed all **Admin Programs** copy → **Projects** (`admin-projects-copy.ts`)
- Removed **LicensorScopeLine** on `/admin/projects` (vendor-only view)
- Built **AdminProjectsIndexTable** with Type column (Suite Gen, Librarian Filings, Platform Ops)
- Loads rows via `loadAdminProjectIndexRows()` — licensor tenant filter, no demo fixtures

## Wave 5B — LiNKbrain Admin

- Tab labels: Inbox (vendor librarian), **Licensee Memory**, **Admin Program Memory**, LiNKbot Memory, Ask, Audit
- Admin program memory uses vendor project picker, not client project list
- Collective demo overlay only when `LINKAIOS_UI_MOCKS=1`
- Inbox edit: consistent Approve/Reject/Back buttons; human scope labels
- Add Knowledge on Admin → collective inbox draft

## Tests

- `admin-projects-data.test.ts` — type classification
- `app-roles.admin-projects.test.ts` — gating

## Files touched (primary)

- `LiNKaios/linkaios-web/src/lib/admin-projects-copy.ts`
- `LiNKaios/linkaios-web/src/lib/admin-projects-data.ts`
- `LiNKaios/linkaios-web/src/components/admin/admin-projects-page.tsx`
- `LiNKaios/linkaios-web/src/components/admin/admin-projects-index-table.tsx`
- `LiNKaios/linkaios-web/src/app/(admin-shell)/admin/projects/page.tsx`
- `LiNKaios/linkaios-web/src/components/admin/licensor-scope-banner.tsx`
- `LiNKaios/linkaios-web/src/components/shell-page-header.tsx`
- `LiNKaios/linkaios-web/src/lib/linkbrain-page-copy.ts`
- `LiNKaios/linkaios-web/src/components/linkbrain/memory-page-content.tsx`
- `LiNKaios/linkaios-web/src/components/linkbrain/memory-command-centre.tsx`
- `LiNKaios/linkaios-web/src/components/linkbrain/linkbrain-memory-page-header.tsx`
- `LiNKaios/linkaios-web/src/components/linkbrain/linkbrain-audit-panel.tsx`
- `LiNKaios/linkaios-web/src/components/linkbrain/linkbrain-inbox-row.tsx`
- `LiNKaios/linkaios-web/src/components/linkbrain/linkbrain-filters.tsx`
- `LiNKaios/linkaios-web/src/components/role-gated-ui.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/memory/drafts/new/page.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/memory/drafts/[versionId]/page.tsx`

## Removed

- `admin-programs-copy.ts`
- `admin-programs-page.tsx`
