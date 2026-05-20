# WP-067 - LinkSkills Integration Test Harness

## Objective

End-to-end test harness for capability lease flows, idempotency, kill switches, and audit verification.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-067-linkskills-integration-tests`
- Base: `development`

## Allowed files

- `packages/linkskills-core/tests/integration/`
- `packages/linkskills-core/tests/fixtures/`
- `packages/linkskills-core/tests/helpers/`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Production code changes (tests only)
- Old repo test patterns (new tests for new architecture)

## Required context

- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md` §4
- `.ai-swarm/CONTRACTS_MVO.md` §6.2, §8 (audit requirements)
- WP-061 through WP-066 (all components under test)

## Steps

1. Create test fixtures:
   - Mock capability backend
   - Test tenant and credentials
   - Sample capabilities (test.echo, test.mock)
   - Test skill manifests

2. Implement lease lifecycle test suite:
   - Test: request → granted → execute → success
   - Test: request → denied (kill switch)
   - Test: request → requires_approval → execute
   - Test: lease expiry
   - Test: lease revocation

3. Implement idempotency test suite:
   - Test: same key + same payload → same result
   - Test: same key + different payload → 409 conflict
   - Test: 24h TTL enforcement
   - Test: replay after 24h creates new execution

4. Implement kill switch test suite:
   - Test: trip switch → lease denied
   - Test: reset switch → lease granted
   - Test: global halt → all new leases blocked
   - Test: in-flight leases complete during halt

5. Implement audit verification suite:
   - Test: all lease events emit audit
   - Test: audit event sequence per CONTRACTS_MVO §8
   - Test: failure audit includes correct error codes
   - Test: PII not in audit payload

6. Implement capability integration test:
   - Mock backend for `cap.test.echo`
   - Full flow: request lease → execute capability → verify result
   - Verify ledger entry created
   - Verify idempotency cache updated

7. Create test harness utilities:
   - `createTestTenant()` - setup helper
   - `createTestCapability()` - register mock capability
   - `waitForLeaseExpiry()` - time helper
   - `getAuditEvents()` - LiNKbrain query helper
   - `resetKillSwitch()` - safety helper

## Acceptance criteria

- [ ] All lease lifecycle paths tested
- [ ] Idempotency behavior verified
- [ ] Kill switch behavior verified
- [ ] Audit events match CONTRACTS_MVO §8 requirements
- [ ] Mock capability backend works end-to-end
- [ ] Test utilities reusable for other packets
- [ ] Test suite passes in CI

## Proof required

- Test run output showing all suites pass
- Coverage report
- Sample audit event capture

## Blockers

- WP-061 through WP-066 must complete
- Mock capability backend needs WP-062 catalog
- Audit verification needs LiNKbrain test instance

## Notes

- Integration tests use real database (test schema)
- Mock capability backends are in-process
- Audit verification queries LiNKbrain directly
- This is the final LinkSkills hardening packet
- Tests serve as executable documentation of contracts
