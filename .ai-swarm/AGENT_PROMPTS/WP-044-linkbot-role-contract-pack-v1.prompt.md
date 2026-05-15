# WP-044 Agent Prompt — LinkBot Role Contract Pack v1

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-044-linkbot-role-contract-pack-v1.md`.

## Branch workflow

1. Start from latest `development`:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
2. Create and work on this branch:
   - `git switch -c dev/codex/WP-044-linkbot-role-contract-pack-v1`
3. Do not work directly on `main`, `staging`, or `development`.
4. When done, commit and push your branch:
   - commit message: `docs: define LinkSites LinkBot role contracts`
   - `git push -u origin dev/codex/WP-044-linkbot-role-contract-pack-v1`

## Required reading

Read these first:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-044-linkbot-role-contract-pack-v1.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `apps/bot-runtime/**` for existing adapter patterns, if needed
- `/Users/linktrend/Projects/LiNKbot-core` only for runtime pattern reference, if needed

## Mission

Define the LinkSites LinkBot role contracts:

- Lead Scout Bot: present but real lead acquisition disabled in MVO.
- Research/Enrichment Bot: researches the lead and comparable businesses, with provenance.
- Website Builder Bot: uses templates as guidance and creates a business-specific website package.
- Outreach Bot: present but disabled in MVO; no outreach draft or send.

## Hard boundaries

- Do not implement model prompts or runtime behavior yet.
- Do not scrape real leads.
- Do not send outreach.
- Do not hardcode Zulip, Odoo, Payload, or Plane internals into LinkBot.
- Do not let LinkBot own canonical memory, skills, secrets, deterministic workflow state, final audit, or target-app configuration.

## Required output

Update only files allowed by the work packet.

At minimum, update:

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

Update `packages/linklogic-sdk` only if shared contract types need representation.

Each role contract must define:

- role id
- purpose
- inputs
- outputs
- allowed capabilities
- allowed skills
- audit events
- development-mode restrictions
- explicit non-ownership

## Proof required

Your agent report must include:

- files changed
- commands run
- tests run or reason tests were not needed
- proof that no live lead acquisition or outreach was added
- blockers/questions
- final branch name and commit SHA

If TypeScript/Zod contracts are changed, run the relevant package tests.
