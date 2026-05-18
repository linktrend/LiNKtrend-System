# LinkSites — canonical workflow map (WebsiteFactory MVO v2)

**Module:** `modules/linksites`  
**Sources:** `LINKSITES_VERTICAL_MVO_V2.md`, `CONTRACTS_MVO.md` §0.A, `LINKSITES_COMPLETION_PLAN.md`  
**External repo:** `/Users/linktrend/Projects/LiNKsites`  
**Identity:** One canonical `site_id` per business/lead; each run uses `site_generation_run_id` (versioned retries).

This document is the readable source of truth for stage order and cross-plane expectations. Implementation stays in owning planes (`LiNKautowork/`, `LiNKbot/`, `LiNKskills/`, `LiNKbrain/`, `LiNKaios/`).

---

## Stage spine

| Order | Stage ID | Summary | Primary plane | Inputs | Outputs | Gate / approval |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `linksites.run.bootstrap` | Bind tenant run to mock CRM lead and site identities | LiNKaios | `tenant_id`, mock `lead_record_ref`, optional prior research handles | `run_id`, `trace_id`, `site_id`, `site_generation_run_id` | Module enabled; kernel manifest valid |
| 2 | `linksites.lead_scout.skip` | Lead Scout role declared; mock substitution only | LiNKbot | `lead_record_ref` | Skip evidence → mock path documented | **MVO:** role disabled; no live acquisition |
| 3 | `linksites.research.enrich` | Governed public research + provenance | LiNKbot | `lead_record_ref`, business facts | `lead_research_bundle`, citation refs | Lease for `public_web_research.read`; provenance recorded |
| 4 | `linksites.template_select_package` | Template-guided copy, media plan, style proposal | LiNKbot | `lead_research_bundle`, `template_id` / template ref from LiNKsites registry | `website_package` (structured) | Template from discovery/registry; no schema invention |
| 5 | `linksites.artifact.write_local` | Persist generated package to local artifact folder | LiNKautowork | `website_package`, paths policy ref | Local artifact paths, digests | **`autowork.linksites.artifact_write_local`** |
| 6 | `linksites.supabase.mirror_upsert` | Structured content + asset refs → mirror | LiNKautowork | Artifact + mirror schema refs | Mirror row/version refs | **`autowork.linksites.supabase_mirror_upsert`**; LinkSkills leases |
| 7 | `linksites.payload.sync_local` | Sync mirror → local Payload CMS | LiNKautowork | Mirror refs, Payload connection ref | `payload_sync_status`, content refs | **`autowork.linksites.payload_sync_local`** |
| 8 | `linksites.preview.verify` | Deterministic checks vs preview frontend | LiNKautowork | Preview base URL / service ref, check profile | `preview_check_report`, pass/fail detail | **`autowork.linksites.preview_readiness_check`** must pass to promote |
| 9 | `linksites.crm.promote_ready` | Mock/shadow CRM lead status update | LiNKautowork + LinkSkills | `preview_check_report`, `lead_record_ref` | Lead status `ready_to_contact` | Only if stage 8 passed; **no real outreach** |
| 10 | `linksites.outreach.declared_skip` | Outreach Bot declared disabled | LiNKbot | — | Skip / audit only | **MVO:** no draft send |

---

## LiNKbot roles (contract roles)

| Role | Stages | Notes |
| --- | --- | --- |
| `lead_scout_bot` | 2 | Declared; disabled; mock CRM supplies path |
| `research_enrichment_bot` | 3 | Read-only research; no direct CRM/Payload/Supabase writes |
| `website_builder_bot` | 4 | Uses LiNKsites templates as guidance; local artifact targets only |
| `outreach_bot` | 10 | Declared; disabled |

Kernel issues LinkSkills leases; bots consume narrowed tooling per `CONTRACTS_MVO.md` §6.1.

---

## Capability connectors (LinkSkills)

Required for MVO v2 (connector IDs align with `CONTRACTS_MVO.md` §0.A.5 naming families):

- CRM / lead status: Odoo or mock CRM connector — **mock/shadow** for writes.
- `payload` / local CMS sync (Payload CMS local).
- Supabase mirror / content structured writes.
- `zulip` — run / operator notifications (`run.notify`, mock send posture).
- `public_web_research` — governed read + provenance.
- `asset_generation` — governed media generation + audit.
- `plane` — internal tasks; mock/shadow default.

---

## LiNKautowork handles (Wave 2 implementation targets)

| Handle | Stage | Purpose |
| --- | --- | --- |
| `autowork.linksites.artifact_write_local` | 5 | Write structured package to dev artifact folder |
| `autowork.linksites.supabase_mirror_upsert` | 6 | Upsert mirror rows per discovered schemas |
| `autowork.linksites.payload_sync_local` | 7 | Sync mirror → Payload |
| `autowork.linksites.preview_readiness_check` | 8 | Deterministic preview validation |
| `autowork.linksites.crm_lead_status_update` *(planned name)* | 9 | Promote mock lead to `ready_to_contact` behind lease |

---

## LiNKbrain — audit / memory events (minimum)

Cross-plane lifecycle: `run.*`, `stage.*`, `workflow.*`, `lease.*` per `CONTRACTS_MVO.md` §6.3.

Domain-oriented (non-exhaustive): `research.performed`, `provenance.recorded`, `template.guidance.selected`, `website.package.generated`, `payload.sync.completed`, `preview.check.completed`, `crm.lead.status.updated`, `role.started`, `role.completed`, `role.skipped`, `role.failed`.

Memory objects hold refs/hashes — not raw secrets.

---

## Plane tasks (shape)

Mock/shadow default; tie tasks to `site_generation_run_id`:

- **Epic / project:** “WebsiteFactory run — {site_id}”
- **Per-stage tasks:** Research complete, package generated, artifact written, mirror updated, Payload synced, preview checks passed, CRM promoted.

Exact taxonomy follows tenant Plane templates when live Plane is enabled.

---

## LiNKaios UI surfaces

- Cockpit run / trace view for kernel `run_id` / `trace_id`
- WebsiteFactory module panels: lead/context, template selection, generation status, preview link, capability lease timeline, failure reports
- Reference migration: legacy paths noted in `modules/linksites/README.md` and `manifest.ts` re-export source

---

## Proof criteria (module map level)

- This map is complete enough for Wave 2 handlers (`WP-212`+) to implement without reinterpretation.
- End-to-end proof (later waves): mock lead → preview URL → checks pass → CRM status `ready_to_contact`, with audit + leases on every side effect.

---

## Explicit non-goals (MVO)

- Live lead acquisition, outreach send, production hosting/DNS/TLS, inventing Payload/Supabase schemas, writing artifacts to Git remotes — per `LINKSITES_VERTICAL_MVO_V2.md`.
