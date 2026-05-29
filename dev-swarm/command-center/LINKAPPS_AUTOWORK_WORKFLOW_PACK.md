# LiNKapps LiNKautowork Workflow Pack

**Document:** LINKAPPS_AUTOWORK_WORKFLOW_PACK.md
**Work Packet:** WP-109
**Date:** 2026-05-17
**Status:** Implementation Complete

---

## Summary

This document describes the deterministic LiNKautowork workflow handlers for the Linkapps App Factory Phase 5 stages. All workflows operate in **development mode** using local/mock deterministic outputs with governed side-effect boundaries per CONTRACTS_MVO.md.

## Workflow Handle Mapping

Per `plugins/vertical/linkapps/manifest.yaml` `required_workflow_hooks`:

| Handle | Stage | Purpose | Requires Lease | Mode |
|--------|-------|---------|----------------|------|
| `autowork.linkapps.create_repo` | 5.2 | Repository generation from template | Yes | mock only |
| `autowork.linkapps.provision_services` | 5.3 | Service provisioning (Supabase, Stripe) | Yes | mock only |
| `autowork.linkapps.build_iteration` | 5.4 | AI implementation iteration | No | mock only |
| `autowork.linkapps.release_readiness` | 5.5 | Quality validation | Yes | mock only |
| `autowork.linkapps.deploy` | 5.6 | Preview deployment | Yes | mock only |
| `autowork.linkapps.compile_handoff` | 5.7 | Handoff package compilation | Yes | mock only |

## Implementation Details

### File Locations

- `LiNKautowork/gateway/src/workflows/linkapps.ts` - Workflow handler implementations
- `LiNKautowork/gateway/src/workflows/linkapps.test.ts` - Test suite
- `LiNKautowork/gateway/src/workflows/index.ts` - Registration and exports

### Stub Behavior (Development Mode)

All workflows use deterministic mock outputs. No real external writes occur:

| Capability | Mock Behavior |
|------------|---------------|
| `cap.github.repo_management` | Returns mock repo URLs, SHA digests |
| `cap.supabase.provisioning` | Returns mock project refs |
| `cap.stripe.product_management` | Returns mock price IDs |
| `cap.vercel.deployment` | Returns localhost preview URLs |

### Idempotency

All workflows require `idempotency_key` in the request. Replays with the same key return the original result without duplicating side effects (stored in memory maps for MVO).

### Lease Enforcement

Side-effecting operations fail closed (`LEASE_REQUEST_INVALID`) when:
- `lease_id` is missing or empty
- `mode` is set to `"live"` (live mode not supported in development)

### Failure Codes (CONTRACTS_MVO.md §5.4)

| Code | When |
|------|------|
| `LEASE_REQUEST_INVALID` | Missing lease_id for side-effecting operation |
| `LEASE_DENIED` | Live mode attempted in development |
| `LEASE_IDEMPOTENCY_CONFLICT` | Missing idempotency_key |
| `WORKFLOW_STEP_FAILED` | Missing required inputs |
| `LEASE_REQUEST_INVALID` | Invalid app_slug format (kebab-case violation) |

## Input/Output Schemas

### autowork.linkapps.create_repo

**Inputs:**
- `app_slug` (string, required): kebab-case app identifier
- `app_name` (string, required): Human-readable app name
- `blueprint_ref` (string, required): Reference to AppBlueprint
- `prd_ref` (string, optional): Reference to PRD
- `template_ref` (string, optional): Starter template reference
- `mode` (string, optional): Must be "mock" or undefined

**Outputs:**
- `app_repo_ref` (object): Mock repo URLs and commit SHA
- `git_commit_sha` (string): Initial commit hash
- `created_at` (string): ISO timestamp
- `lease_id` (string): Echoed from request
- `mode` (string): Always "mock"

### autowork.linkapps.provision_services

**Inputs:**
- `app_repo_ref` (object, required): Repo reference
- `tenant_id` (string, required): Tenant identifier
- `provisioning_profile_ref` (string, optional): Profile reference
- `mode` (string, optional): Must be "mock" or undefined

**Outputs:**
- `service_credentials_ref` (string): Credentials handle
- `supabase_project_ref` (string): Mock project reference
- `stripe_product_ids_ref` (object): Mock price IDs for tiers
- `provisioned_at` (string): ISO timestamp

### autowork.linkapps.build_iteration

**Inputs:**
- `app_repo_ref` (object, required): Repo reference
- `prd_ref` (string, required): PRD reference
- `squad_config` (object, optional): Squad configuration
- `iteration_num` (number, optional): Build iteration number

**Outputs:**
- `implementation_bundle_ref` (string): Bundle reference
- `built_app_bundle` (object): Build status and metadata
- `files_changed_manifest_ref` (string): Manifest reference
- `iteration_num` (number): Iteration number

### autowork.linkapps.release_readiness

**Inputs:**
- `app_repo_ref` (object, required): Repo reference
- `test_matrix_ref` (string, optional): Test configuration
- `lease_ids` (array, optional): Associated leases

**Outputs:**
- `validation_report_ref` (string): Report reference
- `checks_passed` (boolean): Validation result
- `test_results` (object): Test result summary

### autowork.linkapps.deploy

**Inputs:**
- `app_repo_ref` (object, required): Repo reference
- `deployment_target_ref` (string, optional): Target environment
- `app_slug` (string, optional): App identifier for URL
- `mode` (string, optional): Must be "mock" or undefined

**Outputs:**
- `deployment_refs` (array): Deployment references
- `preview_urls` (array): Local preview URLs
- `deployed_at` (string): ISO timestamp

### autowork.linkapps.compile_handoff

**Inputs:**
- `app_repo_ref` (object, required): Repo reference
- `service_refs` (object, optional): Service references
- `deployment_refs` (array, optional): Deployment references

**Outputs:**
- `handoff_package_ref` (string): Package reference
- `audit_event_ids` (array): Associated audit events
- `package_contents` (object): Summary of package contents

## Audit Events

All workflows emit per CONTRACTS_MVO.md §6.3.1:
- `workflow.invoked` - At start
- `workflow.completed` - On success
- `workflow.failed` - On failure

## Testing

Run tests via:
```bash
cd LiNKautowork/gateway
npm test -- linkapps.test.ts
```

Test coverage includes:
- Success paths with valid inputs
- Missing lease_id failures (fail-closed)
- Missing idempotency_key failures
- Live mode rejection
- Invalid input validation
- Idempotent replay behavior

## Constraints

1. **No live external writes**: All operations are mock/deterministic
2. **Lease required**: Side-effecting operations require valid lease_id
3. **Idempotency**: All requests must include idempotency_key
4. **Fail-closed**: Missing lease or live mode attempt results in LEASE_DENIED
5. **Development-only**: No production deployment capabilities

## References

- `plugins/vertical/linkapps/manifest.yaml` - Plugin manifest
- `dev-swarm/command-center/LINKAPPS_CAPABILITY_REQUIREMENTS.md` - Capability matrix
- `dev-swarm/command-center/CONTRACTS_MVO.md` - Cross-plane contracts
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts` - Pattern reference
