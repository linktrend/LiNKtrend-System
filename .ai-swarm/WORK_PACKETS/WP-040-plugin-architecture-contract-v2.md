# WP-040 — Plugin architecture contract v2

## Objective

Replace the old one-off WebsiteFactory framing with a reusable plugin architecture contract for vertical plugins, capability plugins, LinkBot roles, LinkSkills permissions/skills, LiNKautowork hooks, LiNKbrain audit/memory, and LiNKaios orchestration.

## Owner agent

Architect / Integrator.

## Execution mode

- Cursor Architect: source-of-truth contract edits and consistency review.
- Codex: not primary unless assigned narrow schema/type follow-up after contract approval.

## Required context

- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`

## Allowed files

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/DECISIONS.md`
- `.ai-swarm/AGENT_COORDINATION.md`
- `.ai-swarm/AGENT_REPORTS/architect.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`

## Prohibited files

- Application implementation outside shared contract/type definitions.
- Payload, Odoo, Zulip, Plane, or VPS implementation.
- Any workflow assumption not approved in `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`.

## Tasks

1. Update MVO contracts so vertical plugins, capability plugins, and LinkBot role declarations are first-class.
2. Ensure LinkSkills is described as granting permissions and skills, not only permissions.
3. Add mode semantics: `development`, `shadow`, `live`.
4. Add stop-and-ask language for unknown vertical/capability workflows.
5. Update shared TypeScript/Zod contracts only if needed to represent the v2 manifest shape.

## Acceptance criteria

- Contract docs distinguish vertical plugins, capability plugins, core platform services, and LinkBots.
- No document implies capability plugins own target-app business setup.
- Existing WebsiteFactory-specific language is either replaced or clearly marked as historical v1.
- Contract tests pass if shared SDK types are edited.

## Required proof

- Files changed.
- Commands run.
- Test output for any changed TypeScript contracts.
- Agent report updated with proof and blockers.
