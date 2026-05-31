# Capability Connectors

Capability connectors are governed LinkSkills connections to external software, services, or provider APIs.

This folder is the canonical home for connector declarations, contracts, readiness notes, mode posture, and connector-specific docs. Runtime handler code may remain in `LiNKskills/services/logic-engine` until migration-safe extraction is complete.

See `../../docs/architecture/system-completion-targets.md` for the LinkSkills completion target.

## Connector Responsibilities

- capability ID and display name
- supported operations
- tenant configuration refs
- credential refs, never raw secrets
- mode flags: mock, shadow, live
- lease permission requirements
- idempotency rules
- audit events
- failure mapping
- allowed callers

## Connector Non-Responsibilities

- defining a module workflow
- inventing business configuration inside the external software
- storing real credentials
- bypassing LinkSkills leases

## Layout (Tier 2 consolidation)

| Path | Purpose |
|------|---------|
| `cap.*.yaml` (root) | LiNKapps and cross-suite connector declarations (canonical). |
| `lexos/` | LEXOS practice-area capability plugin manifests. |
| `catalog/` | Cross-vertical catalog seeds and loader guidance (WP-114). |
| `linksites/` | LinkSites-specific connector packaging (e.g. manifest.ts). |

Kernel copies under `packages/linkaios-kernel/plugins/capabilities/` are deprecated stubs for linkapps only until Tier 2 linkapps removal; LEXOS and catalog moved here.

## Connector Registry

See `connector-registry.md`.

## Completed-State Target

LinkSkills is operationally complete when every module-facing external action is represented by a connector, every connector is discoverable and mode-aware, every side effect is lease-gated and auditable, and operators can see readiness, approvals, idempotency, kill switches, and execution evidence before live use.
