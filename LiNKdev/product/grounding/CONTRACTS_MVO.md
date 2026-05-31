# MVO contracts — LinkSites flow and capability boundaries

**Status:** Principal MVO reset — May 2026  
**Binds to:** [`PRINCIPAL_PRODUCT_DEFINITION.md`](PRINCIPAL_PRODUCT_DEFINITION.md), [`ARCHITECTURE_RULES.md`](ARCHITECTURE_RULES.md), `suites/linksites/workflow.md`  
**Historical detail:** pre-reset plugin contract text is in git history and `LiNKdev/product/archive/grounding-legacy/` (see archive README)

Typed schemas pin in `packages/linklogic-sdk`. Field names below are canonical for cross-plane messages.

---

## 1. Scope

This document defines **cross-service contracts** for:

- LiNKaios kernel ↔ Suite integration (LinkSites)
- Plane boundaries for side effects
- Required **Capabilities** for MVO
- Minimum audit and lease proof

**Out of repo:** LinkSites product implementation (Payload collections, Next.js frontend, VPS deploy scripts) — source of truth is **`/Users/linktrend/Projects/LiNKsites`**. Discover and adapt schemas; do not invent.

---

## 2. LinkSites business flow (MVO)

One **Project** / **Run** processes **one lead** through:

| Phase | Stage (summary) | Primary plane | Side effects |
|-------|-----------------|---------------|--------------|
| Lead generation | Discover lead (e.g. Maps/search), qualify industry | LiNKbot + Capabilities | Research read; CRM lead create |
| Template & build | Select template, generate copy/media/style | LiNKbot | Asset generation (leased) |
| Publish | Mirror → Payload → frontend URL | LiNKautowork + Capabilities | Supabase mirror, Payload sync, VPS route |
| Outreach | Contact lead to sell site + hosting | LiNKbot + Capabilities | Messaging (Zulip threads; outreach channel leased) |
| Close / recycle | Subscribe + domain transfer OR store for reuse | LiNKautowork + Capabilities | CRM status, domain ops (future), repo archive |

**MVO bar:** stages through **publish + outreach** complete for one lead with full trace.

Canonical stage IDs and handles: `suites/linksites/workflow.md` (update that file when stage names change).

---

## 3. LiNKbot roles (LinkSites)

| Role ID | Purpose | MVO |
|---------|---------|-----|
| `lead_scout_bot` | Discover leads, create CRM records | Active — governed search/acquisition |
| `research_enrichment_bot` | Research lead + comparables with provenance | Active |
| `website_builder_bot` | Template-guided package from LiNKsites registry | Active |
| `outreach_bot` | Sell ready-made site to lead | Active — governed outreach (not skipped) |

Role contracts declare: inputs, outputs, allowed Capabilities, allowed skills, audit events, explicit non-ownership (no direct memory/lease/secrets).

---

## 4. Required Capabilities (MVO)

Studio defaults (all tenants):

| Capability ID | Software | MVO posture |
|---------------|----------|-------------|
| `cap.zulip.run_messaging` | Zulip | Governed project streams/topics |
| `cap.plane.execution_tracking` | Plane (self-hosted) | Studio GSM secrets; bootstrap project/modules/issues |

LinkSites Suite (in addition):

| Capability ID | Software | MVO posture |
|---------------|----------|-------------|
| `cap.crm.odoo_shadow` | CRM / Odoo | Lead read/write, status for outreach gate |
| `cap.supabase.mirror_content` | Supabase | Structured site content mirror |
| `cap.payload.local_sync` | Payload CMS (LiNKsites) | Content upsert + preview publish |
| `cap.research.public_web` | Web research providers | Read-only + provenance |
| `cap.asset.generation` | Media providers | Images/video with audit |

Each connector declares: operations, modes (`mock` \| `shadow` \| `live`), lease requirements, idempotency key shape, audit events, allowed callers, failure mapping, and **`not_configured`** (what it does not set up inside target software).

Connector manifests: `LiNKskills/capability-connectors/`.

---

## 5. LiNKautowork workflow handles (LinkSites)

| Handle | Purpose | Lease required |
|--------|---------|----------------|
| `autowork.linksites.artifact_write_local` | Write generated package to artifact store | No |
| `autowork.linksites.supabase_mirror_upsert` | Upsert mirror rows | Yes |
| `autowork.linksites.payload_sync_local` | Sync mirror → Payload | Yes |
| `autowork.linksites.preview_readiness_check` | Deterministic QA gates | No |
| `autowork.linksites.crm_ready_to_contact_mark` | CRM status after checks | Yes |
| `autowork.linksites.outreach_dispatch` | Governed outreach step | Yes |

Idempotency key: `${run_id}:${stage_id}:${workflow_handle}`. Side-effecting handles fail closed without valid `lease_id`.

---

## 6. Cross-plane envelopes (summary)

### 6.1 LiNKaios ↔ LiNKbot

- Request: `tenant_id`, `run_id`, `stage_id`, `reasoning_kind`, typed inputs, `model_routing_profile`, `pii_policy`
- Response: typed outputs, `model_run_id`, token counts, optional `FailureReport`
- Bot MUST NOT write memory, issue leases, or run workflows directly

### 6.2 LiNKaios ↔ LinkSkills

- Lease lifecycle: `requested → granted|denied → executed|expired|revoked`
- Execute requires matching idempotency key; kill switch denies with audit
- Every execution emits `lease.executed` to LiNKbrain before success return

### 6.3 All planes → LiNKbrain

Standard envelope (`DECISIONS.md` D-08):

`event_id`, `ts`, `tenant_id`, `plane`, `actor`, `action`, `subject` (ids only), `payload`, `schema_version`

Minimum actions per successful LinkSites run: `run.started`, per-stage `stage.started`/`stage.completed`, lease and workflow pairs, domain events (`preview.published`, `outreach.dispatched`, `crm.lead.status.updated`), `run.completed`.

### 6.4 LiNKaios ↔ LiNKautowork

- Invoke: `workflow_handle`, inputs, optional `lease_id`, idempotency key
- Result: `workflow_run_id`, status, outputs, `audit_event_ids`

---

## 7. Site identity

- One canonical `site_id` per business/lead
- Each generation attempt: `site_generation_run_id` (versioned retries)
- Preview URL pattern for MVO: `https://{business_slug}.linktrend.media` (VPS + routing owned with LiNKsites deploy)

---

## 8. Data dictionary (core types)

| Name | Owner |
|------|-------|
| `lead_input`, `lead_record_ref` | LiNKaios kernel |
| `lead_research_bundle` | LiNKbot |
| `website_package`, `template_id` | LiNKbot |
| `artifact_ref`, `mirror_write_ref`, `payload_sync_ref` | LiNKautowork |
| `preview_url`, `preview_check_report` | LiNKautowork / kernel surface |
| `lease_ids`, `workflow_run_ids`, `audit_event_ids`, `run_id` | Cross-plane refs |

Pin TypeScript/Zod in `packages/linklogic-sdk`.

---

## 9. Role-bleed rules (review gate)

Reject any change where:

- LiNKaios executes workflow steps or holds canonical memory
- LiNKbot issues leases or writes LiNKbrain directly
- LinkSkills stores long-term memory
- LiNKautowork performs judgment/copy generation
- LiNKbrain sends CRM/email/publish HTTP
- A Capability connector defines Odoo charts, Payload schemas, or CRM stages without cited discovery from source repo
- LinkSites product code is added to this monorepo instead of LiNKsites

---

## 10. Acceptance posture

A LinkSites MVO run **succeeds** when:

1. One lead flows through discover → build → publish → outreach with no skipped governance stages
2. Preview URL resolves on `*.linktrend.media` (or documented MVO equivalent)
3. Zulip and Plane show run-linked artifacts (messages/tasks)
4. Every side effect has lease + audit + trace visibility in LiNKaios Client
5. LiNKguard cleanup runs on bot sessions; skill disclosure follows progressive policy

A run missing audit, lease, or trace proof for work performed is **unacceptable**.

---

## 11. External repo integration checklist

Before implementing Payload/Supabase/template wiring:

1. Discover schemas and paths in **`/Users/linktrend/Projects/LiNKsites`**
2. Record source refs in issue/report — not invented here
3. Capability connectors expose ops only; LiNKautowork owns deterministic sync sequence
4. VPS/temp URL routing coordinated with LiNKsites deploy — LiNKaios surfaces URL in trace
