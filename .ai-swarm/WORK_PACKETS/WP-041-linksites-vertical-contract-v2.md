# WP-041 — LinkSites vertical contract v2

## Objective

Replace the old static/local lead-to-preview target with the revised LinkSites development-mode MVO contract.

## Owner agent

Architect / Integrator, with LinkSites specialist review after discovery.

## Execution mode

- Cursor Architect: contract and source-of-truth docs.
- Codex: only after WP-042 discovery confirms concrete template/Payload paths.

## Required context

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`

## Allowed files

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/DECISIONS.md`
- `.ai-swarm/AGENT_COORDINATION.md`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`

## Prohibited files

- Real VPS deployment.
- Real lead acquisition.
- Real client outreach.
- New Payload schema invention.
- New Supabase mirror schema invention before WP-042 discovery.

## Tasks

1. Define the canonical LinkSites MVO v2 flow: mock CRM lead, research/enrichment, template selection, generated package, local artifacts, Supabase mirror, Payload sync, preview-ready site, checks, and CRM `ready_to_contact`.
2. Declare development-mode boundaries: no real lead acquisition, no real outreach, no real VPS deployment.
3. Declare production artifact direction: cloud cold storage such as Google Drive, not live hosting.
4. Define canonical LinkBot roles and disabled stages.
5. Define required v1 capability plugins.
6. Define site identity as `site_id` per business/lead plus versioned generation runs unless WP-042 discovery contradicts this.

## Acceptance criteria

- The old lead-to-preview proof is no longer described as the current roadmap target.
- LinkSites v2 contract is detailed enough for implementation work packets.
- All side effects are routed through LinkSkills and LiNKautowork as appropriate.
- Unknown Payload/Supabase schema details are explicitly deferred to discovery, not guessed.

## Required proof

- Files changed.
- Commands run.
- Contract test output if shared SDK files change.
- Agent report updated with proof and blockers.
