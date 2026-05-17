# LEXOS Vertical Plugin Conversion Plan

**Work Packet:** WP-084  
**Target:** Convert LEXOS (LiNKtrend Legal Operating System) into a LiNKaios vertical plugin  
**Status:** Planning phase — no code movement yet  
**Source Repo:** `/Users/linktrend/Projects/LiNKtrend-LEXOS`  
**Base Architecture:** Plugin Architecture V2 (`PLUGIN_ARCHITECTURE_V2.md`)

---

## Executive Summary

LEXOS is a complete litigation vertical application with 180+ TypeScript files, 22 database migrations, and a sophisticated W0–W11 legal cognition workflow. This plan defines how LEXOS becomes a LiNKaios vertical plugin without moving code yet.

**Key Decision:** LEXOS will remain a **vertical plugin**, not a core platform concern. It declares what work needs to happen; LinkSkills grants permissions; LiNKautowork runs deterministic steps; LinkBots perform judgment work; LiNKbrain remembers; LiNKaios coordinates.

---

## 1. Vertical Plugin Declaration

### 1.1 Plugin Identity

| Field | Value |
|-------|-------|
| `plugin_id` | `lexos_litigation` |
| `plugin_kind` | `vertical` |
| `plugin_name` | LEXOS Litigation |
| `version` | `1.0.0-mvo` |
| `purpose` | Legal case management with evidence-based assertion tracking for litigation matters |
| `modes_supported` | `["development"]` — MVO starts with development mode only |

### 1.2 Work Request Types

The LEXOS vertical plugin accepts these work request types:

| Work Request Type | Description | MVP Priority |
|-------------------|-------------|--------------|
| `lexos.intake.new` | New client/matter intake (W0) | Medium |
| `lexos.matter.create` | Create matter for existing client | High |
| `lexos.story.develop` | Develop case story (W2) | High |
| `lexos.evidence.ingest` | Ingest and process evidence (W4) | High |
| `lexos.assertions.extract` | Extract assertions from story/evidence (W5) | High |
| `lexos.support.map` | Map evidence support to assertions (W5) | High |
| `lexos.strategy.develop` | Develop case strategy (W6) | Medium |
| `lexos.research.conduct` | Conduct legal research (W7) | Medium |
| `lexos.argument.draft` | Draft legal argument (W8) | Medium |
| `lexos.adversarial.review` | Perform adversarial critique (W9) | Medium |
| `lexos.output.generate` | Generate final output artifact (W11) | Medium |

### 1.3 Workflow Stages (W0–W11 Mapping)

Each LEXOS workflow stage maps to a responsible plane per `PLUGIN_ARCHITECTURE_V2.md`:

| Stage | Workflow | Responsible Plane | Side Effects? |
|-------|----------|-------------------|---------------|
| W0 | Client Onboarding | LinkBot (intake agent) + LiNKaios | Yes (stub CRM) |
| W1 | Client Master Record | LinkBot (custodian agent) | No (reasoning) |
| W2 | Case-Client Story | LinkBot (story architect) | No (reasoning) |
| W3 | Opposing File Reconciliation | LinkBot (defense agent) | No (reasoning) |
| W4 | Evidence Intake | LiNKautowork + LinkSkills | Yes (storage, extraction) |
| W5 | Support Matrix | LinkBot (analyst) + LiNKautowork | Yes (assertion updates) |
| W6 | Strategy | LinkBot (strategist) | No (reasoning) |
| W7 | Legal Research | LinkBot (librarian) | No (reasoning) |
| W8 | Argument Drafting | LinkBot (advocate) | No (reasoning) |
| W9 | Adversarial Review | LinkBot (adversary) | No (reasoning) |
| W10 | Visual Exhibits | LiNKautowork | Yes (asset generation) |
| W11 | Output Refinement | LinkBot (rhetorician) | No (reasoning) |

---

## 2. LinkBot Role Attachments

LEXOS requires these LinkBot roles, each with defined inputs, outputs, allowed capabilities, and audit events:

### 2.1 `lexos_intake_agent` (W0)

- **purpose:** Process new client/matter intake, conflict check, KYC/CDD
- **inputs:** `intake_form`, `conflict_data`, `kyc_documents`
- **outputs:** `intake_record`, `client_candidate`, `matter_candidate`, `conflict_status`
- **allowed_capabilities:** `cap.storage.supabase`, `cap.crm.mock`
- **allowed_skills:** `intake.process`, `conflict.check`, `kyc.screen`
- **audit_events:** `role.started`, `intake.processed`, `conflict.checked`, `role.completed`, `role.failed`
- **development_restrictions:** `human_approval_required_for_acceptance`, `mock_crm_only`

### 2.2 `lexos_custodian_agent` (W1)

- **purpose:** Maintain client master record, fact promotion
- **inputs:** `client_record`, `promotion_requests`, `matter_facts`
- **outputs:** `updated_client_record`, `client_master_story`, `promotion_decisions`
- **allowed_capabilities:** `cap.storage.supabase`
- **allowed_skills:** `memory.manage`, `fact.promote`, `kyc.refresh`
- **audit_events:** `role.started`, `memory.updated`, `promotion.processed`, `role.completed`

### 2.3 `lexos_story_architect` (W2)

- **purpose:** Create case master story from client narrative
- **inputs:** `client_narrative`, `matter_context`, `known_documents`
- **outputs:** `case_master_story`, `assertion_list`, `timeline_events`, `gaps`, `vulnerabilities`
- **allowed_capabilities:** `cap.storage.supabase`
- **allowed_skills:** `story.develop`, `assertion.extract`, `timeline.build`
- **audit_events:** `role.started`, `story.created`, `assertions.extracted`, `role.completed`

### 2.4 `lexos_evidence_archivist` (W4)

- **purpose:** Ingest, process, catalog evidence with extraction
- **inputs:** `uploaded_files`, `evidence_needs_register`, `matter_context`
- **outputs:** `evidence_objects`, `evidence_extractions`, `evidence_register`, `quality_flags`
- **allowed_capabilities:** `cap.storage.supabase`, `cap.extraction.ocr`, `cap.extraction.parser`
- **allowed_skills:** `evidence.ingest`, `extraction.run`, `qa.validate`
- **audit_events:** `role.started`, `evidence.ingested`, `extraction.completed`, `qa.completed`, `role.completed`

### 2.5 `lexos_analyst` (W5)

- **purpose:** Map assertions to evidence, build support matrix
- **inputs:** `assertion_list`, `evidence_register`, `extractions`, `case_story`
- **outputs:** `support_matrix`, `supported_facts`, `unsupported_facts`, `contradictions`, `evidence_gaps`
- **allowed_capabilities:** `cap.storage.supabase`
- **allowed_skills:** `support.map`, `contradiction.detect`, `gap.identify`
- **audit_events:** `role.started`, `support.mapped`, `contradictions.found`, `role.completed`

### 2.6 `lexos_strategist` (W6)

- **purpose:** Develop case strategy from supported facts
- **inputs:** `support_matrix`, `supported_facts`, `matter_posture`, `jurisdiction`
- **outputs:** `strategy_memo`, `strategy_points`, `research_questions`, `risks`
- **allowed_capabilities:** `cap.storage.supabase`, `cap.research.legal`
- **allowed_skills:** `strategy.develop`, `risk.assess`, `research.plan`
- **audit_events:** `role.started`, `strategy.developed`, `risks.identified`, `role.completed`

### 2.7 `lexos_librarian` (W7)

- **purpose:** Conduct legal research, verify citations
- **inputs:** `research_questions`, `strategy_points`, `jurisdiction`
- **outputs:** `research_memo`, `legal_authorities`, `adverse_authority`, `citation_confidence`
- **allowed_capabilities:** `cap.research.legal`, `cap.research.public_web`
- **allowed_skills:** `research.conduct`, `citation.verify`, `authority.extract`
- **audit_events:** `role.started`, `research.performed`, `citations.verified`, `role.completed`

### 2.8 `lexos_advocate` (W8)

- **purpose:** Draft legal arguments from strategy and research
- **inputs:** `strategy_memo`, `research_memo`, `support_matrix`, `legal_authorities`
- **outputs:** `argument_draft`, `argument_nodes`, `evidence_links`, `unsupported_claims`
- **allowed_capabilities:** `cap.storage.supabase`, `cap.llm.generation`
- **allowed_skills:** `argument.draft`, `citation.insert`, `node.build`
- **audit_events:** `role.started`, `argument.drafted`, `claims.linked`, `role.completed`

### 2.9 `lexos_adversary` (W9)

- **purpose:** Perform adversarial stress-test on argument draft
- **inputs:** `argument_draft`, `support_matrix`, `research_memo`, `risks`
- **outputs:** `adversarial_critique`, `attack_matrix`, `weakness_register`, `revision_checklist`
- **allowed_capabilities:** `cap.storage.supabase`, `cap.research.legal`
- **allowed_skills:** `critique.perform`, `weakness.identify`, `severity.score`
- **audit_events:** `role.started`, `critique.completed`, `weaknesses.found`, `role.completed`

### 2.10 `lexos_rhetorician` (W11)

- **purpose:** Refine output for persuasion while preserving truth discipline
- **inputs:** `argument_draft`, `adversarial_critique`, `resolved_issues`, `visual_artifacts`
- **outputs:** `revised_output`, `final_bundle`, `caveat_preservation_check`
- **allowed_capabilities:** `cap.storage.supabase`, `cap.llm.generation`
- **allowed_skills:** `refine.perform`, `caveat.check`, `bundle.prepare`
- **audit_events:** `role.started`, `output.refined`, `caveats.preserved`, `role.completed`

---

## 3. Required Capability Plugins

LEXOS requires these capability plugins to be available in the LinkSkills catalog:

### 3.1 Core Storage

| Capability | Target Software | Operations | Mode |
|------------|-----------------|------------|------|
| `cap.storage.supabase` | Supabase | `file.upload`, `file.download`, `query.execute`, `row.upsert` | `development` |
| `cap.storage.evidence` | Supabase Storage | `evidence.store`, `original.preserve`, `derivative.store` | `development` |

### 3.2 Document Processing

| Capability | Target Software | Operations | Mode |
|------------|-----------------|------------|------|
| `cap.extraction.parser` | LlamaParse/Layout Parser | `document.parse`, `markdown.extract`, `json.extract` | `development` |
| `cap.extraction.ocr` | OCR Engine | `text.extract`, `confidence.score` | `development` |
| `cap.extraction.qa` | QA Comparator | `extraction.compare`, `quality.assess`, `flag.generate` | `development` |

### 3.3 Research & Generation

| Capability | Target Software | Operations | Mode |
|------------|-----------------|------------|------|
| `cap.research.legal` | Legal Research APIs | `authority.search`, `citation.verify`, `jurisdiction.check` | `shadow` |
| `cap.research.public_web` | Web Research | `search.query`, `page.fetch`, `citation.extract` | `development` |
| `cap.llm.generation` | LLM Providers | `text.generate`, `structured.generate`, `embeddings.create` | `development` |

### 3.4 CRM/Project (Stub for MVO)

| Capability | Target Software | Operations | Mode |
|------------|-----------------|------------|------|
| `cap.crm.mock` | Local Postgres | `lead.read_mock`, `lead.status.update` | `mock` |
| `cap.plane.mock` | Local Postgres | `project.ensure_mock`, `task.ensure_mock` | `mock` |

---

## 4. Required LiNKautowork Workflow Hooks

LEXOS requires these deterministic workflow handles:

| Workflow Handle | Purpose | Deterministic Outputs |
|---------------|---------|----------------------|
| `autowork.lexos.evidence_ingest` | Ingest evidence files, trigger extraction | `evidence_id`, `extraction_id`, `processing_status` |
| `autowork.lexos.extraction_run` | Run extraction pipeline (OCR, parser, QA) | `extraction_complete`, `quality_flags`, `markdown_output`, `json_output` |
| `autowork.lexos.assertion_sync` | Sync assertion support states | `assertion_updates`, `support_matrix_version` |
| `autowork.lexos.artifact_generate` | Generate output artifacts | `artifact_ref`, `artifact_version` |
| `autowork.lexos.crm_sync` | Sync client/matter to mock CRM | `crm_record_id`, `sync_status` |

---

## 5. Required LiNKbrain Audit/Memory Events

LEXOS requires these audit event types per workflow stage:

### 5.1 Core Events (All Stages)

- `run.started`, `run.completed`, `run.failed`, `run.cancelled`
- `stage.started`, `stage.completed`, `stage.failed`, `stage.awaiting_approval`
- `lease.requested`, `lease.granted`, `lease.executed`, `lease.denied`
- `workflow.invoked`, `workflow.completed`, `workflow.failed`

### 5.2 LEXOS-Specific Events

| Event | Stage | Description |
|-------|-------|-------------|
| `intake.processed` | W0 | Intake record created |
| `conflict.checked` | W0 | Conflict check completed |
| `client.accepted` | W0 | Client promoted to W1 |
| `story.created` | W2 | Case master story created |
| `assertions.extracted` | W2 | Assertions extracted from story |
| `evidence.ingested` | W4 | Evidence uploaded and stored |
| `extraction.completed` | W4 | Extraction pipeline finished |
| `support.mapped` | W5 | Evidence-to-assertion mapping complete |
| `contradictions.found` | W5 | Contradictions identified |
| `strategy.developed` | W6 | Strategy memo created |
| `research.performed` | W7 | Research memo created |
| `argument.drafted` | W8 | Argument draft created |
| `critique.completed` | W9 | Adversarial critique created |
| `output.refined` | W11 | Final output artifact created |

---

## 6. Data Objects Owned by LEXOS Vertical Plugin

Per `PLUGIN_ARCHITECTURE_V2.md`, these data objects are owned by the LEXOS vertical plugin:

### 6.1 Core Identity Objects

| Object | Description | Source Schema |
|--------|-------------|---------------|
| `clients` | Client master records | `LiNKtrend-LEXOS/supabase/migrations/` |
| `client_facts` | Client-level facts | `LiNKtrend-LEXOS/supabase/migrations/` |
| `matters` | Matter records | `LiNKtrend-LEXOS/supabase/migrations/` |
| `intake_records` | Intake workflow state | `LiNKtrend-LEXOS/supabase/migrations/` |

### 6.2 Evidence & Assertion Objects

| Object | Description | Source Schema |
|--------|-------------|---------------|
| `evidence` | Evidence objects | `LiNKtrend-LEXOS/supabase/migrations/` |
| `evidence_extractions` | OCR/text extraction results | `LiNKtrend-LEXOS/supabase/migrations/` |
| `assertions` | Core epistemic units | `LiNKtrend-LEXOS/supabase/migrations/` |
| `support_matrix_items` | Evidence-to-assertion mapping | `LiNKtrend-LEXOS/supabase/migrations/` |

### 6.3 Workflow Artifacts

| Object | Description | Source Schema |
|--------|-------------|---------------|
| `case_stories` | Matter narratives | `LiNKtrend-LEXOS/supabase/migrations/` |
| `strategy_memos` | Strategy documents | `LiNKtrend-LEXOS/supabase/migrations/` |
| `research_memos` | Legal research outputs | `LiNKtrend-LEXOS/supabase/migrations/` |
| `argument_drafts` | Legal argument drafts | `LiNKtrend-LEXOS/supabase/migrations/` |
| `adversarial_critiques` | Attack matrix, severity analysis | `LiNKtrend-LEXOS/supabase/migrations/` |
| `output_artifacts` | Final deliverables | `LiNKtrend-LEXOS/supabase/migrations/` |

---

## 7. LiNKaios UI Panels

LEXOS requires these UI panels in the LiNKaios interface:

### 7.1 Matter Workspace Panels

| Panel | Route | Purpose |
|-------|-------|---------|
| `lexos_matter_overview` | `/matters/[matterId]/overview` | Matter dashboard, status |
| `lexos_story_workspace` | `/matters/[matterId]/story` | W2 Case story editing |
| `lexos_evidence_workspace` | `/matters/[matterId]/evidence` | W4 Evidence upload, browse |
| `lexos_assertions_workspace` | `/matters/[matterId]/assertions` | W5 Assertions, support matrix |
| `lexos_strategy_workspace` | `/matters/[matterId]/strategy` | W6 Strategy memo editing |
| `lexos_research_workspace` | `/matters/[matterId]/research` | W7 Research memo editing |
| `lexos_argument_workspace` | `/matters/[matterId]/argument` | W8 Argument draft editing |
| `lexos_adversarial_workspace` | `/matters/[matterId]/adversarial` | W10 Adversarial critique |
| `lexos_output_workspace` | `/matters/[matterId]/output` | W11 Output artifacts |

### 7.2 Intake & Client Panels

| Panel | Route | Purpose |
|-------|-------|---------|
| `lexos_intake_list` | `/intake` | Intake records list |
| `lexos_intake_workspace` | `/intake/[intakeId]` | W0 Intake detail workspace |
| `lexos_clients_list` | `/clients` | Client list |
| `lexos_client_detail` | `/clients/[clientId]` | Client detail view |

---

## 8. Mode Behavior Definition

### 8.1 Development Mode (MVO Default)

- Local Supabase for data storage
- Mock CRM (local Postgres tables)
- Mock Plane (local Postgres tables)
- Local file storage for evidence
- Parser/OCR runs locally or via configurable provider
- LLM calls through configured provider with audit logging
- No real external legal research APIs (shadow mode only)
- No court filing submissions

### 8.2 Shadow Mode (Future)

- Validates real external connectivity without production writes
- Read-only probes to legal research APIs
- CRM/Plane readiness checks
- Evidence extraction provider readiness

### 8.3 Live Mode (Explicitly Excluded from MVO)

- Real court filing submissions
- Real CRM (Odoo/Chatwoot) writes
- Real Plane project/task creation
- Production legal research API writes
- External evidence service production writes

---

## 9. Explicit Non-Goals

The following are explicitly out of scope for the LEXOS vertical plugin MVO:

1. **Multi-jurisdiction support** — MVO targets single jurisdiction
2. **Real court filing integration** — MVO is pre-filing only
3. **Certified transcription/translation** — Machine outputs only with flags
4. **Forensic chain-of-custody automation** — Manual evidence handling
5. **Production email/calendar integration** — Manual scheduling only
6. **Billing/time tracking** — Accounting vertical responsibility
7. **Document comparison/diff** — Deferred to target state
8. **Advanced visual exhibit production** — W10 may be deferred
9. **Real-time collaboration** — Single-user MVO
10. **Mobile-native apps** — Web-only MVO

---

## 10. Files Inspected from LEXOS Repo

Evidence for this plan comes from inspection of:

| Category | Files/Paths | Lines/Count |
|----------|-------------|-------------|
| Database migrations | `supabase/migrations/*.sql` | 22 migration files |
| Type definitions | `src/types/database.ts` | 2,718 lines |
| Server mutations | `src/server/*/mutations.ts` | 17 modules |
| Server queries | `src/server/*/queries.ts` | 17 modules |
| UI features | `src/features/*/` | 12 workspaces |
| App routes | `src/app/matters/[matterId]/*` | 12 routes |
| Workflow spec | `docs/lexos-system-spec/05 *.md` | ~3,800 lines |

---

## 11. Architecture Boundaries

### 11.1 What LEXOS Vertical Plugin DOES NOT Own

Per `01-ecosystem-boundaries.mdc`:

- ❌ Tenant registry, plugin entitlements (LiNKaios owns)
- ❌ Capability catalog, lease issuance (LinkSkills owns)
- ❌ Event ledger, audit storage (LiNKbrain owns)
- ❌ Deterministic workflow execution (LiNKautowork owns)
- ❌ Bot runtime, model routing (LinkBot runtime owns)
- ❌ Secrets, credential storage (LinkSkills owns)

### 11.2 What LEXOS Vertical Plugin DOES Own

- ✅ Litigation-specific work request types
- ✅ W0–W11 workflow stage definitions
- ✅ Legal-domain data objects (clients, matters, evidence, assertions)
- ✅ Role attachments for legal-domain LinkBots
- ✅ UI panels for legal workspaces
- ✅ Required capability plugin declarations
- ✅ Required audit event type declarations

---

## 12. User Decisions Required Before Implementation

The following decisions require user input before implementation proceeds:

### 12.1 Legal Workflow Decisions

| Question | Impact | Recommended Default |
|----------|--------|---------------------|
| Which jurisdiction for MVO? | W7 research sources, W8 citation format | Single jurisdiction (to be specified) |
| Plaintiff-side or defense-side priority? | Whether W3 is required | Plaintiff-side (simpler) |
| Is W10 (visual exhibits) in MVO? | W10 workspace, asset generation capability | Deferred |
| Privilege model details? | Evidence access control, RLS policies | Attorney-client privilege only |

### 12.2 Technical Decisions

| Question | Impact | Recommended Default |
|----------|--------|---------------------|
| Evidence storage provider? | `cap.storage.evidence` backend | Supabase Storage (local) |
| Extraction provider? | `cap.extraction.parser` backend | LlamaParse or local equivalent |
| LLM provider for legal drafting? | `cap.llm.generation` backend | Configurable via LinkSkills |
| Legal research API? | `cap.research.legal` backend | Shadow mode only for MVO |

---

## 13. Follow-Up Work Packets

The following work packets are required for safe migration/adaptation:

### 13.1 Schema Migration Packets

| Packet | Objective | Priority |
|--------|-----------|----------|
| WP-094 | Copy/adapt LEXOS core schema (clients, matters, evidence, assertions) to LiNKaios plugin schema | High |
| WP-095 | Copy/adapt workflow state tables (intake_records, workflow_states, risks) | High |
| WP-096 | Copy/adapt artifact tables (case_stories, memos, drafts, critiques, outputs) | Medium |

### 13.2 Type Definition Packets

| Packet | Objective | Priority |
|--------|-----------|----------|
| WP-097 | Generate TypeScript types from adapted schema | High |
| WP-098 | Define LEXOS-specific work request/response types | High |

### 13.3 Server Logic Packets

| Packet | Objective | Priority |
|--------|-----------|----------|
| WP-099 | Adapt server mutation patterns (W0–W11) to LiNKaios plugin | Medium |
| WP-100 | Adapt server query patterns to LiNKaios plugin | Medium |

### 13.4 UI Component Packets

| Packet | Objective | Priority |
|--------|-----------|----------|
| WP-101 | Adapt layout components (AppShell, Breadcrumbs, MatterSubnav) | Medium |
| WP-102 | Adapt feature workspaces (evidence, assertions, support matrix) | Low |

### 13.5 Integration Packets

| Packet | Objective | Priority |
|--------|-----------|----------|
| WP-103 | Create LEXOS capability plugin manifests | Medium |
| WP-104 | Create LEXOS LinkBot role contracts | Medium |
| WP-105 | Create LEXOS LiNKautowork workflow hooks | Medium |

---

## 14. Migration Strategy

### 14.1 Phase 1: Schema Foundation (WP-094, WP-095, WP-096)

1. Copy LEXOS migrations to LiNKaios plugin schema location
2. Adapt table names for plugin namespace (`lexos_*` prefix)
3. Add tenant_id columns for multi-tenancy
4. Generate TypeScript types
5. Run migrations in development Supabase

### 14.2 Phase 2: Server Logic (WP-099, WP-100)

1. Adapt mutation patterns to use LinkSkills leases
2. Adapt query patterns to respect tenant isolation
3. Add audit event emissions
4. Stub capability backends (mock mode)

### 14.3 Phase 3: UI Components (WP-101, WP-102)

1. Adapt layout components for LiNKaios shell
2. Create plugin-specific route handlers
3. Integrate with LiNKaios trace/status views

### 14.4 Phase 4: Integration (WP-103, WP-104, WP-105)

1. Declare capability plugins
2. Declare LinkBot roles
3. Declare LiNKautowork workflow hooks
4. End-to-end test with mock data

---

## 15. Risk and Blocker Register

| ID | Risk/Blocker | Mitigation | Status |
|----|--------------|------------|--------|
| R01 | User decision needed on jurisdiction | Document in DECISIONS.md | Open |
| R02 | User decision needed on extraction provider | Default to LlamaParse equivalent | Open |
| R03 | Legal research API access | Shadow mode only for MVO | Mitigated |
| R04 | Multi-tenancy schema changes | Add tenant_id to all tables | Planned |
| R05 | Role bleed with LinkSkills | Strict adherence to boundaries | Mitigated |

---

## 16. Acceptance Criteria for This Plan

This plan is complete when:

- [x] Defines LEXOS as a vertical plugin, not core-platform concern
- [x] Maps W0–W11 workflows to candidate LinkBot roles
- [x] Maps W0–W11 to LiNKautowork deterministic steps
- [x] Identifies LinkSkills capability needs
- [x] Identifies LiNKbrain audit/memory needs
- [x] Lists user decisions needed before implementation
- [x] Creates follow-up packet structure for migration
- [x] Documents architecture boundaries
- [x] Lists files inspected as evidence

---

## 17. Proof Summary

| Item | Evidence |
|------|----------|
| Files inspected | 22 migrations, 2,718 lines of types, 17 server modules, 12 UI workspaces |
| Workflow mapping | W0–W11 mapped to LinkBot roles and planes |
| Schema inventory | 12 core tables, 9 artifact tables, 5 cross-cutting tables |
| Architecture compliance | Boundaries verified against `PLUGIN_ARCHITECTURE_V2.md` |

---

*Plan complete. Ready for Integrator review and follow-up packet assignment.*
