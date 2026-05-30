# LiNKtrend-System Repo Architecture Target

## Purpose

`LiNKtrend-System` is the operating-system repo for LiNKaios. It wires together the control plane, LiNKbot runtime adapters, workflows, memory, skills, tenant-enabled suites, and governed external software access. It is not a single product app and it should not contain full forked software systems from `/Users/linktrend/Projects`.

Use `system-completion-targets.md` for what each system must become to reach the 90-95% operational stage.

**Terminology:** See [`docs/terminology.md`](../terminology.md) for the canonical LiNKaios hierarchy (Suite → Module → Project → Phase → Issue → Assignee → Run), integration labels, and repo folder mapping.

## Accepted Terms

- **Plane:** A core subsystem with a clear ownership boundary.
- **Suite:** A tenant-enabled business or operational product package. This replaces the old broad use of `vertical` and the former repo meaning of `Module` for product packages (LinkSites, LiNKapps, …).
- **Module:** A vendor-published recipe inside a suite (phases, issues, assignees). Not the same as a Suite or a Plane Module — see `docs/terminology.md`.
- **Capability connector:** A governed LinkSkills connector to external software or provider APIs. Internal LinkSkills/repo term; LiNKaios UI says **Capability**.
- **Skill:** A reusable learned/procedural capability governed by LinkSkills. Skills are not the same as capability connectors.
- **Runtime adapter:** A bridge between LiNKbot and a bot engine such as OpenClaw, Agent Zero, or Agent Hermes.
- **Project-aware communications:** Tenant, project, role, and audit mapping around channels. Native channel implementations stay in the engine that owns them.
- **Deployable entrypoint:** Thin package/service entrypoint needed by tooling or deployment. Ownership should still point to the subsystem.

## Core Planes

- **LiNKaios:** Organizational control plane. Owns cockpit UI, routing, approvals, tenant/suite activation, work contracts, and system governance.
- **LinkSkills:** Capability governance plane. Owns leases, connector catalog, skills, tool permissions, idempotency, kill switches, approvals, and connector execution posture.
- **LiNKbrain:** Institutional memory and audit intelligence plane. Owns memory objects, event/audit ledger, retrieval, context assembly, benchmarks, and learning loops.
- **LiNKautowork:** Deterministic workflow execution plane. Owns gateway code, workflow templates, workflow runs, and the bridge to the external n8n fork. LiNKaios UI labels these **Automations**.
- **LiNKbot:** Role-bound worker plane. Owns bot roles, fleet/deployment metadata, runtime adapters, communication profiles, and engine-specific role packaging.
- **LiNKguard:** Worker security and cleanup sidecar (formerly PRISM Defender). Owns residue cleanup, filesystem policy, runtime guardrails, sidecar heartbeat, and audit hooks.

## Suites

Suites are tenant-enabled product packages. A tenant may enable one suite, many suites, or a custom set. Suites describe business workflows and required roles/capability connectors, but they do not own the external software implementation.

> **Folder:** Suite declarations live under `suites/`. See `docs/terminology.md` for the full map.

Each suite must have one canonical workflow map in its suite folder. That map is the source of truth for what happens and in what order. It should reference, not duplicate, the owning planes:

- `workflow.ts` or `workflow.md`: workflow spine, stages, inputs, outputs, gates, and completion criteria.
- `roles.ts` or `roles.md`: LiNKbot roles used by each stage.
- `capabilities.ts` or `capabilities.md`: LinkSkills capability connectors and lease posture.
- `audit-events.ts` or `audit-events.md`: LiNKbrain audit and memory events.
- `plane-tasks.ts` or `plane-tasks.md`: Plane project/task expectations.
- `manifest.ts` or `manifest.yaml`: suite registration surface consumed by LiNKaios.

Implementation still lives with the owning system. Deterministic handlers live in `LiNKautowork/`, bot role packs in `LiNKbot/`, connector definitions in `LiNKskills/`, memory/audit contracts in `LiNKbrain/`, and product/template code in the external suite repo when one exists.

Canonical suite examples (target paths):

- `suites/linksites`
- `suites/linkapps`
- `suites/linktrend-media`
- `suites/lexos/litigation`
- `suites/accounting`
- `suites/finance`
- `suites/legal-department`
- `suites/business-development`
- `suites/dental-clinic`
- `suites/restaurant`

LEXOS is a suite family. Litigation is the first practice area; intellectual property and corporate are reserved future areas.

## Capability Connectors

All capability connectors live under LinkSkills. A connector may be used by any suite even if it was first created for a specific one. In LiNKaios UI and operator-facing docs, refer to these as **Capabilities**.

Connectors are responsible for:

- configuration surface
- authentication and credential refs
- capability contract
- lease/audit hooks
- idempotency and mode flags
- communication path to external software or provider

Connectors are not responsible for inventing the target software's internal business setup unless explicitly assigned.

## LiNKbot And Communication

LiNKbot is engine-agnostic as a system. Individual LiNKbots can run through OpenClaw first, then Agent Zero, Agent Hermes, and future engines through runtime adapters.

Role definitions include:

- identity/persona/soul files where the engine uses them
- role purpose and duties
- allowed suites
- allowed capability connectors
- allowed skills and tools
- memory/context rules
- model/runtime profile
- LiNKguard cleanup/security profile
- channel permissions
- emitted audit events

Native channel implementations remain in the owning bot engine. For OpenClaw, Slack, Telegram, WhatsApp, Discord, Matrix, Mattermost, Google Chat, MS Teams, Signal, LINE, IRC, and similar channels are not duplicated in this repo. This repo owns channel profiles, project context, tenant routing, audit mapping, and temporary gaps such as Zulip until native support is adopted and verified.

## Deployable Entrypoints

Deployable entrypoints live under their owning subsystem. Do not recreate a generic `apps/` folder for new work.

Current deployable package homes:

- `LiNKaios/linkaios-web` belongs to LiNKaios.
- `LiNKbot/runtime-adapters/openclaw/bot-runtime` belongs to LiNKbot.
- `LiNKbot/runtime-adapters/openclaw/openclaw-shim` belongs to LiNKbot.
- `LiNKbot/communications/temporary-gateways/zulip` belongs to LiNKbot communications while temporary.
- `LiNKguard/sidecar/linkguard` belongs to LiNKguard.

## External Repos

Forked software in `/Users/linktrend/Projects/link-*` remains separate. This repo references those systems through capability connectors, suite manifests, workflow handles, and docs.

## Migration Rule

Prefer migration-safe moves:

1. Add architecture docs and ownership READMEs.
2. Move declarations/manifests before runtime code.
3. Keep compatibility entrypoints or re-exports during transition.
4. Verify after every wave.
5. Record final ownership changes in `LiNKdev/product/grounding/DECISIONS.md` and `LiNKdev/product/grounding/REPO_INVENTORY.md`.
