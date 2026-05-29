# Swarm Coordination Model v2

## Principle

The repo is the coordination system. Chat memory is not.

Cursor chats, Codex threads, Antigravity sessions, and Kimi/Gemini analysis sessions are isolated. The project must coordinate through files.

## Command Center

Use the **Dev Swarm** factory in the LiNKaios monorepo (`LiNKtrend-System`):

```text
dev-swarm/
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

Factory coordination lives in `dev-swarm/`. Plans, contracts, and live queues live in `dev-swarm/command-center/`.

## Add The Architect Review Report

The architect review report should live at:

```text
dev-swarm/command-center/ARCHITECT_REVIEW_REPORT.md
```

This report becomes the starting map for repo reuse. Agents should not ignore it.

## Live Coordination File

`dev-swarm/command-center/AGENT_COORDINATION.md` should show:

- global status
- active agents
- current issues (legacy docs may still say “work packets”)
- current branch/worktree per agent
- Day-1 frozen decisions
- blockers
- integration queue
- merge queue

## Agent Reports

Each agent writes to one report under `dev-swarm/reports/` (historical legacy agent-report copies are under `dev-swarm/reports/legacy-ai-swarm/`):

```text
dev-swarm/reports/linkbrain-agent.md
dev-swarm/reports/linkskills-agent.md
dev-swarm/reports/linkautowork-agent.md
dev-swarm/reports/linkbot-agent.md
dev-swarm/reports/linkaios-agent.md
dev-swarm/reports/integration-agent.md
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

- `dev-swarm/command-center/ARCHITECTURE_RULES.md`
- `dev-swarm/command-center/ARCHITECT_REVIEW_REPORT.md`
- `dev-swarm/command-center/REPO_INVENTORY.md`
- `dev-swarm/command-center/CONTRACTS_MVO.md`
- their assigned issue under `dev-swarm/programs/linktrend-system/issues/`
- their agent report under `dev-swarm/reports/`

## Human Role

Carlos supervises checkpoints, does not manually relay every message. Agents write to files. The Integrator reads those files and merges.
