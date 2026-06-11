import { afterEach, describe, expect, it } from "vitest";
import { clearN8nWorkflowIdMapForTesting, resolveN8nWorkflowId } from "./n8n-workflow-id-map.js";

describe("resolveN8nWorkflowId", () => {
  afterEach(() => {
    clearN8nWorkflowIdMapForTesting();
  });

  it("resolves dotted handles and dashed webhook paths from env JSON", () => {
    process.env.N8N_WORKFLOW_IDS = JSON.stringify({
      "autowork.linkdeveloper.product_run_bootstrap": "8730597a-7e19-430a-8118-845464093bf5",
    });

    expect(resolveN8nWorkflowId("autowork.linkdeveloper.product_run_bootstrap")).toBe(
      "8730597a-7e19-430a-8118-845464093bf5",
    );
    expect(resolveN8nWorkflowId("linkdeveloper-product_run_bootstrap")).toBe(
      "8730597a-7e19-430a-8118-845464093bf5",
    );
  });

  it("returns undefined when mapping is absent", () => {
    delete process.env.N8N_WORKFLOW_IDS;
    clearN8nWorkflowIdMapForTesting();
    expect(resolveN8nWorkflowId("autowork.linkdeveloper.product_run_bootstrap")).toBeUndefined();
  });
});
