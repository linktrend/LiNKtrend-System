import { describe, expect, it } from "vitest";

import { traceRowToLegacy, TRACE_LIST_COLUMNS } from "@/lib/traces-db";

describe("traces-db", () => {
  it("selects project_id column for post-migration schema", () => {
    expect(TRACE_LIST_COLUMNS).toContain("project_id");
    expect(TRACE_LIST_COLUMNS).not.toContain("mission_id");
  });

  it("maps project_id to legacy mission_id alias", () => {
    const legacy = traceRowToLegacy({
      id: "trace-1",
      event_type: "run.created",
      project_id: "project-1",
      created_at: "2026-06-01T12:00:00.000Z",
      payload: { run_id: "run-1" },
    });
    expect(legacy.mission_id).toBe("project-1");
    expect(legacy.project_id).toBe("project-1");
  });
});
