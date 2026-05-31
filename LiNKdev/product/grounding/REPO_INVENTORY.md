# Repo inventory

**Status:** Updated for Principal MVO reset — May 2026  
**Canonical product truth:** [`PRINCIPAL_PRODUCT_DEFINITION.md`](PRINCIPAL_PRODUCT_DEFINITION.md)

## Purpose

Summarize **what exists in LiNKtrend-System**, what is **reusable for MVO**, and what lives **outside this repo**.

---

## LiNKtrend System = this monorepo

Delivers **LiNKaios Client + LiNKtrend Admin** and integration/orchestration for Suites. First Suite: **LinkSites**.

| Owns (in repo) | Does not own (external) |
|----------------|-------------------------|
| LiNKaios UI/kernel, Admin surfaces | **LiNKsites** product: Payload, templates, frontend, VPS publish (`/Users/linktrend/Projects/LiNKsites`) |
| Plane ownership folders per plane | Full **n8n** fork (`/Users/linktrend/Projects/LiNKautowork`) |
| LinkSkills capability connectors | **LiNKbot-core** engine fork |
| Suite maps under `suites/` | Zulip server native DB |
| LiNKbot roles, adapters, Zulip bridge | |

---

## Canonical ownership map

- `docs/architecture/repo-architecture-target.md` — folder ownership target
- `LiNKaios/` — control plane; deployable app at `LiNKaios/linkaios-web`
- `LiNKskills/` — capability connectors, skills, logic-engine
- `LiNKbrain/` — memory/audit ownership home (compatibility code in migrations + linkaios-web)
- `LiNKautowork/` — workflow gateway
- `LiNKbot/` — runtime adapters, roles, communications profiles
- `LiNKguard/` — worker security sidecar (legacy `@linktrend/linkguard` package)
- `suites/linksites/` — LinkSites Suite workflow map (MVO)

Legacy `modules/` paths are retired; `suites/` is canonical.

---

## MVO touchpoints in this repo

| Area | Path |
|------|------|
| Client UI | `LiNKaios/linkaios-web/` |
| Kernel / SDK | `packages/linklogic-sdk/`, `LiNKaios/` |
| LinkSites integration | `suites/linksites/`, `LiNKaios/linkaios-web/src/lib/suite-integrations/` |
| Capabilities | `LiNKskills/capability-connectors/` |
| Workflows | `LiNKautowork/gateway/` |
| Bot roles | `LiNKbot/roles/suites/linksites/` |
| Migrations | `services/migrations/` |
| Zulip bridge | `LiNKbot/communications/temporary-gateways/zulip/` |

---

## External LinkSites repo

**`/Users/linktrend/Projects/LiNKsites`**

- Payload CMS (`apps/cms`)
- Website templates (`apps/web-master`, packages/blocks)
- Frontend that reads Payload for published sites
- VPS/deploy targets for `*.linktrend.media`

LiNKtrend-System integrates via Capabilities and contracts in [`CONTRACTS_MVO.md`](CONTRACTS_MVO.md). Do not duplicate product code here.

---

## Infrastructure (MVO required)

| System | In-repo integration |
|--------|---------------------|
| Supabase | `packages/db`, `services/migrations` |
| Zulip | Temporary gateway + `cap.zulip.run_messaging` |
| Plane | `cap.plane.execution_tracking` (studio GSM secrets) |
| OpenRouter | Model routing (D-06) |

---

## Legacy / archived

- `Archive/` — pre-cleanup monorepo trees (reference only)
- `LiNKtrend-LEXOS` — external; post-MVO
- `LiNKdev/product/archive/grounding-legacy/` — pre-2026-05 product plans

---

## Reuse recommendations (MVO)

- **Templates & CMS:** discover in LiNKsites repo; wire via Payload/Supabase Capabilities
- **UI:** shadcn patterns in linkaios-web
- **Logic:** extend `packages/linklogic-sdk` for contract types
- **Bot runtime:** LiNKbot-core via `LiNKbot/runtime-adapters/openclaw/bot-runtime`
- **Workflows:** LiNKautowork gateway handles per `CONTRACTS_MVO.md`
