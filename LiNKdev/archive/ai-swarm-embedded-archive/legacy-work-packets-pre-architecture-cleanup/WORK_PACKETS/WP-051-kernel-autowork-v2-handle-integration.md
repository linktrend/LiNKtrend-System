# WP-051 - Kernel to LiNKautowork v2 handle integration

## Objective

Connect LiNKaios kernel dispatch to the LinkSites v2 LiNKautowork workflow handles implemented in WP-048, including lease-gated write stages and trace refs.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-051-kernel-autowork-v2-handle-integration`

## Allowed files

- `LiNKaios/linkaios-web/src/lib/kernel/**`
- `LiNKaios/linkaios-web/src/lib/plugins/**`
- `LiNKautowork/gateway/**` only for narrow imports/exports or tests
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

## Prohibited files

- Do not add live external writes.
- Do not duplicate LiNKautowork workflow implementation inside LiNKaios.
- Do not invent Payload or Supabase schema mappings.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` section `0.A.10.1`
- `.ai-swarm/WORK_PACKETS/WP-048-linkautowork-linksites-workflow-scaffold.md`
- `.ai-swarm/WORK_PACKETS/WP-051-kernel-autowork-v2-handle-integration.md`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`

## Steps

1. Find the existing kernel dispatch path for LiNKautowork workflow invocation.
2. Add v2 handle invocation wiring for artifact write, Supabase mirror upsert, Payload sync, readiness check, and CRM ready-to-contact mark.
3. Ensure side-effecting write handles carry a lease ID and fail closed when missing.
4. Persist all returned `workflow_run_id` and `audit_event_ids` into stage refs.
5. Add tests for handle invocation, missing-lease failure, readiness failure, and trace-ref persistence.
6. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Kernel can invoke the five v2 workflow handles through LiNKautowork.
- Side-effecting handles are lease-gated.
- Stage refs include workflow and audit event IDs.
- Tests prove the integration path.

## Proof required

- Relevant Linkaios kernel/plugin tests pass.
