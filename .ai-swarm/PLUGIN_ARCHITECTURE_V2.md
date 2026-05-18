# Module / Connector Architecture Contract v2

> Post-cleanup terminology note: this document was originally written with `vertical plugin` and `capability plugin`. New work uses `module` and `capability connector`. Legacy schema fields may still say `plugin_*` until the SDK contracts are migrated, but new folders, prompts, docs, and work packets must use the post-cleanup terms.

**Status:** Approved design direction for the revised LinkSites MVO.
**Purpose:** Define the shared plugin architecture before updating implementation contracts.

## Plain-English Rule

Vertical plugins say what work needs to happen. Capability plugins provide the tools. LinkSkills grants permissions and skills. LiNKautowork runs repeatable steps. LiNKbot think and write. LiNKbrain remembers. LiNKaios coordinates.

## Core Platform Services

Core platform services are not vertical plugins.

- **LiNKaios core** coordinates tenants, plugins, work requests, runs, dashboards, approvals, routing, trace/status views, and plugin configuration.
- **LinkSkills** owns the capability catalog, skills, leases, permissions, approvals, idempotency, kill switches, certification metadata, and run ledger.
- **LiNKautowork** owns deterministic workflow templates, workflow execution, run ledger, automation audit, and workflow promotion candidates.
- **LiNKbrain** owns event ledger, audit, memory objects, context assembly, retrieval, trace assembly, and learning data.
- **LiNKbot** is a thin role-bound agent runtime for judgment-heavy work. It does not own canonical memory, skills, secrets, deterministic workflows, or final audit.

## Vertical Plugins

Vertical plugins are business/product machines. Examples include LinkSites, LEXOS Litigation, Linktrend Media, Linkapps, Linktrend Development, and Linktrend Admin plugin families.

Each vertical plugin must declare:

- plugin id, name, version, purpose, and mode support
- accepted work request types
- ordered workflow stages
- required LiNKbot roles
- required capability plugins
- required LinkSkills skills and capability leases
- required LiNKautowork workflow hooks
- required LiNKbrain audit and memory events
- LiNKaios UI panels and read views
- data objects owned by the vertical plugin
- development-mode, shadow-mode, and live-mode behavior
- explicit non-goals

Vertical plugins must not hardcode connector internals, secrets, target-software schemas, or workflow behavior that belongs to another plane.

## Capability Plugins

Capability plugins are reusable governed connections to tools or software. Examples include Odoo, Zulip, Payload CMS, Plane, Postiz, Supabase mirror sync, public web research, and asset generation.

Each capability plugin must declare:

- capability id and target software
- allowed operations
- auth and tenant configuration requirements
- mode flags: `mock`, `shadow`, `live`
- LinkSkills lease requirements
- idempotency rules
- audit events
- allowed callers: LiNKaios, vertical plugins, LiNKbot, or LiNKautowork
- failure mapping
- what it explicitly does not configure inside the target software

Capability plugins prepare communication and governance surfaces. They do not invent Odoo charts of accounts, Payload schemas, CRM stages, content models, or other business configuration unless explicitly assigned. If a schema or configuration already exists in another repo, agents must discover/copy/adapt it instead of recreating it.

## LiNKbot Attachment Model

LiNKbot attach to vertical plugin stages through declared roles. A role defines:

- purpose
- inputs and outputs
- allowed capability plugins
- allowed skills
- model/tool policy
- audit events
- development-mode restrictions

LiNKbot may work inside vertical plugins and also help maintain core services such as LinkSkills, LiNKbrain, and LiNKautowork. They remain thin runtime workers, not owners of memory, permissions, workflow state, or integration secrets.

## Mode Model

Every vertical and capability plugin must distinguish:

- **development mode:** local or mock side effects, local artifact storage, local services where possible
- **shadow mode:** validates real external connectivity/readiness without production writes
- **live mode:** real external side effects, enabled only through explicit config and LinkSkills governance

## Stop-And-Ask Rule

If an agent does not know the workflow for a vertical plugin, capability workflow, or vertical-capability combination, it must stop and ask before implementing. Do not develop based on what the agent thinks the workflow should be.
