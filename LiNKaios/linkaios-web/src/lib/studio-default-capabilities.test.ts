import { describe, expect, it } from "vitest";

import type { CapabilityContext } from "../../../../LiNKskills/capability-connectors/types";
import {
  STUDIO_DEFAULT_CAPABILITY_IDS,
  createStudioDefaultCapabilityRuntime,
  getStudioDefaultCapabilitySecretRefs,
} from "../../../../LiNKskills/capability-connectors/studio-defaults";

const baseContext: CapabilityContext = {
  tenant_id: "tenant-demo",
  run_id: "run-demo",
  stage_id: "stage-demo",
  lease_id: "lease-demo",
  actor: { actor_kind: "linkaios", actor_id: "project-kernel" },
  idempotency_key: "tenant-demo:run-demo:stage-demo:test",
  mode: "mock",
};

describe("studio default capabilities", () => {
  it("declares Zulip and Plane with GSM latest-version secret references", () => {
    expect(STUDIO_DEFAULT_CAPABILITY_IDS).toEqual([
      "cap.zulip.run_messaging",
      "cap.plane.execution_tracking",
    ]);

    const refs = getStudioDefaultCapabilitySecretRefs();
    const secretRefs = [
      ...Object.values(refs.zulip),
      ...Object.values(refs.plane),
    ];

    for (const ref of secretRefs) {
      expect(ref.provider).toBe("google_secret_manager");
      expect(ref.version).toBe("latest");
      expect(ref.secret_name).toMatch(/^LINKTREND_[A-Z0-9_]+$/);
      expect(Object.keys(ref)).not.toContain("project_id");
    }
  });

  it("fails closed when execution is missing a LinkSkills lease", async () => {
    const zulip = createStudioDefaultCapabilityRuntime("cap.zulip.run_messaging");

    const result = await zulip.execute("run.notify", { message_purpose: "status" }, {
      ...baseContext,
      lease_id: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("LEASE_REQUIRED");
    expect(result.audit_events.map(event => event.action)).toEqual([
      "capability.requested",
      "capability.failed",
    ]);
  });

  it("records Zulip mock send evidence with lease and audit events", async () => {
    const zulip = createStudioDefaultCapabilityRuntime("cap.zulip.run_messaging");

    const result = await zulip.execute("channel.message.mock_send", {
      message_purpose: "operator_update",
      stream: "Project demo",
      topic: "Run status",
      content: "Mock run update",
    }, baseContext);

    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      capability_id: "cap.zulip.run_messaging",
      operation: "channel.message.mock_send",
      mode: "mock",
      external_side_effect: "none",
      lease_id: "lease-demo",
    });
    expect(result.audit_events.map(event => event.action)).toEqual(expect.arrayContaining([
      "capability.requested",
      "lease.executed",
      "zulip.notification.queued",
      "capability.executed",
    ]));
  });

  it("records Plane shadow readiness evidence with lease and audit events", async () => {
    const plane = createStudioDefaultCapabilityRuntime("cap.plane.execution_tracking");

    const result = await plane.execute("readiness.probe", {
      probe_window_floor_ts: "2026-06-01T04:00:00.000Z",
    }, {
      ...baseContext,
      mode: "shadow",
      idempotency_key: "tenant-demo:plane:readiness:2026-06-01T04",
    });

    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      capability_id: "cap.plane.execution_tracking",
      operation: "readiness.probe",
      mode: "shadow",
      external_side_effect: "none",
      lease_id: "lease-demo",
    });
    expect(result.audit_events.map(event => event.action)).toEqual(expect.arrayContaining([
      "capability.requested",
      "lease.executed",
      "plane.readiness.checked",
      "capability.executed",
    ]));
  });
});
