import { describe, expect, it } from "vitest";
import { getMutableRunControllerForTesting } from "./run-controller.js";

describe("run controller", () => {
  it("pauses and resumes tenant state", () => {
    const controller = getMutableRunControllerForTesting();
    controller.clear();

    controller.pauseTenant("tenant-1");
    expect(controller.isTenantPaused("tenant-1")).toBe(true);

    controller.resumeTenant("tenant-1");
    expect(controller.isTenantPaused("tenant-1")).toBe(false);
  });

  it("tracks queue status and run cancellation", () => {
    const controller = getMutableRunControllerForTesting();
    controller.clear();

    controller.enqueueRun("tenant-1", "run-1");
    controller.markRunStarted("tenant-1", "run-1");
    controller.enqueueRun("tenant-1", "run-2");
    controller.cancelRun("run-1");

    const status = controller.getQueueStatus("tenant-1");
    expect(status.running).toEqual(["run-1"]);
    expect(status.queued).toEqual(["run-2"]);
    expect(controller.isRunCancelled("run-1")).toBe(true);
  });

  it("pauses active tenants when kill switch is tripped", () => {
    const controller = getMutableRunControllerForTesting();
    controller.clear();

    controller.enqueueRun("tenant-a", "run-a");
    controller.enqueueRun("tenant-b", "run-b");
    controller.onKillSwitchTripped("cap.payload.local_sync");

    expect(controller.isTenantPaused("tenant-a")).toBe(true);
    expect(controller.isTenantPaused("tenant-b")).toBe(true);
  });
});

