# Admin UI fix — full deploy pipeline (2026-06-10)

Principal-authorized promotion and linkdroplet-00 deploy for the `issue/admin-ui-fix` wave.

## Supabase AdminDB (`ilxzgfyllipkwrgrviof`)

| Migration | Status | Notes |
|-----------|--------|-------|
| `202606101200_admin_project_p1.sql` | **Applied** (pre-session) | `linkaios.projects.brief`, `linkaios.get_project_run_spine(uuid)` |
| `202606101201_admin_agents_tenant_id.sql` | **Applied** (this session) | `linkaios.agents.tenant_id` + index + backfill |

**Verification (session pooler, 2026-06-10):**

- `projects.brief` → `text`
- `agents.tenant_id` → `uuid`
- `get_project_run_spine` present in `linkaios`

Applied via `psql` + GSM `LINKTREND_ADMINDB_SUPABASE_SESSION_POOLER_URL` (Supabase CLI lacked `SUPABASE_ACCESS_TOKEN`; MCP-equivalent DDL executed directly).

## Runtime env (linkdroplet-00)

Rendered: `/opt/linktrend/runtime/linkaios/prod.env.runtime` from `./ops/render-runtime-env-from-gsm.sh prod`.

**Non-secret values set/confirmed on VPS `deploy/prod/.env`:**

| Variable | Value |
|----------|-------|
| `LINKAIOS_UI_MOCKS` | `0` |
| `ZULIP_SITE_URL` | `https://zulip.linktrend.internal` |
| `ZULIP_RUN_MESSAGING_MODE` | `live` (was `mock`; updated) |
| `PLANE_API_BASE_URL` | `https://plane.linktrend.internal` |
| `PLANE_WORKSPACE_SLUG` | `linkprojects` |
| `NEXT_PUBLIC_PLANE_URL` | `https://plane.linktrend.internal` |
| `NEXT_PUBLIC_PLANE_WORKSPACE_SLUG` | `linkprojects` |
| `PLANE_TLS_INSECURE` | `1` |
| `CHATWOOT_BASE_URL` | `http://chatwoot-rails-1:3000` |
| `CHATWOOT_PUBLIC_URL` | `https://chatwoot.linktrend.internal` (**added**) |
| `LICENSOR_TENANT_ID` | `da570876-176d-452a-a428-6536d48303e9` |
| `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL` | `https://linkbot.linktrend.internal` (**added**; OpenClaw gateway healthy on `:18789` via Traefik host) |

**GSM secrets resolved at render time (names):** `LINKTREND_ADMINDB_SUPABASE_SESSION_POOLER_URL`, `LINKTREND_AIOS_PROD_SUPABASE_SERVICE_ROLE`, `LINKTREND_AIOS_PROD_AIOS_INGRESS_TOKEN`, `LINKTREND_AIOS_PROD_PLANE_API_KEY`, `LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL`, `LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY`, `LINKTREND_AIOS_PROD_CHATWOOT_API_ACCESS_TOKEN`.

**Stripe:** `LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY` — **not present** in GSM project `linkbot-901208` (describe → NOT_FOUND). No runtime Stripe secret rendered.

## Git promotion

| Ref | SHA | Notes |
|-----|-----|-------|
| `issue/admin-ui-fix` (feature tip) | `9786c081560afeebdec2065a6865c2853139fcaa` | Pushed; merged via PR #121 |
| `development` | `3f3cb7d298afcc322598014db60dcfd5171cd699` | Merge PR #121 |
| `staging` | `d54bda479887e30c8e2fd585765d2456d3d1489b` | Merge PR #122 |
| `main` (promotion merge) | `35f87c245177b3980b313b8853ed66d929b81c99` | Merge PR #123 |
| `main` (deploy tip) | **`3ccef8b143f14b9df4f5e83b9f0ddbcb6e454160`** | Post-promotion hotfixes: restore linksuitegen libs, ESLint/typecheck unblock |

PRs: [#121](https://github.com/linktrend/LiNKtrend-System/pull/121) → development, [#122](https://github.com/linktrend/LiNKtrend-System/pull/122) → staging, [#123](https://github.com/linktrend/LiNKtrend-System/pull/123) → main.

**CI note:** PR #121 `build-test` failed on `@linktrend/bot-runtime` TypeScript (pre-existing monorepo graph); merge used admin bypass per Principal authorization.

## linkdroplet-00 deploy

- Path: `/opt/linktrend/linkaios`
- **Deploy SHA:** `3ccef8b143f14b9df4f5e83b9f0ddbcb6e454160`
- Commands: `git pull origin main`, `render-runtime-env-from-gsm.sh`, `docker compose -f docker-compose.deploy.yml build linkaios`, `up -d`
- Container: `linkaios-linkaios-1` **running**
- In-container probe: `GET http://127.0.0.1:3000/login` → **200**
- Public URL: **https://linkaios.linktrend.internal** (Traefik / internal CA; verify from operator workstation with trust store)

## Principal smoke checklist (separate browser windows)

### LiNKtrend Admin (`/admin` or Admin surface)

1. Sign in at https://linkaios.linktrend.internal — confirm no dev mock banner (`LINKAIOS_UI_MOCKS=0`).
2. **Projects** — open a project; Overview shows **brief** field; run spine loads without RPC error.
3. **Fleet / Workers** — View filter respects licensor tenant; open worker **Sessions** → **Native UI** opens `https://linkbot.linktrend.internal?agent=…`.
4. **Plane** — project row shows live Plane link (`linkprojects` workspace).
5. **Support / Chatwoot** — readiness uses `https://chatwoot.linktrend.internal` (shadow/live per `CRM_MODE`).

### LiNKaios Client (licensee surface)

1. Separate window/profile — Client home loads (not Admin shell).
2. Suites / Projects navigation unchanged; no Admin-only fleet controls visible.
3. Work → Messages — Zulip links use `https://zulip.linktrend.internal`.

## Follow-ups

- Back-merge `main` hotfixes (`86ba9f3`, `68f9f15`, `3ccef8b`) into `development` / `staging` to realign integration branches.
- Add `LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY` to GSM when Stripe catalog billing is ready.
- Repair `@linktrend/bot-runtime` CI build graph so `build-test` passes on future PRs.
