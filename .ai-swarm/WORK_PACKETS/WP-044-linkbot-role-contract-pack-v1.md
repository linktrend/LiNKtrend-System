# WP-044 — LinkBot role contract pack v1

## Objective

Define LinkSites LinkBot roles and stage contracts without implementing bot behavior: Lead Scout, Research/Enrichment, Website Builder, and disabled Outreach.

## Owner agent

LinkBot agent with Architect review.

## Execution mode

- Codex: contract docs/types after WP-040/WP-041 are stable.
- No model prompt implementation until the role contract is approved.

## Required context

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `LiNKbot-core` runtime patterns

## Allowed files

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`
- `apps/bot-runtime/**` only for contract adapter types if explicitly required.

## Prohibited files

- Real lead scraping/acquisition.
- Real outreach sending.
- Hardcoded Zulip/Odoo/Payload logic in LinkBot runtime.
- Secrets, tokens, or live external side effects.

## Tasks

1. Define LinkBot role manifest shape: role id, purpose, inputs, outputs, allowed capabilities, allowed skills, audit events, and development-mode restrictions.
2. Define Lead Scout role as disabled/mock-output in MVO.
3. Define Research/Enrichment role with governed web research and provenance output.
4. Define Website Builder role with template-guided copy/media/style package output.
5. Define Outreach role as present but disabled; no draft/send in v1 unless later assigned.
6. Define what LinkBot must not own: memory, skills, secrets, workflow state, final audit, target-app configuration.

## Acceptance criteria

- Each role has clear inputs/outputs and allowed capabilities.
- Disabled roles have explicit mock/input substitution behavior.
- The Website Builder role uses templates as guidance, not as a simple copy-and-fill operation.
- No role directly owns connector internals.

## Required proof

- Files changed.
- Commands run.
- Tests passing if shared SDK contracts change.
- Agent report updated with proof and blockers.
