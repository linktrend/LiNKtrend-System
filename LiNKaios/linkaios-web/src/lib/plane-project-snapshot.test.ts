import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { adminProcessesForSuite } from "@/lib/admin-suite-templates";
import { buildPlaneSnapshotFromTemplates } from "@/lib/plane-project-snapshot";

describe("plane project snapshot", () => {
  it("builds phases and issues from admin suite templates", () => {
    const modules = adminProcessesForSuite("linksuitegen");
    const snapshot = buildPlaneSnapshotFromTemplates(modules);

    expect(snapshot.phases.length).toBeGreaterThan(0);
    expect(snapshot.issues.length).toBeGreaterThan(0);
    expect(snapshot.linkbotRoles.length).toBeGreaterThan(0);
    expect(snapshot.automationTitles.length).toBeGreaterThan(0);
  });

  it("maps Plane work-item state onto template issues by title", () => {
    const modules = adminProcessesForSuite("linksuitegen");
    const issueTitle = modules[0]?.workflows[0]?.issues[0]?.title;
    expect(issueTitle).toBeTruthy();

    const snapshot = buildPlaneSnapshotFromTemplates(modules, [
      {
        id: "plane-issue-1",
        name: issueTitle,
        state: { group: "started", name: "In Progress" },
        updated_at: "2026-06-10T12:00:00.000Z",
      },
    ]);

    const matched = snapshot.issues.find((issue) => issue.title === issueTitle);
    expect(matched?.status).toBe("running");
    expect(snapshot.phases[0]?.status).toBe("running");
  });
});
