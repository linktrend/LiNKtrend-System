# Admin UI fix — P2 LiNKbrain + LiNKskills

**Branch:** `issue/admin-ui-fix`  
**Scope:** LiNKaios Admin (`/admin`) — LiNKbrain and LiNKskills surfaces  
**Date:** 2026-06-10

## Summary

P2 aligns Admin LiNKbrain and LiNKskills with licensor View scope (All | Admin | All licensees | specific licensee), separates read-only vs editable memory flows, removes Client navigation bleed and off-brand controls, and populates empty Admin tables from live data first with last-resort TypeScript seeds (not `LINKAIOS_UI_MOCKS` overlays).

---

## Renames

| Before | After | Where |
|--------|-------|--------|
| Admin program memory | **Project** | LiNKbrain tab label (`linkbrain-page-copy.ts`), inbox row copy, command centre headings |
| Admin program | **Project** | Memory command centre, filters placeholder |
| Choose an admin program… | **Choose a project…** | Project filter (`linkbrain-filters.tsx`) |
| Admin Program Memory (page title) | **Project** | Licensor `linkbrainPageTitle("project")` |

Client-facing **Project Memory** label unchanged on licensee surface.

---

## Toggle / scope behavior matrix

### Sidebar View (global — all Admin pages)

| View | LiNKbrain lists | LiNKskills hub |
|------|-----------------|----------------|
| **All** | Admin + all licensee rows | Full vendor + tenant catalogue |
| **Admin** | Studio/admin project memory only | Vendor-published catalogue |
| **All licensees** | Licensee partitions only (no admin project) | Tenant-scoped rows |
| **Specific licensee** | That licensee’s collective memory | That licensee’s scope |

Implemented via `licensor-view-scope.ts`, URL param `scope`, and `SidebarLicensorScope` synced through `role-preview-provider.tsx`.

### LiNKbrain memory actions

| Mode | Route / control | Behavior |
|------|-----------------|----------|
| **View** | `/memory/files/{id}` (default) | Read-only body; governance cards hidden |
| **Edit** | `/memory/files/{id}?edit=1` or list Edit action | Editable propose-edit flow; zinc/primary buttons (no violet) |
| **Read-only aggregate** | View = All licensees or specific licensee (non-edit scopes) | Edit actions hidden in doc list (`collectiveReadOnly`) |

### LiNKbrain Ask LiNKbrain

| Control | Options |
|---------|---------|
| View scope dropdown | All, Admin, All licensees, each registered licensee |
| Other filters | Project, LiNKbot, tags (unchanged) |

### LiNKbrain Audit

| Control | Options |
|---------|---------|
| Time | Last 7 days, Last 30 days only |
| Context (collective) | All contexts, Admin, Licensees |
| Project | All projects + loaded mission titles |
| Actions | **No Add Knowledge** on Audit tab (log-only) |

Sidebar View also filters audit rows by licensee registry match.

### LiNKskills catalogue tables

| Surface | Published column | Runtime column |
|---------|------------------|----------------|
| **Admin hub** (Overview / Skills / Tools) | Yes — vendor publish toggle | **Hidden** |
| **LiNKbot detail** (`runtimeOnly`) | Hidden | Yes — per-bot runtime toggle |
| **Client** | For Company | Runtime (unchanged) |

### LiNKskills navigation

| Issue | Fix |
|-------|-----|
| Skills tab links opened Client routes | `LinkskillsHubNav` uses `useAppSurface().appHref()` |

---

## Seed / population approach

**Policy:** Live DB first (A). TypeScript last-resort seed when Admin surface is empty and UI mocks are disabled (B). No `LINKAIOS_UI_MOCKS` on Admin (`isUiMocksEnabledForSurface("admin") === false`).

| Area | Live source | Last-resort seed |
|------|-------------|------------------|
| Inbox, project/bot/licensee memory | `loadLinkbrainPageData` + Supabase brain tables | `buildAdminCollectiveBrainSeed()` via `enrichAdminCollectiveBrainPageData()` |
| Audit trace log | `fetchRecentTraces` + `linkbrain.audit_events` | `buildAdminCollectiveAuditSeed()` |
| LiNKskills Leases | `loadLeaseStatus` for admin tenant | `ADMIN_LINKSKILLS_LEASE_SEED` |

Seed modules:

- `LiNKaios/linkaios-web/src/lib/admin-collective-brain-seed.ts`
- `LiNKaios/linkaios-web/src/lib/admin-collective-brain-data.ts`
- `LiNKaios/linkaios-web/src/lib/admin-linkskills-seed.ts`

Seeds are scoped/filtered by sidebar View the same as live rows. No SQL migration added in this wave; durable AdminDB seed remains optional follow-up.

---

## Key files touched

**LiNKbrain**

- `src/lib/linkbrain-page-copy.ts`
- `src/lib/admin-collective-brain-seed.ts`, `admin-collective-brain-data.ts`
- `src/components/linkbrain/linkbrain-memory-page-header.tsx` — hide Add Knowledge on Audit
- `src/components/linkbrain/linkbrain-audit-table.tsx` — admin/licensee/time/project filters
- `src/components/linkbrain/linkbrain-audit-panel.tsx` — surface-aware mocks + audit seed
- `src/components/linkbrain/linkbrain-ask-form.tsx` — View scope dropdown
- `src/components/linkbrain/linkbrain-memory-doc-row.tsx` — View vs Edit split
- `src/components/linkbrain/memory-command-centre.tsx`, `memory-page-content.tsx`
- `src/app/(shell)/memory/files/[fileId]/page.tsx` — read-only vs `?edit=1`

**LiNKskills**

- `src/components/linkskills-hub-nav.tsx`
- `src/components/skills-catalog-table.tsx`, `tools-catalog-table.tsx`
- `src/components/linkskills-leases-panel.tsx`
- `src/lib/admin-linkskills-seed.ts`

---

## Verification

```bash
cd LiNKaios/linkaios-web
pnpm exec tsc --noEmit -p tsconfig.json
```

Manual smoke on `/admin/memory` and `/admin/skills`:

1. Sidebar View filters licensee memory list and Ask scope.
2. Audit tab has no Add Knowledge; filters include Admin context and 7d/30d.
3. File View is read-only; Edit opens governance with primary (not violet) Propose edit.
4. Skills hub tabs stay under `/admin/skills/*`; Runtime column absent on hub, present on LiNKbot detail.
5. Leases tab shows seed rows when `lease_registry` empty.

---

## Follow-ups (out of P2)

- SQL migration `039_admin_ui_collective_seed.sql` if durable DB seed preferred over TS fallback.
- Replace remaining internal comments saying "admin program" in metrics CTAs if user-facing copy sweep continues.
