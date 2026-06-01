# WP-204 — LiNKautowork Workflow Completion

## Objective

Complete LiNKautowork MVO workflow execution: template registry, idempotency, retry/backoff, workflow audit refs, operator controls, health/status reporting, and gateway-to-external-n8n documentation.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-204-linkautowork-workflow-completion`
- Branch: `wp-204-linkautowork-workflow-completion`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `LiNKautowork/`
- Workflow contracts in `packages/linklogic-sdk/`
- LiNKaios display/control panel integration if needed
- Related tests
- `.ai-swarm/AGENT_REPORTS/`

## Prohibited Files

- Editing external n8n fork at `/Users/linktrend/Projects/LiNKautowork`
- LinkSkills lease ownership
- LiNKbrain memory ownership
- Real secrets or production workflow execution

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `LiNKautowork/templates/README.md`

## Steps

1. Inspect current gateway, template, idempotency, and WebsiteFactory workflow code.
2. Complete deterministic workflow run behavior with audit refs and status visibility.
3. Harden idempotency and retry/backoff behavior.
4. Ensure operator controls/status can be shown through LiNKaios.
5. Document external n8n fork boundary and dev/shadow/live promotion path.

## Acceptance Criteria

- WebsiteFactory workflow execution is repeatable and auditable.
- Template declarations are validated and usable by gateway/runtime code.
- Health/status/controls are visible enough for MVO operator use.

## Proof Required

- `pnpm --filter @linktrend/autowork-gateway typecheck`
- `pnpm --filter @linktrend/autowork-gateway test`
- WebsiteFactory workflow proof command or focused integration test
- External n8n boundary note

## Report File

Update `.ai-swarm/AGENT_REPORTS/WP-204-linkautowork-workflow-completion.md`.
