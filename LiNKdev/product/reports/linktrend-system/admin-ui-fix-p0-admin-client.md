# Admin UI Fix — P0 Admin/Client Separation

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Scope:** Remove in-app Admin/Client switching, strip Admin mock paths, fix route bleed to Client URLs

---

## Summary

Admin and Client are separate apps (`/admin/*` vs `/client/*`). This pass removes production chrome that implied otherwise, gates all Admin data paths away from `LINKAIOS_UI_MOCKS`, and fixes shared shell components that linked to licensee routes without the `/admin` prefix.

---

## Files changed

| Area | Files |
|------|--------|
| Shell chrome | `shell-chrome-toolbar.tsx`, `shell-sidebar.tsx` |
| Mock gating | `lib/ui-mocks/flags.ts`, `lib/ui-mocks/index.ts` |
| LiNKbots fleet | `workers-fleet-nav.tsx`, `fleet-summary-stats-grid.tsx`, `(shell)/workers/page.tsx` |
| LiNKskills | `linkskills-hub-nav.tsx`, `capabilities-hub-cards.tsx`, `skills-catalog-table.tsx`, `tools-catalog-table.tsx`, `(shell)/skills/page.tsx`, `skills/skills/page.tsx`, `skills/tools/page.tsx`, `skills/connectors/page.tsx`, `linkskills-leases-panel.tsx` |
| Metrics | `(shell)/metrics/page.tsx` |
| Cockpit stats | `cockpit-summary-stats-grid.tsx` |

---

## Key fixes

1. **Removed Admin/Client dropdown and role preview from top toolbar** — `AppSurfaceSwitch` and `RolePreviewSelect` no longer render in `ShellChromeToolbar`.
2. **Removed role tier badge from sidebar user block** — `SidebarRoleBadge` removed from footer user display (preview-only role switching is not production UX).
3. **Admin mock hard-off** — Added `isUiMocksEnabledForSurface(surface)`; Admin always returns `false` even when `LINKAIOS_UI_MOCKS=1` in dev. Applied on workers, skills hub, skills/tools/skills catalog, connectors seed rows, leases panel, and metrics.
4. **Route bleed — LiNKbots** — Fleet view tabs, presence filter pills (Active/Online/etc.), stat cards, and worker session links now use `useAppSurface().href()` or `withAppBasePath(..., surface)`.
5. **Route bleed — LiNKskills** — Hub nav tabs, hub slice cards, skills/tools table actions prefix paths for Admin.
6. **Connectors catalogue** — Demo connector rows only when mocks enabled; Admin shows registered capabilities + empty stats otherwise.
7. **Metrics empty state** — CTA links use `withAppBasePath` so Admin stays on `/admin/projects/new` and `/admin/workers`.

---

## Verification

- `pnpm --filter @linktrend/linkaios-web typecheck` — **pre-existing failures** elsewhere in repo; **no errors in files touched by this pass**.
- Manual smoke recommended on DO Admin (`LINKAIOS_UI_MOCKS=0`):
  - `/admin/workers` — filter pills and stat cards stay under `/admin/workers`
  - `/admin/skills/skills` — tab nav stays under `/admin/skills/*`
  - `/admin/skills/connectors` — no demo connector rows unless locally registered
  - Toolbar — no Client/Admin switcher, no role preview dropdown

---

## Remaining risks / bleed points

| Risk | Notes |
|------|--------|
| **Shared shell re-exports** | Most Admin routes re-export `(shell)/*` pages. Any component still hardcoding `/projects`, `/work`, `/suites/...` without `useAppSurface`/`withAppBasePath` can bleed. Fixed the reported hotspots; grep still finds hardcoded paths in `cockpit-dashboard.tsx`, `overview-home.tsx`, `overview-*-summary-grid.tsx`, `metrics-hub-footer.tsx` — **Client-only or unused surfaces today**, but reuse from Admin would need the same pattern. |
| **Dead components** | `app-surface-switch.tsx`, `sidebar-role-preview.tsx` remain in tree but are unused — safe to delete in a cleanup pass. |
| **Client dev mocks** | `LINKAIOS_UI_MOCKS` still works on licensee `/client` surface for layout review; unchanged by design. |
| **Connectors discover page** | Still references demo rows for manifest diff baselines when mocks on; Admin path uses empty seed — discover list may be sparse until capabilities are registered. |
| **RolePreviewProvider** | Still wraps Admin layout for real RBAC from `getAppRoleTierForUser`; only the **preview dropdown/badge** chrome was removed. |

---

## Route audit — other bleed points found (not all fixed)

Hardcoded licensee paths still exist in:

- `components/cockpit-dashboard.tsx` — `/work`, `/projects`, `/suites/my-suites`, `/skills/leases`
- `components/overview-home.tsx` — `/workers`, `/projects`
- `components/summary-metric-card/overview-projects-summary-grid.tsx`
- `components/summary-metric-card/overview-workforce-summary-grid.tsx`
- `components/metrics-hub-footer.tsx`
- `components/role-gated-ui.tsx` — `/projects/new`

These are not on the current Admin nav path except via future reuse. Apply `useAppSurface().href()` if any are mounted under `(admin-shell)`.

---

## Next steps

- Principal smoke on DO Admin for the four surfaces above.
- Optional cleanup: delete unused `AppSurfaceSwitch` / role preview exports.
- Broader grep pass for hardcoded paths if new Admin pages reuse Client summary grids.
