# Repo inventory

**Status:** Inventory complete (WP-001).

## Purpose

Single place to summarize **what exists in this repository**, **what is reusable for the WebsiteFactory MVO**, and **what is out of scope** for the first slice.

## Sections

### Monorepo / package layout (LiNKtrend-System)

- `apps/linkaios-web`: Next.js dashboard for organizational control.
- `apps/bot-runtime`: Node.js adapter wiring LinkBot (OpenClaw) to LiNKaios.
- `apps/openclaw-shim`: Mock OpenClaw server for testing.
- `packages/db`: Shared Supabase client wrapper.
- `packages/linklogic-sdk`: Core SDK for plane-to-plane communication.
- `packages/observability`: Shared logging and tracing.
- `services/migrations`: Canonical Postgres/Supabase schema definitions.

### LinkSites / WebsiteFactory touchpoints

- `LiNKsites/apps/cms`: Payload CMS instance for site content management.
- `LiNKsites/apps/web-master`: Primary Next.js template for generated sites.
- `LiNKsites/packages/blocks`: Reusable UI blocks for the factory pipeline.

### LiNKaios / LiNKbrain / LinkSkills / LiNKautowork / LinkBot touchpoints

- **LiNKaios:** `apps/linkaios-web` (UI) and `packages/linklogic-sdk` (logic).
- **LiNKbrain:** `Archive/LiNKaios/packages/linkbrain` (migrations) for schema reference.
- **LinkSkills:** `LiNKskills/services/logic-engine` and `LiNKskills/skills/` (catalog).
- **LiNKautowork:** `LiNKautowork/gateway/` (n8n integration).
- **LinkBot:** `LiNKbot-core` (runtime) and `apps/bot-runtime` (adapter).

### Infrastructure (Supabase, hosting, CI)

- **Database:** Supabase (Postgres + Auth + RLS).
- **Migrations:** Managed in `LiNKtrend-System/services/migrations`.
- **Hosting:** Vercel (frontend) and Docker/Podman (runtimes).

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
