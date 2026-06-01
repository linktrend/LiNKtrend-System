# WP-063 - LinkSkills Lease Lifecycle Implementation

## Objective

Implement complete lease request → decision → execute → record flow per CONTRACTS_MVO §6.2.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-063-linkskills-lease-lifecycle`
- Base: `development`

## Allowed files

- `packages/linkskills-core/src/lease/`
- `packages/linkskills-core/src/idempotency/`
- `packages/linkskills-core/src/api/lease.ts`
- `packages/linklogic-sdk/src/types/lease.ts`
- `packages/linkskills-core/tests/`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/linkskills-agent.md`

## Prohibited files

- Old repo implementation files
- Capability backend implementations (separate packets)
- LiNKaios kernel logic

## Required context

- `LiNKdev/product/grounding/LINKSKILLS_COMPLETION_PLAN.md` §4.2, 4.3
- `LiNKdev/product/grounding/CONTRACTS_MVO.md` §6.2 (complete lease lifecycle)
- `/Users/linktrend/Projects/LiNKskills/SOP_MACHINE_MVO_CLASS_A.md` §7 (idempotency)
- WP-061 (schema), WP-062 (catalog)

## Steps

1. Define lease types in SDK:
   - `LeaseRequest` interface
   - `LeaseDecision` interface
   - `LeaseExecuteRequest` / `LeaseExecuteResult` interfaces
   - `LeaseStatus` enum

2. Implement `skills.lease.request`:
   - Validate capability exists (call catalog API)
   - Check kill switch state (WP-064 integration)
   - Validate idempotency key format: `${run_id}:${stage_id}:${capability}`
   - Check if lease already exists for idempotency key
   - Return `LeaseDecision` with `granted|denied|requires_approval`
   - If `granted`, set default TTL (5 min expiry)
   - Persist to `linkskills.lease_requests`

3. Implement `skills.lease.execute`:
   - Validate lease_id exists and is in `granted` or `requires_approval` (post-approval) status
   - Verify idempotency key matches original request
   - Check idempotency cache - if same key + same payload, return original result
   - If different payload with same key, return 409 conflict
   - Call capability backend (stub or real)
   - Record to `linkskills.lease_ledger`
   - Emit `lease.executed` audit event to LiNKbrain
   - Return `LeaseExecuteResult` with `ledger_entry_id` + `audit_event_id`

4. Implement idempotency service:
   - `checkIdempotency(tenant_id, idempotency_key, capability, payload)`
   - 24h TTL per SOP_MACHINE_MVO_CLASS_A §7
   - Hash payload for comparison
   - Store in `linkskills.idempotency_cache`

5. Implement lease expiry:
   - Background job to expire leases past TTL
   - Update status to `expired`
   - Emit `lease.expired` audit event

6. Implement lease revocation:
   - Admin endpoint to revoke active lease
   - Update status to `revoked`
   - Emit `lease.revoked` audit event

7. Implement approval flow support:
   - `requires_approval` status handling
   - Approval webhook for LiNKaios kernel
   - Post-approval execution path

## Acceptance criteria

- [ ] `skills.lease.request` returns correct decision types
- [ ] `skills.lease.execute` performs idempotent execution
- [ ] 24h idempotency window enforced
- [ ] 5 minute default lease TTL
- [ ] Audit events emitted: `lease.requested`, `lease.granted`, `lease.denied`, `lease.executed`, `lease.expired`
- [ ] Conflict (409) on mismatched payload with same idempotency key
- [ ] Kill switch check in request path
- [ ] Original result returned on idempotent replay

## Proof required

- Lease lifecycle integration test output
- Idempotency test (same key, same payload → same result)
- Conflict test (same key, different payload → 409)
- Expiry test (lease expires after TTL)
- Audit event capture showing all required events

## Blockers

- WP-061 (schema) must complete
- WP-062 (catalog) must complete
- WP-064 (kill switch) should be available for integration

## Notes

- Lease execution MUST emit audit event BEFORE returning success
- Idempotency check MUST happen before side effect
- Original repo patterns in `services/logic-engine/` are reference only
- Coordinate with WP-007 if old LinkSkills lease code exists
