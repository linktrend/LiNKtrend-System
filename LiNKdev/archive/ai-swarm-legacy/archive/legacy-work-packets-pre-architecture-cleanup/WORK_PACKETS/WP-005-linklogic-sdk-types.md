# WP-005 — LinkLogic SDK contract types

## Objective

Pin the shared TypeScript/Zod contract types from `CONTRACTS_MVO.md` in `packages/linklogic-sdk` so all implementation agents bind to the same names and shapes.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/DECISIONS.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/ARCHITECTURE_RULES.md`

## Allowed files

- `packages/linklogic-sdk/**`
- package-level tests for `packages/linklogic-sdk`
- `.ai-swarm/AGENT_REPORTS/architect.md`

## Prohibited files

- Application UI files outside `packages/linklogic-sdk`
- Service implementation files in `apps/**` or external sibling repos
- Secrets, env files, deployment config, lockfiles unless a local package script requires a generated change

## Tasks

1. Inspect existing `packages/linklogic-sdk` structure and export patterns.
2. Add shared contract schemas/types for:
   - `PluginManifest`, `Plane`, `FailureMode`
   - `LeadInput`, `WorkRequest`, `Run`, `Stage`, status unions
   - `FailureReport`
   - `BotReasonRequest` / `BotReasonResult`
   - `LeaseRequest` / `LeaseDecision` / `LeaseExecuteRequest` / `LeaseExecuteResult`
   - `AuditEvent` / `AuditWriteResult`
   - `WorkflowInvokeRequest` / `WorkflowInvokeResult`
   - capability args/results for `crm.upsert`, `plane.project.create`, `plane.task.create`, `preview.publish`
   - `PreviewOutput`
3. Export the types through the existing SDK public entrypoint.
4. Add focused validation tests if the package has a test pattern.
5. Update `.ai-swarm/AGENT_REPORTS/architect.md` with files changed, commands run, proof, blockers, and next step.

## Acceptance criteria

- Shared types use the exact canonical names from `CONTRACTS_MVO.md`.
- Validation rejects unknown planes, unknown statuses, invalid audit envelope basics, and missing required fields.
- No service-specific implementation logic is introduced.
- Downstream packets can import from `packages/linklogic-sdk` instead of redefining contracts.

## Required proof

- Test/typecheck command output, or a clear explanation if no package-local test command exists.
- Agent report lists exported symbols and files changed.

## Out of scope

Implementing LiNKaios orchestration, LiNKbrain persistence, LinkSkills leases, workflows, bot reasoning, CRM/Plane stubs, or UI.
