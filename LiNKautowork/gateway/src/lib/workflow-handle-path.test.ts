import { describe, expect, it } from "vitest";
import {
  buildN8n214ProductionWebhookPath,
  buildN8nWebhookInvokePath,
  n8nWebhookPathToWorkflowHandle,
  workflowHandleToN8nWebhookPath,
} from "./workflow-handle-path.js";

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

describe("buildN8n214ProductionWebhookPath", () => {
  it("uses n8n 2.14 production webhook shape", () => {
    expect(
      buildN8n214ProductionWebhookPath(
        "8730597a-7e19-430a-8118-845464093bf5",
        "linkdeveloper-product_run_bootstrap",
      ),
    ).toBe(
      "/webhook/8730597a-7e19-430a-8118-845464093bf5/webhook/linkdeveloper-product_run_bootstrap",
    );
  });

  it("falls back to legacy short path without workflow id", () => {
    expect(buildN8nWebhookInvokePath("autowork.linkdeveloper.product_run_bootstrap")).toBe(
      "/webhook/linkdeveloper-product_run_bootstrap",
    );
  });
});
