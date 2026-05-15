# WP-049 - LinkSites kernel v2 stage wiring

## Objective

Wire the LiNKaios kernel stage model for the LinkSites v2 development-mode flow using the approved SDK contracts, capability IDs, LinkBot role IDs, and LiNKautowork workflow handles.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-049-linksites-kernel-v2-stage-wiring`

## Allowed files

- `apps/linkaios-web/src/lib/kernel/**`
- `apps/linkaios-web/src/lib/plugins/**`
- `packages/linklogic-sdk/src/**` only for narrow imports or tests, not new contract invention
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`

## Prohibited files

- Do not edit `/Users/linktrend/Projects/LiNKsites`.
- Do not implement live Zulip/Odoo/Postiz/Payload writes.
- Do not change database migrations unless a narrowly scoped kernel test fixture requires it and the Integrator approves.
- Do not redefine LinkSkills or LiNKautowork responsibilities inside the kernel.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-049-linksites-kernel-v2-stage-wiring.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`

## Steps

1. Identify the current WebsiteFactory/v1 plugin stage wiring and kernel dispatch path.
2. Add a LinkSites v2 stage plan that maps the development-mode flow to canonical role IDs, capability IDs, workflow handles, and audit event expectations.
3. Keep the kernel as coordinator only; all capability policy stays in LinkSkills, deterministic execution stays in LiNKautowork, reasoning stays in LinkBot, and audit/memory stays in LiNKbrain.
4. Persist or expose stage refs consistently (`lease_ids`, `workflow_run_ids`, `audit_event_ids`) for downstream trace/status surfaces.
5. Add focused tests for v2 stage ordering, mapping correctness, and role-boundary enforcement.
6. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Kernel/plugin code can represent the LinkSites v2 stage plan without using historical v1 stage names as the canonical target.
- Each side-effecting stage points to the correct LinkSkills capability and LiNKautowork workflow handle.
- No target software schema or business setup is invented.
- Tests prove the v2 stage plan and mappings.

## Proof required

- Relevant Linkaios kernel/plugin tests pass.
