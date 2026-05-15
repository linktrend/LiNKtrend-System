# WP-045 Agent Prompt — LiNKautowork LinkSites Workflow Contract

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-045-linkautowork-linksites-workflow-contract.md`.

## Current baseline

WP-040 and WP-041 are integrated into `origin/development`. Branch from the latest `origin/development`, not from either packet branch. Use the plugin architecture v2 SDK/docs from WP-040 and the LinkSites vertical MVO v2 contract from WP-041 as the current source of truth.

## Branch workflow

1. Start from latest `development`:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
2. Create and work on this branch:
   - `git switch -c dev/codex/WP-045-linkautowork-linksites-workflow-contract`
3. Do not work directly on `main`, `staging`, or `development`.
4. When done, commit and push your branch:
   - commit message: `docs: define LinkSites autowork workflow contract`
   - `git push -u origin dev/codex/WP-045-linkautowork-linksites-workflow-contract`

## Required reading

Read these first:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-045-linkautowork-linksites-workflow-contract.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `/Users/linktrend/Projects/LiNKautowork/gateway` for existing workflow/run-ledger patterns, if needed

## Mission

Define deterministic LiNKautowork workflow contracts for LinkSites MVO v2:

- local generated artifact write
- Supabase mirror update
- Payload CMS sync
- preview readiness checks
- CRM/mock lead `ready_to_contact` update

LiNKautowork owns repeatable steps and checks. It does not own LinkBot judgment, LinkSkills permissions/skills, LiNKbrain memory, or LiNKaios orchestration.

## Hard boundaries

- Do not implement n8n/live workflow behavior yet.
- Do not deploy to VPS.
- Do not send outreach.
- Do not invent Payload or Supabase schemas.
- Do not perform side-effecting writes outside LinkSkills lease policy.
- Local artifact storage is development-only. Production cold storage is future direction.

## Required output

Update only files allowed by the work packet.

At minimum, update:

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`

Update `packages/linklogic-sdk` only if shared contract types need representation.

Each workflow contract must define:

- workflow handle
- deterministic inputs
- deterministic outputs
- run-ledger refs
- audit events
- retry/idempotency rules
- failure mapping
- required leases where side effects occur

Preview checks must cover required pages, navigation, content blocks, media references, provenance, Payload sync status, and preview readiness.

## Proof required

Your agent report must include:

- files changed
- commands run
- tests run or reason tests were not needed
- proof that no VPS deployment, live workflow, schema invention, or outreach path was added
- blockers/questions
- final branch name and commit SHA

If TypeScript/Zod contracts are changed, run the relevant package tests.
