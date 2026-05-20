import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleZulipRunMessaging } from "./capability-handlers.js";

const mockClient = {} as SupabaseClient;

const context = {
  tenant_id: "tenant-1",
  run_id: "run-1",
  stage_id: "stage-1",
  lease_id: "lease-1",
  actor: { actor_kind: "bot", actor_id: "linkbot-1" },
  idempotency_key: "idem-1",
};

describe("handleZulipRunMessaging", () => {
  it("returns a mocked queued message for run.notify", async () => {
    const result = await handleZulipRunMessaging(
      mockClient,
      {
        mode: "mock",
        operation: "run.notify",
        message_purpose: "run.notify",
      },
      context,
    );

    expect(result.status).toBe("queued_mock");
    expect(result.operation).toBe("run.notify");
    expect(result.mode).toBe("mock");
    expect(String(result.message_ref)).toContain("zulip-mock:");
  });

  it("supports connectivity probe in shadow mode", async () => {
    const result = await handleZulipRunMessaging(
      mockClient,
      {
        mode: "shadow",
        operation: "connectivity.probe",
      },
      context,
    );

    expect(result.status).toBe("readiness_checked");
    expect(result.mode).toBe("shadow");
    expect(result.connectivity?.ok).toBe(true);
  });

  it("rejects live mode", async () => {
    await expect(
      handleZulipRunMessaging(
        mockClient,
        {
          mode: "live",
          operation: "run.notify",
        },
        context,
      ),
    ).rejects.toThrow("Live Zulip messaging is disabled");
  });

  it("rejects shadow mode for outbound operations", async () => {
    await expect(
      handleZulipRunMessaging(
        mockClient,
        {
          mode: "shadow",
          operation: "channel.message.mock_send",
        },
        context,
      ),
    ).rejects.toThrow("mock-only");
  });
});
