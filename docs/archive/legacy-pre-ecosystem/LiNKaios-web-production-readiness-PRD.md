# LiNKaios Web — Production readiness & UI fixture PRD

**Status:** Draft (2026-04-15).  
**Scope:** `apps/linkaios-web` only — remove **default** hardcoded demo paths, add **explicit** opt-in mock/fixture mode for UI/UX testing, production hardening (empty states, errors, copy, env behavior).  
**Out of scope:** OpenClaw fork; `bot-runtime`; redesigning entire information architecture (IA) unless required to remove demo leakage.

---

## 1. Problem

Today the app **merges** hardcoded demo agents, missions, threads, and metrics with live Supabase data (`demo-entities.ts`, `demo-worker-ui.ts`, `DEMO_*` in overview, missions, workers, work, metrics, etc.). That is good for early screenshots but is **wrong for production**: operators cannot tell what is real, migrations and empty DBs look “full,” and Plane/LiNKbrain flows are harder to validate.

---

## 2. Product intent

| Mode | Who | Behavior |
|------|-----|------------|
| **Production (default)** | Deployed LiNKaios | **Only** data from Supabase (and documented env-driven bridges). **No** fake sidebar missions or agents. **No** demo rows merged into overview, work, missions, workers, or metrics. Clear **empty states** when tables are empty. |
| **UI mock mode (opt-in)** | Founder / QA testing UX | Single **env-gated** switch enables a **small, documented fixture pack** (agents, missions, threads, metrics snapshots) so screens remain testable **without** lying that data is real. A visible **banner** states mocks are on. |

One canonical flag (implementer picks exact name, document in §7):

- Suggested: **`LINKAIOS_UI_MOCKS=1`** (server-only, read in server components / server actions) **or** `NEXT_PUBLIC_LINKAIOS_UI_MOCKS=1` if client components must branch (prefer server-only to avoid client bundle leakage of mock logic). Implementer picks one and documents it in §7.

---

## 3. Definition — **production ready** (this PRD)

LiNKaios web is **production ready** when:

1. **Default path:** With mocks **off**, no route lists `demo-lisa`, `demo-smb`, or other hardcoded IDs unless returned **from Supabase** as real rows.
2. **Sidebar & nav:** Projects and workers lists come **only** from API/DB queries; if empty, show **empty state** (copy + CTA), not demo fillers.
3. **Mission / worker detail:** Visiting a former demo URL (`/missions/demo-smb`, `/workers/demo-lisa`, …) returns **not found** or a neutral empty redirect **unless** UI mocks are enabled (then fixture renders with banner).
4. **Merged dashboards:** Overview, Work, Metrics, Gateway previews — **no** `DEMO_*` merge when mocks off; optional fixture merge **only** when mocks on.
5. **Plane bridge:** When Plane env is unset, UI states **“Not configured”** (or similar) **without** implying a live sync happened; no fake “last sync” timestamps.
6. **Errors:** Failed Supabase reads show **operator-safe** error UI (not blank screens); log server-side per existing patterns.
7. **Copy:** Remove user-visible **“(demo)”** strings from default production surfaces unless mocks banner justifies it.
8. **Build & quality:** `pnpm --filter @linktrend/linkaios-web` — `tsc --noEmit`, `lint`, and `next build` all pass.
9. **Docs:** This PRD §7 env table + short **operator** paragraph: how to turn mocks on for a screenshot session.

---

## 4. Mock / fixture rules (when mocks **on**)

- Central module e.g. `src/lib/ui-mocks/` (name flexible) exporting **one** `isUiMocksEnabled()` and fixture objects.
- **Banner** component on `(shell)` layout when enabled: short text + link to this PRD section or internal doc.
- Fixtures **must not** use UUIDs that collide with possible real DB ids if that causes confusion; use clearly fake prefixes **or** namespace routes under `/dev/` only if product prefers (optional — default is same routes with banner).
- Do **not** write mock data to Supabase automatically.

---

## 5. Hardening (non-demo)

- **Empty states:** Missions list, workers list, memory partitions, skills catalog, traces — each has intentional empty copy + next step when count is zero.
- **Loading / error:** Where `error` from Supabase exists today but is ignored, surface minimally.
- **Env:** Document required env for each bridge (Plane, gateway, brain cron) in §7; no secrets in `NEXT_PUBLIC_*` except already-approved publishable keys.

---

## 6. Explicit non-goals (v1 of this PRD)

- Full design-system overhaul.
- Replacing all placeholder form hints (keep helpful placeholders).
- E2E suite for every page (optional: one Playwright smoke if already low cost).

---

## 7. Environment & operator notes

| Variable | Purpose |
|----------|---------|
| `LINKAIOS_UI_MOCKS` | `1` / `true` / `yes` enables fixture pack + shell banner (server-side, via `@linktrend/shared-config`); unset / `0` / `false` = production behaviour (Supabase-only lists, `notFound()` on fixture mission/worker ids). |

**Operator:** For UI/UX review on an empty database, set `LINKAIOS_UI_MOCKS=1`, restart the Next server, exercise flows, then remove the variable or set `0` before pointing stakeholders at the deployment.

---

## 8. Acceptance criteria (checklist)

- [ ] Grep for `demo-lisa`, `demo-smb`, `DEMO_SIDEBAR` in `apps/linkaios-web` — either removed from default paths or strictly behind `isUiMocksEnabled()`.
- [ ] `next build` passes with mocks **off** and **on**.
- [ ] Manual: cold start with empty DB + mocks **off** — app is usable and honest (empty states).
- [ ] Manual: mocks **on** — key flows still populate for UX review.

---

## 9. Document control

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-15 | Initial PRD. |
