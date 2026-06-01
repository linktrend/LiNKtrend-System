# LinkSites — canonical workflow map (Principal MVO)

**Suite:** LinkSites (WebsiteFactory)  
**Canonical definition:** `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md` §5  
**Contracts:** `LiNKdev/product/grounding/CONTRACTS_MVO.md`  
**External product repo:** `/Users/linktrend/Projects/LiNKsites` (templates, Payload CMS, frontend, VPS publish — not in this monorepo)  
**Identity:** One canonical `site_id` per business/lead; each **Run** uses `site_generation_run_id`.

Implementation stays in owning planes (`LiNKaios/`, `LiNKbot/`, `LinkSkills/`, `LiNKautowork/`, `LiNKbrain/`, `LiNKguard/`). This map is the **business stage spine**; LiNKdev program issues `LTS-101` … `LTS-107` implement each phase.

---

## Business stage spine (seven Principal steps)

| Order | Principal step | Stage ID | Summary | Primary assignee | Gate |
| --- | --- | --- | --- | --- | --- |
| 1 | Lead generation | `linksites.lead_generation` | **Principal D1 B:** governed **mock** demo lead (one fixed lead); full lease/audit/trace — not a skip stage. Live Maps deferred. | `lead_scout_bot` | Mock CRM + run bootstrap; lease + provenance recorded |
| 2 | Qualification | `linksites.qualification` | Business type and industry identified | `research_enrichment_bot` | Audit event; enriches run record |
| 3 | Template selection | `linksites.template_selection` | Template from LiNKsites registry (external repo) | `website_builder_bot` | No schema invention in monorepo |
| 4 | Custom website creation | `linksites.website_build` | Copy, media, style within template | `website_builder_bot` → `autowork.linksites.artifact_write_local` | Package feeds autowork |
| 5 | Publish | `linksites.publish` | Payload CMS + temp URL `businessname.linktrend.media` | LiNKautowork handles 031–033 | Preview readiness check must pass |
| 6 | Outreach | `linksites.outreach` | Governed contact to sell site + hosting | `outreach_bot` | Draft-only or Principal-approved send; **not** declared skip |
| 7 | Close or recycle | `linksites.close_or_recycle` | Subscribe/transfer domain OR recycle site for next lead | LiNKaios operator + CRM capability | Documented in trace and LiNKbrain |

---

## Technical sub-stages (deterministic, inside steps 4–5)

| Stage ID | Parent step | Plane | Handle / role |
| --- | --- | --- | --- |
| `linksites.run.bootstrap` | 1 | LiNKaios | Bind tenant, Project, Run, `site_id`, CRM lead ref |
| `linksites.artifact.write_local` | 4 | LiNKautowork | `autowork.linksites.artifact_write_local` |
| `linksites.supabase.mirror_upsert` | 4–5 | LiNKautowork | `autowork.linksites.supabase_mirror_upsert` |
| `linksites.payload.sync_local` | 5 | LiNKautowork | `autowork.linksites.payload_sync_local` |
| `linksites.preview.verify` | 5 | LiNKautowork | `autowork.linksites.preview_readiness_check` |
| `linksites.crm.promote_ready` | 5–6 | LiNKautowork | CRM status after preview pass; gates outreach |

---

## LiNKbot roles

| Role | Principal step | Notes |
| --- | --- | --- |
| `lead_scout_bot` | 1 | **D1 B:** governed mock demo lead for MVO; live search post-MVO |
| `research_enrichment_bot` | 2–3 | Read-only research; provenance bundle |
| `website_builder_bot` | 3–4 | Template-guided package; no direct CRM/Payload writes |
| `outreach_bot` | 6 | Governed outreach; visible in trace |
| `librarian_bot` | (cross-cutting) | Run outputs + Zulip threads → knowledge loop per PPD §3 |

---

## Default capabilities (studio-provided)

- **Zulip** — stream per Project, topics for phases/issues  
- **Plane** — bundled execution tracking; bootstrap from Suite template  
- **Supabase** — auth, RLS, brain/kernel/skills schemas  
- **Suite connectors** — CRM shadow, Payload sync, public research, asset generation (see `CONTRACTS_MVO.md`)

---

## Governance (every side-effecting step)

- LinkSkills capability **lease**  
- LiNKautowork **workflow run** (deterministic steps)  
- LiNKbrain **audit / memory** event  
- LiNKaios **trace** visibility (Client; Admin where applicable)  
- LiNKguard **session cleanup** on bot runs  

---

## LiNKdev program mapping

| Program phase | Issue IDs |
| --- | --- |
| `lead-generation` | LTS-101 |
| `qualification` | LTS-102 |
| `template-selection` | LTS-103 |
| `website-build` | LTS-104 |
| `publish` | LTS-105 |
| `outreach` | LTS-106 |
| `close-recycle` | LTS-107 |
| E2E demo proof | LTS-108 |

Plane modules for infrastructure: `linkaios`, `linkskills`, `linkbrain`, `linkautowork`, `linkbot`, `linkguard` — see `LiNKdev/product/programs/linktrend-system/PROGRAM.md`.

---

## Explicit non-goals (until MVO ships)

- LinkApps, LEXOS, other Suites (PPD §7)  
- Customer-owned Plane/Odoo in MVO tenant settings  
- Moving LiNKsites product code into this monorepo  
- Treating Zulip, Plane, or Supabase as optional for MVO  
- Preview-only or seed-CSV-only demos as substitute for full E2E (PPD §7)
