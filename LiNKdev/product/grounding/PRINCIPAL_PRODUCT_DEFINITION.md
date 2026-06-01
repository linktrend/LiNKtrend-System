# Principal product definition

**Status:** Canonical — May 2026  
**Audience:** Planner, Orchestrator, and agents when the Principal instructs read-first  
**Supersedes:** Pre-2026-05 stub MVO framing (seed CSV lead, preview-only, draft-only outreach)

This document is the plain-English source of truth for what **LiNKtrend System** is and what **done** means for the first program.

---

## 1. What LiNKtrend System is

**LiNKtrend System = LiNKaios.**

LiNKaios is an AI-native **company operating system**: one place where a business owner (the Principal) and a minimal human staff run traditional businesses — dental clinics, restaurants, law firms, accounting firms, venture studios, and similar — with almost no day-to-day manual work.

The system ships as **two interfaces**:

| Interface | Who uses it | Purpose |
|-----------|-------------|---------|
| **LiNKaios Client** | The licensee company (client) and its human users | Run the business: subscribe to Suites, launch Projects, approve budgets and knowledge, review traces, manage roles |
| **LiNKtrend Admin** | The vendor (licensor) — humans and LiNKbots | Operate the fleet: manage licensees, Suites, LiNKbots, Capabilities, troubleshooting, and cross-tenant operations |

Both interfaces are **in scope for MVO**. Development continues until the full Client + Admin surfaces required for the demo exist — there is **no phased release** of a smaller preview-only slice.

---

## 2. Work hierarchy

Business work is organized in a fixed hierarchy:

```
Suite → Module → Phase → Issue
```

| Level | Meaning | Example |
|-------|---------|---------|
| **Suite** | Packaged business process for one aspect of company work | Content creation, content distribution, channel management, **LinkSites** |
| **Module** | Vendor-published recipe inside a Suite | WebsiteFactory module inside LinkSites |
| **Phase** | Stage group inside a Module | Lead generation, website build, publish, outreach |
| **Issue** | Atomic task with input/output contracts | Research one lead, generate homepage copy, send outreach message |
| **Assignee** | Who executes the Issue | **LiNKautowork** (deterministic automation) or **LiNKbot** (judgment/reasoning) |
| **Run** | One pass through a Project's modules (continuous mode repeats Runs) | One LinkSites lead-to-outreach cycle |

Suites describe **what** work happens and in what order. They do **not** own the machinery — that stays with the planes below.

---

## 3. Planes (components of LiNKaios)

These are **parts of LiNKaios**, not separate products. Each plane has a bounded responsibility; no plane absorbs another's job.

| Plane | Role |
|-------|------|
| **LiNKaios** | Control plane: tenants, Suites, Projects, routing, approvals, traces, Client and Admin UI |
| **LiNKbot** | Role-bound AI employees (OpenClaw, Agent Zero, Hermes adapters). Judgment work only — thin runtime shell |
| **LinkSkills** | Skills IP, progressive disclosure, capability permissions, leases, idempotency, kill switches |
| **LiNKautowork** | Deterministic workflow execution (n8n gateway). Repeatable steps, not high-judgment decisions |
| **LiNKbrain** | Events, audit, company memory, context assembly, Librarian knowledge loop, anonymized world brain |
| **LiNKguard** | Worker security: wipe skill IP traces after bot use, enforce confidentiality for company and world brain data |

### LiNKguard and skill IP

LinkSkills skills are **valuable intellectual property**. LiNKbots receive skills through **progressive disclosure** (just-in-time, as needed for the task). After execution, **LiNKguard wipes the LiNKbot of skill traces** so skills cannot be copied or used without authorization.

LiNKguard also enforces **company confidentiality** when data flows to the anonymized world brain, per the client's privacy policy in LiNKaios.

### LiNKbrain and the Librarian

LiNKbots and LiNKautowork produce logs and outputs during Runs. LiNKbrain ingests this raw material.

A specialized **Librarian LiNKbot**:

1. Turns raw runs into **knowledge** (lessons learned).
2. Presents knowledge to the Principal for **accept, reject, or edit** — or auto-accepts when policy allows.
3. Records accepted knowledge in the **company shared LiNKbrain** so all company LiNKbots improve.
4. Uses accepted lessons to **improve LinkSkills** and instruct a specialist LiNKbot to **create/improve LiNKautowork automations** (Karpathy-style LLM Council and Auto Research concepts).
5. **Anonymizes** lessons and records them in a **world-wide brain**, tagged by business process, industry, region, country, etc., so LiNKbots at other companies can learn — without carrying sensitive client data (LiNKguard + privacy policy).

LiNKbrain is **auditable at any time**. Zulip (preferred) or Slack thread communications between LiNKbots and humans are also raw input for the Librarian.

### Capabilities

External software and tools (Odoo, QuickBooks, Plane, Linear, Figma, Twilio, Payload CMS, etc.) connect to LiNKaios through **Capabilities**, governed by LinkSkills leases.

**Default Capabilities in v1** (studio-provided, not customer-configured):

- **Zulip** — project streams, topics, LiNKbot/human threads
- **Plane** — project management sync (bundled with LiNKaios for MVO)

Other Capabilities attach to **Suites** as needed (e.g. Odoo for accounting Suites). A specialist LiNKbot owns continuous Capability integration so LiNKbots can use more external software over time.

Future versions may let the Principal choose default comms/PM Capabilities; future external software may expose agent entry points (MCP/API) so LiNKbots speak to them directly.

---

## 4. Client vs Admin

| | LiNKaios Client | LiNKtrend Admin |
|--|-----------------|-----------------|
| **User** | Licensee company humans | Vendor humans and LiNKbots |
| **Typical actions** | Subscribe Suites, launch Projects, approve budgets/knowledge, review work | Manage licensees, publish Suites, fleet LiNKbots, troubleshoot, cross-tenant ops |
| **Access levels** | Admin, Operator, Viewer (and similar) per company policy | Vendor-side roles |

Human users within a company have different access for approvals (budgets, LiNKbrain inclusions, Suite subscriptions, etc.).

---

## 5. MVO — minimum viable outcome

**MVO is not a stub demo.** It is the **entire LiNKtrend System (Client + Admin)** plus **one full end-to-end LinkSites Suite run for one lead**.

### Required infrastructure (non-negotiable for MVO)

- **Supabase** — auth, Postgres, RLS, brain/memory schemas
- **Zulip** — governed project messaging
- **Plane** — execution tracking (studio-provided for MVO)
- **LiNKbots** — judgment steps in the Suite
- **LiNKautowork** — deterministic steps
- **LinkSkills** — leases and skills on every side effect
- **LiNKbrain** — audit and memory on every meaningful step
- **LiNKguard** — session cleanup and IP/confidentiality posture

Everything else (other Suites, LEXOS, LinkApps, etc.) is **post-MVO** and **out of scope** until MVO ships.

### LinkSites Suite — full business process

**LinkSites** (WebsiteFactory) is the first Suite. Its end-to-end process:

1. **Lead generation** — Search online (e.g. Google Maps) for businesses with no or poor web presence.
2. **Qualification** — Identify business type and industry.
3. **Template selection** — Choose a website template (structure + content guidelines) from the LinkSites product repo.
4. **Custom website creation** — LiNKbots produce business-specific copy, media, and style from the template.
5. **Publish** — Content to **Payload CMS**; frontend on shared VPS with temporary URL `businessname.linktrend.media`.
6. **Outreach** — Contact the lead to sell the ready-made website (site + hosting subscription).
7. **Close or recycle** — If the lead subscribes: register custom domain if needed, transfer site ownership. If not: save site in repository and **recycle** for the next matching lead until sold.

**MVO demo bar:** one lead through **build + publish + outreach** with full governance traces visible in LiNKaios Client (and vendor visibility in Admin where applicable).

### LinkSites repo boundary

**LinkSites product code lives in the external repo** `/Users/linktrend/Projects/LiNKsites` (Payload CMS, templates, frontend, VPS publish targets).

**This repo (`LiNKtrend-System`)** owns:

- LiNKaios Client and Admin UI/kernel integration for the LinkSites Suite
- Suite workflow map under `suites/linksites/`
- LiNKbot roles, LinkSkills capability connectors, LiNKautowork workflows, LiNKbrain events
- Orchestration, leases, audit, and traces — **not** the website factory product implementation itself

Do not move LiNKsites templates, Payload schemas, or frontend into this monorepo.

---

## 6. Audience and execution

| Role | MVO role |
|------|----------|
| **Principal** | Evaluates the demo; all strategic decisions; approves protected actions |
| **LiNKdev** | Factory that plans and executes the program to complete MVO with minimal human intervention |

---

## 7. Explicit non-goals (until MVO is done)

- Shipping LinkApps, LEXOS, or other Suites beyond LinkSites
- Treating CRM/Plane/Zulip/Supabase as optional stubs when the Principal definition requires them for MVO
- Phased "preview-only" or "seed CSV only" demos as substitute for full LinkSites E2E
- Absorbing plane responsibilities into LiNKaios kernel
- Inventing external software business configuration (Odoo charts, Payload schemas) without discovery from source repos

---

## 8. Related grounding (read after this document)

| Document | Purpose |
|----------|---------|
| `VISION.md` | Product narrative |
| `INTENT.md` | Program intent for `linktrend-system` |
| `SHIP_CRITERIA.md` | Definition of done checklist |
| `MASTER_PLAN.md` | High-level path to MVO |
| `CONTRACTS_MVO.md` | LinkSites flow contracts and capability boundaries |
| `ARCHITECTURE_RULES.md` | Non-negotiable plane boundaries |
| `CONSTRAINTS.md` | Repo and integration constraints |
| `GLOSSARY.md` | Terms |

**Not in factory bootstrap:** This file is read when the Principal tells the Planner to read it first. It is not added to default `read_first` templates.
