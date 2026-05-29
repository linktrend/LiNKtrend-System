# WP-065 - LiNKbrain audit envelope mapping for LinkBot flow

## Objective

Map LinkBot governance/runtime lifecycle and LinkSkills/LiNKautowork events into canonical LiNKbrain audit envelope.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow`

## Allowed files

- `apps/linkaios-web/**` (orchestrator/audit bridge only)
- `packages/shared-types/**`
- `packages/observability/**`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`

## Prohibited files

- No alternate ad hoc event store as canonical source.
- No event name rewrites that break existing taxonomy compatibility.

## Required context

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.7 and §0.A.10

## Acceptance criteria

- Required lifecycle events are normalized and persisted in envelope format.
- Event chain can be traced by `run_id` and `stage_id` end-to-end.

## Proof required

- Event mapping table committed in code/docs.
- Integration test or fixture proving end-to-end trace continuity.
