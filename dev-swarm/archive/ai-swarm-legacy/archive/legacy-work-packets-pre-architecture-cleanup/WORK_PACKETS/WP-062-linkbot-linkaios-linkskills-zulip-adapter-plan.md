# WP-062 - LiNKbot to LiNKaios, LinkSkills, and Zulip adapter plan

## Objective

Define the concrete adapter plan for connecting LiNKbot runtime to LiNKaios work dispatch, LinkSkills governed skills/capabilities, LiNKbrain audit/memory, LiNKautowork deterministic handoff, and Zulip communication.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Depends on: WP-061 discovery output
- Branch: `dev/codex/WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan`

## Allowed files

- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-06*-*.md` for follow-up implementation packets
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`
- `.ai-swarm/CONTRACTS_MVO.md` only for narrow clarifications

## Prohibited files

- Do not implement runtime code before WP-061 is reviewed.
- Do not add live Zulip sends.
- Do not let LiNKbot own canonical memory, skills, secrets, deterministic workflow state, or final audit.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md`
- `.ai-swarm/WORK_PACKETS/WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan.md`

## Steps

1. Read WP-061 readiness output.
2. Define adapter surfaces for:
   - LiNKaios work/session dispatch
   - LinkSkills skill/capability calls
   - LiNKbrain audit/memory writes through the correct envelope
   - LiNKautowork deterministic workflow handoff
   - Zulip bot/operator messaging
3. Identify what belongs in `LiNKbot-core` versus `LiNKbot/runtime-adapters/openclaw/bot-runtime` versus LiNKaios plugin config.
4. Break implementation into follow-up WPs with allowed files and proof.
5. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- LiNKbot remains a thin worker/runtime shell.
- Adapter plan is concrete enough for implementation.
- No cross-plane ownership violation is introduced.

## Proof required

- Evidence-based adapter map and follow-up packet list.
