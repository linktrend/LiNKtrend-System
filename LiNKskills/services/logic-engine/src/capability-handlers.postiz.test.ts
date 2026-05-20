import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleCapPostizDistribution } from "./capability-handlers.js";

const mockClient = {} as SupabaseClient;

const context = {
  tenant_id: "tenant-1",
  run_id: "run-1",
  stage_id: "stage-1",
  lease_id: "lease-1",
  actor: { actor_kind: "bot", actor_id: "linkbot-1" },
  idempotency_key: "idem-1",
};

describe("handleCapPostizDistribution", () => {
  it("returns readiness evidence for connectivity probe in shadow mode", async () => {
    const result = await handleCapPostizDistribution(
      mockClient,
      {
        mode: "shadow",
        operation: "connectivity.probe",
      },
      context,
    );

    expect(result.status).toBe("readiness_checked");
    expect(result.mode).toBe("shadow");
    expect(String(result.readiness_ref)).toContain("postiz-readiness:");
  });

  it("creates a mocked draft in mock mode", async () => {
    const result = await handleCapPostizDistribution(
      mockClient,
      {
        mode: "mock",
        operation: "draft.create_mock",
      },
      context,
    );

    expect(result.status).toBe("draft_created_mock");
    expect(result.mode).toBe("mock");
  });

  it("rejects live mode", async () => {
    await expect(
      handleCapPostizDistribution(
        mockClient,
        {
          mode: "live",
          operation: "draft.create_mock",
        },
        context,
      ),
    ).rejects.toThrow("Live Postiz distribution is disabled");
  });

  it("rejects shadow mode for mock-only scheduling", async () => {
    await expect(
      handleCapPostizDistribution(
        mockClient,
        {
          mode: "shadow",
          operation: "schedule.mock",
        },
        context,
      ),
    ).rejects.toThrow("mock-only");
  });
});
