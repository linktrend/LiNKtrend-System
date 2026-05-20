# WP-217 — LiNKautowork Status and Idempotency Visibility Report

## Status
**COMPLETE**  
**Agent:** Kimi  
**Date:** 2026-05-18  
**Branch:** `wp-217-autowork-status-idempotency-visibility`  
**Commit:** `d881126`

## Objective
Expose LiNKautowork workflow status, idempotency, retry, and audit refs to the LinkSites proof surface.

## Worktree / Branch Proof
- Worktree: `/Users/linktrend/Projects/LiNKtrend-System/.worktrees/WP-217-autowork-status-idempotency-visibility`
- Branch: `wp-217-autowork-status-idempotency-visibility`
- Clean-start check: `git status --short --branch` -> clean before edits

## Context Read
- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/REPO_INVENTORY.md`
- `.ai-swarm/LINKAUTOWORK_COMPLETION_PLAN.md`
- Carry-forward reports:
  - `.worktrees/WP-210-baseline-fix-and-build-gate/.ai-swarm/AGENT_REPORTS/WP-210-baseline-fix-and-build-gate.md`
  - `.worktrees/WP-212-linksites-runtime-spine/.ai-swarm/AGENT_REPORTS/WP-212-linksites-runtime-spine.md`
  - `.ai-swarm/AGENT_REPORTS/WP-213-linksites-linkskills-enforcement.md`

## Files Changed

### WP-210 Blocker Fixes
| File | Change |
|------|--------|
| `LiNKautowork/gateway/src/lib/idempotency-store.ts` | Add "compensated" to PersistedEntry status union |
| `LiNKautowork/gateway/src/lib/payload-client.ts` | Fix FetchLike type (RequestInfo -> string \| URL \| Request) |
| `LiNKautowork/gateway/src/lib/payload-client.ts` | Fix HeadersInit -> Record<string, string> |
| `LiNKautowork/gateway/src/lib/supabase-client.ts` | Fix FetchLike type (RequestInfo -> string \| URL \| Request) |
| `LiNKautowork/gateway/src/lib/linksites-v2.integration.test.ts` | Fix vitest mock typing with Parameters<FetchLike> |

### WP-217 New Implementation
| File | Purpose |
|------|---------|
| `LiNKautowork/gateway/src/lib/workflow-status.ts` | Workflow status read model for LiNKaios |
| `LiNKautowork/gateway/src/lib/workflow-status.test.ts` | 8 focused tests for status/idempotency |
| `LiNKautowork/N8N_BOUNDARY.md` | External n8n boundary and dev/shadow/live documentation |
| `LiNKautowork/gateway/src/index.ts` | Export workflow status module |

## Workflow Status Read Model

### Exposed Query Interface
```typescript
interface WorkflowStatusQuery {
  byWorkflowRunId(workflowRunId: string): WorkflowRunView | undefined;
  byTenantAndRun(tenantId: string, runId: string): WorkflowRunView[];
  byIdempotencyKey(idempotencyKey: string): WorkflowRunView | undefined;
  listActive(tenantId?: string): WorkflowRunView[];
  listRecent(limit?: number): WorkflowRunView[];
}
```

### WorkflowRunView Fields
- `workflow_run_id`, `tenant_id`, `run_id`, `stage_id`, `workflow_handle`
- `status`: pending | running | succeeded | failed | compensated
- `attempt`: retry attempt number (1-3 per CONTRACTS_MVO.md)
- `idempotency_key`: idempotency key for deduplication
- `lease_id`: LinkSkills lease reference
- `audit_event_ids`: LiNKbrain event refs
- `retry_exhausted`: boolean flag for final failure

## Tests (59 total, 8 new)

### New Workflow Status Tests
1. records and retrieves workflow run by id
2. retrieves run by idempotency key
3. lists active runs (pending or running)
4. lists recent runs sorted by time
5. updates run status
6. queries by tenant and parent run id
7. builds run view from invoke result with retry_exhausted
8. exposes idempotency proof - same key returns same run

### Test Evidence
```
Test Files  10 passed (10)
     Tests  59 passed (59)
Duration  483ms
```

## Proof Commands

### Typecheck
```bash
pnpm --filter @linktrend/autowork-gateway typecheck
# Result: PASS (0 errors)
```

### Tests
```bash
pnpm --filter @linktrend/autowork-gateway test
# Result: 59 passed (10 test files)
```

## Idempotency Contract Verification

Per `CONTRACTS_MVO.md` §0.A.10.1:

| Requirement | Status |
|-------------|--------|
| Idempotency key format: `${run_id}:${stage_id}:${workflow_handle}` | ✅ Verified in tests |
| Repeat invocation returns original `workflow_run_id` | ✅ Verified in tests |
| No duplicate side effects | ✅ IdempotencyStore enforces |
| TTL: 24 hours default | ✅ Configurable via `ttlHours` |
| Status union includes "compensated" | ✅ Fixed in idempotency-store.ts |

## Retry/Backoff Verification

| Requirement | Status |
|-------------|--------|
| Max 3 attempts | ✅ ExponentialBackoffPolicy |
| Delays: 1s, 4s, 16s | ✅ Configured in retry-policy.ts |
| Non-retryable failures fail immediately | ✅ LEASE_DENIED, WORKFLOW_NOT_FOUND |
| Each attempt recorded | ✅ Attempt number in WorkflowContext |
| `retry_exhausted` in final failure | ✅ Included in WorkflowRunView |

## n8n Boundary Documentation

Created `LiNKautowork/N8N_BOUNDARY.md` documenting:
- Architecture boundary between gateway and external n8n
- Current dev/shadow/live posture (MVO = local/dev mode default)
- Environment configuration variables
- Idempotency store types (InMemory/File)
- Workflow status visibility interface
- Retry/backoff policy details
- Registered workflow handles (WebsiteFactory + LinkSites v2)
- MVO limitations and post-MVO roadmap

## Blockers

None. All acceptance criteria met.

## Decisions

- Used `Record<string, string>` instead of `HeadersInit` for broader compatibility
- Used `Parameters<FetchLike>` and `ReturnType<FetchLike>` for vitest mock typing
- Made `audit_event_ids` required in WorkflowRunView (not optional) to ensure audit trail

## Next Steps

1. **WP-216 (LiNKaios Cockpit Proof Surface)** - Consume workflow status via the query interface
2. **Integration** - Merge through `development` branch per agent coordination rules
3. **WP-218 (LinkSites Proof Runbook)** - Use status read model for demo verification

## Acceptance Criteria Verification

| Criteria | Status |
|----------|--------|
| LiNKaios can display workflow status and idempotency proof | ✅ WorkflowStatusQuery interface exposed |
| Reruns do not create fake duplicate success | ✅ IdempotencyStore + test verification |
| Tests prove retry/idempotency behavior in LinkSites path | ✅ 8 new tests + 51 existing |
| Typecheck passes | ✅ 0 errors |
| Tests pass | ✅ 59 passed |
| n8n boundary documented | ✅ N8N_BOUNDARY.md created |

## Secrets / Side-Effects Check

- No `.env` edits
- No secret writes
- No real Supabase/Payload connections established (dev mode stubs)
- No live outreach/publishing/provisioning side effects
