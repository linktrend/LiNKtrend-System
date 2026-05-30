# WP-126 - LinkBot Role Pack Validation

## Objective

Add validation for LinkBot role contract packs across LinkSites, LEXOS, and LiNKapps so role declarations can be checked before runtime orchestration.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-126-linkbot-role-pack-validation`
- Base: `origin/development`

## Allowed files

- `scripts/**role**`
- `plugins/vertical/**/roles/**`
- `dev-swarm/product/grounding/LINKBOT_ROLE_PACK_VALIDATION.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-126-linkbot-role-pack-validation.md`

## Prohibited files

- No bot-runtime behavior changes.
- No model calls.
- No live provider/capability calls.
- No rewriting role contracts except clear validation metadata fixes.

## Required context

- `dev-swarm/product/grounding/LEXOS_LINKBOT_ROLE_CONTRACTS.md`
- `dev-swarm/product/grounding/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `dev-swarm/product/grounding/CONTRACTS_MVO.md` role sections
- `plugins/vertical/lexos/roles/contracts/*.yaml`
- `plugins/vertical/linkapps/manifest.yaml`

## Steps

1. Inventory role contracts and role declarations across vertical plugins.
2. Add a local validation script or spec that checks required fields, non-ownership, allowed capabilities, and MVO live-action prohibitions.
3. Run the validator against existing role contracts/manifests.
4. Document missing role declarations or follow-up needs.
5. Update the packet-specific report.

## Acceptance criteria

- Validator/spec covers LinkSites, LEXOS, and LiNKapps role declarations.
- No role can silently declare live external authority in MVO mode.
- Validation output is reproducible locally.

## Proof required

- Validator command output or structured inventory proof.
- Role count by vertical.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
