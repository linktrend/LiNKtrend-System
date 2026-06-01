# WP-105 - LEXOS LiNKautowork Workflow Hooks

## Objective

Define deterministic LiNKautowork workflow hook contracts for LEXOS W0-W11 stages, with development-mode stubs only.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-105-lexos-autowork-workflow-hooks`
- Base: `origin/development`

## Allowed files

- `LiNKautowork/gateway/src/workflows/lexos.ts`
- `LiNKautowork/gateway/src/workflows/lexos.test.ts`
- `LiNKautowork/gateway/src/workflows/index.ts`
- `.ai-swarm/LEXOS_AUTOWORK_WORKFLOW_HOOKS.md`
- `.ai-swarm/AGENT_REPORTS/WP-105-lexos-autowork-workflow-hooks.md`

## Prohibited files

- No live legal research API calls
- No court filing or production document submission
- No external CRM, Plane, storage, or provider writes
- No schema or SDK contract changes unless a compile blocker requires a tiny import/export fix

## Required context

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `packages/linklogic-sdk/src/lexos-contracts.ts`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `LiNKautowork/gateway/src/workflows/websitefactory.ts`

## Steps

1. Add a LEXOS workflow module with registered handles from `LexosWorkflowHandleSchema`.
2. Implement deterministic development-mode handlers that validate required inputs, require lease/idempotency where side effects are implied, and return canonical outputs or canonical failures.
3. Add tests for successful stub paths, missing lease/idempotency failures, and live-mode rejection.
4. Document workflow hook mapping and handoff expectations.
5. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- All handles in `LexosWorkflowHandleSchema` are represented.
- Handlers fail closed for missing lease/idempotency on governed operations.
- Development mode produces deterministic local/stub outputs only.
- Tests cover pass and fail cases.

## Proof required

- Relevant `@linktrend/autowork-gateway` test output.
- `rg` output showing all LEXOS workflow handles are registered or documented.
- Confirmation no live external provider call is introduced.
