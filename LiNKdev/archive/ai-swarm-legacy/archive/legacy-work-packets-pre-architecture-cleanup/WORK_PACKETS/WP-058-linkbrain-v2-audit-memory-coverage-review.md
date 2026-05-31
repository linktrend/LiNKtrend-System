# WP-058 - LiNKbrain v2 audit and memory coverage review

## Objective

Review whether the LinkSites v2 flow and platform planes produce the required LiNKbrain audit/memory coverage, then identify concrete gaps before the v2 E2E proof.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-058-linkbrain-v2-audit-memory-coverage-review`

## Allowed files

- `.ai-swarm/LINKBRAIN_V2_COVERAGE_REVIEW.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`
- `packages/linklogic-sdk/src/**` only for read-only analysis unless a tiny test/doc update is necessary
- `services/migrations/*.sql` read-only unless a blocker requires an additive wrapper and Integrator approval

## Prohibited files

- Do not implement new memory schema without explicit follow-up packet.
- Do not weaken audit requirements.
- Do not hide missing audit/memory requirements as "future work" without owner.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.cursor/rules/04-mvo-scope-and-stubbing.mdc`
- `services/migrations/023_linkbrain_audit_envelope.sql`
- `services/migrations/026_linkbrain_rpc_wrapper.sql`
- `.ai-swarm/WORK_PACKETS/WP-058-linkbrain-v2-audit-memory-coverage-review.md`

## Steps

1. Map every LinkSites v2 step to required LiNKbrain audit events and memory/context expectations.
2. Compare the contract expectations to current migrations, SDK schemas, kernel dispatch, LinkSkills outputs, and LiNKautowork outputs.
3. Identify missing event actions, subject refs, wrappers, visibility gaps, and E2E assertions.
4. Produce a gap matrix with owner packet recommendations.
5. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Coverage matrix exists and is actionable.
- No audit/memory requirement is dropped.
- Follow-up blockers are clearly assigned.

## Proof required

- Search/read evidence and a final coverage matrix.
