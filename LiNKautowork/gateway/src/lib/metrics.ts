export type InvocationStatus = "started" | "succeeded" | "failed";

const LATENCY_BUCKETS_MS = [50, 100, 250, 500, 1000, 2500, 5000, 10000, Infinity] as const;

interface HistogramState {
  bucketCounts: number[];
  sum: number;
  count: number;
  observations: number[];
}

function keyForHandleStatus(handle: string, status: InvocationStatus): string {
  return `${handle}::${status}`;
}

function escapeLabelValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function percentile(sorted: number[], quantile: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil(quantile * sorted.length) - 1;
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)] ?? 0;
}

export class MetricsCollector {
  private readonly invocations = new Map<string, number>();
  private readonly retries = new Map<string, number>();
  private readonly latencyByHandle = new Map<string, HistogramState>();
  private runningRuns = 0;

  incrementWorkflowInvocation(handle: string, status: InvocationStatus): void {
    const key = keyForHandleStatus(handle, status);
    this.invocations.set(key, (this.invocations.get(key) ?? 0) + 1);

    if (status === "started") {
      this.runningRuns += 1;
      return;
    }

    this.runningRuns = Math.max(0, this.runningRuns - 1);
  }

  incrementRetry(handle: string, attempt: number): void {
    const key = `${handle}::${attempt}`;
    this.retries.set(key, (this.retries.get(key) ?? 0) + 1);
  }

  recordLatency(handle: string, durationMs: number): void {
    const safeDuration = Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : 0;
    const histogram = this.latencyByHandle.get(handle) ?? {
      bucketCounts: new Array(LATENCY_BUCKETS_MS.length).fill(0),
      sum: 0,
      count: 0,
      observations: [] as number[],
    };

    LATENCY_BUCKETS_MS.forEach((bucketUpperBound, index) => {
      if (safeDuration <= bucketUpperBound) {
        histogram.bucketCounts[index] += 1;
      }
    });

    histogram.sum += safeDuration;
    histogram.count += 1;
    histogram.observations.push(safeDuration);
    this.latencyByHandle.set(handle, histogram);
  }

  setRunningRuns(count: number): void {
    this.runningRuns = Math.max(0, Math.floor(count));
  }

  getRunningRuns(): number {
    return this.runningRuns;
  }

  getPrometheusFormat(): string {
    const lines: string[] = [];

    lines.push("# HELP autowork_workflow_invocations_total Total workflow invocations");
    lines.push("# TYPE autowork_workflow_invocations_total counter");
    for (const [key, value] of this.invocations.entries()) {
      const [handle, status] = key.split("::");
      lines.push(
        `autowork_workflow_invocations_total{handle=\"${escapeLabelValue(handle ?? "") }\",status=\"${escapeLabelValue(status ?? "") }\"} ${value}`,
      );
    }

    lines.push("");
    lines.push("# HELP autowork_workflow_retries_total Total workflow retries by attempt number");
    lines.push("# TYPE autowork_workflow_retries_total counter");
    for (const [key, value] of this.retries.entries()) {
      const [handle, attempt] = key.split("::");
      lines.push(
        `autowork_workflow_retries_total{handle=\"${escapeLabelValue(handle ?? "") }\",attempt=\"${escapeLabelValue(attempt ?? "") }\"} ${value}`,
      );
    }

    lines.push("");
    lines.push("# HELP autowork_running_runs Current number of running workflow runs");
    lines.push("# TYPE autowork_running_runs gauge");
    lines.push(`autowork_running_runs ${this.runningRuns}`);

    lines.push("");
    lines.push("# HELP autowork_workflow_latency_ms Workflow execution latency in milliseconds");
    lines.push("# TYPE autowork_workflow_latency_ms histogram");

    for (const [handle, histogram] of this.latencyByHandle.entries()) {
      LATENCY_BUCKETS_MS.forEach((bucketUpperBound, index) => {
        const bucketLabel = bucketUpperBound === Infinity ? "+Inf" : String(bucketUpperBound);
        lines.push(
          `autowork_workflow_latency_ms_bucket{handle=\"${escapeLabelValue(handle)}\",le=\"${bucketLabel}\"} ${histogram.bucketCounts[index] ?? 0}`,
        );
      });
      lines.push(`autowork_workflow_latency_ms_sum{handle=\"${escapeLabelValue(handle)}\"} ${histogram.sum}`);
      lines.push(`autowork_workflow_latency_ms_count{handle=\"${escapeLabelValue(handle)}\"} ${histogram.count}`);

      const sorted = [...histogram.observations].sort((a, b) => a - b);
      lines.push(
        `autowork_workflow_latency_ms_quantile{handle=\"${escapeLabelValue(handle)}\",quantile=\"0.5\"} ${percentile(sorted, 0.5)}`,
      );
      lines.push(
        `autowork_workflow_latency_ms_quantile{handle=\"${escapeLabelValue(handle)}\",quantile=\"0.95\"} ${percentile(sorted, 0.95)}`,
      );
      lines.push(
        `autowork_workflow_latency_ms_quantile{handle=\"${escapeLabelValue(handle)}\",quantile=\"0.99\"} ${percentile(sorted, 0.99)}`,
      );
    }

    return `${lines.join("\n")}\n`;
  }
}
