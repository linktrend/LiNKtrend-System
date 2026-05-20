# Swarm Coordination Model v2

## Principle

The repo is the coordination system. Chat memory is not.

Cursor chats, Codex threads, Antigravity sessions, and Kimi/Gemini analysis sessions are isolated. The project must coordinate through files.

## Command Center

Create this folder in the LiNKaios monorepo, likely `LiNKtrend-System`:

```text
.ai-swarm/
```

Required structure:

```text
.ai-swarm/
├── MASTER_PLAN.md
├── ARCHITECTURE_RULES.md
├── AGENT_COORDINATION.md
├── REPO_INVENTORY.md
├── CONTRACTS_MVO.md
├── DECISIONS.md
├── INTEGRATION_QUEUE.md
├── MERGE_QUEUE.md
├── WORK_PACKETS/
└── AGENT_REPORTS/
```

## Add The Architect Review Report

The architect review report should be added as:

```text
.ai-swarm/ARCHITECT_REVIEW_REPORT.md
```

This report becomes the starting map for repo reuse. Agents should not ignore it.

## Live Coordination File

`AGENT_COORDINATION.md` should show:

- global status
- active agents
- current work packets
- current branch/worktree per agent
- Day-1 frozen decisions
- blockers
- integration queue
- merge queue

## Agent Reports

Each agent writes to one report:

```text
.ai-swarm/AGENT_REPORTS/linkbrain-agent.md
.ai-swarm/AGENT_REPORTS/linkskills-agent.md
.ai-swarm/AGENT_REPORTS/linkautowork-agent.md
.ai-swarm/AGENT_REPORTS/linkbot-agent.md
.ai-swarm/AGENT_REPORTS/linkaios-agent.md
.ai-swarm/AGENT_REPORTS/integration-agent.md
```

Each report must include:

- assigned work packet
- current status
- files changed
- commands run
- tests/proof
- blockers
- decisions needed
- next step

## Coordination Rules

Agents do not rely on each other’s chat history. Agents read:

- `ARCHITECTURE_RULES.md`
- `ARCHITECT_REVIEW_REPORT.md`
- `REPO_INVENTORY.md`
- `CONTRACTS_MVO.md`
- their assigned work packet
- their agent report

## Human Role

Carlos supervises checkpoints, does not manually relay every message. Agents write to files. The Integrator reads those files and merges.
