# Decisions log

Record **Accepted**, **Stubbed**, or **Deferred** decisions with enough context that agents do not re-litigate silently.

## Decision table

| ID | Date | Decision | Reason | Alternatives Considered | Status | Owner |
|----|------|----------|--------|-------------------------|--------|-------|
| D-01 | 2026-05-14 | **CRM:** local CRM stub (Postgres table + minimal REST) for MVO; real Chatwoot/Odoo deferred to post-MVO | Real Chatwoot/Odoo requires hosted instance, auth, and webhook wiring that blocks the 7-day target. WP-001 found no in-repo Chatwoot/Odoo client. Local stub still produces the required audit/lease/memory write per `ARCHITECTURE_RULES.md`. | Real Chatwoot; real Odoo CRM; local in-memory/file stub | **Stubbed** | integration-agent |
| D-02 | 2026-05-14 | **Plane:** local project/task store (Postgres tables `mvo_projects`, `mvo_tasks`) for MVO; real Plane API deferred | No Plane client present in active repos (WP-001 / `REPO_INVENTORY.md`). Day-1 setup of Plane workspace + API tokens is not on the critical path of lead-to-preview. Local store satisfies coordination artifact requirement in `04-mvo-scope-and-stubbing.mdc`. | Real Plane API; local stub store | **Stubbed** | integration-agent |
| D-03 | 2026-05-14 | **Preview publishing:** static/local preview via `LiNKsites/apps/web-master` rendered + served from `apps/linkaios-web` for MVO; DigitalOcean-hosted preview/publish path deferred to post-MVO | `LiNKsites/apps/web-master` exists and is Next.js. Static/local route produces a preview URL fast and keeps the demo deterministic. Payload CMS publish path stays available as the post-MVO upgrade. User-confirmed hosted target is DigitalOcean, not Vercel; prior Vercel references are superseded. | LinkSites/Payload CMS path; static/local HTTP preview; DigitalOcean App Platform/Droplet preview hosting | **Accepted** (static/local) | linkaios-agent |
| D-04 | 2026-05-14 | **OpenClaw source:** ship `LiNKbot-core` as-is; do not revive `Archive/LiNKopenclaw`; no upstream sync this sprint | WP-001 confirmed `LiNKbot-core` is the active runtime with an adapter at `LiNKtrend-System/apps/bot-runtime`. Archive tree is reference-only. Upstream sync is not on the MVO critical path. | Ship LiNKbot-core as-is; revive archived tree; track upstream OpenClaw | **Accepted** | linkbot-agent |
| D-05 | 2026-05-14 | **Supabase mode:** remote Supabase project (Postgres + Auth + RLS); local Postgres only as fallback for offline dev | `packages/db` already wraps Supabase client (WP-001). Remote Supabase gives Auth/RLS without rebuilding. Migrations live in `services/migrations`. Local-only Postgres rejected because it forces a parallel auth path. | Hosted Supabase project; local Postgres only | **Accepted** | database-architect |
| D-06 | 2026-05-14 | **Model routing:** OpenRouter (single hosted gateway) for MVO; LiteLLM deferred as optional self-hosted gateway | OpenRouter avoids hosting a routing service inside the 7-day window and keeps secret surface small (one provider key). LiteLLM revisited if cost/policy needs centralized control post-MVO. | OpenRouter direct; LiteLLM gateway | **Accepted** | linkaios-agent |
| D-07 | 2026-05-14 | **Website template source:** `LiNKsites/apps/web-master` as the default MVO template | WP-001 inventory confirms `web-master` is the primary Next.js template and `LiNKsites/packages/blocks` provides reusable blocks. No superior alternative discovered in scan. | Fixed `apps/web-master`; alternate package from WP-001 scan | **Accepted** | linkaios-agent |
| D-08 | 2026-05-14 | **Audit event contract:** all services emit a standardized audit envelope to LiNKbrain (`event_id`, `tenant_id`, `actor`, `plane`, `action`, `subject`, `lease_id?`, `workflow_run_id?`, `ts`, `payload`); per-service ad hoc logging rejected | Required by `04-mvo-scope-and-stubbing.mdc` ("no audit event" is an unacceptable stub) and by the LiNKbrain plane definition. Full schema lands in `CONTRACTS_MVO.md` via WP-004. | Standardized envelope to LiNKbrain; per-service ad hoc logging only | **Accepted** | linkbrain-agent |
| D-09 | 2026-05-15 | **Plugin architecture v2:** the LiNKaios plugin contract distinguishes `plugin_kind: "vertical" \| "capability"`, declares `modes_supported` (`development`/`shadow`/`live`), allows vertical plugins to declare LinkBot role attachments, and requires capability plugins to declare a `capability` block with `not_configured[]` enforcing the stop-and-ask rule. New fields are additive and optional so legacy v1 manifests (e.g. WebsiteFactory v1) remain valid. LinkSkills is contractually scoped as permissions + skills. | The MVO target shifted to LinkSites vertical v2 + multiple capability plugins; the v1 WebsiteFactory-only contract conflated the two plugin kinds and missed mode semantics and role attachments. | Keep v1 (single-plugin contract) vs. extend with v2 fields (chosen) vs. branch into separate contract docs per plugin family | **Accepted** | Architect |

## How to update

1. Add or edit a row; set **Date** when the status moves out of **Pending**.
2. Link proof (PR, commit, or agent report section) in **Reason** or a footnote row if the table gets wide.
3. Mirror high-signal outcomes in `AGENT_COORDINATION.md` → **Decisions Made**.

## Repo Git Policy Rollout

Decision: GitHub is the source of truth across all top-level GitHub repos under `/Users/linktrend/Projects`.

Stable branches are `main`, `staging`, and `development`. Work must begin on short-lived branches and promote through `development -> staging -> main`. Fork mirrors may sync from upstream into the `linktrend/*` fork `development` branch only; they must never open PRs or push changes to the original upstream repository.

## LinkSites MVO v2 Direction

Decision: The current MVO target is the LinkSites vertical plugin running in development mode on the reusable LiNKtrend platform slice.

The MVO flow is mock CRM lead -> LinkBot research/enrichment -> template-guided website package -> local generated artifact folder -> Supabase mirror -> LiNKautowork sync to real local Payload CMS -> preview-ready frontend -> deterministic checks -> CRM/mock lead status `ready_to_contact`.

Real lead acquisition, real client outreach, and real VPS deployment are disabled. Generated artifacts use a local folder in development and will use cloud cold storage, such as Google Drive or equivalent, in production. Payload and Supabase schemas must be discovered/copied/adapted from existing source-of-truth repos, not invented.

## LinkSkills Completion Plan Decisions (WP-060)

| ID | Date | Decision | Reason | Alternatives Considered | Status | Owner |
|----|------|----------|--------|-------------------------|--------|-------|
| D-060-A | 2026-05-15 | **Old LiNKskills repo role:** Source evidence only for contracts and patterns. Do not copy implementation files blindly. The `services/logic-engine/` architecture is different from the ecosystem plane model. | The old repo was a standalone centralized service. The new ecosystem model has LinkSkills as a plane with specific responsibilities (leases, capabilities). Direct copying would bring architectural debt. | Copy all implementation; use as reference only; ignore old repo | **Accepted** | linkskills-agent |
| D-060-B | 2026-05-15 | **LinkSkills dual responsibility:** LinkSkills in LiNKtrend-System has BOTH permission/control plane AND governed skills service responsibilities. These are unified through the capability catalog. | CONTRACTS_MVO defines LinkSkills as permission plane (§6.2, §12.4) and the old repo has skills service (Golden Template, progressive disclosure). Both are required for complete functionality. | Split into two services; keep only permission plane; keep only skills service | **Accepted** | linkskills-agent |
| D-060-C | 2026-05-15 | **Progressive disclosure deferred:** Full progressive disclosure service (WP-066) is deferred until after core lease lifecycle (WP-063) is complete. Public contract layer can be simpler in first implementation. | Progressive disclosure is complex (tokens, signing, fragment selection). Core lease functionality is prerequisite for any disclosure. Simpler first step reduces risk. | Implement full disclosure immediately; skip disclosure entirely | **Accepted** | linkskills-agent |
| D-060-D | 2026-05-15 | **Kill switch thresholds:** Cost and security thresholds from `SOP_MVO_CLASS_A.md` §10 are reused as starting points: 15-min spend > $75, burn-rate > 3x 24h avg, >= 3 critical exceptions in 10 min. | Old repo has well-defined thresholds. Actual thresholds may be adjusted based on LiNKaios operational data post-deployment. | Invent new thresholds; copy thresholds exactly; omit automated triggers | **Accepted** | linkskills-agent |
| D-060-E | 2026-05-15 | **Class A/B/C → Modes mapping:** The old repo's Class A/B/C classification maps to the mode model: Class A (internal managed) → `development` + `shadow`, Class B (proprietary) → `shadow` + opt-in `live`, Class C (external) → Future with full disclosure policy. | The mode model (development/shadow/live) from PLUGIN_ARCHITECTURE_V2 §1.0.2 aligns with the old classification but is more explicit about behavior per mode. | Keep Class A/B/C terminology; use only modes; use only classes | **Accepted** | linkskills-agent |
