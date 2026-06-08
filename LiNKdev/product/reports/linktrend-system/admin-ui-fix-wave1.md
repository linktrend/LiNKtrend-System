# Admin UI Fix — Wave 1 Acceptance Report

**Date:** 2026-06-08  
**Branch:** `issue/admin-ui-fix`  
**Deploy host:** `linkdroplet-00` (DigitalOcean)  
**Admin URL:** `https://linkaios.linktrend.internal`  
**Runtime:** `LINKAIOS_UI_MOCKS=0` (container env confirmed `0`)

---

## Deploy evidence

| Item | Value |
|------|--------|
| **Deployed commit (HEAD)** | `feb45826dc968c9d7a4dac20f798edaef453a0ed` |
| **Wave 1 commits on branch** | `26a1c90` (1D) → `c413120`/`d8bc68b` (1A + 1B code) → `feb4582` (1C) |
| **Note on 1B commit** | Standalone commit `a2f0fd2` exists in repo history but is **not** an ancestor of `issue/admin-ui-fix`; Admin Programs stub landed in `d8bc68b` with 1A nav work. |
| **VPS path** | `/opt/linktrend/linkaios` |
| **Container** | `linkaios-linkaios-1` (recreated, Up) |
| **Prior VPS HEAD** | `47e8da4` (Wave 0) |

### Deploy steps executed

1. `git push -u origin issue/admin-ui-fix`
2. SSH `linkdroplet-00`: `git checkout issue/admin-ui-fix` → `git pull`
3. `./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime`
4. `docker compose -f docker-compose.deploy.yml build linkaios`
5. `docker compose -f docker-compose.deploy.yml up -d --remove-orphans linkaios`

**Deploy blockers:** None.

---

## Pre-deploy verification (local)

| Check | Result |
|-------|--------|
| Branch state | **PASS** — clean working tree; Wave 1 commits on `issue/admin-ui-fix`; 5 commits ahead of prior remote |
| `pnpm typecheck` (`linkaios-web`) | **PASS** |
| `pnpm lint` (`linkaios-web`) | **PASS** — warnings only (pre-existing unused-vars) |
| Focused tests | **PASS** — `app-roles.admin-programs.test.ts` (3/3), `agent-fleet-classification.test.ts` (5/5) |

---

## Wave 1 acceptance checklist

Smoke run: authenticated Super Admin session, `LINKAIOS_UI_MOCKS=0`, browser on DO Admin.

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | No orphaned LiNKsuitegen / Fleet v1 rail outside Suites accordion | **PASS** | `/admin/suites` — Suites expanded shows nested **All suites**, **Stripe products**, **LiNKsuitegen** only; no sibling rail below accordion |
| 2 | Fleet v1 reachable under LiNKbots | **PARTIAL** | LiNKbots submenu shows **Fleet v1** link; `/admin/fleet` returns **404** (route not implemented — nav relocation done, page deferred) |
| 3 | `/admin/workers/new` blocked with Suite builder message | **PASS** | Page title **Add LiNKbot**; body **Use Suite builder**; links **Open Suites** / **Back to LiNKbots** — no create form |
| 4 | Client tenant bot on Admin: **no Projects tab** | **PASS** | `/admin/workers/a64f1a5e-91c3-4fd4-8f30-63d1e27929d9/sessions` — subnav: Sessions, LiNKskills, LiNKbrain, Models, Settings, Logs, Lifecycle (no Projects) |
| 5 | Admin bot on Admin: **Projects tab present** | **PARTIAL** | Logic verified in `agent-fleet-classification.test.ts` + `worker-detail-tabs.ts`; **no licensor-scoped agent** in AdminDB (`linkaios.agents` has one row, `linkaios_fleet` null) — live tab not observable until admin bot seed |
| 6 | `/admin/projects` shows admin-programs intent (stub OK) | **PASS** | Title **Admin Programs**; empty state + vendor copy; `/admin/projects/new` redirects to `?blocked=create` banner |
| 7 | Submenu links text-only (no Plus/Factory icons) | **PASS** | Suites + LiNKbots nested links are text-only in DOM snapshot; `admin-linksuitegen-sidebar.tsx` no icon |

**Wave 1 gate:** **PASS** (5/7 full pass, 2/7 partial with documented deferrals)

---

## Findings closed

| Finding | Title | Wave 1 closure |
|---------|-------|----------------|
| **1** | LiNKsuitegen outside Suites accordion | Nested under Suites accordion on DO |
| **2** | Fleet v1 under Suites nav | Moved to LiNKbots submenu (route 404 noted) |
| **3** | Redundant Add suite sidebar link | Sidebar duplicate removed; list page **Add suite** retained as canonical |
| **4** | Icons on submenu items | Plus/Factory removed from nested suite links |
| **27** | Projects list Client bleed | Replaced with **Admin Programs** stub; create/detail blocked |
| **28** | Plane popup on project actions | `PlaneOpenModal` wired in `projects-index-table.tsx`; not exercised on empty admin programs list (Wave 5) |
| **40** | LiNKbots list scope unclear | Header copy distinguishes All licensees vs single-licensee troubleshoot |
| **41** | Add LiNKbot on Admin | Route shows Suite builder block; list header hides Add LiNKbot on Admin |
| **46** | Projects tab conditional | Hidden for client tenant bot on Admin (live); admin bot show path unit-tested |
| **58** | Admin programs model | Stub empty state + gating; full wizard/data model deferred Wave 5 |
| **68** | Company → Clients / Licensees | Sidebar label **Clients / Licensees** on DO; registry UX rewrite **Wave 2** |

---

## Tracks completed

| Track | Commits | Status |
|-------|---------|--------|
| **1A** Nav + sidebar | `c413120`, `d8bc68b` | Done |
| **1B** Projects gating | `d8bc68b` (includes programs stub; `a2f0fd2` not on branch) | Done |
| **1C** LiNKbots boundary | `feb4582` | Done |
| **1D** Licensees label | `26a1c90` | Done |

---

## Observations (non-blocking)

- **`/admin/fleet` 404:** Nav link points to missing `(admin-shell)/admin/fleet/page.tsx`. Relocation satisfies finding **2** nav intent; dashboard implementation belongs Wave 3 fleet ops or earlier hotfix if Principal wants clickable nav before Wave 3.
- **Single agent on DO:** Only `Demo agent` (`a64f1a5e-…`) with no `linkaios_fleet` metadata — sufficient for client-bot tab gating smoke, insufficient for admin-bot Projects tab live proof.
- **Governance panel:** `Licensor tenant ( unresolved )` persists from Wave 0 — set `LICENSOR_TENANT_ID` in GSM when Wave 2 lease/settings work needs resolved tenant name.
- **Parallel commit hygiene:** Orchestrator should cherry-pick or merge `a2f0fd2` history note into branch narrative; functional 1B code is present at `d8bc68b`.

---

## Blockers for Wave 2

Wave 1 boundary work is sufficient to start **Wave 2 — Clients / Licensees + Settings**:

| Area | Findings | Dependency |
|------|----------|------------|
| Licensees registry UX | **69, 70, 68 (complete)** | Replace Client Company/Brand panels; guard `registeredOffice` beyond Wave 0 minimal guard |
| Settings Account | **71, 72** | Hide delete/billing/support; platform workspace card |
| Settings Security | **73, 74** | Invite flow; 2FA demo label |
| Settings Data + Platform | **76, 77, 78** | Hide Integrations card; Super Admin Platform tab |
| Fleet v1 page | — | Optional nav fix before Wave 3 if Principal wants non-404 Fleet link |
| Admin bot seed | **46, 58** | Seed one licensor-scoped agent with `linkaios_fleet.scope=licensor` for live Projects tab acceptance in Wave 5 |

**Principal action:** Optional checkpoint after Wave 1 (plan marks optional); **required after Wave 2**. No staging/main promotion from this wave.

---

## References

- Plan: `LiNKdev/product/reports/linktrend-system/ADMIN_UI_FIX_PLAN.md`
- Wave 0: `LiNKdev/product/reports/linktrend-system/admin-ui-fix-wave0.md`
- Live review: `LiNKdev/product/reports/linktrend-system/ADMIN_UI_LIVE_REVIEW_2026-06-06.md`
