# LinkSites LiNKbot Roles

Module-specific LiNKbot roles for the LinkSites / WebsiteFactory module.

## Roles

### `lead_scout_bot` (Declared, Disabled in MVO)

**Purpose:** Future lead discovery and first-pass qualification for CRM intake.

**Status:** Disabled in MVO. Mock CRM data supplies its output.

**Development Restrictions:**
- `disabled_in_mvo`
- `mock_input_only`
- `no_live_acquisition`
- `no_public_scraping`

### `research_enrichment_bot`

**Purpose:** Research the lead and comparable businesses; produce a provenance-backed enrichment bundle for downstream website generation.

**Inputs:** `lead_record_ref`, `lead_input` business facts, optional prior research refs.

**Outputs:** `lead_research_bundle` (facts + comparable set + provenance citations)

**Allowed Capabilities:**
- `cap.research.public_web` (read)
- `cap.zulip.run_messaging` (run/operator notifications only)
- `cap.plane.execution_tracking` (mock/shadow only)

**Allowed Skills:** LinkSkills-governed research/retrieval skills only.

**Audit Events:** `role.started`, `role.completed`, `research.performed`, `provenance.recorded`, `role.failed`

**Development Restrictions:**
- `research_read_only`
- `provenance_required`
- `no_direct_crm_write`
- `no_direct_payload_or_supabase_write`

### `website_builder_bot`

**Purpose:** Use discovered `LiNKsites` template(s) as guidance and produce business-specific website package content.

**Inputs:** `lead_record_ref`, `lead_research_bundle`, discovered `template_id`

**Outputs:** `website_package` including business-specific copy bundle, media plan, style proposal

**Allowed Capabilities:**
- `cap.asset.generation` (generate)
- `cap.research.public_web` (read)
- `cap.zulip.run_messaging` (status only)

**Allowed Skills:** LinkSkills-governed content-generation, style-planning, and packaging skills.

**Audit Events:** `role.started`, `role.completed`, `template.guidance.selected`, `website.package.generated`, `provenance.recorded`, `role.failed`

**Development Restrictions:**
- `template_guidance_not_clone`
- `local_artifact_target_only`
- `no_direct_publish`
- `no_target_schema_invention`

### `outreach_bot` (Declared, Disabled in MVO)

**Purpose:** Future outreach drafting/sending role for post-MVO phases.

**Status:** Disabled in MVO. No outreach draft or send for v2.

**Development Restrictions:**
- `disabled_in_mvo`
- `no_outreach_draft`
- `no_outreach_send`
- `no_external_contact`

## Source of Truth

The canonical role definitions live in:
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts` (REQUIRED_LINKBOT_ROLES)
- Contract reference: `LiNKdev/product/grounding/CONTRACTS_MVO.md` §0.A.4

## Runtime Execution

Roles are executed through:
1. `LiNKaios` kernel dispatch
2. `LiNKbot/runtime-adapters/openclaw/bot-runtime` reasoning dispatch
3. Audit events emitted to `LiNKbrain`
4. Capability leases gated by `LinkSkills`
