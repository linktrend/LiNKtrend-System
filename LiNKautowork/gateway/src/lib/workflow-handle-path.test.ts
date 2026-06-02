import { describe, expect, it } from "vitest";
import { n8nWebhookPathToWorkflowHandle, workflowHandleToN8nWebhookPath } from "./workflow-handle-path.js";

describe("workflowHandleToN8nWebhookPath", () => {
  it("maps LinkSites handles to dashed webhook paths", () => {
    expect(workflowHandleToN8nWebhookPath("autowork.linksites.payload_sync_local")).toBe(
      "linksites-payload_sync_local",
    );
  });

  it("round-trips dashed paths back to handles", () => {
    const path = workflowHandleToN8nWebhookPath("autowork.linksites.preview_readiness_check");
    expect(n8nWebhookPathToWorkflowHandle(path)).toBe(
      "autowork.linksites.preview_readiness_check",
    );
  });
});
