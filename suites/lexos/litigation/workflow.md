# LEXOS Litigation — canonical workflow map (`lexos_litigation`)

**Module:** `modules/lexos/litigation`  
**Sources:** `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`, `LEXOS_VERTICAL_DISCOVERY.md`, `modules/lexos/litigation/manifest.yaml`  
**External repo:** `/Users/linktrend/Projects/LiNKtrend-LEXOS`

Spine aligned to **`modules/lexos/litigation/manifest.yaml`** (declared stages). The LEXOS conversion plan and external repo describe additional UX slices (for example opposing-party reconciliation and visual exhibits); those are **not** separate `stage_id` rows in the manifest yet — see §Gap notes below.

Domain schemas and UI routes remain **discovery-backed** from LiNKtrend-LEXOS; this map does not invent court rules, filings, or internal legal schemas.

---

## Stage spine (manifest `stages[]` — authoritative)

| Stage | Stage ID | Workflow focus | Responsible plane (manifest) | Inputs | Outputs | Gates |
| --- | --- | --- | --- | --- | --- | --- |
| W0 | `lexos.w0.intake` | Client onboarding, conflicts, KYC | linkbot | `intake_form`, `conflict_data`, `kyc_documents` | `intake_record`, `client_candidate`, `matter_candidate`, `conflict_status` | Human approval for acceptance (posture); mock CRM |
| W1 | `lexos.w1.client_master` | Client master record | linkbot | `client_record`, `promotion_requests` | `updated_client_record`, `client_master_story` | Promotion rules satisfied |
| W2 | `lexos.w2.case_story` | Case narrative + assertions | linkbot | `client_narrative`, `matter_context` | `case_master_story`, `assertion_list`, `timeline_events`, `gaps`, `vulnerabilities` | Story completeness gate (operator) |
| W4 | `lexos.w4.evidence` | Evidence ingest + extraction pipeline | linkautowork | `uploaded_files`, `evidence_needs_register` | `evidence_objects`, `evidence_extractions`, `evidence_register`, `quality_flags` | **`autowork.lexos.evidence_ingest`**, **`autowork.lexos.extraction_run`** |
| W5 | `lexos.w5.support_matrix` | Assertions ↔ evidence mapping | linkbot | `assertion_list`, `evidence_register`, `extractions` | `support_matrix`, `supported_facts`, `unsupported_facts`, `contradictions`, `evidence_gaps` | **`autowork.lexos.assertion_sync`** where deterministic projection is required |
| W6 | `lexos.w6.strategy` | Strategy memo | linkbot | `support_matrix`, `supported_facts`, `matter_posture` | `strategy_memo`, `strategy_points`, `research_questions`, `risks` | — |
| W7 | `lexos.w7.research` | Legal research memo | linkbot | `research_questions`, `strategy_points`, `jurisdiction` | `research_memo`, `legal_authorities`, `adverse_authority`, `citation_confidence` | `cap.research.legal`, `cap.research.public_web` |
| W8 | `lexos.w8.argument` | Argument drafting | linkbot | `strategy_memo`, `research_memo`, `support_matrix` | `argument_draft`, `argument_nodes`, `evidence_links` | Truth/citation discipline |
| W9 | `lexos.w9.adversarial` | Adversarial critique | linkbot | `argument_draft`, `support_matrix`, `research_memo` | `adversarial_critique`, `attack_matrix`, `weakness_register`, `revision_checklist` | — |
| W11 | `lexos.w11.output` | Output refinement / bundle | linkbot | `argument_draft`, `adversarial_critique`, `resolved_issues` | `revised_output`, `final_bundle`, `caveat_preservation_check` | Final review gate |

---

## Gap notes (manifest vs conversion plan vs LEXOS repo UI)

- **`LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`** describes **W3** (opposing reconciliation) and **W10** (visual exhibits) as distinct workflow slices. They are **not** present as `stage_id` entries in `manifest.yaml` today; add them in a manifest + LiNKaios packet before routing depends on them.
- **`autowork.lexos.artifact_generate`** remains a required hook in the manifest for deterministic bundles/exhibits — wire it to W11 and/or a future W10 stage when the manifest is extended.
- LiNKtrend-LEXOS UI paths may still expose “risks”, “support”, or exhibit workspaces; treat those as **sub-panels** until promoted to kernel stages.

---

## LiNKbot roles

See `modules/lexos/litigation/manifest.yaml` `required_linkbot_roles` and `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §2 for narrative contracts (`lexos_intake_agent`, `lexos_custodian_agent`, `lexos_story_architect`, `lexos_evidence_archivist`, `lexos_analyst`, `lexos_strategist`, `lexos_librarian`, `lexos_advocate`, `lexos_adversary`, `lexos_rhetorician`).

---

## Capability connectors (representative)

Per conversion plan §3 (exact catalog rows in LinkSkills/WP-103):

- `cap.storage.supabase`, evidence storage surfaces
- `cap.extraction.ocr`, `cap.extraction.parser`
- `cap.research.legal`, `cap.research.public_web`
- `cap.llm.generation` (judgment packaging — governance via leases)
- `cap.asset.generation` / exhibit pipeline (W10)
- `cap.crm.mock` or tenant CRM connector for intake sync
- `cap.plane.mock` / `plane` tracking for matter tasks

---

## LiNKautowork handles

Per `modules/lexos/litigation/manifest.yaml` `required_workflow_hooks` and `LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §4:

| Handle | Stages | Purpose |
| --- | --- | --- |
| `autowork.lexos.evidence_ingest` | W4 | Store files, register evidence |
| `autowork.lexos.extraction_run` | W4 | OCR/parser/QA pipeline |
| `autowork.lexos.assertion_sync` | W5 | Deterministic support-matrix versioning |
| `autowork.lexos.artifact_generate` | W11 (and future exhibit stage when added) | Bundled outputs / exhibits |
| `autowork.lexos.crm_sync` | W0–W1 | Mock CRM sync |

---

## LiNKbrain — audit / memory events

Core lifecycle events per plan §5.1 plus LEXOS-specific §5.2 table (`intake.processed`, `story.created`, `evidence.ingested`, `support.mapped`, `argument.drafted`, `critique.completed`, `output.refined`, etc.).

Matter-scoped memory objects: clients, matters, stories, evidence, assertions, memos, drafts — **refs to LiNKtrend-LEXOS schemas**, not redefined here.

---

## Plane tasks (shape)

- Matter epic per `matter_id`
- Stage tasks for each manifest `stage_id`; blocking labels when adversarial review unresolved before W11
- Internal readiness tasks for extraction QA failures

---

## LiNKaios UI surfaces

From manifest `public_surfaces`: matter workspace panels (`lexos.matter_overview`, story/evidence/assertions/strategy/research/argument/adversarial/output), intake and client lists.

Routes mirror LiNKtrend-LEXOS matter workspace paths (`/matters/[matterId]/…`) during migration.

---

## Proof criteria

- Operator can navigate stages in LiNKaios with trace IDs; each side-effect stage shows lease + audit.
- Evidence path proves: ingest → extraction → support mapping with deterministic workflow IDs.
- No workflow stage implies production filing or unsupervised legal advice — human gates preserved.

---

## Explicit non-goals

- Inventing litigation procedures, court calendars, or jurisdictional rules not sourced from product/legal discovery.
- Moving LiNKtrend-LEXOS code into this repo — integration via connectors, manifests, and adapters only.
