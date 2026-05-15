# WP-065 - LiNKbrain audit-envelope mapping for LinkBot flow

## Objective

Map LinkBot lifecycle, LinkSkills capability events, and LiNKautowork workflow events into canonical LiNKbrain envelope.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow`

## Allowed files

- `apps/linkaios-web/**` (audit bridge)
- `packages/shared-types/**`
- `packages/observability/**`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`

## Prohibited files

- No alternate canonical audit store
- No incompatible event taxonomy rename

## Required context

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.7 and §0.A.10

## Acceptance criteria

- Required events normalized into envelope
- End-to-end trace queryable by `run_id` + `stage_id`

## Proof required

- Mapping table and integration proof fixture/test
