# WP-061 - Retry with Exponential Backoff

## Objective

Implement retry logic per CONTRACTS_MVO.md §0.A.10.1: exponential backoff (1s, 4s, 16s), max 3 attempts.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-061-retry-backoff`
- Base: `development`

## Allowed Files

- `LiNKautowork/gateway/src/lib/retry-policy.ts` (new)
- `LiNKautowork/gateway/src/lib/workflow-runner.ts` (modify)
- `LiNKautowork/gateway/src/lib/retry-policy.test.ts` (new tests)

## Prohibited Files

- Do not modify idempotency store implementation (WP-060 owns that)
- Do not change audit emitter

## Required Context

- `LiNKautowork/gateway/src/lib/workflow-runner.ts` lines 138-201 (handler invocation)
- `CONTRACTS_MVO.md` §0.A.10.1 (retry rule)
- Current `FailureReport` interface with `retryable` boolean

## Technical Requirements

### Retry Policy

```typescript
interface RetryPolicy {
  maxAttempts: number; // 3
  delaysMs: number[];  // [1000, 4000, 16000]
  shouldRetry(failure: FailureReport, attempt: number): boolean;
}

// Non-retryable codes (fail immediately):
// - WORKFLOW_NOT_FOUND
// - LEASE_DENIED
// - LEASE_KILL_SWITCH
// - LEASE_REQUEST_INVALID
```

### Retry Logic

```typescript
// In invokeWorkflow:
// 1. Check idempotency cache
// 2. For attempt = 1 to maxAttempts:
//    a. Run handler
//    b. If success → cache result, return
//    c. If failure and !retryable → return failure
//    d. If failure and retryable and attempt < maxAttempts → delay, continue
//    e. If attempt === maxAttempts → return failure with retry_exhausted
// 3. Emit workflow.failed for final failure
```

### Stage Attempt Recording

Per CONTRACTS_MVO.md §4.6: "Each attempt MUST be a new Stage.attempt row, not an overwrite."

- First attempt: `attempt: 1` (existing)
- Retry 1: `attempt: 2`
- Retry 2: `attempt: 3`

## Steps

1. Create `retry-policy.ts` with `ExponentialBackoffPolicy` class
2. Modify `invokeWorkflow` to wrap handler in retry loop
3. Add delay utility (async sleep)
4. Track attempt number in context
5. Write tests for:
   - Success on first attempt
   - Success on retry (2nd or 3rd attempt)
   - Failure after 3 attempts
   - Non-retryable failure fails immediately
6. Update agent report

## Acceptance Criteria

- [ ] Retry policy class implemented with configurable delays
- [ ] 1s, 4s, 16s delays between attempts
- [ ] Max 3 attempts enforced
- [ ] Non-retryable codes fail immediately (no retry)
- [ ] Each attempt increments `context.attempt`
- [ ] Final failure includes `retry_exhausted: true` in payload
- [ ] Audit events: `workflow.invoked` once, then retries don't emit additional invoked events

## Proof Required

- Test output showing retry behavior:
  ```
  ✓ succeeds on first attempt
  ✓ succeeds on second attempt after 1s delay
  ✓ succeeds on third attempt after 4s then 16s delays
  ✓ fails immediately for LEASE_DENIED
  ✓ fails after 3 attempts for WORKFLOW_STEP_FAILED
  ```
- Agent report with commit SHA

## Estimated Effort

2-3 hours (backend-specialist or Codex)

## Blockers

None

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G2
- CONTRACTS_MVO.md §4.6, §0.A.10.1
