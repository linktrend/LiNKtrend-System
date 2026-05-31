# LiNKtrend AI Agent Ecosystem — Integrated Design Narrative

## What LiNKtrend System is

**LiNKtrend System** is **LiNKaios**: an AI-native **company operating system** for small and medium businesses. It is not a chatbot, not an automation library, and not a loose bag of agents. It coordinates **suites** (business process packages), **projects**, and **issues** so licensed companies can run real work with audit and governance.

Two surfaces ship as one product:

- **LiNKaios Client** — what a licensee company uses day to day.
- **LiNKtrend Admin** — what the vendor/licensor uses to operate tenants, suites, and capabilities.

Inside that product, major **planes** divide responsibility:

| Plane | Job |
|-------|-----|
| **LiNKaios** | Control plane — orchestration, UI, approvals, traces |
| **LiNKbots** | Judgment work through runtime adapters (OpenClaw, Agent Zero, Hermes, …) |
| **LinkSkills** | Skills IP, capability permissions, progressive disclosure, leases |
| **LiNKautowork** | Deterministic n8n workflows (**Automation** in UI) |
| **LiNKbrain** | Events, Librarian knowledge loop, company brain + anonymized world brain |
| **LiNKguard** | Skill IP wipe after use; confidentiality/anonymization per privacy policy |

**Capabilities** connect LiNKaios to external software (Zulip and Plane are default v1). LiNKaios coordinates; it does not replace Plane’s board or Zulip’s chat.

**Work hierarchy:** **Suite** → **Module** → **Phase** → **Issue**. Each issue’s **assignee** is a **LiNKbot** or **LiNKautowork** automation.

Repo ownership and completion targets: `docs/architecture/repo-architecture-target.md`, `docs/architecture/system-completion-targets.md`. Principal product truth: `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`.

---

## The Simple SMB Example

BrightLocal Studio is a five-person agency. Today it juggles Drive, QuickBooks, Slack, a PM tool, and ChatGPT. The owner wants AI employees that act as one system.

They subscribe to **LinkSites** on LiNKaios Client. A **project** starts for a new restaurant lead discovered via Maps (or an approved online source). The suite’s **modules** and **phases** spell out issues: research business, pick industry template, generate copy, publish preview site, run outreach, handle subscribe/reject.

A **LiNKbot** pulls scoped context from **LiNKbrain** — not a raw dump. It requests **capability leases** from **LinkSkills** before publish or outreach. Routine steps (sync to Payload, update Plane tasks, post Zulip run summary) go to **LiNKautowork**. **LiNKguard** ensures skill material does not leak after the run.

The operator sees one trace in LiNKaios: lead, template, live URL on `businessname.linktrend.media`, outreach status, Plane tasks, leases, automation runs, and brain events. On rejection, the site is recycled for the next matching lead; on subscribe, domain and transfer proceed under governed capabilities.

Site build and Payload live in the **external LiNKsites repo**; this ecosystem repo owns orchestration, leases, and audit.

That loop is the operating model: bots judge, LinkSkills permits, LiNKautowork repeats, LiNKbrain remembers, LiNKaios coordinates.

---

## The Role of Each Plane

**LiNKaios** knows tenant, enabled suites, projects, roles, bots, automations, capabilities, approvals, costs, and dashboard state. It coordinates peers; it does not become the memory system or the skill registry.

**LiNKbot** is the AI employee runtime. Instances are role-bound, tenant-scoped, and adapter-driven so the ecosystem does not depend on one engine.

**LiNKbrain** treats the event ledger as source of truth. Memory objects, lessons, and context bundles are derived, scoped, and revocable. A Librarian loop improves institutional knowledge; world brain contributions are anonymized per policy.

**LinkSkills** issues short-lived capability leases, enforces side-effect policy, and separates **skills** from **capabilities**.

**LiNKautowork** runs repeatable workflows with signed ingress, tenant validation, audit, and kill switches — the cost and variance lever.

**LiNKguard** protects worker sessions: residue cleanup, skill IP wipe, and privacy-policy-aligned handling. It does not own mission authority or memory.

No plane should silently bypass the others.

---

## How The Planes Interact

Work starts in LiNKaios (user, schedule, webhook, or message). LiNKaios resolves tenant, suite, project, module phase, and assignee. A LiNKbot may ask LiNKbrain for a context bundle, request LinkSkills leases, and delegate deterministic steps to LiNKautowork. Events return to LiNKbrain and appear in LiNKaios traces.

---

## Packaging

Customers buy **suites**, not internal plane names. LinkSites is the first MVO suite: lead → site → publish → outreach → outcome. LinkApps, LEXOS, and others are post-MVO.

Internally, a suite bundles modules, LiNKbot roles, LinkSkills capabilities, LiNKautowork templates, and LiNKbrain event schemas. Externally, the SMB sees a business outcome.

---

## Hosting

Default model is hosted SaaS: LiNKaios web as control panel, peer services deployable separately, Postgres/Supabase with tenant scoping, workers on managed infrastructure. Fork external tools only when adapters are insufficient.

---

## Repo Strategy

`LiNKtrend-System` is the LiNKaios monorepo: kernel, Client/Admin web, `suites/`, adapters, gateways. **LiNKsites** is separate for site factory mechanics. Other `link-*` forks integrate through capabilities. Plane implementations may also live in dedicated repos but are invoked as capabilities.

---

## Monetization Logic

The moat is the full operating system: governed automations, institutional memory, certified capabilities, and suite packaging — not isolated plane SKUs for MVO.

---

## Engineering Focus (May 2026)

**MVO is not phased.** Prove **LiNKaios Client**, **LiNKtrend Admin**, and the full **LinkSites** commercial loop with live publish and real outreach — not seed-CSV-only leads or draft-only email as the finish line.

Once Principal accepts that demo, expand suites and capabilities.

---

## Final Picture

LiNKaios is the company operating system. LiNKbots work issues. LinkSkills gates the outside world. LiNKautowork runs the repeatable machine. LiNKbrain is the institutional record. LiNKguard protects confidentiality. External software is reached only through **capabilities**. The licensee buys a suite that runs a business process — starting with LinkSites.
