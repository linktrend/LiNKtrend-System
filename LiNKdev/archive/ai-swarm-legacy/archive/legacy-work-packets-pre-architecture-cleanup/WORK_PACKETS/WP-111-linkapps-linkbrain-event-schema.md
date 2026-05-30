# WP-111 - LiNKapps LiNKbrain Event Schema

## Objective

Define LiNKbrain audit and memory event schemas for LiNKapps app-factory runs, squad decisions, workflow handoffs, and delivery artifacts.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-111-linkapps-linkbrain-event-schema`
- Base: `origin/development`

## Allowed files

- `packages/linklogic-sdk/src/linkapps-brain-events.ts`
- `packages/linklogic-sdk/src/linkapps-brain-events.test.ts`
- `packages/linklogic-sdk/src/index.ts`
- `.ai-swarm/LINKAPPS_LINKBRAIN_EVENT_SCHEMA.md`
- `.ai-swarm/AGENT_REPORTS/WP-111-linkapps-linkbrain-event-schema.md`

## Prohibited files

- No LiNKautowork workflow implementation
- No Linkapps provider/provisioning implementation
- No database migration unless strictly needed and separately documented as deferred

## Required context

- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `packages/linklogic-sdk/src/brain-memory.ts`
- `packages/linklogic-sdk/src/brain-benchmarks.ts`
- `packages/linklogic-sdk/src/contracts-mvo.ts`

## Steps

1. Define Zod schemas for LiNKapps run events, squad decision events, capability lease summaries, and handoff artifact memory objects.
2. Keep PII/customer data out of event payloads; use references and redaction flags.
3. Export schemas/types from the SDK index without colliding with existing names.
4. Add unit tests for valid payloads, invalid payloads, and PII guardrails.
5. Document the event schema and memory handoff expectations.
6. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Linkapps event/memory schemas compile and are exported.
- Tests cover accepted and rejected payload shapes.
- Payloads preserve LiNKbrain ownership of memory/audit without embedding provider secrets or tenant-sensitive details.

## Proof required

- `@linktrend/linklogic-sdk` focused test output.
- `@linktrend/linklogic-sdk` build output.
- Confirmation schema names do not collide with existing SDK exports.
