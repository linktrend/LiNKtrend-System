# WP-118 - LiNKautowork Run Control Integration

## Objective

Wire LiNKautowork run control primitives into workflow invocation paths so pause/cancel state is enforced consistently in deterministic workflow execution.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-118-linkautowork-run-control-integration`
- Base: `origin/development`

## Allowed files

- `LiNKautowork/gateway/src/lib/run-controller.ts`
- `LiNKautowork/gateway/src/lib/run-controller.test.ts`
- `LiNKautowork/gateway/src/lib/workflow-runner.ts`
- `LiNKautowork/gateway/src/lib/workflow-runner.test.ts`
- `LiNKautowork/gateway/src/workflows/**` only for test fixture support
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-118-linkautowork-run-control-integration.md`

## Prohibited files

- No provider clients.
- No LinkSites/LEXOS/Linkapps business behavior changes.
- No external side effects.

## Required context

- `LiNKautowork/gateway/src/lib/run-controller.ts`
- `LiNKautowork/gateway/src/lib/workflow-runner.ts`
- `LiNKdev/product/grounding/LINKAUTOWORK_COMPLETION_PLAN.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`

## Steps

1. Inspect current run-controller and workflow-runner behavior.
2. Enforce pause/cancel checks at the smallest shared workflow invocation point.
3. Add tests for running, paused, cancelled, and idempotent replay behavior.
4. Preserve existing retry/idempotency semantics.
5. Run focused Autowork tests.
6. Update the packet-specific report.

## Acceptance criteria

- Paused/cancelled runs fail closed or return canonical controlled status before side effects.
- Existing LinkSites, LEXOS, and LiNKapps workflow tests still pass.
- No live external writes are introduced.

## Proof required

- `pnpm --filter @linktrend/autowork-gateway test -- run-controller workflow-runner linksites-v2 lexos linkapps` output or exact equivalent.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
