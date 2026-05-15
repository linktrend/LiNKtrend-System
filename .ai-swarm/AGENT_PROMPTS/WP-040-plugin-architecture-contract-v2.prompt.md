# WP-040 Agent Prompt — Plugin Architecture Contract v2

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-040-plugin-architecture-contract-v2.md`.

## Branch workflow

1. Start from the latest `development`:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
2. Create and work on this branch:
   - `git switch -c dev/codex/WP-040-plugin-architecture-contract-v2`
3. Do not work directly on `main`, `staging`, or `development`.
4. When done, commit and push your branch:
   - commit message: `docs: update plugin architecture contract v2`
   - `git push -u origin dev/codex/WP-040-plugin-architecture-contract-v2`

## Required reading

Read these first:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-040-plugin-architecture-contract-v2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/DECISIONS.md`

## Mission

Make the shared plugin architecture contract first-class in the repo source of truth.

The contract must clearly distinguish:

- core platform services
- vertical plugins
- capability plugins
- LinkBot role attachments
- LinkSkills permissions and skills
- LiNKautowork workflow hooks
- LiNKbrain audit/memory events
- LiNKaios orchestration surfaces

Use `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md` as the approved design source.

## Hard boundaries

- Do not implement application behavior.
- Do not invent target-software schemas or business workflows.
- Do not alter Payload, Odoo, Zulip, Plane, VPS, or external-service internals.
- If the workflow is unclear, stop and record the blocker in the agent report.

## Required output

Update only the files allowed by the work packet.

At minimum, update:

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/AGENT_REPORTS/architect.md`

Update SDK contract files only if required by the manifest shape.

## Proof required

Your agent report must include:

- files changed
- commands run
- tests run or reason tests were not needed
- proof that no implementation code or target-app business schema was changed
- blockers or questions
- final branch name and commit SHA

If TypeScript/Zod contracts are changed, run the relevant package tests.
