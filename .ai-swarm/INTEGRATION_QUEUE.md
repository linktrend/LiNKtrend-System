# Integration queue

Track **external or cross-repo integrations** that are required, optional, stubbed, or blocked for the MVO.

Use this file so agents do not hide integration debt inside code comments only.

> **Current canonical target:** LinkSites vertical plugin development-mode MVO v2 (see `LINKSITES_VERTICAL_MVO_V2.md`, `CONTRACTS_MVO.md` §0.A). The v1 `websitefactory.lead_to_preview` static/local rows (INT-020/INT-021/INT-022) are retained as **historical reference for the lead-to-preview proof**; they are NOT the active v2 stub set. The v2 stub posture is per-capability mode (`mock | shadow | live`) recorded in the "LinkSites v2 capability integrations" section below.

## LinkSites v2 capability integrations (canonical, development-mode)

All entries default to **development mode** (local/mock side effects with full LinkSkills lease + LiNKbrain audit + LiNKaios trace visibility per `CONTRACTS_MVO.md` §0.A.7 and §0.A.9). No row in this section permits real client outreach, real VPS deployment, real lead acquisition, or invention of Payload/Supabase schemas. Concrete IDs are reserved (`INT-040`..`INT-050`); detailed contract packs are owned by WP-043/WP-054.

| ID | Capability / Integration | LinkSites v2 use | Mode default | Side effects in dev | Discovery / contract owner | Notes |
|----|--------------------------|------------------|--------------|--------------------|----------------------------|-------|
| INT-040 | Odoo / CRM (shadow-readiness) | mock CRM lead read; lead status updates including `ready_to_contact`; readiness probes for Odoo without writes | `mock` for writes; `shadow` for readiness | local/mock writes only; no Odoo POST/PATCH/PUT/DELETE | WP-043 + integration-agent | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.crm.odoo_shadow`). No business setup inside Odoo. |
| INT-050 | Odoo / Accounting (shadow-readiness) | accounting read/status readiness for future admin verticals; separate from CRM permissions | `mock` for local/read-only surfaces; `shadow` for readiness | no Odoo POST/PATCH/PUT/DELETE in dev; no accounting writes | WP-054 + integration-agent | Contract scaffolded in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.accounting.odoo_shadow`). Keep permission boundary separate from `cap.crm.odoo_shadow`. |
| INT-041 | Payload CMS (local) | sync structured website content from Supabase mirror into local Payload; serve preview-ready frontend | `mock` (local Payload only) | local Payload writes only via LinkSkills lease | WP-042 discovery → WP-043 | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.payload.local_sync`). **MUST NOT invent Payload schemas.** |
| INT-042 | Supabase mirror / content | persist structured website content + asset references; mirror update layer between artifact folder and Payload | `mock` (local/dev Supabase project) | mirror writes via LinkSkills lease | WP-042 discovery → WP-043 | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.supabase.mirror_content`). **MUST NOT invent mirror schema.** |
| INT-043 | Zulip | run notifications + LinkBot/operator work-channel messages | `mock` for outbound; `shadow` for connectivity | no real outbound messages by default; mock-only in dev | WP-043 | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.zulip.run_messaging`). Lease-gated; no public message send in v2. |
| INT-044 | Public web research | governed read-only public research with citations/provenance for Research/Enrichment Bot | `mock` allowed; `shadow` for live providers | read-only fetches only; provenance recorded | WP-043 + linkbot-agent | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.research.public_web`). No write-to-target side effects. |
| INT-045 | Asset generation | governed generated images/video for media plan, with provenance and audit | `mock` (local placeholders) by default; provider-backed paths gated | media files written to local artifact folder only | WP-043 + linkbot-agent | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.asset.generation`). Each generation lease-gated; provenance and audit required. |
| INT-046 | Plane (project/task) | internal execution tracking + future client/project scaffold | `mock | shadow` by default | local writes only in dev; readiness against real Plane permitted in shadow | WP-043 + integration-agent | Contract defined in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.plane.execution_tracking`). Builds on WP-038 readiness adapter. No remote writes in v2. |
| INT-047 | Local generated-artifact folder | durable local store for generated website artifacts (copy, media plan, generated media with provenance, style proposals) | `mock` (local only) | local filesystem writes only | WP-042 discovery → WP-045 | In production, replaced by cloud cold storage (e.g. Google Drive). Not a live host. |
| INT-048 | Deterministic checks (LiNKautowork) | validate required pages, navigation, content blocks, media references, provenance, Payload sync status, preview readiness | n/a (deterministic) | none beyond reads | WP-045 + linkautowork-agent | Gates promotion of mock CRM lead to `ready_to_contact`. |
| INT-049 | Frontend preview reader | existing/local frontend that reads from local Payload and renders the preview-ready site | n/a (read-only) | none | WP-042 discovery | Discover which frontend already serves preview reads before adding any new component. |
| INT-051 | Postiz distribution (future Linktrend Media) | governed marketing distribution readiness with draft/schedule/status mock surfaces and connectivity probes | `mock` for draft/schedule; `shadow` for readiness/status | no live social publish; no real Postiz channel/account/campaign writes | WP-055 + linkskills-agent | Contract scaffolded in `CONTRACTS_MVO.md` §0.A.5.1 (`cap.postiz.distribution`). Keep live publishing disabled until Linktrend Media vertical workflow is defined. |

### Out of scope for LinkSites v2 (do not add as active rows)

- Real lead acquisition pipelines (any provider).
- Real client outreach (email, message, call). Outreach Bot role is declared but disabled.
- Real VPS deployment, customer domains, DNS, TLS, production hosting. Hosted preview/publish work remains tracked under post-MVO row INT-033.
- Cloud cold storage backend for production artifacts. Forward-looking only; no v2 implementation row.

### WP-045 deterministic workflow-handle mapping (LinkSites v2)

The LinkSites v2 deterministic workflow contract pack is documented in `CONTRACTS_MVO.md` §0.A.10.1 with the following handles:

- `autowork.linksites.artifact_write_local`
- `autowork.linksites.supabase_mirror_upsert`
- `autowork.linksites.payload_sync_local`
- `autowork.linksites.preview_readiness_check`
- `autowork.linksites.crm_ready_to_contact_mark`

Notes:

- Side-effecting handles are lease-gated through LinkSkills (`supabase_mirror_upsert`, `payload_sync_local`, `crm_ready_to_contact_mark`).
- `artifact_write_local` is development-only local storage behavior.
- Production cloud cold storage remains post-MVO direction and is not implemented here.



## Queue template

| ID | Integration | Needed for | Owner agent | Status | Notes / link |
|----|-------------|------------|-------------|--------|----------------|
| INT-001 | *example* | *MVO step* | *integration-agent* | Planned | |

## Active items

| ID | Integration | Needed for | Owner agent | Status | Notes / link |
|----|-------------|------------|-------------|--------|----------------|
| INT-010 | Supabase (remote) | All planes: Postgres + Auth + RLS | database-architect | Planned | See `DECISIONS.md` D-05. Wire via existing `packages/db`. |
| INT-011 | OpenRouter | LinkBot reasoning, copy generation | linkaios-agent | Planned | See `DECISIONS.md` D-06. Single provider key managed via env. |
| INT-012 | LinkSites web-master template render | Preview site generation | linkaios-agent | Planned | See `DECISIONS.md` D-03 / D-07. Render `LiNKsites/apps/web-master` and serve from `apps/linkaios-web`. |
| INT-013 | LiNKbrain audit envelope | Cross-plane audit/memory writes | linkbrain-agent | Planned | See `DECISIONS.md` D-08. Schema finalized in WP-004. |
| INT-014 | LinkSkills capability lease | Side-effect gating for preview publish, CRM write | linkskills-agent | Planned | Reuse `LiNKskills/services/logic-engine`. |
| INT-015 | LiNKautowork n8n gateway | Deterministic step orchestration in MVO flow | linkautowork-agent | Planned | Reuse `LiNKautowork/gateway/`. |
| INT-016 | LinkBot (OpenClaw via LiNKbot-core) | Lead evaluation, template selection, copy gen | linkbot-agent | Planned | See `DECISIONS.md` D-04. Driven by `apps/bot-runtime` adapter. |

## Stubbed integrations (historical v1 — lead-to-preview proof)

> The three rows below were authored for the v1 `websitefactory.lead_to_preview` static/local proof. They are retained as historical reference; the v2 stub posture is recorded in the "LinkSites v2 capability integrations" section above.


| ID | Integration | Stub behavior | MVO acceptance criteria | Decision link |
|----|-------------|---------------|--------------------------|---------------|
| INT-020 | **CRM (Chatwoot/Odoo)** — *stubbed* | Local Postgres tables `mvo_crm_contacts` and `mvo_crm_records` (managed by `services/migrations`). A `crm.upsert` capability is exposed through LinkSkills as a lease. The stub writes a row, returns a `crm_record_id`, and emits a LiNKbrain audit event (`plane="linkskills"`, `action="crm.upsert"`). No outbound HTTP to Chatwoot/Odoo. | (1) Lead-to-preview demo creates exactly one `mvo_crm_records` row per run; (2) capability lease is recorded in LinkSkills run ledger; (3) LiNKbrain receives matching audit event with `subject.crm_record_id`; (4) LiNKaios trace view shows the CRM step with the recorded lease id. | `DECISIONS.md` D-01 |
| INT-021 | **Plane (project/task)** — *stubbed* | Local Postgres tables `mvo_projects` and `mvo_tasks`. A `plane.project.create` and `plane.task.create` capability is exposed through LinkSkills as a lease. The stub returns a `project_id` / `task_id` and emits LiNKbrain audit events. No outbound HTTP to Plane API. | (1) Demo creates one project and at least one task row per run; (2) each create is gated by a LinkSkills lease; (3) LiNKbrain audit events emitted per row; (4) LiNKaios shows project + task ids in the trace timeline. | `DECISIONS.md` D-02 |
| INT-022 | **DigitalOcean / full Payload publish** — *deferred (stubbed via static/local preview)* | Preview is generated by rendering `LiNKsites/apps/web-master` with tenant-specific copy + template variables and served from `apps/linkaios-web` at a stable preview route (e.g. `/preview/<tenant>/<run_id>`). No DigitalOcean API calls; no Payload publish step in the MVO. Lease type `preview.publish` still required. | (1) Demo produces a reachable preview URL; (2) preview reflects the generated copy and selected images/placeholders; (3) `preview.publish` lease recorded in LinkSkills; (4) LiNKbrain audit event written with `subject.preview_url`. | `DECISIONS.md` D-03 |

## Deferred (not in MVO)

| ID | Integration | Owner agent | Status | Reason | Revisit when |
|----|-------------|-------------|--------|--------|---------------|
| INT-030 | Real Chatwoot / Odoo CRM | integration-agent + linkskills-agent | **Post-MVO planned** | Hosted instance + auth + webhook wiring exceeds 7-day budget | WP-015 after MVO sign-off, before second vertical |
| INT-031 | Real Plane API | integration-agent + linkskills-agent | **Post-MVO planned** | Workspace + tokens + sync semantics not on MVO critical path | WP-016 after MVO sign-off |
| INT-032 | LiteLLM self-hosted gateway | linkbot-agent + architect | **Post-MVO planned** | Not needed while a single provider key satisfies routing | WP-018 when cost/policy requires centralized routing |
| INT-033 | DigitalOcean hosted preview/publish pipeline | linkaios-agent + linkautowork-agent | **Post-MVO planned** | User-confirmed deployment target is DigitalOcean. Hosted preview/publish needs token management, app/container strategy, rollback, and side-effect lease approval outside the MVO stub. | WP-017 after static/local preview acceptance |
| INT-034 | LEXOS / legal vertical integrations | architect | **Post-MVO planned (planning-only)** | Out of scope per `ARCHITECTURE_RULES.md` until WebsiteFactory MVO works | WP-019 planning after MVO sign-off; implementation remains deferred |
