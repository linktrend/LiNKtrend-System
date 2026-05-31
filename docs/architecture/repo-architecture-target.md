# LiNKtrend-System repo architecture target

## Purpose

**LiNKtrend-System** is the monorepo for **LiNKaios** (LiNKtrend System): the AI-native company operating system. It wires the control plane, execution planes, tenant-enabled **suites**, and governed **capabilities**. It is not a single vertical app and it does not host full forked third-party products.

**Completion bar:** `docs/architecture/system-completion-targets.md`  
**Vocabulary:** `docs/terminology.md`  
**Product truth:** `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`

## LiNKtrend System = LiNKaios

One product, two primary surfaces:

| Surface | Audience |
|---------|----------|
| **LiNKaios Client** | Licensee companies — run suites, projects, issues, traces |
| **LiNKtrend Admin** | Vendor/licensor — tenants, suite catalogue, capabilities, fleet |

## Planes (components, not separate products)

These subsystems have clear ownership boundaries **inside** LiNKaios. They must not absorb one another’s responsibilities.

| Plane | Owns |
|-------|------|
| **LiNKaios** | UI/kernel, routing, approvals, tenant/suite/project orchestration, work contracts, traces |
| **LinkSkills** | Capability connectors, leases, skills, tools, idempotency, kill switches, approvals |
| **LiNKbrain** | Event ledger, memory objects, audit union, context assembly, Librarian loop, learning |
| **LiNKautowork** | Deterministic workflow gateway, templates, runs (UI: **Automation**) |
| **LiNKbot** | Runtime adapters, role packs, communication profiles, mission payloads |
| **LiNKguard** | Worker cleanup, skill IP wipe, confidentiality/anonymization hooks |

## Accepted terms

- **Suite** — Tenant-enabled business process package (LinkSites, LinkApps, LEXOS, …).
- **Module** — Vendor recipe inside a suite (phases, issues, template assignees).
- **Phase** — Stage group inside a module.
- **Issue** — Atomic governed task.
- **Assignee** — LiNKbot or LiNKautowork automation on an issue.
- **Capability** — Governed integration to external software (LinkSkills `capability-connectors/`).
- **Project** — Tenant live work instance (maps to Plane project / Zulip stream when synced).

## Suites in this repo

Suite **orchestration** lives under `suites/`. Each active suite needs a canonical workflow map in its folder (`workflow.md` / `workflow.ts`, roles, capabilities, audit events, Plane expectations, manifest).

| Suite | MVO |
|-------|-----|
| **`suites/linksites`** | **In scope** — full commercial loop (see MVO below) |
| `suites/linkapps`, `suites/lexos/…`, others | **Post-MVO** — declarations may exist; completion not required for Principal demo |

Suite maps **reference** owning planes; they do not duplicate implementation:

- Deterministic steps → `LiNKautowork/`
- Role packs → `LiNKbot/roles/suites/`
- Connectors → `LinkSkills/capability-connectors/`
- Memory/audit contracts → `LiNKbrain/`
- **LinkSites** site factory, Payload, VPS publish → **external `LiNKsites` repo**

## Capabilities

All capability connectors live under **LinkSkills**. Default **v1** studio capabilities: **Zulip**, **Plane**. Others attach per suite (e.g. Odoo for accounting).

Connectors provide: config surface, credential refs, contract, lease/audit hooks, idempotency/modes — not invented business setup inside Odoo/Plane unless explicitly assigned.

## MVO scope (this repo)

MVO is **not phased**. This monorepo must support:

- LiNKaios **Client** + **Admin** surfaces
- **LinkSites** suite orchestration end-to-end with real traces, leases, events, and capability calls into external publish stack
- Default v1 **Zulip** + **Plane** capability paths operational for the demo

Publish URL pattern (Principal): `businessname.linktrend.media` via Payload + VPS — implemented in **LiNKsites**; orchestrated and visible from LiNKaios here.

## LiNKbot and communication

Engine-native channels stay in engine forks. This repo owns profiles, tenant/project routing, audit mapping, and temporary gateways (e.g. Zulip under `LiNKbot/communications/temporary-gateways/` until native support is verified).

## Deployable entrypoints

| Entrypoint | Owner |
|------------|-------|
| `LiNKaios/linkaios-web` | LiNKaios (Client + Admin) |
| `LiNKbot/runtime-adapters/…` | LiNKbot |
| `LiNKguard/sidecar/linkguard` | LiNKguard |

Do not add a generic root `apps/` folder for new work.

## External repos

| Repo | Relationship |
|------|----------------|
| **`LiNKsites`** | Site templates, Payload CMS, build/publish — **required for MVO** |
| `link-*` forks (n8n, Odoo, …) | Referenced via capabilities; not copied into this monorepo |
| `LiNKtrend-LEXOS`, `LiNKapps` | Post-MVO references |

## Migration rule

1. Architecture docs and ownership READMEs first.
2. Move manifests/declarations before runtime code.
3. Compatibility shims during transition.
4. Verify each wave.
5. Record decisions in `LiNKdev/product/grounding/DECISIONS.md` and `REPO_INVENTORY.md` (LiNKdev only — agents do not invent paths there).
