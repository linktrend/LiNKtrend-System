# LiNKtrend terminology

Principal-approved vocabulary (May 2026). Use for user-facing copy, architecture docs, and repo navigation.

**Canonical product definition:** `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`  
**Agent enforcement:** `.cursor/rules/07-suite-project-terminology.mdc`  
**Ownership:** `docs/architecture/repo-architecture-target.md`

---

## LiNKtrend System = LiNKaios

| Term | Meaning |
|------|---------|
| **LiNKtrend System** | The product — one AI-native **company operating system** |
| **LiNKaios** | Same product; control plane UI/kernel, tenant/suite/project orchestration, governance, traces |
| **LiNKaios Client** | Licensee-facing workspace (suites, projects, operators) |
| **LiNKtrend Admin** | Vendor/licensor-facing control (tenants, suite catalogue, capabilities, fleet) |

LiNKbrain, LinkSkills, LiNKautowork, LiNKbots, and LiNKguard are **planes** (major components) **inside** LiNKaios — not separate products in the MVO narrative.

---

## Work hierarchy

| Level | Term | Meaning |
|-------|------|---------|
| 1 | **Suite** | Tenant-enabled **business process package** (LinkSites, LinkApps, LEXOS, …) |
| 2 | **Module** | Vendor-published recipe inside a suite: phases, issues, template assignees |
| 3 | **Phase** | Ordered stage group inside a module |
| 4 | **Issue** | Atomic governed task (inputs/outputs, contracts) |
| — | **Assignee** | Who runs the issue: **LiNKbot** (judgment) or **LiNKautowork** / **Automation** (deterministic n8n) |

**Project** (tenant-created live work spanning one or more modules) remains the LiNKaios runtime container for executing suite recipes; it maps to Plane **Project** and Zulip **stream** when synced. See `.cursor/rules/07-suite-project-terminology.mdc` for Project → Phase → Issue UI mapping and **Run** (continuous mode).

**Run once vs continuous:** Once = single end-to-end pass; Continuous = repeated **Runs** (no parallel runs in MVO).

### External mapping (default v1 capabilities)

| LiNKaios | Plane | Zulip |
|----------|-------|-------|
| Suite | *(none)* | — |
| Module | **Module** (work group in Plane project) | — |
| Project | **Project** | **Stream** (one per LiNKaios project) |
| Phase | Epic / ordered work under Plane module | **Topic** |
| Issue | Work item | Referenced in topic messages |
| Assignee | Plane user (service user per LiNKbot role) or automation | — |
| Run | **Cycle** | — |

Other capabilities (e.g. Odoo) attach to **suites** that need them — not global MVO defaults.

---

## Planes (LiNKaios components)

| Plane | Role |
|-------|------|
| **LiNKaios** | Control plane UI/kernel — tenants, suites, projects, approvals, traces |
| **LiNKbots** | Role-bound workers (OpenClaw / Agent Zero / Hermes **adapters**) |
| **LinkSkills** | Skills IP, capability permissions, progressive disclosure, leases |
| **LiNKautowork** | Deterministic n8n workflows (user-facing: **Automation**) |
| **LiNKbrain** | Events, Librarian knowledge loop, company brain + anonymized world brain |
| **LiNKguard** | Skill IP wipe after use; confidentiality/anonymization per privacy policy |

---

## Capabilities

Integrations to external software are **Capabilities**, governed by LinkSkills leases.

| Context | Term |
|---------|------|
| LiNKaios UI, operator docs | **Capability** |
| Code / repo folders | **capability connector** (implementation) |

**Default v1 (studio-provided):** Zulip (comms), Plane (PM). Additional capabilities ship with suites (e.g. Odoo for accounting suites).

| Capability (examples) | Software | MVO |
|----------------------|----------|-----|
| `cap.zulip.run_messaging` | Zulip | Required |
| `cap.plane.execution_tracking` | Plane (self-hosted) | Required |
| `cap.crm.odoo_shadow` | Odoo CRM | Suite-specific / later |
| Payload / hosting | External **LiNKsites** repo | LinkSites MVO |

Do not call n8n executions “workflows” in LiNKaios UI — use **Automation**. **Phase** is reserved for LiNKaios module stage groups.

---

## LinkSites and repos

| Location | Owns |
|----------|------|
| **`LiNKtrend-System`** (`suites/linksites/`, LiNKaios, planes) | Suite orchestration, capability leases, audit/trace, integration contracts |
| **External `LiNKsites` repo** | Templates, Payload CMS, site build/publish, VPS/temp URL mechanics |

---

## MVO (May 2026)

MVO is **complete or incomplete** — not a phased roadmap. **All** of the following are required:

1. **LiNKaios Client** — operator can run LinkSites work end-to-end with traces.
2. **LiNKtrend Admin** — vendor can see tenants, suite enablement, capability posture.
3. **LinkSites Suite E2E** — Maps (or approved online) lead search → business/industry ID → template → custom site → **live publish** (`businessname.linktrend.media`) → **outreach** (sell site + hosting) → on subscribe: domain + transfer; on reject: recycle site in repo for next matching lead.

**Not acceptable as the MVO bar:** seed-CSV-only leads, draft-only outreach, fake success without publish URL and audit trace, or deferring outreach/publish to “phase 2.”

**Post-MVO:** LinkApps, LEXOS, other suites, extra capabilities, and additional templates.

---

## Repo folders

| Path | Notes |
|------|--------|
| `suites/` | Canonical suite packages |
| `LiNKskills/capability-connectors/` | Capability implementations |
| `LiNKaios/linkaios-web` | Client + Admin deployable UI |
| Legacy `/modules/` | Redirects to `/suites/` during transition |

---

## Forbidden in new user-facing copy

| Do not use | Use instead |
|------------|-------------|
| Mission | **Project** |
| Connector (LiNKaios UI) | **Capability** |
| Workflow (n8n in UI) | **Automation** |
| Workflow (stage groups) | **Phase** |
| Module (for LinkSites product) | **Suite** |
| PRISM (UI) | **LiNKguard** |
| Separate “LiNKbrain product” | Plane inside **LiNKaios** |

Legacy code symbols may persist until migration phases complete; new docs use the table above.
