# Swarm Coordination Model v2

> **Host-repo planning doc (LiNKtrend-System).** Not copied with portable LiNKdev. Normative factory behavior: `LiNKdev/factory/SPEC.md`.

## Principle

The repo is the coordination system. Chat memory is not.

Cursor chats, Codex threads, Antigravity sessions, and Kimi/Gemini analysis sessions are isolated. The project must coordinate through files.

## Command Center

Use the **LiNKdev** factory in the LiNKaios monorepo (`LiNKtrend-System`):

```text
LiNKdev/
├── AGENTS.md
├── SPEC.md
├── STATE.md
├── command-center/          # plans, contracts, queues (was legacy command-center root docs)
│   ├── MASTER_PLAN.md
│   ├── ARCHITECTURE_RULES.md
│   ├── AGENT_COORDINATION.md
│   ├── REPO_INVENTORY.md
│   ├── CONTRACTS_MVO.md
│   ├── DECISIONS.md
│   ├── INTEGRATION_QUEUE.md
│   ├── MERGE_QUEUE.md
│   └── ARCHITECT_REVIEW_REPORT.md
├── programs/
│   └── linktrend-system/
│       └── issues/          # active Issues (was WORK_PACKETS/)
├── reports/                 # agent reports (legacy copies under reports/legacy-ai-swarm/)
├── rules/
├── skills/
├── agents/
├── prompts/
└── archive/                 # read-only legacy ai-swarm and cursor copies
```

Factory coordination lives in `LiNKdev/`. Plans, contracts, and live queues live in `LiNKdev/product/grounding/`.

## Add The Architect Review Report

The architect review report should live at:

```text
LiNKdev/product/grounding/ARCHITECT_REVIEW_REPORT.md
```

This report becomes the starting map for repo reuse. Agents should not ignore it.

## Live Coordination File

`LiNKdev/product/grounding/AGENT_COORDINATION.md` should show:

- global status
- active agents
- current issues (legacy docs may still say “work packets”)
- current branch/worktree per agent
- Day-1 frozen decisions
- blockers
- integration queue
- merge queue

## Agent Reports

Each agent writes to one report under `LiNKdev/product/reports/` (historical legacy agent-report copies are under `LiNKdev/product/reports/archive/legacy-ai-swarm/`):

```text
LiNKdev/product/reports/linkbrain-agent.md
LiNKdev/product/reports/linkskills-agent.md
LiNKdev/product/reports/linkautowork-agent.md
LiNKdev/product/reports/linkbot-agent.md
LiNKdev/product/reports/linkaios-agent.md
LiNKdev/product/reports/integration-agent.md
```

Each report must include:

- assigned issue (or legacy work packet ID)
- current status
- files changed
- commands run
- tests/proof
- blockers
- decisions needed
- next step

## Coordination Rules

Agents do not rely on each other’s chat history. Agents read:

- `LiNKdev/product/grounding/ARCHITECTURE_RULES.md`
- `LiNKdev/product/grounding/ARCHITECT_REVIEW_REPORT.md`
- `LiNKdev/product/grounding/REPO_INVENTORY.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
- their assigned issue under `LiNKdev/product/programs/linktrend-system/issues/`
- their agent report under `LiNKdev/product/reports/`

## Human Role

Carlos supervises checkpoints, does not manually relay every message. Agents write to files. The Integrator reads those files and merges.
