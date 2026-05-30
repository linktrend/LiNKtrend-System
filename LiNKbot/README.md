# LiNKbot

LiNKbot is the role-bound worker plane.

See `../docs/architecture/system-completion-targets.md` for the platform completion target.

## Owns

- runtime adapters for bot engines
- shared and module-specific role definitions
- fleet, deployment, and session ownership docs
- engine-specific identity/persona/soul packaging rules
- bot communication profiles and mission context mapping

## Runtime Adapters

OpenClaw is the first runtime adapter. Future engines such as Agent Zero and Agent Hermes must be added under `runtime-adapters/` without changing the module contract.

## Roles

Roles are engine-agnostic declarations. A role may include engine-specific files, but the role itself should define:

- purpose and responsibilities
- allowed modules
- allowed capability connectors
- allowed skills and tools
- memory/context rules
- approval requirements
- model/runtime profile
- LiNKguard cleanup/security profile
- channel permissions
- emitted audit events

Shared organizational roles live under `roles/shared/`. Module-specific roles live under `roles/suites/<module>/`.

## Communications

Native channel implementations stay in the bot engine that owns them. This repo owns tenant routing, mission context, audit mapping, channel permission profiles, and temporary gateway gaps.

## Completed-State Target

LiNKbot is operationally complete when LiNKaios can provision role-bound bots, assign missions, route them through OpenClaw first, request LiNKbrain context, request LinkSkills leases, delegate deterministic work to LiNKautowork, emit audit/provenance events, and expose sessions, costs, roles, and incidents to operators.
