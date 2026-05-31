# MVO scope and demo flow (authority)

**Status:** Principal product definition (May 2026).  
**Supersedes:** Seed-CSV-only leads, draft-only outreach, “7-day internal demo” lowered bar, and phased MVO language elsewhere in this folder.

**Also read:** `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`, `docs/terminology.md`

---

## MVO goal

**LiNKtrend System = LiNKaios.** MVO proves the full company operating system on one commercial suite:

| Required surface | What Principal must see |
|------------------|-------------------------|
| **LiNKaios Client** | Licensee operator runs LinkSites end-to-end with traces |
| **LiNKtrend Admin** | Vendor view of tenant, suite, capabilities, fleet health |
| **LinkSites Suite** | Complete website-factory **commercial loop** (below) |

MVO is **not phased**. Partial demos (preview without publish, publish without outreach, CSV-only leads) do **not** count as MVO complete.

**Out of MVO:** LinkApps, LEXOS, other suites, and net-new capabilities beyond default v1 unless Principal explicitly pulls them in.

---

## LinkSites commercial loop (required)

```text
Discover lead (Google Maps or approved online source)
  → identify business + industry
  → select industry template
  → generate custom website (copy, media, style within template)
  → LIVE publish (Payload CMS + VPS temp URL: businessname.linktrend.media)
  → outreach to sell website + hosting
  → outcome:
       subscribe → domain provisioning + transfer workflow
       reject    → recycle site/assets in repo for next matching lead
```

### Step detail

1. **Lead discovery** — Governed search via Google Maps API or Principal-approved online provider. Mock-only or seed-CSV-only pipelines are development aids, **not** the MVO completion bar.
2. **Qualification** — LiNKbot or operator confirms weak/absent web presence and industry fit.
3. **Template** — Select from **LiNKsites** template stack (external repo); structure fixed, copy/style customized.
4. **Build** — Website package, Supabase mirror, LiNKautowork sync to Payload as needed.
5. **Publish** — **Live** site on studio temp host pattern `businessname.linktrend.media` (Payload + VPS). Static/local-only preview is insufficient for MVO done.
6. **Outreach** — Sell website + hosting package. **Real outreach execution** is required (governed by LinkSkills leases and policy). Draft-only email is **not** the MVO bar.
7. **Close** — Subscribe path triggers domain + transfer capabilities; reject path recycles site for next lead with audit trail.

---

## Demo story (Principal evaluation)

Principal opens **LiNKtrend Admin**, confirms tenant has LinkSites enabled and Zulip/Plane capabilities healthy.

An operator (or demonstrated LiNKbot run) in **LiNKaios Client** starts a LinkSites **project** and walks the loop above on a real or realistically sourced lead (not a hard-coded CSV row as the only proof).

Throughout:

- **LinkSkills** issues capability leases (publish, outreach, Plane, Zulip, Maps/search, hosting/domain as declared).
- **LiNKautowork** runs deterministic publish checks, status updates, recycle/subscribe branches.
- **LiNKbrain** records events and retrievable context.
- **LiNKguard** applies skill IP wipe and privacy policy hooks on governed runs.

---

## Required result at demo

| Artifact | Required |
|----------|----------|
| Lead record | Source + business facts + industry |
| Template choice | Named industry template |
| Live site URL | `https://businessname.linktrend.media` (or approved equivalent) |
| Outreach proof | Sent or executed outreach per policy (not “draft saved only”) |
| CRM / lead status | Reflects ready → contacted → subscribed/rejected |
| Plane | Project/tasks for execution tracking (default v1 capability) |
| Zulip | Run notifications / operator thread (default v1 capability) |
| LiNKbot run(s) | Role-bound execution with adapter proof |
| LinkSkills | Leases + execute ledger entries |
| LiNKautowork | Workflow run(s) with audit |
| LiNKbrain | Events/memory visible in trace |
| LiNKaios trace | Unified Client view; Admin tenant summary |

---

## Repos and capabilities

| Piece | Owner |
|-------|--------|
| Suite orchestration, LiNKaios UI, leases, traces | **LiNKtrend-System** (`suites/linksites/`, planes) |
| Payload, templates, VPS publish mechanics | **External LiNKsites repo** |
| Default v1 capabilities | **Zulip**, **Plane** (studio-provided secrets) |
| Suite-specific later | e.g. Odoo for accounting suites — not MVO default |

---

## Non-goals (still true)

- Full multi-suite catalogue polish
- LinkApps / LEXOS delivery
- Payment processing beyond governed subscribe handoff
- Public SaaS self-serve onboarding polish
- Cross-tenant world brain at scale

---

## Unacceptable “MVO complete” claims

- Seed CSV as the only lead source presented to Principal
- Outreach left in draft-only state
- Preview folder or static HTML without live `*.linktrend.media` URL
- Success without capability leases, brain events, and LiNKaios trace
- Declaring “phase 1 done” while outreach or publish is deferred

---

## Example (illustrative)

**Bella Taipei Pasta** appears via Maps search in Taipei. Research issue enriches cuisine and competitors. Website Builder issue selects restaurant template from LiNKsites, generates copy and bistro styling, LiNKautowork syncs to Payload, publish issue goes live at `bellataipeipasta.linktrend.media`. Outreach issue sends governed offer for site + hosting. Plane shows follow-up tasks; Zulip logs the run. Principal sees full trace in Client. If rejected, recycle issue marks assets for next Italian restaurant lead with audit proof.
