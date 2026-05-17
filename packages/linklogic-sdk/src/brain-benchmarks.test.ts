import { describe, expect, it } from "vitest";

import {
  BrainBenchmarkAggregateRowSchema,
  BrainFeedbackRecordPayloadSchema,
  parseBrainBenchmarkAggregateRow,
  parseBrainFeedbackRecordPayload,
  stripTenantIdentifyingFields,
} from "./brain-benchmarks.js";

describe("stripTenantIdentifyingFields", () => {
  it("removes forbidden top-level keys and keeps safe metrics", () => {
    const input = {
      tenant_id: "t-1",
      orgId: "o-99",
      plugin_vertical_key: "linksites_v2",
      metrics: { avg_duration_ms: 120 },
    };
    expect(stripTenantIdentifyingFields(input)).toEqual({
      plugin_vertical_key: "linksites_v2",
      metrics: { avg_duration_ms: 120 },
    });
  });

  it("strips forbidden keys recursively", () => {
    const input = {
      outer: {
        user_email: "a@example.com",
        ok: true,
        nested: { workspace_id: "w", correlationId: "c" },
      },
    };
    expect(stripTenantIdentifyingFields(input)).toEqual({
      outer: { ok: true, nested: {} },
    });
  });
});

describe("BrainBenchmarkAggregateRowSchema", () => {
  it("accepts valid aggregate rows", () => {
    const row = parseBrainBenchmarkAggregateRow({
      bucket_start: new Date("2026-05-01T00:00:00.000Z").toISOString(),
      bucket_end: new Date("2026-05-02T00:00:00.000Z").toISOString(),
      plugin_vertical_key: "linksites_v2",
      dimension_key: "stage:research_enrichment.completed",
      sample_size: 42,
      avg_duration_ms: 150,
      failure_rate: 0.12,
      avg_cost_normalized: 3,
      schema_version: 1,
    });
    expect(row.sample_size).toBe(42);
  });

  it("rejects rows with stray tenant-ish keys", () => {
    expect(() =>
      BrainBenchmarkAggregateRowSchema.parse({
        bucket_start: "2026-05-01T00:00:00.000Z",
        bucket_end: "2026-05-02T00:00:00.000Z",
        tenant_id: "x",
        plugin_vertical_key: "linksites_v2",
        dimension_key: "d",
        sample_size: 1,
        avg_duration_ms: null,
        failure_rate: null,
        avg_cost_normalized: null,
        schema_version: 1,
      }),
    ).toThrow();
  });
});

describe("BrainFeedbackRecordPayloadSchema", () => {
  it("parses valid feedback payloads", () => {
    const p = parseBrainFeedbackRecordPayload({
      memory_object_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
      verdict: "approved",
      actor_subject_type: "operator",
      idempotency_key: "replay-key-abcdefgh",
    });
    expect(p.verdict).toBe("approved");
  });

  it("rejects short idempotency keys", () => {
    expect(() =>
      BrainFeedbackRecordPayloadSchema.parse({
        memory_object_id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
        verdict: "invalidated",
        actor_subject_type: "linkbot",
        idempotency_key: "short",
      }),
    ).toThrow();
  });
});
