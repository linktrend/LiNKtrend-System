# WP-051 Agent Prompt - Kernel To LiNKautowork V2 Handle Integration

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-051-kernel-autowork-v2-handle-integration.md`.

## Current baseline

WP-048 implemented LinkSites v2 workflow scaffolds in LiNKautowork. Branch from latest `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-051-kernel-autowork-v2-handle-integration`
5. Commit with message `feat: integrate kernel with LinkSites v2 workflows`
6. `git push -u origin dev/codex/WP-051-kernel-autowork-v2-handle-integration`

## Required reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-048-linkautowork-linksites-workflow-scaffold.md`
- `.ai-swarm/WORK_PACKETS/WP-051-kernel-autowork-v2-handle-integration.md`

## Mission

Connect kernel dispatch to the five LinkSites v2 LiNKautowork handles. Persist workflow/audit refs and enforce lease gating for side-effecting handles.

## Hard boundaries

- Do not duplicate workflow logic inside LiNKaios.
- Do not add live external writes.
- Do not invent Payload/Supabase schemas.

## Proof required

Run relevant Linkaios kernel tests and record proof in `.ai-swarm/AGENT_REPORTS/integration-agent.md`.
