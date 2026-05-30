# Agent Prompts

Use this folder only for active, not-yet-launched prompt payloads.

Older packet prompts were moved to `dev-swarm/product/grounding/archive/legacy-work-packets-pre-architecture-cleanup/AGENT_PROMPTS/` because they contain pre-cleanup folder paths such as `plugins/vertical`, `LiNKbot/runtime-adapters/openclaw/bot-runtime`, and older product casing. They are historical evidence, not launch instructions.

New prompts must use:

- `docs/architecture/repo-architecture-target.md`
- `dev-swarm/product/grounding/REPO_INVENTORY.md`
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

## Required Completion Block

Every implementation prompt must require the agent to finish with a durable handoff:

```text
Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
```

## Parallel Wave Rule

Do not put dependent packets in the same parallel wave. If packet B needs packet A's topology, generated files, reports, or code, packet A must finish, commit, and pass Integrator verification before packet B is launched.

## Current Status

There are no active launch prompts after the architecture cleanup. Create new prompt files here only for the next approved development wave.
