# Admin UI Fix — Integration Pass

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Integrator:** parallel subagent reconciliation + focused commits  
**Deploy host:** `linkdroplet-00`  
**Admin URL:** `https://linkaios.linktrend.internal`
**Branch HEAD:** `666cd622fa9fc029f565485d5adce571287bfe16` (`666cd62`)

**Gap-closure verification (2026-06-10):** Working tree clean. Linear history — `d53c191` (Stripe) → `490639f` (infra) → `666cd62` (docs); no duplicate or conflicting changes between those SHAs.

---

## Executive summary

Ten parallel subagent waves landed as uncommitted working-tree changes. Integration pass reconciled **P0 toolbar removal** with **P1 refresh toolbar**, wired **LinkSkills lease View filter**, fixed a broken linksuitegen test import, ran **45/45 focused vitest tests**, and grouped work into **5 commits** (see SHAs below).

**Merge conflicts:** None — no `<<<<<<<` markers; parallel edits were compatible.

**Integration fixes applied:**

| Fix | Detail |
|-----|--------|
| Toolbar | Removed `AppSurfaceSwitch` + `RolePreviewSelect` from `shell-chrome-toolbar.tsx`; kept Refresh + Help |
| LinkSkills View | Added `filterLeasesForViewScope`; wired leases hub + panel to `?scope=` |
| Test hygiene | Dropped Wave 7 block importing missing `@/lib/kernel/fleet/client-tenant-linktrend` |

---

## Ten-wave status

| # | Wave report | Priority | Status | Notes |
|---|-------------|----------|--------|-------|
| 1 | `admin-ui-fix-p0-admin-client.md` | P0 | **Integrated** | Mock hard-off on Admin; route bleed fixes; toolbar switcher removed in integration |
| 2 | `admin-ui-fix-p0-view-filter.md` | P0 | **Integrated** | Sidebar View + URL sync; Work/CS/LiNKbots wired; LinkSkills leases wired in integration |
| 3 | `admin-ui-fix-p0-alerts-plane.md` | P0 | **Integrated** | Alerts boundary, Plane hrefs, LiNKsuitegen routes restored |
| 4 | `admin-ui-fix-p1-customer-service.md` | P1 | **Integrated** | Chatwoot live sync, View-scoped queue |
| 5 | `admin-ui-fix-p1-linkbots.md` | P1 | **Integrated** | Fleet v1 merged, sessions/logs tab, native UI popup |
| 6 | `admin-ui-fix-p1-projects.md` | P1 | **Integrated** | Admin project wizard, brief editor, run spine |
| 7 | `admin-ui-fix-p2-brain-skills.md` | P2 | **Integrated** | Collective memory seeds, audit filters, hub nav surface-aware |
| 8 | `admin-ui-fix-p2-settings.md` | P2 | **Integrated** | LinkGuard cleanup panel + run API |
| 9 | `admin-ui-fix-p2-suites.md` | P2 | **Integrated** | Suite builder modals, module process tree |
| 10 | Integration pass (this doc) | — | **Complete** | Commits, tests, deploy checklist |

Prior wave acceptance docs (`admin-ui-fix-wave0.md` … `wave6.md`, `waves-3-6-complete.md`) remain historical; DO smoke at prior SHAs (`bb7a307`, `ed2e2c6`) superseded by this integration head.

---

## Commit SHAs (integration + gap closure)

| SHA | Message |
|-----|---------|
| `666cd62` | `docs(admin-ui): update integration summary after infra gap closure` |
| `490639f` | `feat(admin-ui): close infra gaps for plane status, fleet binding, and tenant scoping` |
| `d53c191` | `feat(admin): Stripe catalog API and Admin hybrid UI` |
| `6c081b7` | `docs(admin-ui): record integration commit SHAs in summary` |
| `309fecd` | `docs(admin-ui): wave acceptance reports and integration summary` |
| `e0cc9b4` | `chore(deploy): document Chatwoot public URL and project brief migration` |
| `fd38606` | `feat(admin-ui): integrate parallel wave fixes for Admin shell` |
| `0e38684` | `feat(scope): licensor View filter and LinkSkills lease scoping` |
| `44da8b7` | `fix(shell): remove admin/client switcher from toolbar` |

Authoritative: `git rev-parse issue/admin-ui-fix` → `666cd622fa9fc029f565485d5adce571287bfe16`.


---

## Test results

**Verified at HEAD `666cd62`:** 83 tests, 21 files, 0 failures.

```bash
cd LiNKaios/linkaios-web
pnpm test \
  src/lib/licensor-view-scope.test.ts \
  src/lib/admin-vendor-ops.test.ts \
  src/lib/admin-fleet-troubleshoot.test.ts \
  src/lib/admin-linkskills-tenant.test.ts \
  src/lib/chatwoot-links.test.ts \
  src/lib/plane-links.test.ts \
  src/lib/work-attention-feed.test.ts \
  src/lib/work-attention-feed-routing.test.ts \
  src/lib/metrics-snapshot-trend.test.ts \
  src/lib/session-stop-policy.test.ts \
  src/lib/suite-composition.test.ts \
  src/lib/admin-project-create.test.ts \
  src/lib/admin-project-suite-binding.test.ts \
  src/lib/plane-project-status.test.ts \
  src/lib/agent-fleet-classification.test.ts \
  src/lib/cockpit/cockpit-data.test.ts \
  src/lib/work-messages-scope.test.ts \
  src/lib/admin/linksuitegen/admin-integration.test.ts \
  src/lib/admin/linksuitegen/machine-review/openclaw-dispatch.test.ts \
  src/lib/admin/stripe/governance.test.ts \
  src/lib/admin/stripe/stripe-admin.test.ts
```

| Result | Count |
|--------|------:|
| **PASS** | 83 tests / 21 files |
| **FAIL** | 0 |

**Code hygiene (source tree):** No `ADMIN_LINKSKILLS_LEASE_SEED`, `buildAdminCollectiveBrainSeed`, or `app-surface-switch` in `LiNKaios/linkaios-web` — seed modules and switcher component removed (`490639f`). Historical wave reports may still mention them.

Typecheck not re-run full monorepo in this pass; prior wave docs report PASS at `bb7a307`.


---

## Deploy env checklist (linkdroplet-00)

Confirm in `/opt/linktrend/runtime/linkaios/prod.env.runtime` (render via `./ops/render-runtime-env-from-gsm.sh`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `LINKAIOS_UI_MOCKS=0` | **Yes** | Admin must not show demo overlays |
| `CHATWOOT_PUBLIC_URL` | **Yes** | Operator "Open in Chatwoot" popup (`https://chatwoot.linktrend.internal`) |
| `CHATWOOT_BASE_URL` | **Yes** | Internal Docker sync (`http://chatwoot-rails-1:3000`) |
| `PLANE_WORKSPACE_SLUG` | **Yes** | Plane board URLs (`linkprojects` on DO) |
| `NEXT_PUBLIC_PLANE_WORKSPACE_SLUG` | **Yes** | Client-side Plane links (same slug) |
| `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL` | **Yes** | LiNKbot Native UI popup on worker Sessions tab |
| `ZULIP_SITE_URL` | **Yes** | Work → Messages "Open in Zulip" — empty state when unset (no broken links) |
| `LICENSOR_TENANT_ID` | Recommended | LinkSkills lease tenant resolution without RPC seed |
| `STRIPE_SECRET_KEY` | **Yes** (Admin billing) | Suite billing tab + `cap.stripe.product_management` (GSM: `LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY`) |

Also verify: `NODE_ENV=production`, Supabase service role, GSM mount, Traefik host `linkaios.linktrend.internal`.

---

## Deploy steps (linkdroplet-00)

**Not executed in this pass** — document only.

```bash
# On VPS
cd /opt/linktrend/linkaios
git fetch origin
git checkout issue/admin-ui-fix   # or merge to development first per policy
git pull --rebase origin issue/admin-ui-fix

./ops/render-runtime-env-from-gsm.sh prod \
  --output /opt/linktrend/runtime/linkaios/prod.env.runtime

# Apply Supabase migrations (Principal gate if non-local)
#   supabase/migrations/202606101200_admin_project_p1.sql       — projects.brief + get_project_run_spine
#   supabase/migrations/202606101201_admin_agents_tenant_id.sql — agents.tenant_id fleet View scoping

docker compose -f docker-compose.deploy.yml build
docker compose -f docker-compose.deploy.yml up -d --remove-orphans
```

Health: `https://linkaios.linktrend.internal` loads; container `linkaios-linkaios-1` recreated.

---

## Known remaining gaps

None — infra closure pass complete (2026-06-10). Post-deploy still requires GSM/runtime values on linkdroplet-00 (`ZULIP_SITE_URL`, Supabase migration apply) — see deploy checklist above.

Historical gaps (closed this pass):

| Gap | Resolution |
|-----|------------|
| Plane → Archived status sync | Live Plane GET + mapping heuristic → Draft/Active/Archived on Admin project detail/index |
| Lead LiNKbot UUID binding | `resolveLicensorLeadAgentId` binds `primary_agent_id` from licensor fleet by `roleId` or exact name |
| `ZULIP_SITE_URL` | Documented in `deploy/prod/.env.example`; Work → Messages empty state when unset |
| Project brief migration | `202606101200_admin_project_p1.sql` — `projects.brief` + `get_project_run_spine` |
| `agents.tenant_id` | `202606101201_admin_agents_tenant_id.sql` + View filter reads column first |

---

## Recommended Principal smoke test order

1. **Toolbar** — `/admin` — no Admin/Client dropdown; Refresh spins; Help opens panel.
2. **View filter** — sidebar View → Admin → All licensees → XYZ Marketing; confirm banner + URL `?scope=`.
3. **LiNKbots** — `/admin/workers` — stat pills stay under `/admin/workers`; open session → Native UI popup if env set.
4. **Work → Alerts** — page loads (no crash); Plane/Zulip external links if env set.
5. **Work → Sessions** — list narrows with View; scoped inbox renders.
6. **Customer Service** — queue filters with View; Open in Chatwoot uses public URL.
7. **Projects** — `/admin/projects` — launch wizard, brief editor on detail.
8. **LiNKbrain** — `/admin/memory` — View filters collective list; Audit has no Add Knowledge.
9. **LiNKskills** — `/admin/skills/leases` — Admin view shows licensor seed rows only.
10. **Suites** — `/admin/suites` — builder modals, module tree expand.
11. **Settings → LinkGuard** — run cleanup button (governed).
12. **LiNKsuitegen** — `/admin/linksuitegen` — dashboard loads (no 404).

---

## Conflicts resolved

| Area | Resolution |
|------|------------|
| Shell toolbar | P0 removed switcher; P1 added refresh — **merged**: refresh kept, switcher removed |
| Role preview | Provider retained for RBAC; toolbar + sidebar badge removed per P0 |
| LiNKbots nav | P0 route bleed + P1 fleet merge — both kept via `useAppSurface().href()` |
| LinkSkills | P0 mock gating + P2 catalog + View filter — leases filter added in integration |

No git merge conflict markers were present.
