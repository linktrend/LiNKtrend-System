# LiNKtrend-System Repo Architecture Target

## Purpose

`LiNKtrend-System` is the operating-system repo for LiNKaios. It wires together the control plane, LiNKbot runtime adapters, workflows, memory, skills, tenant-enabled modules, and governed external software access. It is not a single product app and it should not contain full forked software systems from `/Users/linktrend/Projects`.

Use `system-completion-targets.md` for what each system must become to reach the 90-95% operational stage.

## Accepted Terms

- **Plane:** A core subsystem with a clear ownership boundary.
- **Module:** A tenant-enabled business or operational package. This replaces the old broad use of `vertical`.
- **Capability connector:** A governed LinkSkills connector to external software or provider APIs.
- **Skill:** A reusable learned/procedural capability governed by LinkSkills. Skills are not the same as capability connectors.
- **Runtime adapter:** A bridge between LiNKbot and a bot engine such as OpenClaw, Agent Zero, or Agent Hermes.
- **Mission-aware communications:** Tenant, mission, role, and audit mapping around channels. Native channel implementations stay in the engine that owns them.
- **Deployable entrypoint:** Thin package/service entrypoint needed by tooling or deployment. Ownership should still point to the subsystem.

## Core Planes

- **LiNKaios:** Organizational control plane. Owns cockpit UI, routing, approvals, tenant/module activation, work contracts, and system governance.
- **LinkSkills:** Capability governance plane. Owns leases, connector catalog, skills, tool permissions, idempotency, kill switches, approvals, and connector execution posture.
- **LiNKbrain:** Institutional memory and audit intelligence plane. Owns memory objects, event/audit ledger, retrieval, context assembly, benchmarks, and learning loops.
- **LiNKautowork:** Deterministic workflow execution plane. Owns gateway code, workflow templates, workflow runs, and the bridge to the external n8n fork.
- **LiNKbot:** Role-bound worker plane. Owns bot roles, fleet/deployment metadata, runtime adapters, communication profiles, and engine-specific role packaging.
- **LiNKguard:** Worker security and cleanup sidecar. Owns residue cleanup, filesystem policy, runtime guardrails, sidecar heartbeat, and audit hooks.

## Modules

Modules are tenant-enabled packages. A tenant may enable one module, many modules, or a custom set. Modules describe business workflows and required roles/connectors, but they do not own the external software implementation.

Each module must have one canonical workflow map in its module folder. That map is the source of truth for what happens and in what order. It should reference, not duplicate, the owning planes:

- `workflow.ts` or `workflow.md`: workflow spine, stages, inputs, outputs, gates, and completion criteria.
- `roles.ts` or `roles.md`: LiNKbot roles used by each stage.
- `capabilities.ts` or `capabilities.md`: LinkSkills capability connectors and lease posture.
- `audit-events.ts` or `audit-events.md`: LiNKbrain audit and memory events.
- `plane-tasks.ts` or `plane-tasks.md`: Plane project/task expectations.
- `manifest.ts` or `manifest.yaml`: module registration surface consumed by LiNKaios.

Implementation still lives with the owning system. Deterministic handlers live in `LiNKautowork/`, bot role packs in `LiNKbot/`, connector definitions in `LiNKskills/`, memory/audit contracts in `LiNKbrain/`, and product/template code in the external module repo when one exists.

Canonical module examples:

- `modules/linksites`
- `modules/linkapps`
- `modules/linktrend-media`
- `modules/lexos/litigation`
- `modules/accounting`
- `modules/finance`
- `modules/legal-department`
- `modules/business-development`
- `modules/dental-clinic`
- `modules/restaurant`

LEXOS is a module family. Litigation is the first practice area; intellectual property and corporate are reserved future areas.

## Capability Connectors

All capability connectors live under LinkSkills. A connector may be used by any module even if it was first created for a specific one.

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
- allowed modules
- allowed capability connectors
- allowed skills and tools
- memory/context rules
- model/runtime profile
- LiNKguard cleanup/security profile
- channel permissions
- emitted audit events

Native channel implementations remain in the owning bot engine. For OpenClaw, Slack, Telegram, WhatsApp, Discord, Matrix, Mattermost, Google Chat, MS Teams, Signal, LINE, IRC, and similar channels are not duplicated in this repo. This repo owns channel profiles, mission context, tenant routing, audit mapping, and temporary gaps such as Zulip until native support is adopted and verified.

## Deployable Entrypoints

Deployable entrypoints live under their owning subsystem. Do not recreate a generic `apps/` folder for new work.

Current deployable package homes:

- `LiNKaios/linkaios-web` belongs to LiNKaios.
- `LiNKbot/runtime-adapters/openclaw/bot-runtime` belongs to LiNKbot.
- `LiNKbot/runtime-adapters/openclaw/openclaw-shim` belongs to LiNKbot.
- `LiNKbot/communications/temporary-gateways/zulip` belongs to LiNKbot communications while temporary.
- `LiNKguard/sidecar/linkguard` belongs to LiNKguard.

## External Repos

Forked software in `/Users/linktrend/Projects/link-*` remains separate. This repo references those systems through capability connectors, module manifests, workflow handles, and docs.

## Migration Rule

Prefer migration-safe moves:

1. Add architecture docs and ownership READMEs.
2. Move declarations/manifests before runtime code.
3. Keep compatibility entrypoints or re-exports during transition.
4. Verify after every wave.
5. Record final ownership changes in `dev-swarm/command-center/DECISIONS.md` and `dev-swarm/command-center/REPO_INVENTORY.md`.
