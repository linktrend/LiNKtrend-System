# WP-041 Agent Prompt — LinkSites Vertical Contract v2

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-041-linksites-vertical-contract-v2.md`.

## Branch workflow

1. Start from the latest `development`:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
2. Create and work on this branch:
   - `git switch -c dev/codex/WP-041-linksites-vertical-contract-v2`
3. Do not work directly on `main`, `staging`, or `development`.
4. When done, commit and push your branch:
   - commit message: `docs: update LinkSites vertical contract v2`
   - `git push -u origin dev/codex/WP-041-linksites-vertical-contract-v2`

## Required reading

Read these first:

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-041-linksites-vertical-contract-v2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/DECISIONS.md`

## Mission

Make the revised LinkSites development-mode MVO the canonical contract target.

The canonical v2 flow is:

`mock CRM lead -> LiNKbot research/enrichment -> template-guided website package -> local generated artifact folder -> Supabase mirror -> LiNKautowork sync to real local Payload CMS -> preview-ready frontend -> deterministic checks -> CRM/mock lead status ready_to_contact`

Use `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md` as the approved design source.

## Hard boundaries

- No real lead acquisition.
- No real client outreach.
- No real VPS deployment.
- Do not invent Payload or Supabase schemas.
- Do not implement code.
- Do not create target-app business configuration.
- If the current docs conflict with the v2 design, update docs to make v2 canonical and mark old proof language as historical.

## Required output

Update only the files allowed by the work packet.

At minimum, update:

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/AGENT_COORDINATION.md`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

Update SDK contract files only if required by the revised contract.

## Proof required

Your agent report must include:

- files changed
- commands run
- tests run or reason tests were not needed
- proof that no implementation code, Payload schema, Supabase schema, VPS deployment, or outreach send path was added
- blockers or questions
- final branch name and commit SHA

If TypeScript/Zod contracts are changed, run the relevant package tests.
