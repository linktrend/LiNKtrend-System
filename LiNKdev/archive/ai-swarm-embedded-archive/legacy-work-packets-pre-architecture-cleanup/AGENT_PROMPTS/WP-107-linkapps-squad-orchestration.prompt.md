# WP-107 Agent Prompt - LiNKapps Squad Orchestration

Recommended model/tool: Cursor Composer or Gemini 3 Flash for documentation/spec work. Use Kimi only if source repo archaeology becomes necessary. Do not use Codex or Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-107-linkapps-squad-orchestration.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-107 -b dev/cursor/WP-107-linkapps-squad-orchestration origin/development
cd ../LiNKtrend-System-WP-107
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md` §6.1
- `.ai-swarm/WORK_PACKETS/WP-107-linkapps-squad-orchestration.md`
- `/Users/linktrend/Projects/LiNKapps/.agent/ARCHITECTURE.md` if present
- `/Users/linktrend/Projects/LiNKapps/.agent/agents/orchestrator.md` if present

## Mission

Define how LiNKaios coordinates multiple LiNKbot roles as a governed LiNKapps implementation squad. This is a spec packet only.

## Scope

Allowed:

- Create `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`.
- Update `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`.

Hard boundaries:

- No runtime implementation.
- No LiNKbot code changes.
- No LiNKapps code movement.
- No production side effects.

## Required Answers

The spec must answer:

1. How the orchestrator dispatches to specialist agents.
2. What the squad communication protocol is.
3. How intermediate artifacts are shared.
4. How failures, reassignment, and escalation work.
5. How many apps/squads can run concurrently in development mode.

Also include:

- Squad formation protocol.
- Role assignment rules.
- Concurrency limits.
- Audit events.
- LinkSkills lease touchpoints.
- LiNKbrain memory/context handoff points.

## Proof Required

- Document cross-references `CONTRACTS_MVO.md` §6.1.
- Report lists any unresolved user decisions.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `docs: define LiNKapps squad orchestration`
Push branch to GitHub.
