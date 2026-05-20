# WP-056 Agent Prompt - LEXOS Vertical Repo Discovery

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-056-lexos-vertical-repo-discovery.md`.

## Current baseline

LEXOS Litigation is a future vertical plugin. Discovery target is `/Users/linktrend/Projects/LiNKtrend-LEXOS`. Do not edit the target repo.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-056-lexos-vertical-repo-discovery`
5. Commit with message `docs: discover LEXOS vertical reuse surface`
6. `git push -u origin dev/codex/WP-056-lexos-vertical-repo-discovery`

## Required reading

- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-056-lexos-vertical-repo-discovery.md`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS`

## Mission

Produce evidence-based discovery of existing LEXOS vertical assets, workflows, schemas, UI, agents, and reusable code.

## Hard boundaries

- Do not edit `/Users/linktrend/Projects/LiNKtrend-LEXOS`.
- Do not implement LEXOS.
- Do not invent legal workflows.

## Proof required

Record commands run, exact evidence paths, and target repo clean status in `.ai-swarm/AGENT_REPORTS/integration-agent.md`.
