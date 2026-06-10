# Admin UI Fix — Infra Gap Closure

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Scope:** Close six remaining infra/gaps from integration pass

---

## Summary

Closed Plane lifecycle sync, licensor lead-agent UUID binding, Zulip empty-state UX, migration verification, and `agents.tenant_id` fleet scoping. Focused vitest suite expanded and passes.

---

## Gap closure

| # | Gap | Change |
|---|-----|--------|
| 1 | Plane → Archived status sync | `plane-project-status.ts` + `planeLiveState` on bridge; Admin project rows use `resolveEffectiveProjectStatus` |
| 2 | Lead LiNKbot binding | `resolveLicensorLeadAgentId` — licensor fleet UUID via `roleId` or exact `display_name`; template `roleId` on lead executors |
| 3 | `ZULIP_SITE_URL` | Already in `deploy/prod/.env.example`; Work → Messages shows banner + empty state without broken settings links when unset |
| 4 | Project brief migration | Verified `supabase/migrations/202606101200_admin_project_p1.sql` — `projects.brief` COMMENT + `get_project_run_spine` RPC |
| 5 | `agents.tenant_id` | New `202606101201_admin_agents_tenant_id.sql`; `resolveAgentTenantId` / View filter prefer column over `runtime_settings` |
| 6 | Deploy prep | Integration doc gaps cleared; focused tests run; branch pushed when auth allows |

---

## Migrations (Principal gate for non-local)

1. `supabase/migrations/202606101200_admin_project_p1.sql`
2. `supabase/migrations/202606101201_admin_agents_tenant_id.sql`

---

## Deploy readiness

| Item | Status |
|------|--------|
| Code on `issue/admin-ui-fix` | Ready after commit/push |
| Focused vitest (16 files) | Run in closure pass |
| GSM `ZULIP_SITE_URL` on linkdroplet-00 | **Human/Ops** — add via `./ops/render-runtime-env-from-gsm.sh` |
| Supabase migrations apply | **Principal gate** |
| Licensor fleet agent seed | **Ops** — agents need `tenant_id` or `linkaios_fleet.scope=licensor` for lead binding + View filter proof |

---

## Blockers (human / GSM only)

- **`ZULIP_SITE_URL`** in GSM for production LiNKaios web container (not a code gap).
- **Migration apply** on shared Supabase (Principal approval).
- **Licensor-scoped fleet rows** in AdminDB for live lead-agent binding smoke (data seed, not code).

---

## Key files

- `LiNKaios/linkaios-web/src/lib/plane-project-status.ts`
- `LiNKaios/linkaios-web/src/lib/admin-project-suite-binding.ts`
- `LiNKaios/linkaios-web/src/lib/agent-fleet-classification.ts`
- `LiNKaios/linkaios-web/src/lib/admin-projects-data.ts`
- `supabase/migrations/202606101201_admin_agents_tenant_id.sql`
