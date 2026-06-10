# Blocker 2 — Plane live for Admin projects

**Status:** Complete (code + live proof)  
**Branch:** `issue/admin-ui-fix`  
**Date:** 2026-06-10

## Summary

Admin project create now bootstraps **live** Plane projects with modules, work-items, and Run cycles. Project detail tabs (Modules, Phases, Issues, LiNKbots) populate from suite templates and Plane snapshot sync when `LINKSKILLS_PLANE_MODE=live`.

## Live proof (Principal)

| Field | Value |
|-------|--------|
| **Plane URL** | https://plane.linktrend.internal/linkprojects/projects/ADMINPLAAC38/ |
| **Plane workspace** | `linkprojects` (LiNKprojects) |
| **Plane project ID** | `d40dc562-3693-42e0-9b55-ce827e76a392` |
| **Plane identifier** | `ADMINPLAAC38` |
| **Admin project ID** | `ac3860fe-ef89-4ccd-bde5-6451bfc21af3` |
| **Admin project title** | Admin Plane proof MQ7DY3NO |
| **Licensor tenant ID** | `da570876-176d-452a-a428-6536d48303e9` |
| **Plane issues bootstrapped** | 6 |
| **Admin detail path** | `/admin/projects/ac3860fe-ef89-4ccd-bde5-6451bfc21af3` |

Proof command:

```bash
export LICENSOR_TENANT_ID=da570876-176d-452a-a428-6536d48303e9
export LINKSKILLS_PLANE_MODE=live
export PLANE_API_BASE_URL=https://plane.linktrend.internal
export PLANE_WORKSPACE_SLUG=linkprojects
export NEXT_PUBLIC_PLANE_URL=https://plane.linktrend.internal
export NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=linkprojects
export PLANE_API_KEY="$(gcloud secrets versions access latest --project=linkbot-901208 --secret=LINKTREND_AIOS_PROD_PLANE_API_KEY)"
node scripts/proof-admin-plane-sync.mjs
```

## Root fixes

1. **Plane project views** — New Plane projects default `module_view=false` / `cycle_view=false`. Bootstrap now PATCHes both to `true` before creating modules/cycles.
2. **Plane cycle payload** — Cycle create requires `project_id` in POST body (Plane v1 contract).
3. **Admin suite templates** — `linksuitegen`, `linkbrain`, `linktrend-platform` module/phase/issue templates added so bootstrap and UI tabs are not empty for vendor programs.
4. **Plane snapshot loader** — Phases/Issues/LiNKbots tabs read suite template + live Plane work-item state via `plane-project-snapshot.ts`.

## Required DO env (linkdroplet-00)

```env
LINKSKILLS_PLANE_MODE=live
PLANE_API_BASE_URL=https://plane.linktrend.internal
PLANE_WORKSPACE_SLUG=linkprojects
NEXT_PUBLIC_PLANE_URL=https://plane.linktrend.internal
NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=linkprojects
PLANE_API_KEY_SECRET_NAME=LINKTREND_AIOS_PROD_PLANE_API_KEY
LICENSOR_TENANT_ID=da570876-176d-452a-a428-6536d48303e9
```

Re-render runtime env from GSM and recreate `linkaios` container after merge.

## Files changed

| Area | Files |
|------|--------|
| Admin suite templates | `LiNKaios/linkaios-web/src/lib/admin-suite-templates.ts` |
| Plane bootstrap fixes | `LiNKaios/linkaios-web/src/lib/kernel/plane-bootstrap.ts` |
| Plane snapshot sync | `LiNKaios/linkaios-web/src/lib/plane-project-snapshot.ts`, `.test.ts` |
| Project tabs | `project-issues-panel.tsx`, `project-workflows-panel.tsx`, `project-linkbots-automations-panel.tsx` |
| Admin detail | `app/(admin-shell)/admin/projects/[id]/page.tsx` |
| Module rows | `project-modules-data.ts` |
| Proof scripts | `scripts/proof-admin-plane-sync.mjs`, `scripts/proof-admin-plane-bootstrap.ts` |
| Tests | `admin-projects-data.test.ts` |

## Blockers / follow-ups

| Item | Status |
|------|--------|
| DO deploy with this commit | **Pending** — Principal/integrator after merge |
| Finding 32 (dual Zulip buttons) | **Out of scope** for Blocker 2 — separate channels UX fix |
| Older admin projects without Plane mapping | Run **Push to Plane** (`POST /api/projects/{id}/plane-sync`) or re-launch after deploy |

## Tests

```bash
cd LiNKaios/linkaios-web
pnpm exec vitest run src/lib/plane-project-snapshot.test.ts src/lib/admin-projects-data.test.ts src/lib/admin-project-create.test.ts src/lib/kernel/plane-adapter.test.ts
```

All 13 tests passed locally on 2026-06-10.
