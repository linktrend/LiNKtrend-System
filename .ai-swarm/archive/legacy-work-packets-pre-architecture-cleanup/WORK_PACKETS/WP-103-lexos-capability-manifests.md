# WP-103 - LEXOS Capability Plugin Manifests

## Objective

Create capability plugin manifests for LEXOS-required capabilities.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-103-lexos-capability-manifests`
- Base: `development`

## Allowed Files

- `packages/linkaios-kernel/plugins/capabilities/lexos/*.yaml`
- `packages/linkaios-kernel/plugins/capabilities/lexos/*.json`
- `.ai-swarm/WORK_PACKETS/WP-103*.md`
- `.ai-swarm/DECISIONS.md`

## Prohibited Files

- Capability implementations
- Secrets or credentials
- Target-software business configuration

## Required Context

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §3
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.5

## Steps

1. Create capability manifests for:
   - `cap.storage.evidence`
   - `cap.extraction.parser`
   - `cap.extraction.ocr`
   - `cap.extraction.qa`
   - `cap.research.legal`

2. Define per manifest:
   - `capability_id` and `target_software`
   - `allowed_operations`
   - `auth_requirements`
   - `mode_flags`
   - `lease_requirements`
   - `idempotency_rules`
   - `audit_events`
   - `allowed_callers`
   - `failure_mapping`
   - `not_configured` (explicit non-ownership)

## Acceptance Criteria

- All 5 capability manifests exist
- Each manifest declares `not_configured` list
- Mode flags include only `development` or `shadow` for MVO
- No secrets in manifests

## Proof Required

- Manifest file listing
- Example manifest content
- Validation that no `live` mode is declared
