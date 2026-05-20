# WP-064 - Health Checks and Observability

## Objective

Add health endpoint and metrics for operational visibility into LiNKautowork.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-064-health-metrics`
- Base: `development`

## Allowed Files

- `LiNKautowork/gateway/src/lib/health.ts` (new)
- `LiNKautowork/gateway/src/lib/metrics.ts` (new)
- `LiNKautowork/gateway/src/index.ts` (add exports)
- `LiNKautowork/gateway/src/lib/health.test.ts` (new)

## Prohibited Files

- No changes to workflow handlers
- No changes to audit emitter
- No production monitoring stack (Datadog, etc.)

## Required Context

- `LiNKautowork/gateway/src/index.ts` (current exports)
- Prometheus metrics format documentation
- Health check pattern from other services

## Technical Requirements

### Health Check

```typescript
interface HealthCheck {
  check(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    checks: {
      database: { status: 'ok' | 'error'; latencyMs: number };
      idempotencyStore: { status: 'ok' | 'error' };
      // WP-062: n8n?: { status: 'ok' | 'error' };
    };
    workflowsRegistered: number;
    timestamp: string;
  }>;
}
```

### Metrics

```typescript
interface MetricsCollector {
  // Counters
  incrementWorkflowInvocation(handle: string, status: 'started' | 'succeeded' | 'failed'): void;
  incrementRetry(handle: string, attempt: number): void;
  
  // Histograms
  recordLatency(handle: string, durationMs: number): void;
  
  // Gauges
  setRunningRuns(count: number): void;
  
  // Export
  getPrometheusFormat(): string;
}
```

### Sample Prometheus Output

```
# HELP autowork_workflow_invocations_total Total workflow invocations
# TYPE autowork_workflow_invocations_total counter
autowork_workflow_invocations_total{handle="autowork.websitefactory.render",status="succeeded"} 42

# HELP autowork_workflow_latency_ms Workflow execution latency
# TYPE autowork_workflow_latency_ms histogram
autowork_workflow_latency_ms_bucket{handle="autowork.websitefactory.render",le="100"} 5
autowork_workflow_latency_ms_bucket{handle="autowork.websitefactory.render",le="500"} 15
autowork_workflow_latency_ms_bucket{handle="autowork.websitefactory.render",le="+Inf"} 20
autowork_workflow_latency_ms_sum{handle="autowork.websitefactory.render"} 4500
autowork_workflow_latency_ms_count{handle="autowork.websitefactory.render"} 20
```

## Steps

1. Create `health.ts` with health check implementation
2. Create `metrics.ts` with Prometheus-compatible metrics
3. Add health check calls to workflow runner
4. Export health check and metrics from index.ts
5. Write tests verifying health endpoint and metrics format
6. Update agent report

## Acceptance Criteria

- [ ] `/health` endpoint returns JSON health status
- [ ] Health check reports: database, idempotency store status
- [ ] Health check includes `workflows_registered` count
- [ ] Metrics collector tracks invocation counts per handle
- [ ] Metrics collector tracks latency histogram (p50, p95, p99 buckets)
- [ ] Prometheus format export available
- [ ] Running runs gauge updated in real-time

## Proof Required

```bash
# Health check
curl http://localhost:3000/health
# Returns: {"status":"ok","workflowsRegistered":7,...}

# Metrics
curl http://localhost:3000/metrics
# Returns valid Prometheus format
```

- Test output: `✓ health check returns ok`, `✓ metrics in Prometheus format`
- Agent report with curl output

## Estimated Effort

3-4 hours (backend-specialist or Kimi/Gemini)

## Blockers

None

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G5
- WP-065 (Operator Controls) depends on health checks
