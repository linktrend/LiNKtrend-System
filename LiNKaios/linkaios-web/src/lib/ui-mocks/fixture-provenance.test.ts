import { describe, expect, it } from "vitest";

import { DEMO_WORK_ALERTS } from "@/lib/ui-mocks/work-alert-fixtures";
import { isUiMockWorkAlert } from "@/lib/ui-mocks/fixture-provenance";
import type { WorkAlert } from "@/lib/work-alerts";

describe("fixture provenance", () => {
  it("marks demo work alerts as fixtures", () => {
    expect(isUiMockWorkAlert(DEMO_WORK_ALERTS[0]!)).toBe(true);
  });

  it("does not mark live trace alerts as fixtures", () => {
    const live: WorkAlert = {
      id: "trace-abc",
      title: "kernel.stage.completed",
      severity: "info",
      summary: "ok",
      detail: "detail",
      source: "project proj-1",
      createdAt: new Date().toISOString(),
    };
    expect(isUiMockWorkAlert(live)).toBe(false);
  });
});
