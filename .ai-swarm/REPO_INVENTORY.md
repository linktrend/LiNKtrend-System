# Repo inventory

**Status:** Inventory complete (WP-001).

## Purpose

Single place to summarize **what exists in this repository**, **what is reusable for the WebsiteFactory MVO**, and **what is out of scope** for the first slice.

## Sections

### Canonical ownership map

- `docs/architecture/repo-architecture-target.md`: source of truth for the target repo layout.
- `LiNKaios/`: LiNKaios ownership home; compatibility code remains in `LiNKaios/linkaios-web` and `packages/linkaios-kernel`.
- `LiNKskills/`: LinkSkills governance, skills, tools, scripts, catalogs, and capability connectors.
- `LiNKskills/capability-connectors/`: canonical connector registry and connector docs/manifests.
- `LiNKbrain/`: LiNKbrain ownership home for memory, audit, retrieval, context assembly, benchmarks, schemas, and migration references.
- `LiNKautowork/`: deterministic workflow gateway and templates for the external n8n fork.
- `LiNKbot/`: bot runtime adapters, fleet metadata, role definitions, and communication profiles.
- `LiNKguard/`: worker security and cleanup sidecar formerly known as PRISM Defender.
- `modules/`: tenant-enabled modules such as LinkSites, LiNKapps, Linktrend Media, and LEXOS practice areas.

### Monorepo / package layout (LiNKtrend-System)

- `LiNKaios/linkaios-web`: Next.js dashboard for organizational control.
- `LiNKbot/runtime-adapters/openclaw/bot-runtime`: Node.js adapter wiring LiNKbot (OpenClaw) to LiNKaios.
- `LiNKbot/runtime-adapters/openclaw/openclaw-shim`: Mock OpenClaw server for testing.
- `LiNKguard/sidecar/linkguard`: Legacy PRISM package implementation under the LiNKguard ownership home.
- `LiNKbot/communications/temporary-gateways/zulip`: Temporary mission-aware Zulip bridge during native OpenClaw channel evaluation.
- `apps/`: Deployable-entrypoint area; currently still contains `linkaios-web`.
- `packages/db`: Shared Supabase client wrapper.
- `packages/linklogic-sdk`: Core SDK for plane-to-plane communication.
- `packages/observability`: Shared logging and tracing.
- `services/migrations`: Canonical Postgres/Supabase schema definitions.

### LinkSites / WebsiteFactory touchpoints

- `LiNKsites/apps/cms`: Payload CMS instance for site content management.
- `LiNKsites/apps/web-master`: Primary Next.js template for generated sites.
- `LiNKsites/packages/blocks`: Reusable UI blocks for the factory pipeline.

### LiNKaios / LiNKbrain / LinkSkills / LiNKautowork / LiNKbot touchpoints

- **LiNKaios:** `LiNKaios/linkaios-web` (UI) and `packages/linklogic-sdk` (logic).
- **LiNKbrain:** `LiNKbrain/` is the ownership home; active compatibility code is in `packages/linklogic-sdk/src/brain-*`, `LiNKaios/linkaios-web/src/components/linkbrain`, and `services/migrations/*linkbrain*`.
- **LinkSkills:** `LiNKskills/services/logic-engine` and `LiNKskills/capability-connectors/`.
- **LiNKautowork:** `LiNKautowork/gateway/` (n8n integration).
- **LiNKbot:** `LiNKbot-core` (external runtime) and `LiNKbot/` ownership home; active OpenClaw adapter code is in `LiNKbot/runtime-adapters/openclaw/bot-runtime`.
- **LiNKguard:** `LiNKguard/` ownership home; active compatibility package code is in `LiNKguard/sidecar/linkguard`.

### Infrastructure (Supabase, hosting, CI)

- **Database:** Supabase (Postgres + Auth + RLS).
- **Migrations:** Managed in `LiNKtrend-System/services/migrations`.
- **Hosting:** DigitalOcean is the user-confirmed deployment target; Docker/Podman remain runtime packaging references.

### Known legacy or archived code paths

- `Archive/LiNKaios/`: Previous monorepo structure; use for schema/pattern reference.
- `Archive/LiNKopenclaw/`: Original bot runtime; use `LiNKbot-core` instead.
- `LiNKtrend-LEXOS`: Legal vertical; reference only for MVO.

### Reuse recommendations

- **Template:** Use `LiNKsites/apps/web-master` as the default MVO template.
- **UI:** Use `LiNKapps/packages/ui` (shadcn) for all new dashboard components.
- **Logic:** Reuse `LiNKskills/services/logic-engine` as the basis for the LinkSkills plane.
- **Workflow:** Reuse `LiNKautowork/gateway` for n8n coordination.
- **Bot:** Use `LiNKbot-core` as the runtime, controlled via `bot-runtime` adapter.
