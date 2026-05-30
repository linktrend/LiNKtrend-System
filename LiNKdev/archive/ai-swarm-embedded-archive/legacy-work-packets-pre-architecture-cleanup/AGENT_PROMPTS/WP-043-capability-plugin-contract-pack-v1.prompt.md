# WP-043 Agent Prompt — Capability Plugin Contract Pack v1

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-043-capability-plugin-contract-pack-v1.md`.

## Current baseline

WP-040, WP-041, WP-044, and WP-045 are integrated into `origin/development`. Branch from the latest `origin/development`, not from any packet branch. Use plugin architecture v2, LinkSites vertical MVO v2, LiNKbot role contracts, and LiNKautowork workflow contracts as the current source of truth.

## Branch workflow

1. Start from latest `development`:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
2. Create and work on this branch:
   - `git switch -c dev/codex/WP-043-capability-plugin-contract-pack-v1`
3. Do not work directly on `main`, `staging`, or `development`.
4. When done, commit and push your branch:
   - commit message: `docs: define capability plugin contract pack v1`
   - `git push -u origin dev/codex/WP-043-capability-plugin-contract-pack-v1`

## Required reading

Read these first:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-043-capability-plugin-contract-pack-v1.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/DECISIONS.md`

## Mission

Define connector-only contracts for the LinkSites v1 capability plugins:

- Odoo/CRM shadow-readiness
- Payload CMS
- Supabase mirror/content
- Zulip
- public web research
- asset generation
- Plane

Capability plugins are governed connector surfaces. They do not define target-software business setup.

## Hard boundaries

- Do not create Odoo chart of accounts, accounting rules, CRM stages, or Odoo business data.
- Do not create Payload schemas.
- Do not create Supabase mirror schemas before WP-042 discovery.
- Do not invent Zulip stream taxonomy beyond connector/run-message needs.
- Do not enable live external writes by default.
- Do not implement application code unless the packet explicitly permits a narrow shared contract/type update.

## Required output

Update only files allowed by the work packet.

At minimum, update:

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

Update `packages/linklogic-sdk` only if shared contract types need representation.

Each capability contract must define:

- operations
- modes: `mock`, `shadow`, `live`
- auth/config surface
- idempotency
- LinkSkills lease requirements
- audit events
- allowed callers
- failure mapping
- explicit non-ownership inside the external software

## Proof required

Your agent report must include:

- files changed
- commands run
- tests run or reason tests were not needed
- proof that target-app business setup was not invented
- blockers/questions
- final branch name and commit SHA

If TypeScript/Zod contracts are changed, run the relevant package tests.
