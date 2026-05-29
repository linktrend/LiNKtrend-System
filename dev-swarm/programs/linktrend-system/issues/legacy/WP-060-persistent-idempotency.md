# WP-060 - Persistent Idempotency Store

## Objective

Replace in-memory idempotency cache with persistent storage to survive process restarts.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-060-persistent-idempotency`
- Base: `dev/codex/WP-059-linkautowork-completion-plan-runtime-hardening`

## Allowed Files

- `LiNKautowork/gateway/src/lib/idempotency-store.ts` (new)
- `LiNKautowork/gateway/src/lib/workflow-runner.ts` (modify)
- `packages/db/schema/autowork/0001_idempotency.sql` (new migration)
- `LiNKautowork/gateway/src/lib/idempotency-store.test.ts` (new tests)

## Prohibited Files

- Do not modify contract types in `packages/linklogic-sdk`
- Do not change workflow handlers

## Required Context

- `LiNKautowork/gateway/src/lib/workflow-runner.ts` lines 22-26 (current in-memory cache)
- `CONTRACTS_MVO.md` §6.4 (idempotency contract)
- `@linktrend/db` package for Postgres connection

## Technical Requirements

### Database Schema

```sql
CREATE TABLE autowork_idempotency_keys (
  key_hash VARCHAR(64) PRIMARY KEY, -- SHA-256 of idempotency_key
  tenant_id VARCHAR(64) NOT NULL,
  workflow_handle VARCHAR(255) NOT NULL,
  workflow_run_id UUID NOT NULL,
  result_json JSONB NOT NULL, -- serialized WorkflowInvokeResult
  status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

  INDEX idx_tenant_handle (tenant_id, workflow_handle),
  INDEX idx_expires (expires_at)
);
```

### Interface

```typescript
interface IdempotencyStore {
  getCachedResult(keyHash: string): Promise<WorkflowInvokeResult | undefined>;
  cacheResult(
    keyHash: string,
    tenantId: string,
    workflowHandle: string,
    workflowRunId: string,
    result: WorkflowInvokeResult,
    ttlHours?: number
  ): Promise<void>;
  cleanupExpired(before: Date): Promise<number>; // returns deleted count
}
```

## Steps

1. Create migration file with schema above
2. Implement `PostgresIdempotencyStore` class
3. Modify `workflow-runner.ts` to use persistent store
4. Add cleanup cron/background job (or TTL-based deletion)
5. Write tests verifying persistence across restart
6. Update `dev-swarm/reports/legacy-ai-swarm/linkautowork-agent.md`

## Acceptance Criteria

- [ ] Migration applies cleanly
- [ ] Idempotency table has correct schema
- [ ] `invokeWorkflow` checks Postgres before running handler
- [ ] Duplicate `idempotency_key` returns cached `workflow_run_id` without re-execution
- [ ] TTL cleanup removes expired entries
- [ ] Tests simulate restart: process A caches, process B reads same result

## Proof Required

- Migration applied: `psql \d autowork_idempotency_keys`
- Test output: `✓ returns cached result after simulated restart`
- Agent report with commit SHA and branch

## Estimated Effort

2-3 hours (backend-specialist or Kimi/Gemini)

## Blockers

None

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G1
- WP-059 completion plan
