import type { WorkAlert } from "@/lib/work-alerts";

export const DEMO_WORK_ALERTS: WorkAlert[] = [
  {
    id: "demo-alert-1",
    title: "Fixture · integration latency",
    severity: "warning",
    summary: "Synthetic alert for layout review — not live telemetry.",
    detail: "This item only appears when UI mocks are enabled.",
    source: "Fixture",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-alert-2",
    title: "Fixture · policy reminder",
    severity: "info",
    summary: "Reminder to confirm tool permissions before go-live.",
    detail: "Open Tool permissions in Settings to review defaults.",
    source: "Fixture",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];
