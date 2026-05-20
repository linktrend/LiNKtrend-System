# WP-114 - LinkSkills Cross-Vertical Capability Catalog Seeds

## Objective

Create cross-vertical capability catalog seed manifests/specs that reconcile LinkSites, LEXOS, and LiNKapps capability declarations without implementing providers.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-114-linkskills-cross-vertical-catalog-seeds`
- Base: `origin/development`

## Allowed files

- `packages/linkaios-kernel/plugins/capabilities/catalog/**`
- `.ai-swarm/LINKSKILLS_CROSS_VERTICAL_CAPABILITY_CATALOG.md`
- `.ai-swarm/AGENT_REPORTS/WP-114-linkskills-cross-vertical-catalog-seeds.md`

## Prohibited files

- No LinkSkills runtime/service implementation
- No live provider clients
- No secrets or tenant/provider account IDs
- No changes to vertical manifests except documenting mismatches

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `packages/linkaios-kernel/plugins/capabilities/lexos/*.yaml`
- `plugins/vertical/linkapps/manifest.yaml`

## Steps

1. Inventory capability IDs across LinkSites contracts, LEXOS manifests, and LiNKapps requirements.
2. Create declaration-only catalog seed files or a canonical catalog spec for shared capability IDs, modes, lease scopes, and `not_configured` defaults.
3. Identify duplicate/overlapping capability IDs and propose canonical names or aliases.
4. Add validation guidance for future kernel/catalog loader integration.
5. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Cross-vertical catalog captures LinkSites, LEXOS, and LiNKapps required capabilities.
- Duplicate or overlapping capability surfaces are explicitly reconciled or documented.
- Seeds/specs include mode defaults, lease posture, idempotency posture, and `not_configured`.
- No runtime provider code is added.

## Proof required

- Capability inventory output or table.
- File listing for seed/spec artifacts.
- Confirmation no live provider configuration was introduced.
