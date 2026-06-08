# Admin UI Fix — Wave 0 Acceptance Report

**Date:** 2026-06-08  
**Branch:** `issue/admin-ui-fix`  
**Deploy host:** `linkdroplet-00` (DigitalOcean)  
**Admin URL:** `https://linkaios.linktrend.internal`  
**Runtime:** `LINKAIOS_UI_MOCKS=0` (confirmed in `/opt/linktrend/runtime/linkaios/prod.env.runtime` and container env)

---

## Deploy evidence

| Item | Value |
|------|--------|
| **Deployed commit (HEAD)** | `47e8da4d8973e048945c787eea806d9c91d2f9ea` |
| **Wave 0 commits** | `f7246f1` → `b527fd5` → `47e8da4` |
| **VPS path** | `/opt/linktrend/linkaios` |
| **Compose project** | `linkaios` (`docker-compose.deploy.yml`) |
| **Container** | `linkaios-linkaios-1` (recreated, Up) |
| **Prior VPS HEAD** | `eb7c297` (`deploy-wave11`) — stashed as `wave0-deploy-stash` before checkout |

### Deploy steps executed

1. `git push -u origin issue/admin-ui-fix`
2. SSH `linkdroplet-00`: stash local WIP → `git checkout issue/admin-ui-fix` → pull
3. `./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime`
4. `docker compose -f docker-compose.deploy.yml build linkaios`
5. `docker compose -f docker-compose.deploy.yml up -d --remove-orphans linkaios`

**Deploy blockers:** None. SSH and GSM render succeeded.

---

## Pre-deploy verification (local)

| Check | Result |
|-------|--------|
| Branch clean | **PASS** — only untracked report files + `supabase/.temp/` |
| `pnpm test` (focused) | **PASS** — 14/14 (`admin-linkskills-tenant`, `project-mission-id`, `traces-db`, `admin-vendor-ops`) |
| `pnpm typecheck` | **PASS** after clearing stale `.next/` artifacts (pre-existing cache noise unrelated to Wave 0) |

---

## Wave 0 acceptance checklist

Smoke run: authenticated Super Admin session, `LINKAIOS_UI_MOCKS=0`, browser + container env check.

| # | Route / surface | Result | Notes |
|---|-----------------|--------|-------|
| 1 | `/admin/skills` Overview | **PASS** | Hub cards render; no SQL/error boundary |
| 2 | `/admin/skills/skills` | **PASS** | Catalogue loads (`bootstrap` skill visible) |
| 3 | `/admin/skills/tools` | **PASS** | `http-fetch`, `workspace-read`, `restricted-shell` listed |
| 4 | `/admin/skills/leases` | **PASS** | Empty lease window; no crash |
| 5 | `/admin/memory` Inbox | **PASS** | Collective inbox rows render |
| 6 | `/admin/memory?tab=project` | **PASS** | Project Memory partition loads |
| 7 | `/admin/memory?tab=audit` | **PASS** | Audit trace log (22 events) |
| 8 | `/admin/work/alerts` | **PASS** | Alerts list renders; no "Something Went Wrong" |
| 9 | Worker LiNKbrain tab (finding 48) | **PASS** | `/admin/workers/a64f1a5e-91c3-4fd4-8f30-63d1e27929d9/brain` — empty partition OK |
| 10 | `/admin/projects/{id}?tab=leases` (finding 35) | **PASS** | `0fbbf6f1-ea9e-495a-93e4-cb9d35b3df66` — "Leases for this project", 0 rows |
| 11 | `/admin/licensees` (69) | **PASS** | Registry list loads |
| 12 | Licensee detail / Companies & Brands (70) | **PASS** | XYZ Marketing profile; no `registeredOffice` crash |

**Wave 0 gate:** **PASS** (12/12)

---

## Findings closed

| Finding | Title | Wave 0 closure |
|---------|-------|----------------|
| **20** | Alerts page Server Components crash | Alerts loads with live trace rows |
| **35** | Project detail Leases tab crash | Leases tab renders empty ledger |
| **48** | Demo agent LiNKbrain `mission_id` crash | Brain tab renders; `project_id` query path |
| **59** | LiNKskills Overview load failure | Overview hub loads post migrations 011/022 |
| **60** | Skills catalogue load failure | Skills catalogue loads |
| **61** | Tools `linkaios.tools` missing | Tools catalogue loads |
| **62** | Capabilities overview stats broken | Overview + `/admin/skills/governance` load |
| **63** | LiNKskills Leases tab crash | Leases tab loads |
| **64** | LiNKbrain all tabs `mission_id` crash | Inbox, Project Memory, Audit load |
| **69** | Company tab runtime crash | Licensee profile loads with guarded address fields |
| **70** | Brand tab runtime crash | Companies & Brands navigation without crash |

### Tracks completed (orchestrator handoff)

| Track | Status |
|-------|--------|
| **0A** DB verify/apply (011, 022, 033) | Done via Supabase MCP (prior sub-agent) |
| **0B** `mission_id` → `project_id` | `47e8da4` |
| **0C** Licensor leases resolver | `b527fd5` |
| **0D** Alerts Suspense + licensee guard | `f7246f1` |

---

## Observations (non-blocking)

- **Governance panel** shows `Licensor tenant ( unresolved )` on `/admin/skills/governance` — leases pages still load; consider setting `LICENSOR_TENANT_ID` in GSM for Wave 1+ lease/kill-switch UX.
- Container logs show occasional `invalid input syntax for type uuid: "default"` — unrelated to Wave 0 routes; track in Wave 1 if it surfaces in UI.
- VPS had local modifications on `deploy-wave11`; stashed before deploy. Principal may want to reconcile stash vs `issue/admin-ui-fix` compose/env deltas later.

---

## Blockers for Wave 1

Wave 0 unblocks rendering; **Wave 1 — Admin / Client boundary** remains:

| Area | Findings | Work |
|------|----------|------|
| Nav + sidebar | 1–4, 68 | Nest LiNKsuitegen under Suites; Fleet v1 under LiNKbots; remove submenu icons; **Clients / Licensees** label |
| Projects gating | 27, 28, 58 | Replace Client project CRUD bleed with **Admin Programs** intent |
| LiNKbots boundary | 40, 41, 46 | Remove **Add LiNKbot** on Admin; hide Projects tab on client-tenant bots |
| Product scope | — | Customer Service nav stub; vendor LiNKbrain copy vs Client Company Memory |

**Principal action:** None required to start Wave 1. Optional: confirm `LICENSOR_TENANT_ID` in GSM if governance kill-switch panel should show resolved tenant name.

---

## References

- Plan: `LiNKdev/product/reports/linktrend-system/ADMIN_UI_FIX_PLAN.md`
- Live review: `LiNKdev/product/reports/linktrend-system/ADMIN_UI_LIVE_REVIEW_2026-06-06.md`
- Deploy doc: `deploy/README.md` § Production VPS (linkdroplet-00)
