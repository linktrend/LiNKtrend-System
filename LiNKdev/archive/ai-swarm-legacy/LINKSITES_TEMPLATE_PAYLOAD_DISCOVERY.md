# LinkSites Template + Payload Discovery (WP-042)

Date: 2026-05-15  
Scope: read-only discovery in `/Users/linktrend/Projects/LiNKsites` for master template, Payload model, Supabase mirror clues, and preview frontend wiring.

## Known Facts (from repository evidence)

- Master template frontend is `apps/web-master`:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/registry.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/marketing-smb-v1.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/app/[lang]/[[...slug]]/page.tsx`
- Current template registry contains one concrete template module:
  - `marketing-smb-v1` exported by `marketing-smb-v1.ts` and set as fallback/default in `registry.ts`.
- Industry-template structure exists as template modules under:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/`
  - plus factory seed/scripts in `/Users/linktrend/Projects/LiNKsites/apps/cms/scripts/factory/`.
- Payload CMS app and config:
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/payload.config.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/collections/`
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/src/blocks/`
- Payload collections/content model are explicitly wired in `payload.config.ts` (examples):
  - Core: `sites`, `site-domains`, `site-settings`, `navigation`, `media`, `languages`, `users`, `api-keys`, `roles`
  - Content/page families: `pages`, `offer-pages`, `case-study-pages`, `video-pages`, `faq-pages`, `terms-pages`, `privacy-pages`, `cookie-policy-pages`, `articles`, `videos`, `testimonials`, `locations`, `team-members`, `help-articles`, categories collections, and others listed in `apps/cms/src/collections`.
- Supabase mirror/schema clues exist and are concrete:
  - `/Users/linktrend/Projects/LiNKsites/supabase/migrations/20260331_000001_lsites_init.sql` (creates `lsites_core` schema/tables)
  - `/Users/linktrend/Projects/LiNKsites/supabase/schemas/lsites_core.schema.json`
  - `/Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json` (Payload collection slug -> `lsites_core` table mapping)
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/scripts/sync-supabase-to-cms.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/cms/scripts/seed-supabase-lsites-core.ts`
- Frontend path that reads from Payload for preview:
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/payload-client.ts`
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/repository/`
  - `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/app/[lang]/[[...slug]]/page.tsx` (calls repository readers and renders selected template)
- Local Payload boot commands and env assumptions:
  - Commands from `/Users/linktrend/Projects/LiNKsites/apps/cms/package.json`: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm payload`, factory/sync scripts.
  - Required env from `/Users/linktrend/Projects/LiNKsites/apps/cms/.env.example`: `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL` (plus webhook/search vars as optional integrations).
  - `payload.config.ts` hard-requires `DATABASE_URI` (except codegen path) and auto-enables SSL for `.supabase.co` hosts.

## Assumptions (explicit)

- `apps/web-master` is treated as canonical master template for WP-042 because code + docs + inventory align on it.
- `marketing-smb-v1` appears to be the only currently registered template module; additional industry variants may be intended but are not currently registered in `src/templates/registry.ts`.

## Blockers / Open Questions

- No technical blocker for discovery completion.
- Clarification needed in follow-up implementation packets: whether v2 should continue with single-template (`marketing-smb-v1`) registry plus seeded variants, or require additional explicit industry template modules before wiring automation.

## Commands Run (discovery)

- `ls -la /Users/linktrend/Projects/LiNKsites`
- `rg --files /Users/linktrend/Projects/LiNKsites`
- `rg -n "payload|collection|slug|supabase|preview|web-master|template|industry|block|cms|payload.config|buildConfig|generated" /Users/linktrend/Projects/LiNKsites -g '!**/node_modules/**'`
- `sed -n` on the exact files listed above for evidence validation.

## Read-Only Proof (LiNKsites unchanged)

- Verified with:
  - `git -C /Users/linktrend/Projects/LiNKsites status --short`
- Result: no WP-042 edits were made in `/Users/linktrend/Projects/LiNKsites`.
