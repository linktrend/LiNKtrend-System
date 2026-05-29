# WP-042 — LinkSites template and Payload discovery

## Objective

Discover the existing master template, Payload CMS model, Supabase mirror clues, and preview frontend paths inside `/Users/linktrend/Projects/LiNKsites` without inventing schemas or workflows.

## Owner agent

Repo archaeologist / LinkSites specialist.

## Execution mode

- Codex or Gemini: read-only discovery and summary.
- No implementation unless a follow-up packet is approved.

## Required context

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `/Users/linktrend/Projects/LiNKsites`

## Allowed files

- `.ai-swarm/AGENT_REPORTS/integration-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`
- `.ai-swarm/REPO_INVENTORY.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`

## Prohibited files

- Do not edit `LiNKsites` code.
- Do not create Payload schemas.
- Do not create Supabase mirror tables.
- Do not add dependencies.

## Tasks

1. Identify the master template and any industry-specific template structure.
2. Identify how the master template is linked to Payload CMS.
3. Identify Payload collections/content models already present.
4. Identify any existing Supabase mirror/schema/sync code.
5. Identify the frontend path that reads from Payload for preview display.
6. Identify local Payload boot commands and environment assumptions.
7. Report gaps and recommend exact source files to reuse.

## Acceptance criteria

- Discovery report names exact files/directories.
- Report clearly distinguishes known facts from assumptions.
- Any unknown workflow is called out as a blocker/question.
- No target-app schema is invented.

## Required proof

- Files searched/read.
- Exact paths found.
- Commands run, if any.
- Discovery report committed and pushed to `development`.
