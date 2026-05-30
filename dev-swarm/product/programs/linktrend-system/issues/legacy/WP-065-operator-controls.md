# WP-065 - Operator Control Plane

## Objective

Allow operators to pause, cancel, and monitor workflow runs through LiNKaios UI.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-065-operator-controls`
- Base: `dev/codex/WP-064-health-metrics`

## Allowed Files

- `LiNKautowork/gateway/src/lib/run-controller.ts` (new)
- `LiNKautowork/gateway/src/index.ts` (add exports)
- `apps/linkaios-web/src/panels/autowork-controls/` (new panel)
- `apps/linkaios-web/src/panels/autowork-controls/index.tsx` (new)

## Prohibited Files

- No changes to workflow handlers
- No changes to core runner logic (except pause check)

## Hard Boundaries

- Development mode controls only
- No production circuit breaker integration yet

## Required Context

- `CONTRACTS_MVO.md` §4.4 (run cancellation)
- WP-064 health metrics
- LiNKaios plugin UI panel patterns

## Technical Requirements

### Run Controller

```typescript
interface RunController {
  // Per-tenant controls
  pauseTenant(tenantId: string): void;
  resumeTenant(tenantId: string): void;
  isTenantPaused(tenantId: string): boolean;
  
  // Per-run controls
  cancelRun(runId: string): void;
  isRunCancelled(runId: string): boolean;
  
  // Kill switch listener
  onKillSwitchTripped(capability: string): void;
  
  // Queue status
  getQueueStatus(tenantId: string): {
    running: string[];
    queued: string[];
    paused: boolean;
  };
}
```

### Integration Points

1. **Workflow Runner**: Check `isTenantPaused` and `isRunCancelled` before/after each handler
2. **LinkSkills**: Subscribe to kill-switch events
3. **LiNKaios UI**: New panel for operator controls

### UI Panel Design

```
┌─ LiNKautowork Controls ──────────────┐
│ Tenant: tenant-1                    │
│ Status: [Running] [Paused ▼]       │
│                                     │
│ Active Runs:                        │
│ • run-123  [Cancel]                │
│ • run-456  [Cancel]                │
│                                     │
│ Queue: 3 runs waiting               │
│                                     │
│ [Pause All] [Resume All]            │
└─────────────────────────────────────┘
```

## Steps

1. Implement `RunController` class with pause/cancel tracking
2. Add pause/cancel checks to workflow runner
3. Create LiNKaios UI panel component
4. Wire panel to run controller API
5. Add kill-switch subscription
6. Write tests for pause/resume/cancel scenarios
7. Update agent report

## Acceptance Criteria

- [ ] `pauseTenant` prevents new runs from starting
- [ ] `resumeTenant` allows queued runs to proceed
- [ ] `cancelRun` stops in-flight run gracefully
- [ ] Kill-switch events pause affected capability runs
- [ ] UI panel shows run queue and controls
- [ ] Pause/resume buttons work in UI
- [ ] Cancel button stops individual runs

## Proof Required

- Screenshot: LiNKaios UI panel with controls
- Test output:
  ```
  ✓ pausing tenant queues new runs
  ✓ resuming tenant processes queued runs
  ✓ canceling run stops in-flight execution
  ✓ kill-switch pauses capability runs
  ```
- Agent report with UI screenshot path

## Estimated Effort

6-8 hours (frontend-specialist + backend-specialist)

## Blockers

- WP-064 (Health Metrics) — provides foundation
- LiNKaios kernel API for panel registration

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G6
- CONTRACTS_MVO.md §4.4 (status transitions)
