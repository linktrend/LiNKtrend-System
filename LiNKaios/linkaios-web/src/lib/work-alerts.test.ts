import { describe, expect, it } from "vitest";

import { isActionableWorkAlert, traceToWorkAlert } from "./work-alerts";

describe("traceToWorkAlert", () => {
  it("humanizes routine project lifecycle events", () => {
    const alert = traceToWorkAlert({
      id: "1",
      event_type: "project.created",
      project_id: "abc-123",
      created_at: "2026-06-01T12:00:00.000Z",
      payload: { suite_id: "linksites", tenant_id: "tenant-1", cadence: "once" },
    });

    expect(alert.title).toBe("Project launched");
    expect(alert.summary).not.toContain("cadence");
    expect(alert.summary).toContain("Suite linksites");
  });

  it("surfaces error messages in summary", () => {
    const alert = traceToWorkAlert({
      id: "2",
      event_type: "openclaw_error",
      created_at: "2026-06-01T12:00:00.000Z",
      payload: { message: "Gateway disconnected during tool run" },
    });

    expect(alert.title).toBe("LiNKbot runtime error");
    expect(alert.summary).toBe("Gateway disconnected during tool run");
    expect(alert.severity).toBe("critical");
  });
});

describe("isActionableWorkAlert", () => {
  it("excludes info-level lifecycle traces from the action queue", () => {
    const alert = traceToWorkAlert({
      id: "3",
      event_type: "project.created",
      created_at: "2026-06-01T12:00:00.000Z",
      payload: {},
    });

    expect(isActionableWorkAlert(alert)).toBe(false);
  });

  it("includes warning and critical alerts", () => {
    const warning = traceToWorkAlert({
      id: "4",
      event_type: "gateway.error",
      created_at: "2026-06-01T12:00:00.000Z",
      payload: { error: "timeout" },
    });
    expect(isActionableWorkAlert(warning)).toBe(true);
  });
});
