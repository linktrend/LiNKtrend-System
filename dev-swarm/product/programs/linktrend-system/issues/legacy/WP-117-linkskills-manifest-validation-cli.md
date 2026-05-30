# WP-117 - LinkSkills Capability Manifest Validation CLI

## Objective

Add a local validation script for capability plugin manifests so LinkSites, LEXOS, and LiNKapps contracts can be checked before runtime loader work.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-117-linkskills-manifest-validation-cli`
- Base: `origin/development`

## Allowed files

- `scripts/**`
- `packages/linkaios-kernel/plugins/capabilities/**`
- `dev-swarm/product/grounding/LINKSKILLS_CAPABILITY_MANIFEST_VALIDATION.md`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/WP-117-linkskills-manifest-validation-cli.md`

## Prohibited files

- No LinkSkills runtime service implementation.
- No live provider clients.
- No secrets or real tenant/provider identifiers.
- No modifying existing manifests except to fix validation metadata that is obviously inconsistent.

## Required context

- `dev-swarm/product/grounding/CONTRACTS_MVO.md` §0.A.5.1
- `dev-swarm/product/grounding/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `packages/linkaios-kernel/plugins/capabilities/lexos/*.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/*.yaml`
- `packages/linkaios-kernel/plugins/capabilities/catalog/seeds/cross_vertical_catalog.v1.yaml`

## Steps

1. Inspect existing package dependencies before choosing parser approach.
2. Add a local script that validates required manifest fields, mode posture, idempotency, failure mapping, and `not_configured` presence.
3. Ensure manifests default safe in MVO: no silent live writes.
4. Add a package/root script only if it fits existing conventions.
5. Run validation against all capability manifests.
6. Update the packet-specific report.

## Acceptance criteria

- Validator runs locally with no external services.
- Validator fails on missing required governance fields.
- Current Linkapps/LEXOS/catalog manifests pass or are fixed within allowed scope.

## Proof required

- Validator command output.
- Summary of manifests checked.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
