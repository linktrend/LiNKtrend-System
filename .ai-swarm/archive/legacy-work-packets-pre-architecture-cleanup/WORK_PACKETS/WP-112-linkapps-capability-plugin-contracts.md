# WP-112 - LiNKapps Capability Plugin Contracts

## Objective

Create declaration-only capability plugin contract manifests for LiNKapps app-factory operations, based on the approved capability requirements matrix.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-112-linkapps-capability-plugin-contracts`
- Base: `origin/development`

## Allowed files

- `packages/linkaios-kernel/plugins/capabilities/linkapps/**`
- `.ai-swarm/LINKAPPS_CAPABILITY_PLUGIN_CONTRACTS.md`
- `.ai-swarm/AGENT_REPORTS/WP-112-linkapps-capability-plugin-contracts.md`

## Prohibited files

- No implementation of live providers
- No secrets, tokens, project IDs, account IDs, or tenant credentials
- No real GitHub, Supabase, Stripe, Vercel, EAS, Plane, or Zulip writes
- No edits to LinkSkills service runtime

## Required context

- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.5 and §0.A.5.1
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`

## Steps

1. Create YAML manifests for the LiNKapps capability surfaces in the requirements matrix.
2. For each manifest, define mode flags, allowed operations, lease requirements, idempotency keys, failure mapping, audit events, allowed callers, and explicit `not_configured`.
3. Default all side-effect-heavy providers to development/mock or shadow mode unless the requirements spec explicitly allows a safer local mode.
4. Document how capability IDs map back to Linkapps stages and manifest requirements.
5. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Capability contract manifests exist for GitHub repo management, Supabase provisioning, Stripe product management, Vercel deployment, EAS build, Plane tracking, and Zulip messaging.
- Every manifest includes `not_configured` and idempotency rules.
- No manifest silently enables live writes.
- Manifest documentation maps capability IDs to app-factory stages.

## Proof required

- Manifest file listing.
- `rg` proof that no manifest declares live write authority by default.
- Example manifest excerpt in the report.
