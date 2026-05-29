# WP-063 - LiNKaios ingress fail-closed governance adapter

## Objective

Enforce fail-closed validation on LiNKaios dispatch to LiNKbot when required governance payload fields are missing/invalid.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-063-linkaios-ingress-fail-closed-governance-adapter`

## Allowed files

- `LiNKaios/linkaios-web/**` (dispatch/orchestration only)
- `packages/shared-types/**`
- `packages/shared-config/**`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`

## Prohibited files

- No capability runtime implementation
- No silent governance downgrade/bypass

## Required context

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md`

## Acceptance criteria

- Missing governance payload fails closed deterministically
- Rejection maps to canonical failure code
- Denied dispatch audit event emitted

## Proof required

- Typecheck/tests for pass and fail dispatch cases
