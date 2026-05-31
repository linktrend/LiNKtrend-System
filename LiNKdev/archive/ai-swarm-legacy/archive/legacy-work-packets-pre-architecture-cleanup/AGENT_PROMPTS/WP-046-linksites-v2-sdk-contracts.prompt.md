# WP-046 Agent Prompt - LinkSites v2 SDK Contracts

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-046-linksites-v2-sdk-contracts.md`.

## Current baseline

WP-040 through WP-045 are integrated into `origin/development`. WP-042 discovered the existing LiNKsites master template, Payload CMS model, Supabase mirror clues, and preview frontend paths. Branch from the latest `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-046-linksites-v2-sdk-contracts`
5. Commit with message `feat: add LinkSites v2 SDK contracts`
6. `git push -u origin dev/codex/WP-046-linksites-v2-sdk-contracts`

## Required reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-046-linksites-v2-sdk-contracts.md`

## Mission

Add focused Zod/TypeScript schemas for the LinkSites v2 contract surface needed by implementation packets. Do not invent Payload or Supabase schemas; reference discovered paths/refs as contract values.

## Hard boundaries

- No edits in `/Users/linktrend/Projects/LiNKsites`.
- No migrations.
- No runtime orchestration or connector implementation.
- No non-canonical failure codes unless tests and docs are updated consistently.

## Proof required

Run the linklogic SDK tests and record exact command output summary in `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`.
