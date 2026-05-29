# WP-059 Agent Prompt - LiNKautowork Completion Plan Runtime Hardening

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-059-linkautowork-completion-plan-runtime-hardening.md`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-059-linkautowork-completion-plan-runtime-hardening`
5. Commit with message `docs: define LiNKautowork completion plan`
6. `git push -u origin dev/codex/WP-059-linkautowork-completion-plan-runtime-hardening`

## Required reading

- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-059-linkautowork-completion-plan-runtime-hardening.md`
- `LiNKautowork/gateway/**`

## Mission

Define what "finished enough" means for LiNKautowork and generate execution-ready hardening packets.

## Hard boundaries

- Do not deploy n8n.
- Do not modify live workflows.
- No credentials.

## Proof required

Record evidence, gap analysis, and follow-up packet list in `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.
