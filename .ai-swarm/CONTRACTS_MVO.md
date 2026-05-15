# MVO contracts — LiNKaios kernel + plugin architecture v2

**Current canonical target:** LinkSites vertical plugin development-mode MVO v2 (see §0.A below).
**Status:** Plugin architecture v2 contract (WP-040, 2026-05-15) plus LinkSites v2 contract target (WP-041, 2026-05-15). Supersedes the WebsiteFactory-only framing from WP-004; the original v1 WebsiteFactory binding is retained as a concrete vertical-plugin instance and historical reference.
**Owner:** Cursor Architect / Integrator.
**Binds to:** `ARCHITECTURE_RULES.md`, `.cursor/rules/01-ecosystem-boundaries.mdc`, `PLUGIN_ARCHITECTURE_V2.md`, `LINKSITES_VERTICAL_MVO_V2.md`, `DECISIONS.md` D-01..D-09, `INTEGRATION_QUEUE.md`, `LINKAIOS_KERNEL_MANIFEST.md` (WP-003 + v2 addendum).

## 0. Scope and reading order

This document pins the **cross-service contracts** for the LiNKaios kernel plus its plugin ecosystem and the revised LinkSites vertical plugin development-mode MVO.

`LiNKtrend-System` is the **LiNKaios control-plane repo**. Plugins divide into two kinds:

- **Vertical plugins** (business/product machines) declare what work needs to happen and which planes execute it. LinkSites (WebsiteFactory), LEXOS Litigation, Linktrend Media, Linkapps, Linktrend Development, and Linktrend Admin are vertical plugin families.
- **Capability plugins** (reusable governed connectors) provide auth, mode, idempotency, and audit hooks for external tools and software. Examples include Odoo/CRM, Zulip, Payload CMS, Plane, Postiz, Supabase mirror sync, governed public web research, and asset generation.

§0.A pins the canonical v2 contract surface that all current implementation packets target. §§1–13 retain the v1 `websitefactory.lead_to_preview` static/local lead-to-preview-site contract as historical reference; agents MUST treat any conflict between v1 §§1–13 and v2 §0.A as resolved in favor of v2.

## 0.A LinkSites vertical plugin development-mode MVO v2 (canonical)

This subsection makes the revised LinkSites development-mode MVO the canonical contract target. The earlier static/local lead-to-preview proof in §§1–13 is no longer the current roadmap target; it is preserved for context and for the parts of the typed kernel/plugin/cross-plane envelope that remain valid (manifest shape §1, run lifecycle §4, failure taxonomy §5, audit envelope §6.3, role-bleed rules §12 in particular).

### 0.A.1 Canonical v2 flow

The LinkSites v2 MVO proves the full website factory workflow in development mode. The canonical end-to-end flow is:

`mock CRM lead -> LinkBot research/enrichment -> template-guided website package -> local generated artifact folder -> Supabase mirror -> LiNKautowork sync to real local Payload CMS -> preview-ready frontend -> deterministic checks -> CRM/mock lead status ready_to_contact`

Plain English: a mock CRM lead exists; a Research/Enrichment LinkBot performs governed public research and enriches context; a Website Builder LinkBot picks a `LiNKsites` master/industry template, writes business-specific copy, plans media, and proposes style changes; generated artifacts are written to a local generated-artifact folder; structured website content and asset refs are written to the Supabase mirror; LiNKautowork syncs Supabase content into the local Payload CMS; the existing/local frontend reads from Payload and shows the preview-ready site; LiNKautowork deterministic checks validate required pages, navigation, content blocks, media references, provenance, Payload sync status, and preview readiness; if checks pass, the mock CRM lead status is set to `ready_to_contact`.

### 0.A.2 Development-mode hard boundaries

The following are out of scope for the v2 MVO and MUST NOT be implemented or wired by any v2 work packet:

- autonomous real lead acquisition (Lead Scout role is declared but disabled).
- real client outreach (Outreach Bot role is declared but disabled; no draft send, no public email or message send).
- real VPS deployment, customer domain, DNS, TLS, or production hosting.
- inventing Payload CMS schemas or Supabase mirror schemas — discovery (WP-042) must locate existing schemas before any wiring or migration work.
- writing generated artifacts to Git repos.

### 0.A.3 Production artifact direction (forward-looking, not in MVO)

In development mode, generated website artifacts are written to a local generated-artifact folder.

In production, this artifact store becomes cloud cold storage (for example Google Drive or an equivalent durable archive), NOT live hosting. The artifact store is the versioned archive of generated outputs; the live website host is a separate downstream concern outside the v2 MVO scope.

### 0.A.4 Canonical LinkBot roles (v1 LinkSites)

- **Lead Scout Bot** — future role for discovering leads and creating/enriching CRM records. **Declared but disabled** in v2; mock CRM data supplies its output.
- **Research/Enrichment Bot** — researches the specific lead and comparable businesses, records provenance, prepares research context.
- **Website Builder Bot** — selects template guidance from `LiNKsites`, writes copy, plans media, proposes style changes, produces the structured website package.
- **Outreach Bot** — future role for client outreach. **Declared but disabled** in v2; no outreach draft or send for v1.

Quality control starts with deterministic LiNKautowork checks. A dedicated QA Bot is **deferred** until deterministic checks expose a need for judgment review.

### 0.A.4.1 LinkBot role contract pack v1 (WP-044)

The LinkSites v2 vertical plugin MUST declare `required_linkbot_roles[]` entries for the four roles below. This section defines the minimum required role-contract fields and MVO restrictions for each role.

#### `lead_scout_bot` (declared, disabled in MVO)

- **purpose:** Future lead discovery and first-pass qualification for CRM intake.
- **inputs:** `lead_input` (mock only), optional operator-provided acquisition notes.
- **outputs:** `lead_record_ref` from mock/local substitution only.
- **allowed_capabilities:** none in v1 MVO runtime path.
- **allowed_skills:** none in v1 MVO runtime path.
- **audit_events:** `role.declared`, `role.skipped`, `role.mock_substitution`.
- **development_restrictions:**
  - `disabled_in_mvo`
  - `mock_input_only`
  - `no_live_acquisition`
  - `no_public_scraping`
- **explicit_non_ownership:**
  - MUST NOT own canonical memory, capability leases, secrets, deterministic workflow state, final audit, or target-app configuration.
  - MUST NOT own CRM schema/stage definitions.

#### `research_enrichment_bot`

- **purpose:** Research the lead and comparable businesses; produce a provenance-backed enrichment bundle for downstream website generation.
- **inputs:** `lead_record_ref`, `lead_input` business facts, optional prior research refs.
- **outputs:** `lead_research_bundle` (facts + comparable set + provenance citations), optional enriched context refs.
- **allowed_capabilities:** `public_web_research.read`, `zulip.notify` (run/operator notifications only), `plane.task.write` (mock/shadow only).
- **allowed_skills:** LinkSkills-governed research/retrieval skills only.
- **audit_events:** `role.started`, `role.completed`, `research.performed`, `provenance.recorded`, `role.failed`.
- **development_restrictions:**
  - `research_read_only`
  - `provenance_required`
  - `no_direct_crm_write`
  - `no_direct_payload_or_supabase_write`
- **explicit_non_ownership:**
  - MUST NOT issue capability leases directly.
  - MUST NOT persist canonical research memory directly to LiNKbrain stores; only emit event/audit refs through declared planes.

#### `website_builder_bot`

- **purpose:** Use discovered `LiNKsites` template(s) as guidance and produce business-specific website package content.
- **inputs:** `lead_record_ref`, `lead_research_bundle`, discovered `template_id` or equivalent template ref.
- **outputs:** `website_package` including business-specific copy bundle, media plan, style proposal, and template guidance refs.
- **allowed_capabilities:** `asset_generation.generate`, `public_web_research.read`, `zulip.notify` (status only).
- **allowed_skills:** LinkSkills-governed content-generation, style-planning, and packaging skills only.
- **audit_events:** `role.started`, `role.completed`, `template.guidance.selected`, `website.package.generated`, `provenance.recorded`, `role.failed`.
- **development_restrictions:**
  - `template_guidance_not_clone`
  - `local_artifact_target_only`
  - `no_direct_publish`
  - `no_target_schema_invention`
- **explicit_non_ownership:**
  - MUST NOT own Payload sync, Supabase mirror persistence, deterministic checks, or CRM status promotion (LiNKautowork + LinkSkills responsibilities).

#### `outreach_bot` (declared, disabled in MVO)

- **purpose:** Future outreach drafting/sending role for post-MVO phases.
- **inputs:** `lead_record_ref`, `website_package` summary (future).
- **outputs:** none in v1 MVO; role skip evidence only.
- **allowed_capabilities:** none in v1 MVO runtime path.
- **allowed_skills:** none in v1 MVO runtime path.
- **audit_events:** `role.declared`, `role.skipped`.
- **development_restrictions:**
  - `disabled_in_mvo`
  - `no_outreach_draft`
  - `no_outreach_send`
  - `no_external_contact`
- **explicit_non_ownership:**
  - MUST NOT own message-channel configuration, send-policy approvals, or communication logs as canonical audit (LiNKaios/LinkSkills/LiNKbrain own these planes).

### 0.A.5 Required v1 capability plugins

The v2 MVO requires capability plugins (governed connectors) covering:

- **Odoo/CRM shadow-readiness** — local/mock writes for lead status with Odoo readiness/shadow checks behind config.
- **Payload CMS (local)** — local Payload sync/publish connector; no schema invention.
- **Supabase mirror/content** — structured website content and asset references; schema copied/adapted from existing source, not invented.
- **Zulip** — run notifications plus LinkBot/operator work-channel communication.
- **Public web research** — governed read-only public research with citations/provenance.
- **Asset generation** — governed generated media (images/video) with provenance and audit.
- **Plane** — internal execution tasks plus future client/project scaffold; mock/shadow by default.

Each capability plugin contract pack (modes `mock | shadow | live`, lease requirements, idempotency, audit events, allowed callers, failure mapping, non-configuration of target-software business setup) is owned by WP-043 and downstream packets.

### 0.A.6 Site identity

Unless WP-042 discovery contradicts this, site identity is:

- one canonical `site_id` per business/lead record.
- each generation run creates a versioned `site_generation_run_id` tied to that `site_id`.

Reasoning: avoids creating a new logical site per retry, supports version history, lets future CRM/Odoo and Plane records point to the same site, and supports later production deployment without changing identity.

### 0.A.7 Side-effect routing (v2)

All side effects in the v2 flow MUST flow through LinkSkills capability leases and LiNKautowork deterministic workflows. Specifically:

- **LinkSkills leases** gate every capability-backed side effect: CRM/mock writes, Supabase mirror writes, Payload CMS writes, Zulip notifications, asset generation, public web research, and Plane/project writes. Lease lifecycle, idempotency, kill switches, and run-ledger semantics from §6.2 and §7.5 remain authoritative.
- **LiNKautowork workflows** own deterministic steps: artifact assembly, Supabase mirror sync, Payload sync, deterministic checks, and CRM status promotion to `ready_to_contact`. Each workflow accepts a `lease_id` when it performs a capability-gated action and references that lease in audit (§6.4).
- **LiNKbrain audit envelope** (§6.3, D-08) remains the single audit/event surface. Per-service ad hoc logging is not a substitute. New workflow and capability action types may be added per §6.3.1's "agents may add via decision row, never rename" rule.
- **LinkBot** continues to obey §6.1 boundaries: no direct memory writes, no direct lease issuance, no deterministic step execution, PII stripped from model prompts.

### 0.A.8 Schema-related deferrals (discovery-gated)

The following details are **explicitly deferred to WP-042 discovery** and MUST NOT be invented by any v2 contract or implementation packet:

- the concrete master/industry template location inside `/Users/linktrend/Projects/LiNKsites` (including whether it lives under `LiNKsites/apps/web-master`, an `apps/cms` Payload collection, or elsewhere).
- the current Payload CMS schema (collections, fields, relationships, locale strategy).
- whether the Supabase mirror schema already exists, where it lives, and what tables/columns it defines.
- the local Payload CMS boot sequence and configuration.
- which existing frontend reads from Payload to render the preview-ready site.

If WP-042 discovery returns a result that contradicts §0.A.1–§0.A.7 (for example, the existing site identity model is `business_id`/`project_id` rather than `site_id`/`site_generation_run_id`), the discovery result wins and this section is updated in the follow-up packet before implementation begins.

### 0.A.9 Mode model

Per `PLUGIN_ARCHITECTURE_V2.md`, every vertical and capability plugin distinguishes:

- **development mode** — local or mock side effects, local artifact storage, local services where possible. **Default for the v2 MVO.**
- **shadow mode** — validates real external connectivity/readiness without production writes.
- **live mode** — real external side effects, enabled only through explicit config and LinkSkills governance. **Not used in the v2 MVO.**

### 0.A.10 Acceptance posture (v2)

A v2 LinkSites MVO run is considered successful when, in development mode:

1. A mock CRM lead is intake-ready and contains enough business facts to drive research.
2. Research/Enrichment Bot produces an enrichment record with provenance citations.
3. Website Builder Bot produces a structured website package referencing a discovered `LiNKsites` template.
4. Generated artifacts (copy, media plan, style proposals, generated media with provenance) are written to the local generated-artifact folder.
5. Structured content + asset refs are written to the Supabase mirror through a LinkSkills lease.
6. LiNKautowork sync writes content into the local Payload CMS through a LinkSkills lease.
7. The existing/local frontend renders the preview-ready site from Payload.
8. Deterministic LiNKautowork checks pass against the required-pages/navigation/content/media/provenance/sync/preview criteria.
9. CRM/mock lead status is promoted to `ready_to_contact` through a LinkSkills lease.
10. Zulip notifications and Plane execution-tracking writes occur in mock/shadow mode with full lease + audit trail.

Every step above MUST produce: a LinkSkills lease (for side-effecting steps), a LiNKbrain audit event chain (§§6.3, 8), and a LiNKautowork workflow run reference (for deterministic steps), all visible from the LiNKaios trace/status surface. A v2 run that lacks any of audit/lease/memory/trace for a step that performed work is **unacceptable** per `.cursor/rules/04-mvo-scope-and-stubbing.mdc`.

### 0.A.10.1 LiNKautowork LinkSites v2 deterministic workflow contract pack (WP-045)

The LinkSites v2 development-mode flow requires the following deterministic workflow handles in LiNKautowork:

| Workflow handle | Purpose | Deterministic inputs | Deterministic outputs | Run-ledger refs | Audit events | Lease required |
|---|---|---|---|---|---|---|
| `autowork.linksites.artifact_write_local` | Write generated site package to the local development artifact folder only. | `tenant_id`, `run_id`, `site_id`, `site_generation_run_id`, `artifact_bundle_ref`, `artifact_root_path`, `idempotency_key` | `artifact_ref`, `artifact_manifest_ref`, `artifact_root_path`, `written_files_count`, `artifact_digest` | `Stage.refs.workflow_run_ids[]`, `subject.workflow_run_id` | `workflow.invoked`, `workflow.completed` or `workflow.failed` | No |
| `autowork.linksites.supabase_mirror_upsert` | Upsert discovered/approved mirror records from artifact outputs into Supabase mirror. | `tenant_id`, `run_id`, `site_id`, `site_generation_run_id`, `artifact_ref`, `mirror_payload_ref`, `lease_id`, `idempotency_key` | `mirror_write_ref`, `mirror_revision_ref`, `upserted_records_count`, `mirror_digest` | `Stage.refs.workflow_run_ids[]`, `Stage.refs.lease_ids[]`, LinkSkills `ledger_entry_id` | `workflow.invoked`, `workflow.completed` or `workflow.failed` | Yes (`lease_id` required) |
| `autowork.linksites.payload_sync_local` | Sync mirror-backed content into local Payload CMS for preview. | `tenant_id`, `run_id`, `site_id`, `site_generation_run_id`, `mirror_write_ref`, `payload_target_ref`, `lease_id`, `idempotency_key` | `payload_sync_ref`, `payload_document_refs`, `payload_sync_status` | `Stage.refs.workflow_run_ids[]`, `Stage.refs.lease_ids[]`, LinkSkills `ledger_entry_id` | `workflow.invoked`, `workflow.completed` or `workflow.failed` | Yes (`lease_id` required) |
| `autowork.linksites.preview_readiness_check` | Run deterministic quality gates against the preview-ready site. | `tenant_id`, `run_id`, `site_id`, `site_generation_run_id`, `payload_sync_ref`, `preview_url`, `required_pages`, `required_navigation_items`, `required_content_blocks`, `required_media_refs`, `idempotency_key` | `checks_passed`, `check_report_ref`, `failed_checks[]`, `preview_readiness_status` | `Stage.refs.workflow_run_ids[]`, `subject.workflow_run_id` | `workflow.invoked`, `workflow.completed` or `workflow.failed` | No |
| `autowork.linksites.crm_ready_to_contact_mark` | Set CRM/mock lead status to `ready_to_contact` only after readiness checks pass. | `tenant_id`, `run_id`, `lead_id`, `site_id`, `site_generation_run_id`, `checks_passed`, `check_report_ref`, `lease_id`, `idempotency_key` | `crm_record_id`, `lead_status`, `status_updated_at` | `Stage.refs.workflow_run_ids[]`, `Stage.refs.lease_ids[]`, LinkSkills `ledger_entry_id` | `workflow.invoked`, `workflow.completed` or `workflow.failed` | Yes (`lease_id` required) |

Contract rules for the five handles above:

- **Idempotency rule:** `idempotency_key` MUST be `${run_id}:${stage_id}:${workflow_handle}` and repeat invocation MUST return the original `workflow_run_id` and outputs without duplicating side effects.
- **Retry rule:** max 3 attempts for `retryable` failures with exponential backoff `1s, 4s, 16s`; no retry for policy-denied lease failures.
- **Failure mapping:** capability and workflow errors map to §5.4 codes only: `WORKFLOW_NOT_FOUND`, `WORKFLOW_STEP_FAILED`, `WORKFLOW_TIMEOUT`, `WORKFLOW_COMPENSATED`, `INTEGRATION_UNAVAILABLE`, `INTEGRATION_AUTH_FAILED`, `INTEGRATION_TIMEOUT`, `LEASE_DENIED`, `LEASE_EXPIRED`, `LEASE_KILL_SWITCH`, `LEASE_IDEMPOTENCY_CONFLICT`, `POLICY_REQUIRES_APPROVAL`.
- **Lease gate rule:** every side-effecting write (`supabase_mirror_upsert`, `payload_sync_local`, `crm_ready_to_contact_mark`) MUST fail closed when `lease_id` is absent, invalid, expired, denied, or kill-switched.
- **Development storage rule:** `artifact_write_local` is development-mode local filesystem behavior only. Production cold storage (for example Google Drive/equivalent durable archive) is future direction and not implemented in this packet.
- **Preview readiness minimums:** `preview_readiness_check` MUST fail if any required page, navigation item, content block, media reference, provenance reference, Payload sync status, or preview availability check fails.

### 0.A.11 Relationship to §§1–13 (historical v1 contract)

§§1–13 below were authored for the v1 `websitefactory.lead_to_preview` static/local preview flow finalized in WP-004 (2026-05-14). They remain useful as the typed source-of-truth for:

- the kernel ↔ plugin manifest contract surface (§1).
- the data dictionary's reusable types (§2): `lead_input`, `lead_record_ref`, `template_id`, `copy_bundle`, `media_plan`, `lease_ids`, `workflow_run_ids`, `audit_event_ids`, `run_id`.
- lead intake schema, validation, idempotency, and PII rules (§3).
- `WorkRequest` / `Run` / `Stage` lifecycle and retry policy (§4).
- `FailureReport` taxonomy and canonical error codes (§5).
- cross-plane envelopes for LinkBot (§6.1), LinkSkills (§6.2), LiNKbrain (§6.3, D-08), and LiNKautowork (§6.4).
- capability common rules (§7.5) and minimum audit-event sets per outcome (§8).
- role-bleed rules per plane and per plugin (§12).

The following §§1–13 elements are **historical and superseded by §0.A**:

- the `websitefactory.lead_to_preview` work-request type and the 10-stage trace in §10 as the canonical demo target.
- §7.1–§7.4 capability instances (`crm.upsert`, `plane.project.create`, `plane.task.create`, `preview.publish`) as the **complete** required-capability set. They remain valid v1 capabilities and v2 may still use a `crm.upsert`-shaped capability for mock CRM status updates; however the v2 capability surface is broader and is owned by WP-043 (Supabase mirror, Payload, Zulip, web research, asset generation, Odoo readiness, Plane shadow).
- §9 `PreviewOutput` as the **sole** canonical output. The v2 output shape (preview-ready Payload-backed site + deterministic checks + `ready_to_contact` promotion) is owned by WP-041 follow-up and WP-042 discovery; it MUST NOT be invented ahead of discovery.
- §11 STUB blocks (INT-020/INT-021/INT-022) as the **current** stub set. The v2 stub posture is mock/shadow per capability plugin (see `INTEGRATION_QUEUE.md` LinkSites v2 section and §0.A.5 above).

Old v1 proof language elsewhere in §§1–13 should be read as "historical v1 example" rather than "current roadmap target." Implementation packets must bind to §0.A first and to §§1–13 only for the elements explicitly retained above.

---

> **Historical reference (v1).** §§1–13 below describe the v1 `websitefactory.lead_to_preview` static/local proof. Read with §0.A above; the canonical current target is the LinkSites v2 development-mode flow.

> "LiNKaios coordinates the ecosystem but must not absorb the responsibilities of LiNKbrain, LinkSkills, LiNKautowork, or LinkBot." — `ARCHITECTURE_RULES.md`

All field names below are **canonical**. Implementation agents MUST bind to these names exactly. Pin Zod/TypeScript schemas in `packages/linklogic-sdk` (LiNKaios) and mirror in service-local types; do not invent parallel names.

Implementation agents should treat sections 1–10 as **typed contracts**, section 11 as **stub specifications**, and section 12 as **role-bleed guards** that fail review on violation.

---

## 1. Plugin architecture v2 — plugin kinds, mode model, role attachments

The kernel/plugin contract surface in §1.5–§1.7 is shared by **all** plugins, but the kernel distinguishes plugin kinds at load time.

### 1.0.1 Plugin kinds

- **Core platform services** — `linkaios`, `linkskills`, `linkautowork`, `linkbrain`, `linkbot`. These are not plugins. Plugins MUST NOT absorb their responsibilities (see §12 and `.cursor/rules/01-ecosystem-boundaries.mdc`).
- **Vertical plugin** (`plugin_kind: "vertical"`) — declares work request types, ordered workflow stages, required LinkBot roles, required capability plugins, required LinkSkills permissions/skills, required LiNKautowork workflow hooks, required LiNKbrain audit/memory events, LiNKaios UI panels/read views, owned data objects, and per-mode behavior. Examples: LinkSites/WebsiteFactory, LEXOS Litigation, Linktrend Media, Linkapps, Linktrend Development, Linktrend Admin.
- **Capability plugin** (`plugin_kind: "capability"`) — declares a governed connection to one piece of software/tooling: capability id, target software, allowed operations, auth/tenant config, mode flags, LinkSkills lease requirements, idempotency rules, audit events, allowed callers, failure mapping, and what it explicitly does **not** configure inside the target software. Capability plugins prepare the connector surface only; they MUST NOT invent the target software's internal business setup (Odoo charts of accounts, Payload schemas, CRM stages, content models, etc.). If a schema or configuration already exists in another repo, agents MUST discover/copy/adapt rather than recreate.

Verticals say what work needs to happen. Capabilities provide the tools. LinkSkills grants permissions and skills. LiNKautowork runs deterministic steps. LinkBots reason. LiNKbrain remembers. LiNKaios coordinates.

### 1.0.2 Mode model (development / shadow / live)

Every vertical and capability plugin MUST declare which modes it supports and behave correctly in each:

- **`development`** — local or mock side effects, local artifact storage, local services where possible. Default for MVO. Capability plugin backends may run as in-process stubs (e.g. INT-020/INT-021/INT-022 in §11) provided the lease + audit + memory + trace artifacts are still produced.
- **`shadow`** — validates real external connectivity, auth, and idempotency without performing production writes. Reads are permitted; writes are dry-run or echoed to an audit-only sink. A shadow run MUST emit the same audit envelope shape as a live run, with `payload.mode: "shadow"`.
- **`live`** — real external side effects against the target software. Enabled only when (a) the tenant config explicitly opts in, (b) LinkSkills grants a non-revoked lease for the capability, and (c) the kill switch is `open`. Live runs MUST emit `payload.mode: "live"`.

The plugin manifest's `modes_supported` field declares the supported modes; the run-time mode is selected per `(tenant_id, plugin_id, capability)` by LiNKaios config and surfaced in the trace view. A capability plugin that declares only `development` MUST NOT be invoked in `shadow` or `live` regardless of operator override.

### 1.0.3 LinkBot role attachment model

LinkBots attach to vertical-plugin stages through **declared roles**. A role declaration belongs to the vertical plugin manifest (or to a shared role pack), and pins:

- role purpose
- inputs and outputs (typed names from §2)
- allowed capability plugins (subset of the vertical's `required_capabilities`)
- allowed LinkSkills permissions/skills
- model and tool policy (model routing profile, max tokens, tool catalog subset)
- audit events the role emits
- development-mode restrictions (e.g. outreach drafts only, no send)

LinkBots remain thin runtime workers: they do not own canonical memory, permissions, deterministic workflow state, or integration secrets (§12.3).

### 1.0.4 Stop-and-ask rule

If an agent does not know the intended workflow for a vertical plugin, capability plugin, or vertical/capability combination, it MUST stop and ask before implementing. Agents MUST NOT invent business workflows, software schemas, charts of accounts, CRM stages, Payload content models, Odoo records, or similar domain configuration based on assumptions. When a target software already has schemas/configs in another repo, copy/adapt them rather than rebuilding.

This rule is enforced in §12.7 as a review-gate.

## 1.5 LiNKaios kernel ↔ plugin contract surface

The remainder of §1 applies to every plugin kind. Vertical-only and capability-only obligations are flagged inline.

### 1.1 Kernel responsibilities (owned)

Per `LINKAIOS_KERNEL_MANIFEST.md` §1, the kernel owns and the plugin MUST NOT re-implement:

- Tenant registry (`tenant_id`, plugin entitlements).
- Plugin registry + manifest loader (validates §2 below at boot).
- Work + Run orchestration (`work_request` → `run` → `stage`).
- Status + Trace surfaces (read-only joins by id).
- Approvals + Routing hooks (keyed on `run_id` + `stage_id`).
- Integration visibility (real vs stub per tenant).

### 1.2 Plugin manifest contract (typed shape)

The kernel rejects any plugin whose manifest fails this shape at load time.

```ts
type Plane = "linkaios" | "linkbot" | "linkskills" | "linkautowork" | "linkbrain";
type FailureMode = "retryable" | "abort_run" | "require_approval";
type PluginKind = "vertical" | "capability";
type PluginMode = "development" | "shadow" | "live";

interface LinkBotRoleAttachment {
  role_id: string;                   // e.g. "research_enrichment_bot"
  purpose: string;
  inputs: string[];                  // §2 typed names
  outputs: string[];
  allowed_capabilities: string[];    // subset of required_capabilities
  allowed_skills: string[];          // LinkSkills skills + permissions the role may use
  model_policy: {
    model_routing_profile: string;   // resolved by LiNKaios (D-06)
    tools?: string[];                // optional tool-catalog subset
  };
  audit_events: string[];            // subset of required_audit_events
  development_restrictions?: string[]; // e.g. "outreach_draft_only"
}

interface CapabilityPluginSurface {
  capability_id: string;             // e.g. "crm.upsert", "payload.publish"
  target_software: string;           // e.g. "odoo", "payload_cms"
  allowed_operations: string[];      // bounded list; lease-gated
  auth_requirements: string[];       // config keys; secrets live in LinkSkills
  mode_flags: PluginMode[];          // subset of "development" | "shadow" | "live"
  lease_requirements: string[];      // LinkSkills permission/skill ids
  idempotency_rules: string;         // human-readable rule, e.g. "(tenant_id,lead_id)"
  audit_events: string[];            // subset of §6.3.1
  allowed_callers: Array<"linkaios" | "vertical_plugin" | "linkbot" | "linkautowork">;
  failure_mapping: Record<string, string>; // backend code → §5.4 code
  not_configured: string[];          // explicit list of target-software internals the capability does NOT configure
}

interface PluginManifest {
  plugin_id: string;            // slug, e.g. "websitefactory"
  plugin_kind: PluginKind;      // "vertical" | "capability" (v2). Default "vertical" for legacy manifests.
  plugin_name: string;
  version: string;              // semver of the manifest
  purpose: string;

  modes_supported: PluginMode[];   // §1.0.2 — at minimum ["development"]

  public_surfaces: {
    work_request_types: string[];   // e.g. ["websitefactory.lead_to_preview"]
    ui_panels: string[];            // panels mounted into apps/linkaios-web
    read_views: string[];
  };

  // Vertical-plugin fields (required when plugin_kind="vertical")
  stages: Array<{
    stage_id: string;
    display_name: string;
    responsible_plane: Plane;
    inputs: string[];              // names defined in §3 (data dictionary)
    outputs: string[];
    failure_mode: FailureMode;
  }>;

  config_surfaces: string[];          // tenant-scoped config keys
  required_capabilities: string[];    // capability plugin ids (vertical) / empty for capability plugins
  required_workflow_hooks: string[];  // LiNKautowork workflow handles
  required_audit_events: string[];    // LiNKbrain audit event types (subset of §6.3)
  required_linkbot_roles?: LinkBotRoleAttachment[]; // vertical plugins only
  preview_output_shape: Record<string, string>; // declared field → type (verticals that surface a preview)
  non_goals: string[];

  // Capability-plugin field (required when plugin_kind="capability")
  capability?: CapabilityPluginSurface;
}
```

Notes for v2 compatibility:

- `plugin_kind` and `modes_supported` MAY be omitted by legacy v1 manifests; the kernel SHOULD treat the manifest as `plugin_kind="vertical"` and `modes_supported=["development"]` and emit a deprecation warning. New manifests MUST declare both.
- A vertical plugin MUST have at least one stage; a capability plugin SHOULD declare `stages: []` if its surface is purely a connector and MUST declare its operations through the `capability` block.
- `required_linkbot_roles` is verbose by design: the kernel surfaces role attachments in the trace view so operators see which LinkBot played which stage.

### 1.3 Manifest validation at load

The kernel rejects the manifest if any of the following hold; agents must surface a structured error, not a soft warning:

- `responsible_plane === "linkaios"` and the stage declares any `output` that is a side-effect (any capability id) — kernel must not own side effects.
- `required_capabilities` references a capability not present in the LinkSkills capability catalog at boot.
- `required_workflow_hooks` references a workflow handle not registered in LiNKautowork.
- `required_audit_events` references an event type not in §6.3.
- Any stage with `failure_mode="require_approval"` whose `responsible_plane` is not `linkskills` or `linkaios` (only those planes own the approval surface).
- Plugin attempts to declare an audit sink other than LiNKbrain, or a secrets surface other than LinkSkills.
- `plugin_kind="vertical"` and `stages.length === 0`.
- `plugin_kind="capability"` and `capability` block is missing or `capability.mode_flags` is empty.
- `capability.allowed_callers` includes a value other than `linkaios | vertical_plugin | linkbot | linkautowork`.
- `modes_supported` contains a mode not in `{development, shadow, live}`, or is empty.
- A vertical plugin declares a `required_linkbot_roles[i].allowed_capabilities` value not present in its own `required_capabilities`, or a `required_linkbot_roles[i].audit_events` value not in `required_audit_events`.
- A capability plugin's `not_configured` list is empty (capability plugins MUST explicitly state what they do not configure inside the target software — §1.0.4 stop-and-ask enforcement).

### 1.4 LinkSites / WebsiteFactory manifest declaration (concrete vertical instance)

Pinned in `LINKAIOS_KERNEL_MANIFEST.md` §4. WP-004 binds the manifest fields to types above; the YAML in WP-003 is the canonical v1 instance and is loaded as-is at boot. The LinkSites vertical MVO v2 (see `LINKSITES_VERTICAL_MVO_V2.md` and WP-041) extends this manifest with `plugin_kind: "vertical"`, `modes_supported: ["development"]`, the LinkBot role attachments declared in WP-044, and the capability plugins enumerated in WP-043. v2 fields are additive; the v1 manifest remains valid under the legacy-compat rules in §1.2.

---

## 2. Data dictionary (canonical typed names)

These names appear in stage `inputs`/`outputs` and across plane contracts. Pin once in `packages/linklogic-sdk/types`.

| Name | Shape (summary) | Owner |
|------|-----------------|-------|
| `lead_input` | §3.1 | LiNKaios kernel (intake) |
| `lead_record_ref` | `{ lead_id: string; tenant_id: string; idempotency_key: string }` | LiNKaios kernel |
| `lead_evaluation` | `{ score: number; segment: string; rationale: string; model_run_id: string }` | LinkBot |
| `template_id` | `string` (slug from `LiNKsites/apps/web-master` template catalog) | LinkBot |
| `copy_bundle` | `{ blocks: Array<{ block_id: string; text: Record<string,string> }>; locale: string }` | LinkBot |
| `media_plan` | `{ placements: Array<{ block_id: string; asset_ref: string; kind: "placeholder" \| "stock" }> }` | LinkBot |
| `render_spec` | `{ template_id: string; copy_bundle: CopyBundle; media_plan: MediaPlan; theme: ThemeOverrides }` | LiNKautowork |
| `crm_record_id` | `string` (uuid) | LinkSkills lease backend (stub: `mvo_crm_records.id`) |
| `project_id` | `string` (uuid) | LinkSkills lease backend (stub: `mvo_projects.id`) |
| `task_id` | `string` (uuid) | LinkSkills lease backend (stub: `mvo_tasks.id`) |
| `preview_url` | `string` (absolute URL on `apps/linkaios-web`) | LiNKautowork (`autowork.websitefactory.preview_serve`) |
| `preview_artifact_ref` | `string` (storage handle for rendered bundle) | LiNKautowork |
| `lease_ids` | `string[]` (LinkSkills run-ledger refs) | LinkSkills |
| `workflow_run_ids` | `string[]` (LiNKautowork run refs) | LiNKautowork |
| `audit_event_ids` | `string[]` (LiNKbrain refs) | LiNKbrain |
| `run_id` | `string` (uuid) | LiNKaios kernel |

---

## 3. Lead intake contract

Owner plane for intake: **LiNKaios kernel** (`lead_intake` stage). No side effects.

### 3.1 `lead_input` schema

```ts
interface LeadInput {
  tenant_id: string;                       // required; must exist in tenant registry
  source: "manual" | "csv_import" | "stub";
  business_name: string;                   // required, 1..200 chars, trimmed
  industry: string;                        // required, free text 1..120 chars
  industry_taxonomy_id?: string;           // optional, slug from internal taxonomy
  contact?: {
    name?: string;                         // <=200 chars
    email?: string;                        // RFC5322 if provided
    phone?: string;                        // E.164 if provided
  };
  location?: { city?: string; region?: string; country?: string };
  notes?: string;                          // <=2000 chars
  external_ids?: Record<string, string>;   // reserved keys: "chatwoot_id", "odoo_id"
  client_idempotency_key?: string;         // optional; see §3.3
}
```

### 3.2 Validation rules

- Reject if `tenant_id` is not in `linkaios.tenants` with `status="active"`.
- Reject if `business_name` is empty after trim or `industry` is empty after trim.
- `email`, when present, MUST pass RFC5322; `phone`, when present, MUST be E.164.
- `external_ids` keys MUST match `/^[a-z][a-z0-9_]{1,40}$/`.
- Any string field longer than its limit returns `LEAD_INPUT_TOO_LONG` (see §5.4).
- Validation runs in the kernel before a `run` is created. No partial intake.

### 3.3 Idempotency / dedupe

- **Idempotency key** = `client_idempotency_key` if provided, otherwise the SHA-256 of `(tenant_id || ":" || business_name_normalized || ":" || (contact.email ?? "") || ":" || (contact.phone ?? ""))`.
- The kernel stores `(tenant_id, idempotency_key) → lead_id` with a unique index. Re-submission within **24 hours** returns the existing `lead_record_ref` and the existing `run_id` (no new run). After 24 hours a new run MAY be created.
- `business_name_normalized` = `trim` + `toLowerCase` + collapse whitespace.

### 3.4 PII handling

- `contact.email`, `contact.phone`, `contact.name` are PII.
- PII MUST NOT appear in audit `payload` fields. Audit events that need to reference a contact use `subject.lead_id` only; PII lookup goes through LiNKaios kernel reads gated by RLS.
- PII MUST NOT appear in `copy_bundle` or `render_spec` outputs (the preview must not leak the lead's own contact info as page content unless explicitly placed by an operator-approved stage; MVO does not expose such a stage).
- Logs at all planes MUST redact email and phone using `[redacted:email]` / `[redacted:phone]`.
- LinkBot prompts to OpenRouter MUST strip `contact` entirely; only `business_name`, `industry`, `location`, `notes` are sent.

---

## 4. Work / Run lifecycle

Owner: **LiNKaios kernel**. Stage execution is dispatched to planes; the kernel never executes the side effect itself.

### 4.1 `work_request`

```ts
interface WorkRequest {
  work_request_id: string;      // uuid, assigned by kernel
  tenant_id: string;
  plugin_id: string;            // e.g. "websitefactory"
  work_request_type: string;    // e.g. "websitefactory.lead_to_preview"
  payload: unknown;             // plugin-typed; for WebsiteFactory this is LeadInput
  requested_by: { actor_kind: "user" | "system" | "bot"; actor_id: string };
  created_at: string;           // ISO-8601 UTC
  idempotency_key: string;      // §3.3
}
```

### 4.2 `run`

```ts
interface Run {
  run_id: string;               // uuid
  work_request_id: string;
  tenant_id: string;
  plugin_id: string;
  status: RunStatus;            // §4.4
  started_at: string;
  ended_at?: string;
  stages: Stage[];              // ordered per manifest
  outputs: Record<string, unknown>; // typed names from §2; populated as stages complete
  failure?: FailureReport;      // §5
}
```

### 4.3 `stage`

```ts
interface Stage {
  stage_id: string;             // matches manifest stage_id
  run_id: string;
  responsible_plane: Plane;
  status: StageStatus;          // §4.4
  attempt: number;              // 1-based; bumped on retry
  inputs_snapshot: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  started_at?: string;
  ended_at?: string;
  refs: {
    lease_ids?: string[];       // LinkSkills
    workflow_run_ids?: string[];// LiNKautowork
    audit_event_ids?: string[]; // LiNKbrain
    model_run_id?: string;      // LinkBot
  };
  failure?: FailureReport;
}
```

### 4.4 Status transitions

`RunStatus`: `pending → running → (succeeded | partial | failed | awaiting_approval | cancelled)`.

| From | To | Trigger |
|------|----|---------|
| `pending` | `running` | First stage dispatched. |
| `running` | `awaiting_approval` | A stage with `failure_mode="require_approval"` requires operator approval. |
| `awaiting_approval` | `running` | Operator approves via kernel approvals surface. |
| `awaiting_approval` | `cancelled` | Operator rejects, OR approval timeout (default 24h). |
| `running` | `succeeded` | All stages reached `succeeded`. |
| `running` | `partial` | A stage failed `require_approval` AND was rejected, but earlier deterministic stages completed and outputs are surfacable. |
| `running` | `failed` | A stage failed `abort_run`, or `retryable` exceeded max attempts (default 3). |
| any non-terminal | `cancelled` | Operator cancel, OR tenant suspended. |

`StageStatus`: `pending → dispatched → running → (succeeded | failed | awaiting_approval | skipped)`. A `skipped` stage MUST record a reason in `failure.code` (using §5.4 codes such as `STAGE_SKIPPED_BY_POLICY`).

### 4.5 Run finalization

When a run reaches `succeeded`, `partial`, `failed`, or `cancelled`, the kernel MUST emit `run.completed`, `run.failed`, or `run.cancelled` via §6. The `record_run` stage (LiNKbrain) persists the closure and returns the final `audit_event_ids`; it does not own the run terminal-state transition.

### 4.6 Retry policy

- `retryable` stages: max 3 attempts, exponential backoff (1s, 4s, 16s). Each attempt MUST be a new `Stage.attempt` row, not an overwrite.
- `abort_run`: 1 attempt; failure terminates the run.
- `require_approval`: not retried automatically; gated by §4.4 approval transitions.

---

## 5. Failure taxonomy

All planes emit failure reports with this shape; the kernel surfaces them in the trace view.

### 5.1 `FailureReport`

```ts
interface FailureReport {
  code: string;                 // §5.4 enum
  plane: Plane;                 // where it originated
  message: string;              // human-readable, PII-free
  retryable: boolean;
  approval_required?: boolean;  // true when code === "POLICY_REQUIRES_APPROVAL"
  details?: Record<string, unknown>; // bounded; never include raw PII
  caused_by?: { ref_kind: "lease" | "workflow_run" | "audit_event" | "model_run"; ref_id: string };
  occurred_at: string;
}
```

### 5.2 Failure → status mapping

| Code class | Resulting stage status | Resulting run status (if propagated) |
|------------|------------------------|--------------------------------------|
| `LEAD_*`, `MANIFEST_*` | `failed` | `failed` (abort_run) |
| `LEASE_DENIED` | `failed` | `awaiting_approval` if policy says recoverable, else `failed` |
| `WORKFLOW_*` retryable | `failed` then retried | `running` until max attempts |
| `MODEL_*` retryable | `failed` then retried | `running` until max attempts |
| `POLICY_REQUIRES_APPROVAL` | `awaiting_approval` | `awaiting_approval` |
| `KERNEL_*` | `failed` | `failed` |

### 5.3 Failure visibility

Every `FailureReport` MUST also be emitted as a LiNKbrain audit event of type `stage.failed` or `run.failed` (§6.3). A failure that is not in LiNKbrain is treated as not having happened — the run cannot leave `running` without an audit event recording the terminal state.

### 5.4 Canonical error code enum (initial set; agents may add, never rename)

- `LEAD_INPUT_INVALID`, `LEAD_INPUT_TOO_LONG`, `LEAD_TENANT_INACTIVE`, `LEAD_DUPLICATE_WITHIN_WINDOW`.
- `MANIFEST_INVALID`, `MANIFEST_CAPABILITY_UNKNOWN`, `MANIFEST_WORKFLOW_UNKNOWN`, `MANIFEST_AUDIT_EVENT_UNKNOWN`.
- `LEASE_REQUEST_INVALID`, `LEASE_DENIED`, `LEASE_EXPIRED`, `LEASE_KILL_SWITCH`, `LEASE_IDEMPOTENCY_CONFLICT`.
- `WORKFLOW_NOT_FOUND`, `WORKFLOW_TIMEOUT`, `WORKFLOW_STEP_FAILED`, `WORKFLOW_COMPENSATED`.
- `MODEL_PROVIDER_ERROR`, `MODEL_TIMEOUT`, `MODEL_OUTPUT_INVALID`, `MODEL_QUOTA_EXCEEDED`.
- `INTEGRATION_UNAVAILABLE`, `INTEGRATION_AUTH_FAILED`, `INTEGRATION_TIMEOUT`.
- `POLICY_REQUIRES_APPROVAL`, `APPROVAL_REJECTED`, `APPROVAL_TIMEOUT`.
- `STAGE_SKIPPED_BY_POLICY`, `KERNEL_DISPATCH_FAILED`, `KERNEL_PERSISTENCE_FAILED`.

---

## 6. Cross-plane contracts

All cross-plane calls are JSON over the in-cluster transport exposed by `packages/linklogic-sdk`. Every call carries `tenant_id`, `run_id`, `stage_id`, and a `trace_id` header; receivers MUST echo these into their audit events.

### 6.1 LiNKaios ↔ LinkBot (reasoning dispatch)

LinkBot is a **delegating shell**. It accepts a stage dispatch and returns typed output. It MUST NOT write to LiNKbrain memory directly (it asks LiNKbrain via the audit envelope), MUST NOT issue capability leases (it asks LinkSkills via the kernel), and MUST NOT execute deterministic steps.

**Request — `bot.reason`**

```ts
interface BotReasonRequest {
  tenant_id: string;
  run_id: string;
  stage_id: string;             // e.g. "lead_evaluation"
  reasoning_kind:               // pinned vocabulary
    | "lead_evaluation"
    | "template_selection"
    | "copy_generation"
    | "media_placement";
  inputs: Record<string, unknown>;    // typed per stage; §2 names
  model_routing_profile: string;      // resolved by LiNKaios from tenant config (D-06)
  pii_policy: "strip_contact";        // MVO default; LinkBot MUST honor
}
```

**Response — `bot.reason.result`**

```ts
interface BotReasonResult {
  outputs: Record<string, unknown>;   // typed per stage
  model_run_id: string;               // logged in stage.refs.model_run_id
  tokens_in: number;
  tokens_out: number;
  failure?: FailureReport;            // present if reasoning failed
}
```

### 6.2 LiNKaios ↔ LinkSkills (lease lifecycle)

LinkSkills owns capability catalog, lease issuance, run ledger, idempotency, and kill switches. The kernel does **not** decide policy content — it only asks.

**Lease lifecycle states:** `requested → (granted | denied | requires_approval) → (executed | expired | revoked)`.

**Request — `skills.lease.request`**

```ts
interface LeaseRequest {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  capability: string;           // e.g. "crm.upsert", "preview.publish"
  arguments: Record<string, unknown>;  // typed per capability (§7)
  idempotency_key: string;             // e.g. `${run_id}:${stage_id}:${capability}`
  actor: { actor_kind: "plugin" | "bot" | "user"; actor_id: string };
}
```

**Response — `skills.lease.decision`**

```ts
interface LeaseDecision {
  lease_id: string;
  status: "granted" | "denied" | "requires_approval";
  reason?: string;
  expires_at?: string;          // present when granted; default TTL = 5 minutes
  kill_switch_state: "open" | "tripped";
  failure?: FailureReport;
}
```

**Execute — `skills.lease.execute`**

The kernel (or the responsible plane stage) invokes the lease to perform the side effect. LinkSkills records the run-ledger entry and only then dispatches to the capability backend (real or stub per §11).

```ts
interface LeaseExecuteRequest {
  lease_id: string;
  idempotency_key: string;      // MUST equal the LeaseRequest idempotency_key
}

interface LeaseExecuteResult {
  lease_id: string;
  capability: string;
  result: Record<string, unknown>;  // typed per capability (§7)
  ledger_entry_id: string;
  audit_event_id: string;           // LinkSkills MUST have written `lease.executed` to LiNKbrain before returning
  failure?: FailureReport;
}
```

**Idempotency:** A re-execute with the same `idempotency_key` returns the original `result` and `ledger_entry_id`; it MUST NOT trigger a second side effect at the backend (real or stub).

**Kill switch:** When tripped for a capability, all `skills.lease.request` for that capability return `denied` with `LEASE_KILL_SWITCH` and the kernel transitions the stage to `failed` (`abort_run`).

### 6.3 All planes → LiNKbrain (audit/event envelope)

Per `DECISIONS.md` D-08, every side effect, decision, and run transition is emitted to LiNKbrain in a single envelope. Per-service ad hoc logging is **forbidden** as a substitute.

**Envelope — `brain.audit.write`**

```ts
interface AuditEvent {
  event_id: string;             // uuid, generated by emitter
  ts: string;                   // ISO-8601 UTC
  tenant_id: string;
  plane: Plane;                 // emitter
  actor: { actor_kind: "kernel" | "plugin" | "bot" | "user" | "system"; actor_id: string };
  action: string;               // canonical type, see §6.3.1
  subject: {                    // ids only, never PII payloads
    run_id?: string;
    stage_id?: string;
    lease_id?: string;
    workflow_run_id?: string;
    capability?: string;
    plugin_id?: string;
    lead_id?: string;
    preview_url?: string;
    preview_artifact_ref?: string;
    crm_record_id?: string;
    project_id?: string;
    task_id?: string;
  };
  refs?: {
    caused_by_event_id?: string;
    parent_event_id?: string;
  };
  payload: Record<string, unknown>;   // bounded, PII-redacted (§3.4)
  schema_version: "1";
}

interface AuditWriteResult {
  event_id: string;
  persisted_at: string;
  failure?: FailureReport;
}
```

**§6.3.1 Canonical `action` values (initial set; agents may add via decision row, never rename):**

- Run-level: `run.started`, `run.completed`, `run.failed`, `run.cancelled`.
- Stage-level: `stage.started`, `stage.completed`, `stage.failed`, `stage.awaiting_approval`, `stage.skipped`.
- Lease-level: `lease.requested`, `lease.granted`, `lease.denied`, `lease.executed`, `lease.expired`, `lease.revoked`.
- Workflow-level: `workflow.invoked`, `workflow.completed`, `workflow.failed`, `workflow.compensated`.
- Output-level: `preview.published`, `crm.upserted`, `plane.project.created`, `plane.task.created`.
- Approval-level: `approval.requested`, `approval.granted`, `approval.rejected`, `approval.timed_out`.

**Write semantics:** LiNKbrain returns `event_id` on success. If LiNKbrain is unreachable, the emitter MUST queue locally and retry; a stage that cannot confirm its `*.completed` audit event MUST NOT transition the run to a terminal `succeeded` state.

### 6.4 LiNKaios ↔ LiNKautowork (workflow run lifecycle)

LiNKautowork executes deterministic workflows; it does **not** make high-judgment decisions and does **not** own audit storage.

**Workflow run states:** `requested → running → (succeeded | failed | compensated)`.

**Request — `autowork.workflow.invoke`**

```ts
interface WorkflowInvokeRequest {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  workflow_handle: string;      // e.g. "autowork.websitefactory.render"
  inputs: Record<string, unknown>;
  lease_id?: string;            // present when this workflow performs a side effect gated by LinkSkills
  idempotency_key: string;      // `${run_id}:${stage_id}:${workflow_handle}`
}
```

**Response — `autowork.workflow.result`**

```ts
interface WorkflowInvokeResult {
  workflow_run_id: string;
  status: "succeeded" | "failed" | "compensated";
  outputs?: Record<string, unknown>;  // present when succeeded
  audit_event_ids: string[];          // LiNKautowork MUST have emitted workflow.invoked + workflow.completed (or workflow.failed)
  failure?: FailureReport;
}
```

**Step transitions:** LiNKautowork emits internal `workflow.invoked` at start and `workflow.completed` / `workflow.failed` / `workflow.compensated` at terminal. Intermediate step granularity is internal to n8n; the contract surface is the workflow-run boundary.

**Compensation:** When a workflow declares compensation steps (e.g. cleanup of partially-rendered preview), failure triggers compensation and returns `compensated` with `failure` set. The kernel treats `compensated` as a terminal failure unless the stage policy says otherwise.

---

## 7. LinkSkills capability checks (MVO capabilities)

Each capability below MUST be present in the LinkSkills catalog at boot. Argument and result shapes are the **contract** the kernel and plugin bind to; backends (real or stub, §11) implement them.

### 7.1 `crm.upsert`

**Arguments:**

```ts
interface CrmUpsertArgs {
  tenant_id: string;
  lead_id: string;
  business_name: string;
  industry: string;
  contact_email?: string;       // PII; not echoed back in payload
  contact_phone?: string;       // PII; not echoed back in payload
  external_ids?: Record<string, string>;
}
```

**Result:**

```ts
interface CrmUpsertResult {
  crm_record_id: string;
  created: boolean;             // true on first upsert, false on update
}
```

**Policy:** `failure_mode = require_approval` (per WP-003 manifest). Default policy denies without operator approval at MVO; approval can be auto-granted per tenant config.

### 7.2 `plane.project.create`

**Arguments:** `{ tenant_id, lead_id, project_name, owner_actor_id }`.
**Result:** `{ project_id, created: boolean }`.
**Policy:** `require_approval`. Idempotent per `(tenant_id, lead_id)`.

### 7.3 `plane.task.create`

**Arguments:** `{ tenant_id, project_id, title, description?, assignee_actor_id? }`.
**Result:** `{ task_id, created: boolean }`.
**Policy:** `require_approval`. Idempotent per `(project_id, title_normalized)`.

### 7.4 `preview.publish`

**Arguments:**

```ts
interface PreviewPublishArgs {
  tenant_id: string;
  run_id: string;
  render_spec: RenderSpec;      // §2
  preview_route_prefix: string; // tenant config; default "/preview/<tenant>/<run_id>"
}
```

**Result:**

```ts
interface PreviewPublishResult {
  preview_url: string;          // absolute URL, served by apps/linkaios-web
  preview_artifact_ref: string;
  expires_at?: string;          // optional; null for static/local MVO
}
```

**Policy:** `require_approval` at MVO (per WP-003 manifest). Approval-auto-grant allowed per tenant. The actual publish executes via `autowork.websitefactory.render` + `autowork.websitefactory.preview_serve` workflows (see §6.4).

### 7.5 Common capability rules

- All capabilities MUST be idempotent under the LeaseRequest `idempotency_key` (§6.2).
- All capabilities MUST emit `lease.executed` and the corresponding output-level event (`crm.upserted`, `plane.project.created`, `plane.task.created`, `preview.published`) to LiNKbrain before returning success.
- All capabilities MUST honor kill switches without state mutation.

---

## 8. Minimum audit events per run outcome

Per `DECISIONS.md` D-08 and `.cursor/rules/04-mvo-scope-and-stubbing.mdc` ("no audit event" is an unacceptable stub).

### 8.1 Successful run (`status = "succeeded"`) — minimum events in LiNKbrain

In order:

1. `run.started` (plane: `linkaios`).
2. For each stage in order: `stage.started`, `stage.completed` (plane = stage's `responsible_plane`).
3. For each capability used: `lease.requested`, `lease.granted`, `lease.executed`, and the output-level event (`crm.upserted` and/or `plane.project.created` and/or `plane.task.created` and/or `preview.published`).
4. For each workflow used: `workflow.invoked`, `workflow.completed`.
5. `run.completed` (plane: `linkaios`) carrying `subject.preview_url` and the full ref set (§9).

A `succeeded` run MUST have at least: `run.started`, all stage `stage.completed` pairs, ≥4 `lease.executed` (`crm.upsert`, `plane.project.create`, `plane.task.create`, `preview.publish`), `preview.published`, `run.completed`.

### 8.2 Failed run (`status = "failed"`) — minimum events

- `run.started`.
- All `stage.started` up to and including the failing stage.
- `stage.failed` on the failing stage, with `payload.failure` populated.
- For any executed leases prior to failure: their `lease.executed` and corresponding output-level events.
- `run.failed` carrying `payload.failure_summary` referencing the failing `stage_id`.

### 8.3 Approval-required run (`status = "awaiting_approval"`)

- `run.started`.
- `stage.started` then `stage.awaiting_approval` on the gated stage, with `subject.lease_id` and `payload.capability`.
- `approval.requested` (plane: `linkaios`).
- On resolution: `approval.granted` → `stage.completed`, or `approval.rejected`/`approval.timed_out` → `stage.failed` → `run.failed` or `run.cancelled` per §4.4.

---

## 9. Preview output contract

The kernel surfaces this object verbatim in the trace/status view for every WebsiteFactory run. It is the canonical "result" of the MVO.

```ts
interface PreviewOutput {
  run_id: string;
  tenant_id: string;
  plugin_id: "websitefactory";

  preview_url: string;                       // §7.4 result
  preview_artifact_ref: string;              // §7.4 result

  crm_record_id: string | null;              // null if crm.upsert approval not granted
  project_id: string | null;
  task_id: string | null;

  lease_ids: string[];                       // every LinkSkills lease used by the run
  workflow_run_ids: string[];                // every LiNKautowork workflow used
  audit_event_ids: string[];                 // at least run.started, run.completed/run.failed, and preview.published if present

  status: "succeeded" | "partial" | "failed" | "awaiting_approval";
  finalized_at?: string;                     // present when status is terminal
}
```

The kernel populates this object **only from cross-plane refs** — no business data is duplicated into `PreviewOutput` beyond what is needed to render the trace view. Operators following any `lease_ids[i]` reach the LinkSkills run ledger; following `audit_event_ids[i]` reaches LiNKbrain.

---

## 10. End-to-end stage trace (WebsiteFactory `lead_to_preview`)

| # | Stage | Plane | Side effect? | Leases | Workflows | Audit events emitted |
|---|-------|-------|--------------|--------|-----------|----------------------|
| 1 | `lead_intake` | linkaios | No | — | — | `run.started`, `stage.started`, `stage.completed` |
| 2 | `lead_evaluation` | linkbot | No (reasoning) | — | — | `stage.started`, `stage.completed` |
| 3 | `template_selection` | linkbot | No | — | — | `stage.started`, `stage.completed` |
| 4 | `copy_generation` | linkbot | No | — | — | `stage.started`, `stage.completed` |
| 5 | `media_placement` | linkbot | No | — | — | `stage.started`, `stage.completed` |
| 6 | `look_and_feel` | linkautowork | No (deterministic) | — | `autowork.websitefactory.render` | `stage.started`, `workflow.invoked`, `workflow.completed`, `stage.completed` |
| 7 | `crm_upsert` | linkskills | Yes (stub backend) | `crm.upsert` | — | `stage.started`, `lease.requested`, `lease.granted`, `lease.executed`, `crm.upserted`, `stage.completed` |
| 8 | `plane_project_create` | linkskills | Yes (stub backend) | `plane.project.create`, `plane.task.create` | — | `stage.started`, 2× `lease.executed`, `plane.project.created`, `plane.task.created`, `stage.completed` |
| 9 | `preview_publish` | linkskills + linkautowork | Yes (static/local stub) | `preview.publish` | `autowork.websitefactory.preview_serve` | `stage.started`, `lease.executed`, `workflow.invoked`, `workflow.completed`, `preview.published`, `stage.completed` |
| 10 | `record_run` | linkbrain | No (persist) | — | — | closure persistence for prior `run.completed` / `run.failed` / `run.cancelled` refs |

---

## 11. Stub behaviors (MVO-acceptable)

Stubs MUST still produce the lease + audit + memory + trace artifacts. Per `.cursor/rules/04-mvo-scope-and-stubbing.mdc`, a stub that skips audit/lease/memory/trace is **unacceptable**.

### 11.1 STUB — CRM local (INT-020)

```text
STUB: CRM local backend
- Behavior:
  - Postgres tables mvo_crm_contacts(id, tenant_id, business_name, email_hash, phone_hash, created_at, updated_at)
    and mvo_crm_records(id, tenant_id, lead_id, contact_id, industry, payload_jsonb, created_at, updated_at).
  - email_hash / phone_hash are sha256 with tenant-scoped salt (no plaintext PII at rest in stub).
  - LinkSkills capability "crm.upsert" wraps this backend. Lease lifecycle (request → grant → execute)
    runs as in §6.2. On execute, exactly one mvo_crm_records row is upserted per (tenant_id, lead_id);
    crm.upserted audit event is emitted.
- Limitation:
  - No outbound HTTP to Chatwoot/Odoo.
  - No webhook ingestion.
  - No multi-record CRM features (notes thread, activity timeline) beyond payload_jsonb.
- Owner: integration-agent (backend), linkskills-agent (lease).
- Acceptance criteria:
  - One mvo_crm_records row per successful run.
  - lease_id and audit_event_id surfaced in PreviewOutput.
  - Idempotency: re-running the same run does not create a second row.
- Related: DECISIONS.md D-01, INTEGRATION_QUEUE.md INT-020, deferred INT-030.
```

### 11.2 STUB — Plane local (INT-021)

```text
STUB: Plane project/task local backend
- Behavior:
  - Postgres tables mvo_projects(id, tenant_id, lead_id, name, owner_actor_id, created_at)
    and mvo_tasks(id, project_id, title, title_normalized, description, assignee_actor_id, status, created_at).
  - Unique index (project_id, title_normalized) enforces task idempotency.
  - Capabilities "plane.project.create" and "plane.task.create" wrap inserts; each emits lease.executed
    + plane.project.created / plane.task.created audit events.
- Limitation:
  - No outbound HTTP to Plane API.
  - No cycle/sprint/state-machine modeling beyond status enum {open, done}.
  - No multi-assignee or sub-task semantics.
- Owner: integration-agent (backend), linkskills-agent (leases).
- Acceptance criteria:
  - One mvo_projects row + ≥1 mvo_tasks row per successful run.
  - PreviewOutput.project_id and PreviewOutput.task_id populated.
  - Idempotent re-run: no duplicate project or task rows.
- Related: DECISIONS.md D-02, INTEGRATION_QUEUE.md INT-021, deferred INT-031.
```

### 11.3 STUB — Static/local preview publishing (INT-022)

```text
STUB: Static/local preview publishing
- Behavior:
  - LiNKautowork workflow autowork.websitefactory.render takes RenderSpec and produces a rendered bundle
    (HTML/CSS/JS) for LiNKsites/apps/web-master with tenant copy + media plan applied. Bundle is stored
    under a preview_artifact_ref (object storage handle or local volume for MVO).
  - LiNKautowork workflow autowork.websitefactory.preview_serve registers the bundle behind a route
    served by apps/linkaios-web at preview_route_prefix/<tenant>/<run_id>.
  - Capability preview.publish gates the publish step; lease lifecycle runs per §6.2 with approval gate.
  - Audit event preview.published carries subject.preview_url, subject.preview_artifact_ref, run_id.
- Limitation:
  - No DigitalOcean-hosted preview publish, no DNS, no TLS issuance (route is on the existing apps/linkaios-web host).
  - No Payload CMS publish path.
  - No CDN/cache invalidation; previews are best-effort and may be garbage-collected after a TTL
    (default 14 days for MVO; not contractually guaranteed).
- Owner: linkaios-agent (route + serve), linkautowork-agent (render workflow), linkskills-agent (lease).
- Acceptance criteria:
  - A successful run produces a reachable preview_url that renders the generated copy + media plan.
  - lease.executed and preview.published audit events emitted before stage.completed.
  - PreviewOutput.preview_url and preview_artifact_ref populated.
- Related: DECISIONS.md D-03, INTEGRATION_QUEUE.md INT-022, deferred INT-033.
```

---

## 12. Role-bleed rules (review-gate)

Reviewers MUST reject any implementation that violates the rules in this section. These are **non-negotiable** and bind verbatim to `ARCHITECTURE_RULES.md` and `.cursor/rules/01-ecosystem-boundaries.mdc`.

### 12.1 LiNKaios core (kernel) — MUST NOT

- Execute deterministic workflow steps (delegate to LiNKautowork).
- Hold long-term canonical memory or learning state (delegate to LiNKbrain).
- Decide capability/permission policy, hold secrets, or issue capability leases (delegate to LinkSkills).
- Run LLM reasoning sessions or persona state (delegate to LinkBot).
- Encode plugin-specific business logic (e.g. lead scoring, copy generation, template choice).
- Publish/serve preview sites except as a thin static route surfaced via the plugin's declared `preview_output_shape` (per D-03).

### 12.2 WebsiteFactory plugin — MUST NOT

- Implement kernel routing, approvals UX, or trace-view logic — only **declare** stages, panels, and config keys.
- Talk directly to a CRM, Plane, or hosting provider — go through `required_capabilities` / `required_workflow_hooks`.
- Maintain its own audit sink — emit only declared `required_audit_events` to LiNKbrain.
- Hold tenant secrets — config keys are stored by the kernel, secrets by LinkSkills.
- Mutate `Run` or `Stage` state — request transitions via kernel APIs only.
- Add capabilities, workflow handles, or audit event types not declared in its manifest at boot.

### 12.3 LinkBot — MUST NOT

- Hold canonical memory (writes go via `brain.audit.write`; long-term memory belongs to LiNKbrain).
- Hold or fetch capability leases on its own — the kernel obtains them and passes lease references when needed.
- Hold secrets (provider keys live in LinkSkills + env; LinkBot receives only the resolved `model_routing_profile`).
- Execute deterministic workflow steps (delegate to LiNKautowork).
- Receive PII fields outside `pii_policy="strip_contact"` for MVO.

### 12.4 LinkSkills — MUST and MUST NOT

LinkSkills owns the **capability catalog, permissions, and skills**: capability ids and their argument/result schemas; the set of skills a role/bot may invoke; the lease lifecycle (request → grant → execute); idempotency, kill switches, certification metadata, and the run ledger. Permissions and skills are both first-class — a role declaration in §1.0.3 binds to LinkSkills entries, and a capability plugin in §1.0.1 declares its `lease_requirements` against the same registry.

LinkSkills MUST NOT:

- Hold long-term memory or learning state (delegate to LiNKbrain).
- Execute deterministic workflows beyond capability backends (LiNKautowork executes the workflow body).
- Run LLM reasoning (delegate to LinkBot).
- Approve its own leases — approval routing belongs to the LiNKaios kernel approvals surface.
- Skip emitting `lease.executed` to LiNKbrain when the side effect occurred (even on partial failure).
- Allow a capability plugin to perform side effects in modes (`shadow`, `live`) the plugin manifest did not declare in `modes_supported`.

### 12.5 LiNKautowork — MUST NOT

- Make high-judgment decisions, lead-scoring, copy generation, or template selection (delegate to LinkBot).
- Issue or modify capability leases (delegate to LinkSkills).
- Write to LiNKbrain memory beyond its declared `workflow.*` audit events.
- Bypass the lease for side-effecting workflows; if a workflow performs a capability-gated action it MUST accept a `lease_id` in `WorkflowInvokeRequest` and reference it in audit.

### 12.6 LiNKbrain — MUST NOT

- Execute business actions (no outbound HTTP to CRM, Plane, hosting providers, etc.).
- Issue capability leases or hold secrets.
- Make routing or approval decisions.
- Mutate `Run` or `Stage` state.
- Accept audit events without a `tenant_id`, `plane`, `action`, and `subject` — events failing the envelope (§6.3) are rejected with `MANIFEST_AUDIT_EVENT_UNKNOWN` semantics.

### 12.7 Stop-and-ask review-gate (cross-cutting)

Reviewers MUST reject any change that invents target-software business configuration without explicit approval. Specifically:

- A capability plugin PR that adds Odoo charts of accounts, Payload content models, CRM stages, Plane workflows/states, Zulip stream structure, or any target-software internal schema is rejected unless the source-of-truth repo + commit are cited in the PR.
- A vertical-plugin PR that hardcodes a business workflow not present in `PLUGIN_ARCHITECTURE_V2.md`, `LINKSITES_VERTICAL_MVO_V2.md`, or an explicit approved work packet is rejected. The author MUST stop and ask before implementing.
- An agent that does not know the intended workflow for a vertical/capability combination MUST record the question in its agent report and not guess.

This rule binds to `.cursor/rules/01-ecosystem-boundaries.mdc` and `PLUGIN_ARCHITECTURE_V2.md` §"Stop-And-Ask Rule".

---

## 13. Implementation handoff

Contracts above are concrete enough that the following parallel packets can start without inventing shared interfaces. Recommended sequence (no shared mutable state across packets; see `.cursor/skills/parallel-agents/SKILL.md`):

- **WP-005** — `packages/linklogic-sdk` type pinning for §2 data dictionary, §4 Run/Stage, §5 FailureReport, §6 cross-plane envelopes, §7 capability args/results, §9 PreviewOutput. Owner: Architect.
- **WP-006** — LiNKbrain audit envelope migration + writer (D-08, §6.3). Owner: linkbrain-agent + database-architect.
- **WP-007** — LinkSkills lease lifecycle wiring on `LiNKskills/services/logic-engine` (§6.2, §7). Owner: linkskills-agent.
- **WP-008** — LiNKautowork workflow handles `autowork.websitefactory.render` and `autowork.websitefactory.preview_serve` on `LiNKautowork/gateway` (§6.4, §11.3). Owner: linkautowork-agent.
- **WP-009** — LinkBot reasoning dispatch wiring on `apps/bot-runtime` (§6.1). Owner: linkbot-agent.
- **WP-010** — LiNKaios kernel: tenant + plugin registry, work_request/run/stage orchestration, manifest loader, approvals surface (§1, §4). Owner: linkaios-agent.
- **WP-011** — WebsiteFactory plugin: declare manifest, implement stage handlers as dispatch glue only (§1.4, §12.2). Owner: linkaios-agent + linkbot-agent.
- **WP-012** — Stub backends INT-020/INT-021/INT-022 (§11). Owner: integration-agent + database-architect.
- **WP-013** — End-to-end demo + audit-event assertion harness against §8 and §10. Owner: qa-automation-engineer.

WP-005 and WP-006 should land first; WP-007..WP-009 can proceed in parallel after WP-005; WP-010..WP-012 in parallel after WP-006 and WP-007; WP-013 last.
