# Repo Strategy And Reuse Map v2

## Recommended Repo Structure

Keep the agreed structure:

```text
LiNKtrend-System / LiNKaios monorepo
- kernel
- dashboard
- vertical plugins
- capability plugin definitions
- shared contracts
- shared UI
- service SDK clients

Separate service repos
- LiNKbrain
- LiNKskills
- LiNKautowork
- LiNKbot-core
```

## Confirmed Reuse Anchors

### LiNKaios

Use `LiNKtrend-System` as the LiNKaios monorepo.

Reuse:

- `LiNKaios/linkaios-web`
- existing 12 routes
- sidecar apps where useful
- `packages/auth`
- `packages/db`
- `packages/observability`
- `packages/shared-types`
- `packages/ui` if current
- existing Supabase migrations where compatible

Do not rebuild the dashboard.

### LinkSkills

Use `LiNKskills` as the LinkSkills repo.

Reuse:

- `services/logic-engine`
- build registry script
- API run script
- retention worker
- Gold Skill Template v1.2.0
- catalogued skills/tools
- existing frontmatter conventions
- existing PRD-locked structure

MVO work is to wire existing logic-engine to MVO contracts and add LinkSites capabilities.

### LiNKautowork

Use `LiNKautowork` as the LiNKautowork repo.

Reuse:

- n8n gateway
- HMAC/signed ingress
- tenant validation
- audit writeback pattern
- event bridge
- kill-switch controls
- template/live workflow folders
- embedded n8n fork if already used

MVO work is to add LinkSites workflows and connect to LinkSkills/LiNKbrain.

### LiNKbrain

Use existing archive code as the base.

Source:

```text
/Users/linktrend/Projects/Archive/LiNKaios/packages/linkbrain/
```

Reuse:

- SQL migrations
- `lb_core`
- `lb_shared`
- `lb_scratch`
- RLS patterns
- RPC patterns
- scratch-to-lesson concept
- audit runs pattern

MVO work is to create or update the active LiNKbrain repo around these migrations and expose minimal HTTP APIs.

### LinkSites

Use `LiNKsites`.

Reuse:

- `apps/cms`
- Payload CMS site factory
- `apps/web-master`
- packages/blocks
- packages/ui if useful
- template system

MVO work is to use this as the first preview-site engine.

### LiNKapps

Use `LiNKapps` as the design-system ancestor.

Reuse:

- `packages/ui`
- `packages/config`
- design tokens
- Tailwind preset
- ESLint rule pattern blocking raw primitive imports

MVO work may defer full design-system port if it blocks the demo, but should not rebuild UI primitives from scratch.

### LiNKbot

Use `LiNKbot-core`.

Compare with:

```text
/Users/linktrend/Projects/Archive/LiNKopenclaw/
```

Day-1 decision: whether current `LiNKbot-core` is ahead of archive/upstream or needs sync.

MVO work is to build the adapter path, not refactor all OpenClaw.

### LEXOS

Keep `LiNKtrend-LEXOS` separate.

Use it later as LawFirm vertical reference. Do not merge during WebsiteFactory MVO.

## Missing Items To Create

- `dev-swarm/` (factory; plans/contracts in `dev-swarm/product/grounding/`)
- WebsiteFactory plugin manifest
- MVO shared contracts
- LiNKbrain HTTP service if not already present
- LinkSkills LinkSites capabilities
- LiNKautowork LinkSites workflow templates
- LiNKbot Website Scout / Studio Manager adapter
- LiNKaios wiring to real service endpoints
- unified audit event contract

## Reuse Rule

The sprint should not reward old code for existing. Reuse only if it accelerates the MVO and does not violate system boundaries.

If old code is useful but messy, wrap it with an adapter.
