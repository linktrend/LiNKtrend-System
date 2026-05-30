# WP-104 - LEXOS LiNKbot Role Contracts

## Objective

Define LEXOS-specific LiNKbot role contracts for the W0-W11 litigation workflow without implementing runtime behavior.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-104-lexos-linkbot-role-contracts`
- Base: `origin/development`

## Allowed files

- `plugins/vertical/lexos/roles/**`
- `.ai-swarm/LEXOS_LINKBOT_ROLE_CONTRACTS.md`
- `.ai-swarm/AGENT_REPORTS/WP-104-lexos-linkbot-role-contracts.md`

## Prohibited files

- No LiNKbot runtime implementation changes
- No live legal research or provider integration
- No secrets, credentials, or tenant data
- No edits to LEXOS source repo

## Required context

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `packages/linklogic-sdk/src/lexos-contracts.ts`

## Steps

1. Create role contract declarations for the 10 LEXOS roles listed in `LexosRoleIdSchema`.
2. For each role, define allowed inputs, expected outputs, required capabilities, audit events, and non-goals.
3. Document how roles receive context from LiNKbrain and request side effects through LinkSkills leases.
4. Add a short role-to-stage matrix in `.ai-swarm/LEXOS_LINKBOT_ROLE_CONTRACTS.md`.
5. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- All LEXOS roles have explicit contract files or one structured manifest.
- Contracts preserve boundaries: LiNKbot reasons, LinkSkills governs side effects, LiNKbrain owns memory.
- No role can perform live court filing, live legal research writes, or external sends in MVO mode.
- Contracts align with `LexosRoleIdSchema`.

## Proof required

- File listing of created role contracts.
- `rg` output showing every `LexosRoleIdSchema` role appears in the role contracts.
- Confirmation no role contract declares live side-effect authority.
