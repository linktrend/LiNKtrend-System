# LiNKaios Core — Design Narrative

## Purpose

LiNKaios Core is the operating system and command center of the LiNKtrend AI agent ecosystem. Its job is not to be a vertical product, an agent runtime, an automation engine, a memory system, or a skill registry. Its job is to coordinate all of those things under a tenant-aware business operating layer.

In plain English, LiNKaios is the place where a company installs a business package, hires AI employees into roles, configures which external tools the business uses, watches the work happen, approves risky actions, tracks cost, and audits what happened.

The original design correctly describes LiNKaios Core as the shared substrate every vertical sits on. It does not know what a “matter,” “campaign,” or “website” is. The vertical plugins know that. LiNKaios knows tenants, plugins, roles, bots, workflows, permissions, installed capabilities, routing, and visibility.

The refined architecture should frame LiNKaios as a tenant-aware organizational execution control plane. That phrase is less marketable than “AI operating system,” but it is more precise for engineering. The system is the OS because it governs execution contracts, identity, routing, state, policy, approvals, and audit across the whole AI workforce.

## What LiNKaios Owns

LiNKaios owns the kernel and the business control surface. It owns the tenant model, the user model, the plugin installation lifecycle, the role model, the LinkBot registry, workflow definitions, workflow state, engagement/project abstractions, UI routes, billing controls, cost caps, approvals, dashboard surfaces, and service integrations.

LiNKaios owns the question: “What is installed for this tenant, what work exists, who or what is responsible for it, what state is it in, what can happen next, and where do we send the request?”

It does not own the detailed memory system, because that is LiNKbrain. It does not own capability authorization internals, because that is LinkSkills. It does not own deterministic workflow execution, because that is LiNKautowork. It does not own the internals of OpenClaw or Agent Zero, because those are LinkBot runtime adapters.

## Vertical Plugins

A vertical plugin is a package that defines a business shape. Examples are WebsiteFactory, VentureStudio, MediaProduction, Ecommerce, LawFirm Litigation, Real Estate Agency, or Accounting Firm. A vertical plugin defines domain objects, workflows, role taxonomy, UI surfaces, workflow stages, default LinkBots, skill bindings, required capabilities, optional capabilities, and memory structures.

A WebsiteFactory vertical might define leads, website audits, proposals, website projects, deployment checklists, SEO reports, and post-launch monitoring. It may declare roles such as Studio Manager, Website Scout, SEO Analyst, Content Builder, and Sales Ops. It may require capabilities such as CRM, project management, document storage, accounting, social publishing, analytics, and deployment.

A LawFirm Litigation vertical defines matters, evidence, legal research, drafting workflows, review stages, filing approvals, and roles such as Senior Litigator, Paralegal, General Counsel, and Adversarial Reviewer. It may require document management, messaging, billing, legal research, citation checking, OCR, and evidence extraction.

The important design point is that LiNKaios Core does not hardcode these business concepts. It provides the plugin runtime and contract. The plugin supplies the domain meaning.

## Capability Plugins

A capability plugin is not a business vertical. It is a horizontal service category. Examples include accounting, document management, project management, messaging, CRM, marketing, email, analytics, storefront, storage, error monitoring, payments, and reverse proxy.

A capability plugin defines operations in abstract form. For accounting, operations may include create invoice, get balance, record payment, and create journal entry. The tenant may implement accounting through Odoo, QuickBooks, or Xero. The vertical plugin does not care which adapter is selected. It asks the accounting capability for create invoice. LiNKaios knows which adapter the tenant chose.

This abstraction is important because SMBs use different stacks. One client may use QuickBooks, another Odoo, another Xero. The AI operating layer should not force all customers into one tool. The capability plugin model gives the platform adapter flexibility.

The risk is that raw connectivity is becoming commoditized through MCP, OpenAPI, and ecosystem connectors. The value of capability plugins is not merely “we connect to QuickBooks.” The value is that the connection is governed, tenant-scoped, typed, auditable, swappable, and usable by LinkBots and workflows under policy.

## LinkBots In LiNKaios

A LinkBot is hired into a role declared by a vertical plugin. The bot record binds tenant, plugin, role, runtime core, persona overlay, model routing, cost cap, and status. From the user’s perspective, this is an AI employee. From the engineering perspective, it is a role-bound runtime instance with policy, memory, skills, and workflow boundaries.

LiNKaios should allow an admin to hire, pause, resume, retire, inspect, and configure LinkBots. It should show which roles are available from installed plugins, which runtime core is preferred, which memory scopes apply, which skills are pre-bound, which workflows the bot can participate in, and which approval gates apply.

The bot-as-employee metaphor should be used for customer understanding and UI. Architecturally, the real primitives are role, contract, policy, memory scope, capability lease, workflow state, cost cap, and audit trace.

## Workflow Runtime

LiNKaios should provide the kernel-level workflow model. A workflow is a named state machine declared by a vertical plugin. It contains stages, transitions, gates, and execution bindings. An engagement is the polymorphic business object moving through a workflow. In a law firm this may be a matter. In WebsiteFactory it may be a site project. In MediaProduction it may be a campaign. In VentureStudio it may be a venture mission.

When an engagement moves from one stage to another, LiNKaios determines what must happen. It may trigger a LinkSkills capability, request a LinkBot action, call a LiNKautowork workflow, require human approval, or write audit. This workflow runtime should start simple, likely Postgres-backed, because early operational simplicity matters. Temporal can be introduced later for more complex durable execution, but the contract should be designed so workflow execution can eventually be routed to Temporal or another durable engine.

Every transition should produce audit. A transition should record tenant, plugin, engagement, workflow, from-stage, to-stage, triggering actor, skill used, workflow used, outcome, cost, and run identifiers. The fine-grained execution audit belongs to LinkBrain and peer service ledgers, but LiNKaios should provide the unified surface.

## Command Center UI

The command center should be the main product surface. The original 12-route structure is strong: admin, company, devtools, gateway, memory, metrics, projects, settings, skills, traces, work, and workers.

The admin route controls tenant settings, plugin installs, capability choices, credentials, cost caps, and kill switches. The company route shows human and bot org structure. The workers route manages LinkBots. The work route shows active work. The projects route surfaces engagements across verticals. The skills route reads LinkSkills. The memory route reads LiNKbrain. The traces route shows audit. The metrics route shows cost, performance, automation savings, and operational pulse. The gateway route shows inbound integration events.

Vertical plugins may extend the project surface with domain-specific routes such as matters, campaigns, sites, or ventures, but they should use the shared UI system.

## Open Source Strategy

LiNKaios should use Next.js for the web app, Supabase/Postgres for tenant and kernel data, shadcn/ui/Tailwind for the design system, OpenTelemetry for traces, OPA/OPAL for policy where needed, Traefik/Tailscale for private routing, and SDKs for LinkBrain, LinkSkills, LiNKautowork, and LinkBot-core.

It should integrate, not absorb, open-source business systems. Odoo can serve accounting. Paperless can serve document management. Plane can serve project management. Zulip can serve internal messaging. Postiz can serve social scheduling. Listmonk can serve email marketing. Chatwoot can serve CRM/support. Metabase can serve analytics. Vaultwarden can serve secrets/password storage where appropriate. GlitchTip can serve error monitoring. These systems become adapters/capability choices, not LiNKaios internals.

MCP, A2A, and OpenAPI should be supported as interoperability layers. LiNKaios should not fight these standards. It should govern them.

## Repo Structure

LiNKaios should be a monorepo because the kernel, UI, plugin runtime, vertical plugins, capability plugin definitions, contracts, and SDK clients need to evolve together early.

A practical structure is:

- `apps/linkaios-web` for the Next.js command center.
- `packages/ui` for shared components.
- `packages/contracts` for shared schemas.
- `packages/plugin-runtime` for manifest loading and validation.
- `packages/sdk-linkbrain`, `sdk-linkskills`, `sdk-linkautowork`, and `sdk-linkbot`.
- `plugins/verticals` for WebsiteFactory, VentureStudio, MediaProduction, Ecommerce, LawFirm, and future verticals.
- `plugins/capabilities` for accounting, CRM, document management, messaging, project management, analytics, marketing, email, storage, payments, and other horizontal capabilities.
- `db/migrations` for kernel schemas.
- `tools/plugin-validator` and `tools/manifest-validator`.
- `docs/architecture`, `docs/plugin-contracts`, and `docs/work-packets`.

Vertical and capability plugins should stay in the LiNKaios monorepo initially. Later, third-party or large plugins can become separate repos once the plugin contract stabilizes.

## Deployment

The default deployment should be shared SaaS. LiNKaios web can run on Vercel or a self-hosted Node runtime. Backend services run on DigitalOcean droplets/App Platform. The kernel database uses Supabase. Peer services use separate databases/projects or schemas depending on maturity and isolation needs. External tools run as Docker Compose services or hosted SaaS adapters.

The design should preserve a path to dedicated deployments. Every row should carry tenant and region. Plugin data should be designed for export. Peer services should support shared and dedicated instance modes.

## Moat

LiNKaios has no moat as “a web dashboard.” Multi-tenant SaaS, RBAC, dashboards, and plugin managers are commodity. The moat is the platform shape: vertical business packages, capability-as-contract, LinkBots hired into roles, LinkSkills-governed actions, LiNKautowork deterministic execution, LiNKbrain institutional learning, and pre-integrated open-source business stack.

The strongest moat is the combined loop: work comes in, a bot reasons, LinkSkills governs, LiNKautowork executes, LiNKbrain learns, and LiNKaios updates the operating surface. That loop is the product.

## First Build Target

The first vertical should be WebsiteFactory/LinkSites. It is lower-regulation, repeatable, easy to demonstrate, and has obvious automation value. Build one narrow but complete loop before expanding. The goal is not to show every vertical. The goal is to prove that one vertical can install, provision bots, run workflows, use skills, trigger automations, write memory, and expose audit.
