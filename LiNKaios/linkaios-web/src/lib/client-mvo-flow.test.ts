import { describe, expect, it } from "vitest";

import {
  assertClientMvoFlowComplete,
  CLIENT_MVO_FLOW_STEPS,
  LINKSITES_SUITE_ID,
  projectLaunchHref,
  projectRunProgressHref,
  suiteSubscribeHref,
} from "./client-mvo-flow";

describe("client MVO flow (LTS-002)", () => {
  it("defines sign-in → subscribe → launch → run progress routes", () => {
    expect(CLIENT_MVO_FLOW_STEPS.map((s) => s.id)).toEqual([
      "sign_in",
      "subscribe_suite",
      "launch_project",
      "run_progress",
    ]);
    expect(suiteSubscribeHref(LINKSITES_SUITE_ID)).toBe("/suites/linksites?tab=subscribe");
    expect(projectLaunchHref(LINKSITES_SUITE_ID)).toBe("/projects/new?suite=linksites");
    expect(projectRunProgressHref("proj-demo-1")).toBe("/projects/proj-demo-1?tab=runs");
  });

  it("acceptance: licensee sign-in, LinkSites subscribe, project launch, run progress", () => {
    const result = assertClientMvoFlowComplete({
      canSignIn: true,
      linksitesSubscribed: true,
      canLaunchProject: true,
      hasRunProgressEntry: true,
    });
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });
});
