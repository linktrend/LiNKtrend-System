# WP-205 — LiNKbot Runtime Completion

## Objective

Complete LiNKbot MVO runtime: OpenClaw adapter contracts, role/fleet definitions, LinkSkills lease adapter, LiNKbrain context handoff, Zulip temporary gateway behavior, and mission/session proof.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-205-linkbot-runtime-completion`
- Branch: `wp-205-linkbot-runtime-completion`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `LiNKbot/`
- LiNKbot contracts in `packages/linklogic-sdk/`
- LiNKbot-facing LiNKaios display helpers if needed
- Related tests
- `.ai-swarm/AGENT_REPORTS/`

## Prohibited Files

- External `LiNKbot-core` / OpenClaw fork code
- LinkSkills lease authority implementation
- LiNKbrain memory ownership implementation
- Real outbound messaging without explicit MVO-safe stub/lease

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `LiNKbot/README.md`

## Steps

1. Inspect current OpenClaw runtime adapter and Zulip temporary gateway.
2. Complete adapter contracts for mission/session, role/fleet, lease, and context handoff.
3. Ensure role definitions cover shared roles and module-specific roles.
4. Harden temporary Zulip gateway behavior and document replacement boundary.
5. Verify bot-runtime and zulip-gateway tests/typechecks.

## Acceptance Criteria

- LiNKbot can receive mission/context/lease instructions through clear contracts.
- OpenClaw remains an external engine boundary.
- Zulip temporary gateway is mission-aware and does not become generic capability ownership.

## Proof Required

- `pnpm --filter @linktrend/bot-runtime typecheck`
- `pnpm --filter @linktrend/bot-runtime test`
- `pnpm --filter @linktrend/zulip-gateway typecheck`
- `pnpm --filter @linktrend/zulip-gateway test`

## Report File

Update `.ai-swarm/AGENT_REPORTS/WP-205-linkbot-runtime-completion.md`.
