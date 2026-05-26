import { describe, expect, it } from "vitest";

import {
  dualProjectMissionIdFields,
  resolveMissionIdFromRecord,
  withMissionIdAlias,
  withProjectIdAlias,
} from "./project-mission-id";

describe("project-mission-id API aliases", () => {
  it("dualProjectMissionIdFields mirrors the same trimmed id", () => {
    expect(dualProjectMissionIdFields("  demo-smb  ")).toEqual({
      projectId: "demo-smb",
      missionId: "demo-smb",
    });
  });

  it("resolveMissionIdFromRecord prefers projectId over missionId", () => {
    expect(
      resolveMissionIdFromRecord({ projectId: "proj-a", missionId: "legacy-b" }),
    ).toBe("proj-a");
  });

  it("resolveMissionIdFromRecord falls back to missionId", () => {
    expect(resolveMissionIdFromRecord({ missionId: "legacy-b" })).toBe("legacy-b");
  });

  it("withProjectIdAlias adds projectId from missionId", () => {
    expect(withProjectIdAlias({ missionId: "x", status: "ok" })).toEqual({
      missionId: "x",
      projectId: "x",
      status: "ok",
    });
  });

  it("withMissionIdAlias adds missionId from projectId", () => {
    expect(withMissionIdAlias({ projectId: "y", createdAt: "t" })).toEqual({
      projectId: "y",
      missionId: "y",
      createdAt: "t",
    });
  });
});
