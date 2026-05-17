# WP-076 - LinkSkills Capability Catalog API

## Objective

Implement capability registry CRUD and discovery endpoints matching `CapabilityPluginSurface` contract from CONTRACTS_MVO.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-076-linkskills-capability-catalog-api`
- Base: `development`

## Allowed files

- `packages/linkskills-core/src/catalog/`
- `packages/linkskills-core/src/api/`
- `packages/linklogic-sdk/src/types/capability.ts`
- `packages/linkskills-core/tests/`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Old repo implementation (`LiNKskills/services/logic-engine/`)
- LiNKaios kernel code (use contracts only)
- LinkSkills lease implementation (WP-077)

## Required context

- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md` §4.1
- `.ai-swarm/CONTRACTS_MVO.md` §1.2 (CapabilityPluginSurface)
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.5 (v1 capability contracts)
- WP-075 schema (capabilities table)

## Steps

1. Define TypeScript types in `packages/linklogic-sdk`:
   - `CapabilityPluginSurface` interface
   - `CapabilityMode` enum (development, shadow, live)
   - `CapabilityOperation` type
   - `CapabilityCatalogEntry` type

2. Implement capability registration API:
   - `POST /v1/capabilities` - register new capability
   - Validate against `CapabilityPluginSurface` schema
   - Reject if `not_configured` list is empty (§1.3 validation)
   - Reject if `mode_flags` is empty

3. Implement capability discovery API:
   - `GET /v1/capabilities` - list with filters (mode, target_software)
   - `GET /v1/capabilities/{capability_id}` - full contract
   - `GET /v1/capabilities/{capability_id}/contract` - public contract only

4. Implement capability validation for LiNKaios kernel:
   - `validateCapabilityReference(capability_id)` - check existence
   - `validateCapabilityModes(capability_id, requested_mode)` - check supported
   - Called by kernel at plugin boot time (§1.3)

5. Seed v1 MVO capabilities from CONTRACTS_MVO §0.A.5:
   - `cap.crm.odoo_shadow`
   - `cap.accounting.odoo_shadow`
   - `cap.payload.local_sync`
   - `cap.supabase.mirror_content`
   - `cap.zulip.run_messaging`
   - `cap.research.public_web`
   - `cap.asset.generation`
   - `cap.plane.execution_tracking`

6. Add capability plugin contract pack validation:
   - Verify all required fields present
   - Verify failure mapping uses §5.4 canonical codes
   - Verify allowed_callers subset valid

## Acceptance criteria

- [ ] All 8 v1 capabilities seeded with full contracts
- [ ] API endpoints match CONTRACTS_MVO §1.2 schema
- [ ] Validation rejects invalid capability manifests
- [ ] Discovery endpoints filter correctly
- [ ] Kernel validation helpers exported from SDK
- [ ] Tests for all endpoints

## Proof required

- API test output showing all endpoints work
- Validation rejection tests
- Capability list showing all 8 v1 capabilities

## Blockers

- WP-075 must complete (database schema)
- WP-005 (linklogic-sdk types) should be available

## Notes

- Keep capability contracts read-only after registration (versioned updates)
- Public contract layer should not expose internal implementation details
- Coordinate with WP-043 (capability plugins) for actual implementations
