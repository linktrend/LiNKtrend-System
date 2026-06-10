# Admin UI Fix — P0 View Filter

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Scope:** Replace licensee-only sidebar dropdown with unified **View** filter driving admin page scoping.

---

## View options

| Value | Label | Meaning |
|-------|-------|---------|
| `__platform__` | **All** | Entire platform — admin + all licensees (default) |
| `__admin__` | **Admin** | Studio/licensor admin bots and data only |
| `__all__` | **All licensees** | All tenant/licensee scope, excludes admin |
| `{licensee id}` | **{Licensee name}** | Single licensee from registry |

Licensor tenant UUID fallback: `da570876-176d-452a-a428-6536d48303e9`

---

## Shared state

- **Hook:** `useLicensorScope()` in `components/role-preview-provider.tsx`
- **Persistence:** `localStorage` key `linkaios.licensorScope`
- **URL sync:** `?scope=` query param (legacy `?scope=admin` maps to `__admin__`)
- **Helpers:** `lib/licensor-view-scope.ts` — filtering, labels, mutation guards

---

## Pages wired

| Area | Component / route | Behavior |
|------|-------------------|----------|
| Sidebar | `sidebar-licensor-scope.tsx` | View dropdown (replaces Licensee label) |
| Page header | `licensor-scope-banner.tsx` | Shows active View + read-only pill |
| Overview | `admin-control-panel.tsx` | Platform vs single-licensee birds-eye |
| Licensees | `admin-company-page.tsx` | Registry unless single licensee selected |
| Work → Sessions | `work/sessions/page.tsx` + `scoped-sessions-inbox.tsx` | Sessions filtered by agent fleet scope |
| Work → Alerts | `alerts-inbox.tsx` | Support ticket alerts respect View |
| Customer Service | `customer-service-queue.tsx` | Ticket queue filtered by View |
| LiNKbots | `workers/page.tsx` | Fleet list uses View (removed separate `?scope=admin` nav) |
| LiNKbrain | `memory-command-centre.tsx` (existing) + demo overlay | Collective memory filtered by View |
| LiNKbrain → Audit | `linkbrain-audit-table.tsx` | Removed per-page licensee dropdown |
| LiNKbrain → Ask | `linkbrain-ask-form.tsx` | Licensee picker removed; follows sidebar View |
| Vendor ops / fleet | `admin-vendor-ops.ts`, `admin-fleet-troubleshoot.ts` | Re-export view-scope guards |

---

## Removed / deferred redundant filters

- LiNKbots sidebar **Admin LiNKbots** sub-link (use View = Admin instead)
- LiNKbrain audit **Licensee** `<select>`
- LiNKbrain Ask **Licensee** dropdown on licensor collective (sidebar View + hidden field when narrowed)

---

## Still unwired / follow-up

| Area | Gap |
|------|-----|
| **LiNKskills** leases/governance panels | Server-loaded licensor tenant only; no multi-tenant lease aggregation yet |
| **Work → Messages** | Thread list not tenant-keyed in current data model — no filter applied |
| **Live API rows** | Fleet/session filtering uses `runtime_settings.linkaios_fleet` until `agents.tenant_id` ships |
| **Admin overview Admin view** | Uses platform birds-eye; dedicated admin-only KPI strip not added |
| **Trace / metrics pages** | No licensee-specific duplicate filters found; platform metrics remain global |

---

## Verification

```bash
cd LiNKaios/linkaios-web
pnpm test src/lib/licensor-view-scope.test.ts src/lib/admin-vendor-ops.test.ts src/lib/admin-fleet-troubleshoot.test.ts
pnpm typecheck
```

---

## Key files

- `src/lib/app-roles.ts` — scope constants + write/read-only rules
- `src/lib/licensor-view-scope.ts` — central filter/guard helpers
- `src/components/sidebar-licensor-scope.tsx` — View UI
- `src/components/role-preview-provider.tsx` — context + URL sync
