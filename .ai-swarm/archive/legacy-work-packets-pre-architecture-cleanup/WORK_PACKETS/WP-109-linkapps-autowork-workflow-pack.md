# WP-109 - LiNKapps LiNKautowork Workflow Pack

## Objective

Create development-mode LiNKautowork workflow hooks for LiNKapps app-factory stages, using deterministic local/mock outputs and governed side-effect boundaries.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-109-linkapps-autowork-workflow-pack`
- Base: `origin/development`

## Allowed files

- `LiNKautowork/gateway/src/workflows/linkapps.ts`
- `LiNKautowork/gateway/src/workflows/linkapps.test.ts`
- `LiNKautowork/gateway/src/workflows/index.ts`
- `.ai-swarm/LINKAPPS_AUTOWORK_WORKFLOW_PACK.md`
- `.ai-swarm/AGENT_REPORTS/WP-109-linkapps-autowork-workflow-pack.md`

## Prohibited files

- No real GitHub, Supabase, Stripe, Vercel, EAS, Plane, or Zulip writes
- No production deployment
- No changes to `plugins/vertical/linkapps/manifest.yaml`
- No capability plugin implementation outside deterministic stubs

## Required context

- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`

## Steps

1. Define workflow handles for the 7 Phase 5 stages declared in the Linkapps manifest.
2. Implement deterministic development-mode handlers that validate inputs and return local/mock references.
3. Require lease and idempotency metadata for operations that would be external side effects in live mode.
4. Add tests for success paths, missing lease/idempotency failures, and live-mode rejection.
5. Document workflow handle mapping and stub behavior.
6. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- All Phase 5 stages have mapped workflow handles.
- Side-effect-capable operations fail closed without lease and idempotency key.
- Development mode never performs live external writes.
- Tests cover successful stubs and governed failures.

## Proof required

- Relevant `@linktrend/autowork-gateway` test output.
- File/handle listing for the 7 Linkapps workflow hooks.
- Confirmation no live provider client was introduced.
