# WP-063 - LiNKaios ingress fail-closed governance adapter

## Objective

Make LiNKaios -> LinkBot dispatch fail closed when required `linktrendGovernance` fields are absent or invalid.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-063-linkaios-ingress-fail-closed-governance-adapter`

## Allowed files

- `apps/linkaios-web/**` (dispatch/orchestration surfaces only)
- `packages/shared-types/**` (contract updates)
- `packages/shared-config/**` (governance flags)
- `dev-swarm/reports/legacy-ai-swarm/linkaios-agent.md`
- `dev-swarm/command-center/DECISIONS.md` (if policy decision needed)

## Prohibited files

- No capability connector runtime implementation.
- No bypass mode that silently downgrades required governance checks.

## Required context

- `dev-swarm/command-center/LINKBOT_ADAPTER_PLAN.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- `dev-swarm/command-center/LINKBOT_CORE_SYNC_READINESS.md`

## Acceptance criteria

- Missing governance payload causes deterministic fail-closed rejection.
- Rejection reason maps to canonical failure taxonomy.
- Audit event emitted for denied dispatch.

## Proof required

- Typecheck/test evidence for changed packages/apps.
- One failing and one passing dispatch-path test case.
