# Admin UI Fix — Wave 2 Acceptance Report

**Date:** 2026-06-08  
**Branch:** `issue/admin-ui-fix`  
**Deploy host:** `linkdroplet-00` (DigitalOcean)  
**Admin URL:** `https://linkaios.linktrend.internal`  
**Runtime:** `LINKAIOS_UI_MOCKS=0` (container env confirmed `0`)

---

## Deploy evidence

| Item | Value |
|------|--------|
| **Deployed commit (HEAD)** | `65b8d1b4445d0c5daad251d69ec843cbe0a48263` |
| **Wave 2 feature commits** | `e2481d4` (2A) → `b3be82a` (2B) → `441d29d` (2D) → `6bf4172` (2C) |
| **Deploy hotfix** | `65b8d1b` — `team-members-add-button.tsx` hooks order (unblocked Docker `next build`) |
| **VPS path** | `/opt/linktrend/linkaios` |
| **Container** | `linkaios-linkaios-1` (recreated, Up) |
| **Prior VPS HEAD** | `feb4582` (Wave 1) |

### Deploy steps executed

1. `git push origin issue/admin-ui-fix`
2. SSH `linkdroplet-00`: `git checkout issue/admin-ui-fix` → `git pull`
3. `./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime`
4. `docker compose -f docker-compose.deploy.yml build linkaios`
5. `docker compose -f docker-compose.deploy.yml up -d --remove-orphans linkaios`

**First build attempt** at `6bf4172` failed: ESLint `react-hooks/rules-of-hooks` in `team-members-add-button.tsx` (Wave 2C). Fixed in `65b8d1b`; second build succeeded.

**Deploy blockers after hotfix:** None.

---

## Pre-deploy verification (local)

| Check | Result |
|-------|--------|
| Branch state | **PASS** — clean working tree on `issue/admin-ui-fix`; Wave 2 commits present; only untracked plan/review docs outside scope |
| `pnpm typecheck` (`linkaios-web`) | **PASS** |
| `pnpm build` (`linkaios-web`) | **PASS** after `65b8d1b` hooks fix |
| `pnpm lint` (`linkaios-web`) | **WARN** — pre-existing unused-vars; one hooks error fixed in hotfix |
| Focused tests | **PASS** — `app-roles.platform-settings.test.ts` (2/2), `licensor-licensee-profile.test.ts` (4/4), `licensor-operator-team.test.ts` (4/4), `settings-hub-tabs.test.ts` (5/5) — **15/15** |

---

## Wave 2 acceptance checklist

Smoke run: authenticated Super Admin session, `LINKAIOS_UI_MOCKS=0`, browser on DO Admin.

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | `/admin/licensees` — browse licensees, open detail, no crash on Overview or Companies index | **PASS** | Registry lists XYZ / LEXOS / Harbor; detail Overview shows licensor service-profile copy (Contract Legal Entity, Service Contacts); Companies & Brands tab loads contacts without `registeredOffice` crash |
| 2 | Admin Settings Account: profile only — no delete, billing, support | **PASS** | `/admin/settings/user` — profile hero, Basic/Contact/About, **Platform access** card only; no Delete account, Plan & Billing, or Support cards in DOM |
| 3 | Super Admin sees Platform tab in Settings | **PASS** | Sidebar **Platform** link + hub tab selected at `/admin/settings?tab=platform`; Integration Routing, Automation traces, LiNKguard, MVO Proof Surfaces cards |
| 4 | No Integrations request card on Admin | **PASS** | `/admin/settings?tab=data` — **Data Export**, **Data Settings**, **Platform Secrets** only; no licensee Integrations request card |
| 5 | Add member flow visible for Super Admin (finding 73) | **PASS** | `/admin/settings/access` — **Add Team Member** opens invite modal (full name, email, role); copy documents audit + stubbed email for MVO |

**Wave 2 gate:** **PASS** (5/5)

---

## Findings closed

| Finding | Title | Wave 2 closure |
|---------|-------|----------------|
| **68** | Company → Clients / Licensees | Sidebar **Clients / Licensees**; registry + per-licensee **Client / Licensee Profile** with service-scope copy (not corporate governance) |
| **69** | Company tab crash (`registeredOffice`) | Licensor overview panels guard fixtures; DO detail Overview loads without error boundary |
| **70** | Brand / Companies tab crash | Companies & Brands tab shows operational service contacts index; no Client brand-asset crash |
| **71** | Settings Account licensee bleed | Admin account surface profile-only; delete/billing/support hidden for licensor Admin |
| **72** | Workspace access card misfit | **Platform access** card shows licensor tier, assigned licensees, admin sections (not tenant subscription shape) |
| **73** | Security — roles + Add member | Gated **Add Team Member** + invite modal with full fields; server action stub with audit note (email delivery shadow OK per MVO) |
| **74** | 2FA appears mock | **Demo setup key** label + MVO copy on `/admin/settings/two-factor`; clearly not production QR |
| **76** | Data tab admin purpose | Data Export, Data Settings, Platform Secrets (Vaultwarden) — licensor operator direction |
| **77** | Integrations card bleed | Integrations request card absent on Admin Data tab |
| **78** | Platform tab visibility | Platform tab in sidebar + hub for Super Admin on DO |

---

## Tracks completed

| Track | Commit | Status |
|-------|--------|--------|
| **2A** Licensees registry | `e2481d4` | Done |
| **2B** Settings Account | `b3be82a` | Done |
| **2C** Settings Security | `6bf4172` | Done |
| **2D** Settings Data + Platform | `441d29d` | Done |
| **Hotfix** Docker build | `65b8d1b` | Done |

---

## Principal checkpoint — required stop (Wave 2)

**Do not start Wave 3** until Principal confirms this checkpoint on DO.

### URLs to verify (Super Admin, Admin workspace, All licensees unless noted)

| Area | URL | What to check |
|------|-----|----------------|
| Licensees registry | `https://linkaios.linktrend.internal/admin/licensees` | Browse three licensees; copy says **Clients / Licensees** |
| Licensee detail | `https://linkaios.linktrend.internal/admin/licensees` → select **XYZ Marketing Group** | Overview + **Companies & Brands** tabs load; service contacts, not AGM/share capital |
| Settings Account | `https://linkaios.linktrend.internal/admin/settings/user` | Profile only; **Platform access** card at bottom |
| Settings Security / team | `https://linkaios.linktrend.internal/admin/settings/access` | **Add Team Member** → invite modal |
| Settings 2FA | `https://linkaios.linktrend.internal/admin/settings/two-factor` | Demo labeling visible |
| Settings Data | `https://linkaios.linktrend.internal/admin/settings?tab=data` | No **Integrations** request card |
| Settings Platform | `https://linkaios.linktrend.internal/admin/settings?tab=platform` | Tab visible; routing / traces / LiNKguard links |

### What changed (plain English)

- **Clients / Licensees** is now a usable vendor registry: browse tenants, open a service profile, and switch tabs without the old corporate-profile crash.
- **Admin Settings** matches licensor staff: account is profile-only, workspace access shows platform scope, Super Admins get a **Platform** tab and licensor **Data** cards (no licensee integration requests).
- **Team invites** are wired in the UI with a documented shadow path until live Supabase invite email ships.

### Open blockers / deferrals (not Wave 2 gate failures)

| Item | Notes |
|------|--------|
| **Invite email live send** | Modal + server action present; Principal should not expect delivery email until Supabase Auth admin invite is live |
| **First-login password reset** | Documented in invite copy; `must_change_password` enforcement not proven end-to-end on DO |
| **2FA production** | Still demo/local until Supabase MFA QR enrollment |
| **Role preview bleed** | Preview role **User** on Admin may still hide Platform/Security/Data tabs by design — verify tier expectations |
| **LICENSOR_TENANT_ID** | Governance panel may still show unresolved licensor tenant (carried from Wave 0/1) |
| **`/admin/fleet` 404** | Nav link from Wave 1; page deferred to Wave 3 |
| **LiNKskills / LiNKbrain load state** | Not re-tested in Wave 2 smoke; Wave 0 fixes assumed still valid — Principal may spot-check before Wave 3 |

---

## Observations (non-blocking)

- Wave 2 commit order on branch: 2D (`441d29d`) landed before 2C (`6bf4172`) in git history; all four tracks present at deploy SHA.
- Deploy required one-line hooks hotfix outside the four named Wave 2 commits.

---

## References

- Plan: `LiNKdev/product/reports/linktrend-system/ADMIN_UI_FIX_PLAN.md`
- Wave 0: `LiNKdev/product/reports/linktrend-system/admin-ui-fix-wave0.md`
- Wave 1: `LiNKdev/product/reports/linktrend-system/admin-ui-fix-wave1.md`
- Live review: `LiNKdev/product/reports/linktrend-system/ADMIN_UI_LIVE_REVIEW_2026-06-06.md`
