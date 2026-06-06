# LiNKdeveloper Suite

LiNKdeveloper is the Software Development Lifecycle suite — governed product runs from opportunity intake through launch and continuous improvement.

**v1 placement:** Operator UX on **LiNKaios Client** for the **Linktrend** studio tenant (Zulip + inbox parity). **LiNKsuitegen** stays Admin-only. Other client tenants are not marketplace-listed until explicitly opened.

The implementation lives in the external repo [`LiNKdeveloper`](https://github.com/linktrend/LiNKdeveloper) (`/Users/linktrend/Projects/LiNKdeveloper`). This folder is declaration-only: registry entry, manifest pointer, module catalogue hook, and workflow map. No runtime duplication.

**Forward plan:** `LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md`

## External artefacts

| Path (LiNKdeveloper repo) | Purpose |
| --- | --- |
| `manifest/linkdeveloper.suite.json` | Canonical module catalogue (10 modules, phases, issue templates) |
| `suite/load-manifest.mjs` | Loader for orchestrator and CI |
| `suite/schema.mjs` | Zod schema for manifest validation |
| `docs/IMPLEMENTATION_PACKAGE_INDEX.md` | Implementation package index |
| `docs/LINKDEVELOPER_AS_SUITE_MAP.md` | Human-readable suite map |
| `docs/LINKAIOS_ADMIN_INTEGRATION_SPEC.md` | Admin API and UI contract (LD-18+) |

## Module catalogue hook

`module-catalogue.ts` exposes the stable pointer Admin and LiNKaios use to resolve the external manifest. LD-18 wires API routes; this packet registers the catalogue contract only.

## Visibility

`visibility: client_entitled` — entitled on **Client** for tenant slug **`linktrend`** in v1; not in general client marketplace. Admin retains optional cross-tenant support API routes when `admin_cross_tenant_support: true`.

## Fleet (v1)

| OpenClaw | Role |
|----------|------|
| `linkdeveloper-orchestrator` | Suite head (factory control) |
| `linkdeveloper-steward` | Product steward (per active product run) |

Specialist suite roles map to **Agent Zero lanes** and **LiNKautowork** per `STUDIO_FORWARD_PLAN.md` §4.2.
