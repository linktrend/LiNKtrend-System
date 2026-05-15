# LiNKaios kernel/plugin manifest (WP-003 + WP-040 v2)

**Current canonical target:** LinkSites vertical plugin development-mode MVO v2 (see §0.A below and `LINKSITES_VERTICAL_MVO_V2.md`).
**Status:** WP-003 + WP-040 plugin architecture v2 + WP-041 LinkSites v2 addendum (2026-05-15). Vertical/capability plugin distinction and mode semantics added. The v1 WebsiteFactory `lead_to_preview` manifest in §§4–11 is retained as historical reference for the kernel/plugin shape (§§1–3) and the per-stage plane-ownership pattern (§7). The §4 `websitefactory.lead_to_preview` instance is no longer the active roadmap target.
**Owner:** linkaios-agent (kernel), Architect/Integrator (contract surface).
**Scope:** Minimum LiNKaios kernel + plugin contract needed to run vertical plugins (LinkSites/WebsiteFactory v1, LinkSites v2 per `LINKSITES_VERTICAL_MVO_V2.md`, and future verticals) against governed capability plugins without role bleed.

## 0.A LinkSites vertical plugin v2 — kernel-side delta

LinkSites v1 (`websitefactory`, §4) is superseded as the canonical demo target by the LinkSites v2 development-mode flow. The kernel responsibilities §§1–2, plugin manifest shape §3, role-bleed map §7, and plane-ownership-vs-plugin-declaration split §8 remain authoritative and unchanged. Only the §4 concrete instance is historical.

The v2 LinkSites vertical plugin will, in its own forthcoming manifest (owned by WP-041 follow-up + WP-042 discovery):

- declare a v2 work-request type (e.g. `linksites.lead_to_preview_site` or equivalent; final slug pinned post-discovery).
- declare new stages corresponding to research/enrichment, website-package generation, local artifact write, Supabase mirror write, Payload sync, frontend preview readiness, deterministic checks, and CRM `ready_to_contact` promotion.
- declare disabled-but-present LinkBot roles for Lead Scout and Outreach.
- declare required capabilities covering Odoo/CRM shadow-readiness, Payload CMS, Supabase mirror, Zulip, public web research, asset generation, and Plane (mock/shadow by default). See `INTEGRATION_QUEUE.md` LinkSites v2 section.
- declare required workflow hooks for: local-artifact assembly, Supabase mirror sync, Payload sync, deterministic checks, and CRM status promotion. Concrete handles are pinned by WP-045.
- declare required audit events extending §6.3.1 with v2 action types (added via decision rows, never renamed).
- declare site identity as one canonical `site_id` per business/lead plus versioned `site_generation_run_id`, unless WP-042 discovery contradicts this.
- declare non-goals matching `LINKSITES_VERTICAL_MVO_V2.md` §"Out of scope for this MVO": no autonomous real lead acquisition, no real client outreach, no real VPS deployment / customer domain / DNS / TLS / production hosting, no Payload/Supabase schema invention, no generated artifacts in Git, no public outreach send.

The concrete §4-shaped manifest instance for LinkSites v2 MUST NOT be written ahead of WP-042 discovery; doing so violates `LINKSITES_VERTICAL_MVO_V2.md` §"Discovery Requirements" and the v2 hard boundary against inventing Payload or Supabase schemas. §4 below remains the historical v1 reference.

### 0.A.3 LinkBot role contract pack v1 declaration (WP-044)

For LinkSites v2, the plugin-level `required_linkbot_roles[]` MUST include exactly four declared role contracts:

- `lead_scout_bot` (declared but disabled in MVO)
- `research_enrichment_bot`
- `website_builder_bot`
- `outreach_bot` (declared but disabled in MVO)

Kernel validation expectations for this pack:

- Each role contract MUST declare: `role_id`, `purpose`, `inputs`, `outputs`, `allowed_capabilities`, `allowed_skills`, `audit_events`, and `development_restrictions`.
- Disabled roles (`lead_scout_bot`, `outreach_bot`) MUST declare explicit `development_restrictions` containing disabled/mock behavior and MUST emit skip audit evidence rather than performing side effects.
- Enabled roles MUST use only governed capabilities and skills declared by the LinkSites vertical plugin; they MUST NOT embed connector internals (Zulip/Odoo/Payload/Plane target-app configuration) into LinkBot role logic.
- Each role contract MUST include explicit non-ownership language matching §2 and `CONTRACTS_MVO.md` §0.A.4.1:
  - no canonical memory ownership.
  - no capability lease issuance ownership.
  - no secrets ownership.
  - no deterministic workflow state ownership.
  - no final audit ownership.
  - no target-app configuration ownership.

### 0.A.1 Kernel non-ownership reaffirmed under v2

Under v2 the kernel still MUST NOT:

- own artifact generation, Payload sync, Supabase mirror writes, deterministic checks, or CRM promotion logic — those belong to LiNKautowork workflows declared by the v2 LinkSites plugin and gated by LinkSkills leases.
- hold canonical memory for research/enrichment outputs — those go through the LiNKbrain audit envelope (§6.3 / D-08).
- run LLM reasoning for research, copy, media planning, or style proposals — those belong to LinkBot roles declared by the plugin.

### 0.A.2 Trace/status surface obligations under v2

The kernel trace/status surface MUST be able to render a v2 run by joining (id-only) refs to:

- LinkSkills leases for each capability-backed side effect (CRM/mock write, Supabase mirror write, Payload write, Zulip notification, asset generation, web research, Plane mock/shadow write, CRM `ready_to_contact` promotion).
- LiNKautowork workflow runs for each deterministic step (artifact assembly, Supabase sync, Payload sync, deterministic checks, status promotion).
- LiNKbrain audit events for run/stage/lease/workflow/output transitions.
- Plane (mock/shadow) execution-tracking refs where present.

The kernel does not invent v2 trace content; it joins refs from the plugin's declared stages. The §§1, 4, 5, 6 surfaces of the LiNKaios kernel and `INTEGRATION_QUEUE.md` integration-visibility column are unchanged.

---

## 0. Framing

`LiNKtrend-System` is the **LiNKaios control-plane repo**. The product being proved here is the **LiNKaios core/kernel + plugin contract**.

The plugin ecosystem has two kinds (see `PLUGIN_ARCHITECTURE_V2.md` and `CONTRACTS_MVO.md` §1.0.1):

- **Vertical plugins** — business/product machines that declare ordered stages, required LinkBot roles, required capability plugins, required LinkSkills permissions/skills, required LiNKautowork workflow hooks, required LiNKbrain audit/memory events, LiNKaios UI panels, and per-mode behavior. Examples: LinkSites/WebsiteFactory, LEXOS Litigation, Linktrend Media, Linkapps, Linktrend Development, Linktrend Admin.
- **Capability plugins** — reusable governed connectors that prepare communication and governance surfaces for an external piece of software. Examples: Odoo/CRM, Zulip, Payload CMS, Plane, Postiz, Supabase mirror sync, public web research, asset generation. They MUST NOT invent target-software business configuration (§3.2 and `CONTRACTS_MVO.md` §1.0.4 stop-and-ask).

LinkSites/WebsiteFactory is the **first concrete vertical plugin** used to exercise tenant/plugin registration, work/run orchestration, status/trace surfaces, approvals/routing, mode model, and integration visibility. If a future vertical plugin (e.g. LEXOS, sales-outreach) replaces it, the LiNKaios kernel below must remain unchanged.

## 1. LiNKaios kernel — owned responsibilities

The LiNKaios kernel is the **only** plane that owns these:

1. **Tenant registry**
   - `tenant_id`, display name, status, plugin entitlements.
   - Tenant-scoped configuration namespace for plugins.
2. **Plugin registry + manifest loader**
   - Loads plugin manifests (see §3) at boot or on install.
   - Validates that declared capabilities, workflows, audit events, and config keys are recognized by the relevant planes (LinkSkills, LiNKautowork, LiNKbrain).
   - Rejects plugins that try to declare side-effect actions outside LinkSkills, or audit sinks outside LiNKbrain.
3. **Work + Run orchestration**
   - `work_request` (intent) → `run` (execution instance).
   - Drives plugin **stages** declared in the manifest. Each stage is dispatched to the correct plane (kernel never executes side effects, deterministic steps, or audit writes itself).
   - Assigns `run_id`, persists stage status transitions, and surfaces them.
4. **Status + Trace surfaces**
   - Read-only views over `run`, `stage`, `lease`, `workflow_run`, `audit_event` references for operators.
   - Trace view joins LinkSkills run-ledger refs, LiNKautowork run refs, and LiNKbrain audit refs **by id only**; it does not duplicate their content.
5. **Approvals + Routing hooks**
   - Generic approval inbox keyed on `run_id` + `stage_id`.
   - Routing rules per tenant/plugin (e.g. which operator/role approves `preview.publish`). Kernel does not decide policy content; LinkSkills does.
6. **Integration visibility**
   - Reads the canonical `INTEGRATION_QUEUE.md`-style registry of real vs stubbed integrations per tenant and surfaces it next to the trace.

## 2. LiNKaios kernel — explicit non-ownership (role-bleed guard)

LiNKaios kernel **must not**:

- Execute deterministic workflow steps (that is LiNKautowork).
- Hold long-term canonical memory or learning state (that is LiNKbrain).
- Hold capability/permission logic, secrets, or capability lease issuance (that is LinkSkills).
- Run LLM reasoning sessions or persona state (that is LinkBot).
- Encode plugin-specific business logic (e.g. lead scoring, copy generation, image placement). That belongs inside plugin code dispatched through the planes above.
- Publish/serve preview sites except as a thin static route surfaced via the WebsiteFactory plugin's declared output (per `DECISIONS.md` D-03).

If a feature request implies the kernel should "just do X" for the MVO, it must instead be modeled as a plugin stage dispatched to the correct plane.

## 3. Plugin manifest — required shape

Every LiNKaios plugin declares a manifest with these fields. The typed contract is pinned in `CONTRACTS_MVO.md` §1.2 and exported from `@linktrend/linklogic-sdk` (`PluginManifestSchema`).

### 3.1 Shared fields (vertical + capability)

- **`plugin_id`** — stable slug, e.g. `websitefactory`. Used in URLs, audit, lease scope.
- **`plugin_kind`** — `"vertical" | "capability"` (v2). Default `"vertical"` for legacy v1 manifests.
- **`plugin_name`** — human label, e.g. `LinkSites / WebsiteFactory`.
- **`version`** — semver of the manifest, not the underlying code.
- **`purpose`** — one paragraph describing the plugin's job.
- **`modes_supported[]`** — subset of `{development, shadow, live}` (§4 of `PLUGIN_ARCHITECTURE_V2.md`). At minimum `["development"]`.
- **`public_surfaces`** — what the plugin exposes back to LiNKaios:
  - `work_request_types[]` — the work intents the plugin accepts (verticals; capability plugins typically empty).
  - `ui_panels[]` — named panels embedded in `apps/linkaios-web` (intake form, trace detail, preview view). UI lives in `LiNKapps/packages/ui` shadcn components.
  - `read_views[]` — read-only views the kernel may render for operators (e.g. preview iframe).
- **`config_surfaces[]`** — tenant-scoped config keys the plugin reads. Kernel stores; plugin reads. Secrets live in LinkSkills, not in config.
- **`required_audit_events[]`** — LiNKbrain audit event types this plugin emits (matches D-08 envelope).
- **`non_goals[]`** — things this plugin explicitly does not do in the current version.

### 3.2 Vertical plugin fields (required when `plugin_kind="vertical"`)

- **`stages[]`** — ordered list of stages. Each stage declares:
  - `stage_id`, `display_name`, `responsible_plane` ∈ `{linkbot, linkskills, linkautowork, linkbrain, linkaios}`.
  - `inputs`, `outputs` (typed names from `CONTRACTS_MVO.md` §2).
  - `failure_mode` — `retryable | abort_run | require_approval`.
- **`required_capabilities[]`** — capability plugin ids this vertical will request leases for.
- **`required_workflow_hooks[]`** — LiNKautowork workflow handles this vertical will invoke.
- **`required_linkbot_roles[]`** — LinkBot role attachments for stages whose `responsible_plane = linkbot`. Each role declares purpose, inputs/outputs, allowed capabilities (subset of `required_capabilities`), allowed LinkSkills permissions/skills, model/tool policy, audit events, and development-mode restrictions.
- **`preview_output_shape`** — what the kernel surfaces to operators as "the result" (URL, artifact refs, lease ids, audit ids). Optional for verticals that do not surface a preview artifact.

### 3.3 Capability plugin fields (required when `plugin_kind="capability"`)

- **`capability`** block:
  - `capability_id` — e.g. `crm.upsert`, `payload.publish`.
  - `target_software` — the external tool being connected.
  - `allowed_operations[]` — bounded list of operations (lease-gated).
  - `auth_requirements[]` — config keys (secrets resolved via LinkSkills).
  - `mode_flags[]` — subset of `{development, shadow, live}`. LinkSkills MUST refuse leases in a mode not listed.
  - `lease_requirements[]` — LinkSkills permission/skill ids needed to grant a lease.
  - `idempotency_rules` — human-readable rule, e.g. "`(tenant_id, lead_id)`".
  - `audit_events[]` — subset of `CONTRACTS_MVO.md` §6.3.1.
  - `allowed_callers[]` — subset of `{linkaios, vertical_plugin, linkbot, linkautowork}`.
  - `failure_mapping{}` — backend error code → canonical `CONTRACTS_MVO.md` §5.4 code.
  - `not_configured[]` — explicit list of target-software internals the capability does **not** configure (charts of accounts, Payload schemas, CRM stages, etc.). Required and non-empty; enforces the stop-and-ask rule.

Capability plugins MUST NOT declare `stages[]` or `required_linkbot_roles[]`.

## 4. LinkSites / WebsiteFactory plugin manifest (concrete vertical instance — historical v1 reference)

The YAML below is the v1 manifest loaded at boot and retained as the historical v1 manifest for the static/local `websitefactory.lead_to_preview` proof. It illustrates the §3 manifest shape with real values. The current canonical target is the LinkSites v2 plugin (§0.A); v2's concrete manifest is deferred to the post-discovery follow-up packet.

The LinkSites vertical MVO v2 (`LINKSITES_VERTICAL_MVO_V2.md`, WP-041) extends this manifest with `plugin_kind`, `modes_supported`, `required_linkbot_roles[]`, and an updated `required_capabilities[]` list covering the Odoo/CRM, Payload, Supabase mirror, Zulip, public web research, asset generation, and Plane capability plugins. The v2 fields are additive; v1 remains valid under the legacy-compat rules in `CONTRACTS_MVO.md` §1.2.

```yaml
plugin_id: websitefactory
plugin_kind: vertical                 # v2; legacy v1 manifests omit this and default to "vertical"
plugin_name: LinkSites / WebsiteFactory
version: 0.1.0-mvo
modes_supported: [development]        # v2; v1 ran development-only
purpose: >
  Take an SMB lead, evaluate it, select an industry template, generate
  business-specific copy, place placeholder imagery, adjust look-and-feel
  without changing template structure, and produce a preview site URL
  suitable for stakeholder review.

public_surfaces:
  work_request_types:
    - websitefactory.lead_to_preview
  ui_panels:
    - intake_form           # operator picks/imports lead
    - stage_timeline        # run status across stages
    - preview_panel         # iframe of preview URL
  read_views:
    - run_detail
    - preview_artifact

stages:
  - stage_id: lead_intake
    display_name: Intake lead
    responsible_plane: linkaios
    inputs: [lead_input]
    outputs: [lead_record_ref]
    failure_mode: abort_run

  - stage_id: lead_evaluation
    display_name: Evaluate lead
    responsible_plane: linkbot
    inputs: [lead_record_ref]
    outputs: [lead_evaluation]
    failure_mode: retryable

  - stage_id: template_selection
    display_name: Select industry template
    responsible_plane: linkbot
    inputs: [lead_evaluation]
    outputs: [template_id]
    failure_mode: retryable

  - stage_id: copy_generation
    display_name: Generate business copy
    responsible_plane: linkbot
    inputs: [lead_record_ref, template_id]
    outputs: [copy_bundle]
    failure_mode: retryable

  - stage_id: media_placement
    display_name: Place images/placeholders
    responsible_plane: linkbot
    inputs: [template_id, copy_bundle]
    outputs: [media_plan]
    failure_mode: retryable

  - stage_id: look_and_feel
    display_name: Apply brand look-and-feel
    responsible_plane: linkautowork
    inputs: [template_id, copy_bundle, media_plan]
    outputs: [render_spec]
    failure_mode: retryable

  - stage_id: crm_upsert
    display_name: Write CRM record (stub)
    responsible_plane: linkskills        # lease-gated; stub backed by mvo_crm_records
    inputs: [lead_record_ref, lead_evaluation]
    outputs: [crm_record_id]
    failure_mode: require_approval

  - stage_id: plane_project_create
    display_name: Create project + task (stub)
    responsible_plane: linkskills        # lease-gated; stub backed by mvo_projects/mvo_tasks
    inputs: [lead_record_ref]
    outputs: [project_id, task_id]
    failure_mode: require_approval

  - stage_id: preview_publish
    display_name: Publish preview site
    responsible_plane: linkskills        # preview.publish lease, executed via linkautowork render
    inputs: [render_spec]
    outputs: [preview_url, preview_artifact_ref]
    failure_mode: require_approval

  - stage_id: record_run
    display_name: Persist run + audit closure
    responsible_plane: linkbrain
    inputs: [run_id, all_outputs]
    outputs: [audit_event_ids]
    failure_mode: abort_run

config_surfaces:
  - default_template_id           # default to LiNKsites/apps/web-master
  - brand_palette_source          # tenant-scoped
  - preview_route_prefix          # e.g. /preview/<tenant>/<run_id>
  - model_routing_profile         # OpenRouter profile (D-06)

required_capabilities:
  - crm.upsert                    # LinkSkills lease (stubbed CRM)
  - plane.project.create
  - plane.task.create
  - preview.publish               # static/local route per D-03

required_workflow_hooks:
  - autowork.websitefactory.render        # deterministic look-and-feel + render
  - autowork.websitefactory.preview_serve # serve static preview asset

required_audit_events:
  # All envelopes follow DECISIONS.md D-08
  - run.started
  - stage.completed
  - lease.requested
  - lease.granted
  - lease.executed
  - preview.published
  - run.completed
  - run.failed

preview_output_shape:
  run_id: string
  tenant_id: string
  preview_url: string                       # served by apps/linkaios-web preview route
  preview_artifact_ref: string              # storage handle for rendered bundle
  crm_record_id: string | null              # null if approval not granted
  project_id: string | null
  task_id: string | null
  lease_ids: string[]                       # LinkSkills run-ledger refs
  workflow_run_ids: string[]                # LiNKautowork run refs
  audit_event_ids: string[]                 # LiNKbrain refs
  status: one_of[succeeded, partial, failed, awaiting_approval]

non_goals:
  - Full Payload CMS publish path
  - DigitalOcean-hosted preview publishing
  - Real Chatwoot/Odoo CRM writes
  - Real Plane API project/task creation
  - LEXOS/legal vertical work
  - Live image generation (placeholders only for MVO)
  - Domain provisioning, DNS, TLS
  - Outbound email to the lead
```

## 5. Input shape — `lead_input`

Lightweight schema (prose). WP-004 will pin types.

- `tenant_id` (required)
- `source` ∈ `{manual, csv_import, stub}` (D-01 stub allows seed CSV)
- `business_name` (required)
- `industry` (required, free text + optional taxonomy id)
- `contact`:
  - `name`, `email`, `phone` (any field may be null; PII handling per WP-004)
- `location` (optional: city, region, country)
- `notes` (optional free text)
- `external_ids` (optional map; e.g. `chatwoot_id` reserved for post-MVO real CRM)

## 6. Output shape — see `preview_output_shape` above

The kernel surfaces this object verbatim in the trace/status view. No nested business logic in the output.

## 7. Plane ownership map for WebsiteFactory stages

| Stage | Responsible plane | Why this plane and not the kernel |
|-------|-------------------|------------------------------------|
| `lead_intake` | LiNKaios | Pure coordination: registry write of `lead_record_ref`. No side effects. |
| `lead_evaluation` | LinkBot | Reasoning step; thin runtime shell; no canonical memory writes (delegates to LinkBrain). |
| `template_selection` | LinkBot | Reasoning over template catalog + lead profile. |
| `copy_generation` | LinkBot | LLM via OpenRouter (D-06); LinkBot is the only reasoning surface. |
| `media_placement` | LinkBot | Selection logic over placeholder pool; not a deterministic workflow. |
| `look_and_feel` | LiNKautowork | Deterministic transform of template + copy + media → render spec. |
| `crm_upsert` | LinkSkills (stub backend) | Side effect; capability lease + audit required. |
| `plane_project_create` | LinkSkills (stub backend) | Side effect; lease + audit required. |
| `preview_publish` | LinkSkills + LiNKautowork | `preview.publish` lease gates a deterministic render+serve. |
| `record_run` | LiNKbrain | Audit closure, memory persistence. |

## 8. What each external plane owns vs the WebsiteFactory plugin declares

- **LinkBot** owns reasoning execution, persona/session, model routing call-out. **The plugin declares** which stages need reasoning and what inputs/outputs LinkBot must produce. The plugin does not own session state.
- **LinkSkills** owns capability catalog, lease issuance, run ledger, idempotency, kill switches. **The plugin declares** which capabilities it will request (`required_capabilities[]`). The plugin does not own permission logic or secrets.
- **LiNKautowork** owns deterministic execution and workflow run ledger. **The plugin declares** which workflow handles it invokes (`required_workflow_hooks[]`). The plugin does not own n8n state.
- **LiNKbrain** owns events, memory, audit, trace storage, retrieval. **The plugin declares** which audit event types it emits (`required_audit_events[]`). The plugin does not own the audit envelope schema (D-08).
- **LiNKaios kernel** owns orchestration, status/trace surfaces, approvals, integration visibility. **The plugin declares** stages, config keys, UI panels, and the preview output shape. The plugin does not own routing, approvals UX, or the trace view itself.

## 9. Integration points (cross-reference `INTEGRATION_QUEUE.md`)

At least three required; six listed below cover the MVO surface.

| Manifest dependency | Queue id | Status |
|---------------------|----------|--------|
| `crm.upsert` capability backend | **INT-020** | **Stubbed** (local `mvo_crm_records` table, lease + audit still required) |
| `plane.project.create` / `plane.task.create` backend | **INT-021** | **Stubbed** (local `mvo_projects` / `mvo_tasks` tables) |
| `preview.publish` static/local route | **INT-022** | **Stubbed (accepted)** — `web-master` rendered + served from `apps/linkaios-web` |
| LiNKbrain audit envelope | **INT-013** | **Planned (real)** — schema finalized in WP-004 |
| LinkSkills capability lease engine | **INT-014** | **Planned (real)** — reuse `LiNKskills/services/logic-engine` |
| LiNKautowork n8n gateway | **INT-015** | **Planned (real)** — reuse `LiNKautowork/gateway/` |
| LinkBot runtime (OpenClaw) | **INT-016** | **Planned (real)** — `LiNKbot-core` via `apps/bot-runtime` |
| Supabase (Postgres + Auth + RLS) | **INT-010** | **Planned (real)** |
| OpenRouter | **INT-011** | **Planned (real)** |

Deferred items (`INT-030`..`INT-034`) remain out of scope per WP-002.

## 10. Non-goals for the MVO

In addition to the plugin-level `non_goals` above, the kernel MVO explicitly defers:

- Multi-tenant billing / metering.
- Plugin marketplace / dynamic install at runtime (manifests loaded from repo at boot is enough).
- Cross-plugin orchestration (a single run touches a single plugin).
- Fine-grained RBAC beyond per-tenant + per-role approval routing.
- LEXOS/legal vertical (gated by ARCHITECTURE_RULES.md until WebsiteFactory MVO works).

## 11. Acceptance check against WP-003

- [x] Kernel responsibilities defined (§1) and explicit non-ownership stated (§2).
- [x] WebsiteFactory manifest declared with id, purpose, surfaces, stages, config, capabilities, workflow hooks, audit events, preview output (§4).
- [x] Inputs (§5) and outputs (§6) described.
- [x] Plane ownership mapped per stage (§7) and per declared field (§8).
- [x] ≥3 integration points listed with real/stub status (§9 lists nine).
- [x] Role-bleed guards: kernel does not absorb LinkBot/LinkSkills/LiNKautowork/LiNKbrain; WebsiteFactory does not absorb kernel responsibilities.
- [x] Concrete enough that WP-004 can bind contracts (typed names exist for stages, capabilities, workflows, audit events, output shape).

## 12. Handoff to WP-004

WP-004 should:

1. Pin TypeScript / Zod (or equivalent) types for the manifest fields in §3 and the WebsiteFactory instance in §4.
2. Pin the `lead_input` schema (§5), the audit envelope (D-08), and the `preview_output_shape` (§6).
3. Define cross-plane request/response contracts for: LinkSkills lease request/grant/execute, LiNKautowork workflow invoke/result, LiNKbrain event write, LinkBot reasoning call.
4. Define failure taxonomy aligned with `failure_mode` values used in §4.
