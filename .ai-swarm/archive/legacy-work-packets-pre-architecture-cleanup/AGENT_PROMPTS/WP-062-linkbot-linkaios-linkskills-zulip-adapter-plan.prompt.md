# WP-062 Agent Prompt - LiNKbot Adapter Plan

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan.md`.

## Dependency gate

Start only after WP-061 is reviewed and integrated.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan`
5. Commit with message `docs: define LiNKbot adapter plan`
6. `git push -u origin dev/codex/WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan`

## Required reading

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md`
- `.ai-swarm/WORK_PACKETS/WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan.md`

## Mission

Define the adapter plan connecting LiNKbot to LiNKaios dispatch, LinkSkills skill/capability calls, LiNKbrain audit/memory, LiNKautowork handoff, and Zulip messaging.

## Hard boundaries

- Do not implement runtime code before WP-061 is reviewed.
- No live messages.
- LiNKbot must not own memory, skills, secrets, deterministic workflow state, or final audit.

## Proof required

Record adapter map and follow-up packet list in `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`.
