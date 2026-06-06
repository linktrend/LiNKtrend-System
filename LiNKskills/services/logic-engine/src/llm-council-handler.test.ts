import { describe, expect, it } from "vitest";

import {
  handleLlmCouncilDeliberation,
  mapDeliberationToCouncilReport,
  validateCouncilReport,
} from "./llm-council-handler.js";

const mockClient = {} as import("@supabase/supabase-js").SupabaseClient;

const context = {
  tenant_id: "tenant-1",
  run_id: "run-1",
  stage_id: "linkdeveloper.gate.g1",
  lease_id: "lease-1",
  actor: { actor_kind: "bot" as const, actor_id: "linkbot-1" },
  idempotency_key: "idem-1",
};

describe("validateCouncilReport", () => {
  it("accepts sample G1-shaped PASS report", async () => {
    const result = await handleLlmCouncilDeliberation(
      mockClient,
      {
        mode: "mock",
        operation: "gate.deliberate",
        gate: "G1",
        program_id: "linkdeveloper-pilot",
        query: "Qualify Hello World product run",
      },
      context,
    );

    expect(result.status).toBe("completed");
    expect(result.council_report?.summary_status).toBe("PASS");
    expect(result.council_report?.personas).toHaveLength(5);

    const validation = validateCouncilReport(result.council_report!, { expectedGate: "G1" });
    expect(validation.ok).toBe(true);
  });
});

describe("mapDeliberationToCouncilReport", () => {
  it("maps API payload to five personas", () => {
    const report = mapDeliberationToCouncilReport(
      "G2",
      "linksuitegen-factory",
      {
        gate: "G2",
        program_id: "linksuitegen-factory",
        stage1: [{ model: "openai/gpt-5.1", response: "PASS — intent is clear." }],
        stage2: [],
        stage3: { model: "google/gemini-3-pro-preview", response: "PASS overall." },
        metadata: {},
        deliberation_ref: "council:G2:linksuitegen-factory",
      },
      [{ label: "Bundle", path: "artifacts/exports/demo/bundle.json" }],
    );

    expect(report.personas).toHaveLength(5);
    expect(report.gate).toBe("G2");
    expect(validateCouncilReport(report, { expectedGate: "G2" }).ok).toBe(true);
  });
});
