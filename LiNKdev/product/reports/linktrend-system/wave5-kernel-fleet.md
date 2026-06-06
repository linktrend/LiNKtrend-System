# Agent Report: Wave 5 — Platform kernel and fleet wiring

**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 5 (deliverables 5.1–5.8)  
**Repo:** `LiNKtrend-System`  
**Branch:** `issue/wave5-kernel-fleet`  
**Date:** 2026-06-06

## Summary

Wave 5 wires LiNKaios kernel fleet policy into code: `runtime_tier` on suite issue templates, tenant provision/subscribe guards, tenant isolation tests, unified bot-runtime dispatch router, legacy LiNKaios mapping sync to fleet v1, and Supabase fleet binding tables. Hetzner (Wave 12) and VPS live `LINKDEVELOPER_SERVICE_URL` smoke remain deferred.

## Deliverables

| # | Deliverable | Status | Evidence |
|---|-------------|--------|----------|
| 5.1 | `FLEET_AND_RUNTIME_POLICY.md` cross-linked from `.cursor/rules/` | **Done** | `.cursor/rules/09-fleet-and-runtime-policy.mdc` |
| 5.2 | Tenant provision: CEO profile + council flag | **Done** | `kernel/fleet/tenant-provision.ts` + `tenant-provision.test.ts` |
| 5.3 | Suite subscribe: entitlements + head slot allocation | **Done** | `kernel/fleet/suite-subscribe.ts` + `suite-subscribe.test.ts` |
| 5.4 | `runtime_tier` on issue templates + validation script | **Done** | `kernel/fleet/issue-templates.ts`, `scripts/validate-runtime-tiers.mjs` |
| 5.5 | Unified dispatch router (OC / AZ / autowork / codex / council) | **Done** | `bot-runtime/src/unified-dispatch.ts` + tests |
| 5.6 | Tenant isolation test suite (two tenants) | **Done** | `kernel/fleet/tenant-isolation.test.ts` |
| 5.7 | Fleet binding migrations | **Done** | `supabase/migrations/20260606120000_wave5_fleet_kernel.sql` |
| 5.8 | `LINKDEVELOPER_SERVICE_URL` live on VPS | **Deferred** | `getLinkdeveloperAdminClient()` HTTP path exists; VPS URL not set (Hetzner deferred) |

## Legacy mapping sync (fleet v1)

| File | Change |
|------|--------|
| `LiNKaios/.../suite-role-mapping.ts` | Outreach → `linksites-head`; research/build/librarian → AZ lanes; legacy `linksites-builder` / `librarian` removed |
| `LiNKaios/.../openclaw-dispatch.ts` | Orchestrator roles → `admin-openclaw`; factory roles → null (Agent Zero) |
| `bot-runtime/fleet-runtime-mappings.ts` | Compile-boundary mirror of LiNKbot suite mapping barrels |

## Test results

**Status: PASS** (2026-06-06)

| Command | Result |
|---------|--------|
| `pnpm --filter @linktrend/bot-runtime test` | 19 files, 121 tests — pass |
| `pnpm exec vitest run` (kernel/fleet + mapping + openclaw-dispatch) | 6 files, 16 tests — pass |
| `node scripts/validate-runtime-tiers.mjs` | pass |

## Integrator

Merge `issue/wave5-kernel-fleet` → `development` when review passes. Apply `20260606120000_wave5_fleet_kernel.sql` on staging Supabase before fleet provision RPC smoke.
