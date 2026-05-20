import { describe, expect, it } from "vitest";
import { createHealthCheck } from "./health.js";
import { MetricsCollector } from "./metrics.js";

describe("health check", () => {
  it("returns ok health payload with workflow count", async () => {
    const health = createHealthCheck({
      checkDatabase: async () => ({ status: "ok", latencyMs: 3 }),
      checkIdempotencyStore: async () => ({ status: "ok" }),
      listWorkflows: () => ["autowork.websitefactory.render", "autowork.websitefactory.preview_serve"],
    });

    const result = await health.check();
    expect(result.status).toBe("ok");
    expect(result.checks.database.status).toBe("ok");
    expect(result.checks.database.latencyMs).toBe(3);
    expect(result.checks.idempotencyStore.status).toBe("ok");
    expect(result.workflowsRegistered).toBe(2);
    expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("returns degraded when one dependency fails", async () => {
    const health = createHealthCheck({
      checkDatabase: async () => ({ status: "error", latencyMs: 10, message: "timeout" }),
      checkIdempotencyStore: async () => ({ status: "ok" }),
      listWorkflows: () => [],
    });

    const result = await health.check();
    expect(result.status).toBe("degraded");
  });
});

describe("metrics collector", () => {
  it("emits Prometheus-compatible output", () => {
    const metrics = new MetricsCollector();

    metrics.incrementWorkflowInvocation("autowork.websitefactory.render", "started");
    metrics.recordLatency("autowork.websitefactory.render", 80);
    metrics.recordLatency("autowork.websitefactory.render", 320);
    metrics.incrementRetry("autowork.websitefactory.render", 1);
    metrics.incrementWorkflowInvocation("autowork.websitefactory.render", "succeeded");

    const output = metrics.getPrometheusFormat();

    expect(output).toContain("# TYPE autowork_workflow_invocations_total counter");
    expect(output).toContain('autowork_workflow_invocations_total{handle="autowork.websitefactory.render",status="started"} 1');
    expect(output).toContain('autowork_workflow_invocations_total{handle="autowork.websitefactory.render",status="succeeded"} 1');
    expect(output).toContain("# TYPE autowork_workflow_latency_ms histogram");
    expect(output).toContain('autowork_workflow_latency_ms_bucket{handle="autowork.websitefactory.render",le="100"} 1');
    expect(output).toContain('autowork_workflow_latency_ms_bucket{handle="autowork.websitefactory.render",le="500"} 2');
    expect(output).toContain('autowork_workflow_latency_ms_quantile{handle="autowork.websitefactory.render",quantile="0.5"}');
    expect(output).toContain('autowork_workflow_latency_ms_quantile{handle="autowork.websitefactory.render",quantile="0.95"}');
    expect(output).toContain('autowork_workflow_latency_ms_quantile{handle="autowork.websitefactory.render",quantile="0.99"}');
    expect(output).toContain("# TYPE autowork_running_runs gauge");
    expect(output).toContain("autowork_running_runs 0");
  });
});
