# Agent Prompts

Use this folder only for active, not-yet-launched prompt payloads.

Older packet prompts were moved to `.ai-swarm/archive/legacy-work-packets-pre-architecture-cleanup/AGENT_PROMPTS/` because they contain pre-cleanup folder paths such as `plugins/vertical`, `LiNKbot/runtime-adapters/openclaw/bot-runtime`, and older product casing. They are historical evidence, not launch instructions.

New prompts must use:

- `docs/architecture/repo-architecture-target.md`
- `.ai-swarm/REPO_INVENTORY.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`

Do not copy old archived prompts without updating paths and terminology.

## Required Clean Worktree Block

Every new large-wave prompt must include this requirement in its branch workflow:

```text
Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.
```

## Current Status

There are no active launch prompts after the architecture cleanup. Create new prompt files here only for the next approved development wave.
