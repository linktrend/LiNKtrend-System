# WP-055 - Postiz distribution capability scaffold

## Objective

Define and scaffold the Postiz capability surface for future Linktrend Media / marketing distribution workflows without live publishing.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-055-postiz-distribution-capability-scaffold`

## Allowed files

- `.ai-swarm/**`
- `LiNKskills/services/logic-engine/**`
- `LiNKaios/linkaios-web/src/**` only for config/env placeholders or mock adapter registration
- `.env.example`

## Prohibited files

- Do not publish live social posts.
- Do not configure live Postiz accounts, channels, or campaigns.
- Do not invent final Linktrend Media workflow.
- Do not store or commit secrets.

## Required context

- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/WORK_PACKETS/WP-055-postiz-distribution-capability-scaffold.md`

## Steps

1. Discover any existing Postiz references in the repo.
2. Define/scaffold mock/shadow-safe operations such as `connectivity.probe`, `draft.create_mock`, `schedule.mock`, and `status.read`.
3. Keep live publishing disabled until the Linktrend Media / marketing distribution vertical plugin is defined.
4. Define lease requirements, idempotency, audit events, allowed callers, env placeholders, and canonical failure mapping.
5. Add tests or docs proof appropriate to the touched surface.
6. Update the relevant agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Postiz is prepared as a governed distribution capability.
- No live post or real account configuration is performed.
- The capability can be plugged into a future Linktrend Media vertical.

## Proof required

- Search evidence and changed-file summary.
- Passing tests if code is changed; otherwise docs/report proof.
