# WP-042 Agent Prompt — LinkSites Template and Payload Discovery

You are working in `/Users/linktrend/Projects/LiNKtrend-System` and must also inspect `/Users/linktrend/Projects/LiNKsites`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-042-linksites-template-payload-discovery.md`.

## Current baseline

WP-040 and WP-041 are integrated into `origin/development`. Branch from the latest `origin/development`, not from either packet branch. Your discovery must treat plugin architecture v2 and LinkSites vertical MVO v2 as the current source of truth.

## Branch workflow

1. In `/Users/linktrend/Projects/LiNKtrend-System`, start from latest `development`:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
2. Create and work on this branch in `LiNKtrend-System`:
   - `git switch -c dev/codex/WP-042-linksites-template-payload-discovery`
3. Inspect `/Users/linktrend/Projects/LiNKsites` in read-only mode.
4. Do not edit or commit anything in `/Users/linktrend/Projects/LiNKsites`.
5. When done, commit and push your `LiNKtrend-System` branch:
   - commit message: `docs: document LinkSites template and Payload discovery`
   - `git push -u origin dev/codex/WP-042-linksites-template-payload-discovery`

## Required reading

Read these first:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-042-linksites-template-payload-discovery.md`
- `/Users/linktrend/Projects/LiNKsites` repo structure

## Mission

Discover the existing LinkSites master template, Payload-linked content model, Supabase mirror clues, and preview frontend paths.

The user believes there is a master template in `/Users/linktrend/Projects/LiNKsites`; it may be in `apps/web-master`, `apps/cms`, `packages/blocks`, or elsewhere. Find it from repo evidence.

## Hard boundaries

- Read-only discovery in `LiNKsites`.
- Do not invent schemas.
- Do not edit `LiNKsites`.
- Do not add dependencies.
- Do not implement application code.
- If the master template or Payload schema cannot be identified, record that as a blocker instead of guessing.

## Required output

Create or update:

- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/REPO_INVENTORY.md` only if high-confidence inventory corrections are needed
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`

The discovery report must name exact files/directories for:

- master template
- industry template structure, if any
- Payload CMS collections/content models
- Supabase mirror/schema/sync code, if any
- frontend path that reads from Payload
- local Payload boot commands and required environment assumptions

## Proof required

Your agent report must include:

- files searched/read
- exact paths found
- commands run
- known facts vs assumptions
- blockers/questions
- proof that no `LiNKsites` files were modified
- final branch name and commit SHA
