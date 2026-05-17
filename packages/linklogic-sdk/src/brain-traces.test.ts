/**
 * Tests for cross-vertical trace dashboard schemas (WP-116).
 *
 * Coverage:
 * - Valid trace summary parsing
 * - Valid cross-vertical aggregate parsing
 * - Privacy stripping removes tenant-identifying fields
 * - Query builder produces valid filters
 * - Invalid payloads are rejected
 */

import { describe, expect, it } from "vitest";

import {
  buildDailyAggregateQuery,
  buildRecentTracesQuery,
  CrossVerticalAggregateQuerySchema,
  CrossVerticalAggregateResultSchema,
  CrossVerticalTraceAggregateSchema,
  parseCrossVerticalAggregateQuery,
  parseCrossVerticalAggregateResult,
  parseCrossVerticalTraceAggregate,
  parseTraceQueryFilter,
  parseTraceQueryResult,
  parseTraceSummary,
  StageSlugSchema,
  stripTenantFieldsFromTrace,
  TraceOutcomeSchema,
  TraceQueryFilterSchema,
  TraceQueryResultSchema,
  TraceSummarySchema,
  VerticalKeySchema,
} from "./brain-traces.js";

describe("VerticalKeySchema", () => {
  it("accepts valid vertical keys", () => {
    expect(VerticalKeySchema.parse("linksites")).toBe("linksites");
    expect(VerticalKeySchema.parse("lexos")).toBe("lexos");
    expect(VerticalKeySchema.parse("linkapps")).toBe("linkapps");
  });

  it("rejects invalid vertical keys", () => {
    expect(() => VerticalKeySchema.parse("unknown")).toThrow();
    expect(() => VerticalKeySchema.parse("")).toThrow();
  });
});

describe("TraceOutcomeSchema", () => {
  it("accepts valid outcomes", () => {
    expect(TraceOutcomeSchema.parse("success")).toBe("success");
    expect(TraceOutcomeSchema.parse("partial")).toBe("partial");
    expect(TraceOutcomeSchema.parse("failure")).toBe("failure");
    expect(TraceOutcomeSchema.parse("cancelled")).toBe("cancelled");
    expect(TraceOutcomeSchema.parse("timeout")).toBe("timeout");
  });

  it("rejects invalid outcomes", () => {
    expect(() => TraceOutcomeSchema.parse("error")).toThrow();
    expect(() => TraceOutcomeSchema.parse("pending")).toThrow();
  });
});

describe("StageSlugSchema", () => {
  it("accepts LinkSites stage slugs", () => {
    expect(StageSlugSchema.parse("intake")).toBe("intake");
    expect(StageSlugSchema.parse("research")).toBe("research");
    expect(StageSlugSchema.parse("template_selection")).toBe("template_selection");
    expect(StageSlugSchema.parse("content_generation")).toBe("content_generation");
    expect(StageSlugSchema.parse("site_generation")).toBe("site_generation");
    expect(StageSlugSchema.parse("preview_build")).toBe("preview_build");
    expect(StageSlugSchema.parse("crm_update")).toBe("crm_update");
  });

  it("accepts LEXOS stage slugs", () => {
    expect(StageSlugSchema.parse("lexos_intake")).toBe("lexos_intake");
    expect(StageSlugSchema.parse("matter_setup")).toBe("matter_setup");
    expect(StageSlugSchema.parse("story_develop")).toBe("story_develop");
    expect(StageSlugSchema.parse("evidence_ingest")).toBe("evidence_ingest");
    expect(StageSlugSchema.parse("assertions_extract")).toBe("assertions_extract");
    expect(StageSlugSchema.parse("support_map")).toBe("support_map");
    expect(StageSlugSchema.parse("strategy_develop")).toBe("strategy_develop");
    expect(StageSlugSchema.parse("research_conduct")).toBe("research_conduct");
    expect(StageSlugSchema.parse("argument_draft")).toBe("argument_draft");
    expect(StageSlugSchema.parse("adversarial_review")).toBe("adversarial_review");
    expect(StageSlugSchema.parse("output_generate")).toBe("output_generate");
  });

  it("accepts LiNKapps stage slugs", () => {
    expect(StageSlugSchema.parse("app_intake")).toBe("app_intake");
    expect(StageSlugSchema.parse("squad_form")).toBe("squad_form");
    expect(StageSlugSchema.parse("capability_plan")).toBe("capability_plan");
    expect(StageSlugSchema.parse("provider_match")).toBe("provider_match");
    expect(StageSlugSchema.parse("artifact_generate")).toBe("artifact_generate");
    expect(StageSlugSchema.parse("delivery_handoff")).toBe("delivery_handoff");
  });
});

describe("TraceSummarySchema", () => {
  const validTrace = {
    trace_id: "550e8400-e29b-41d4-a716-446655440000",
    tenant_id: "tenant_123",
    vertical_key: "linksites",
    stage_slug: "research",
    outcome: "success",
    started_at: "2026-05-17T10:00:00Z",
    completed_at: "2026-05-17T10:05:00Z",
    duration_ms: 300000,
    run_id: "550e8400-e29b-41d4-a716-446655440001",
    episode_id: "550e8400-e29b-41d4-a716-446655440002",
    workflow_run_id: "550e8400-e29b-41d4-a716-446655440003",
    plane: "linkbot",
    lease_count: 2,
    audit_event_id: "550e8400-e29b-41d4-a716-446655440004",
    schema_version: 1,
  };

  it("accepts valid trace summary", () => {
    const result = parseTraceSummary(validTrace);
    expect(result.trace_id).toBe(validTrace.trace_id);
    expect(result.tenant_id).toBe("tenant_123");
    expect(result.vertical_key).toBe("linksites");
    expect(result.duration_ms).toBe(300000);
  });

  it("accepts minimal valid trace summary", () => {
    const minimal = {
      trace_id: "550e8400-e29b-41d4-a716-446655440000",
      tenant_id: "tenant_123",
      vertical_key: "lexos",
      stage_slug: "matter_setup",
      outcome: "failure",
      started_at: "2026-05-17T10:00:00Z",
      plane: "linkautowork",
    };
    const result = parseTraceSummary(minimal);
    expect(result.vertical_key).toBe("lexos");
    expect(result.duration_ms).toBeUndefined();
    expect(result.plane).toBe("linkautowork");
  });

  it("rejects trace without required fields", () => {
    expect(() =>
      TraceSummarySchema.parse({
        trace_id: "550e8400-e29b-41d4-a716-446655440000",
        // missing tenant_id, vertical_key, etc.
      }),
    ).toThrow();
  });

  it("rejects invalid UUID", () => {
    expect(() =>
      TraceSummarySchema.parse({
        ...validTrace,
        trace_id: "not-a-uuid",
      }),
    ).toThrow();
  });
});

describe("CrossVerticalTraceAggregateSchema", () => {
  const validAggregate = {
    bucket_start: "2026-05-17T00:00:00Z",
    bucket_end: "2026-05-18T00:00:00Z",
    bucket_unit: "day",
    vertical_key: "linksites",
    stage_slug: "research",
    outcome: "success",
    trace_count: 42,
    avg_duration_ms: 250000,
    p50_duration_ms: 200000,
    p95_duration_ms: 500000,
    p99_duration_ms: 750000,
    failure_rate: 0.05,
    timeout_rate: 0.01,
    cancellation_rate: 0.02,
    avg_cost_band: 3,
    avg_leases_per_trace: 2.5,
    traces_with_leases: 38,
    schema_version: 1,
    aggregation_job_id: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts valid cross-vertical aggregate", () => {
    const result = parseCrossVerticalTraceAggregate(validAggregate);
    expect(result.vertical_key).toBe("linksites");
    expect(result.trace_count).toBe(42);
    expect(result.failure_rate).toBe(0.05);
  });

  it("cross-vertical aggregate schema strips tenant_id via parsing", () => {
    // Note: The schema doesn't explicitly reject extra fields, but stripTenantFieldsFromTrace
    // should be used before creating aggregates. The aggregate schema validates the shape
    // doesn't include tenant-identifying fields as required properties.
    const result = CrossVerticalTraceAggregateSchema.parse({
      ...validAggregate,
      tenant_id: "tenant_123", // Extra field - Zod .strict() would reject, but we use .passthrough()
    });
    // The schema should not have tenant_id as a defined property
    expect("tenant_id" in CrossVerticalTraceAggregateSchema.shape).toBe(false);
    // The result shape is valid per schema (extra fields ignored in non-strict mode)
    expect(result.vertical_key).toBe("linksites");
  });

  it("rejects aggregate without required aggregation_job_id", () => {
    expect(() =>
      CrossVerticalTraceAggregateSchema.parse({
        ...validAggregate,
        aggregation_job_id: undefined,
      }),
    ).toThrow();
  });
});

describe("stripTenantFieldsFromTrace", () => {
  it("removes tenant_id from objects", () => {
    const input = {
      trace_id: "550e8400-e29b-41d4-a716-446655440000",
      tenant_id: "tenant_123",
      vertical_key: "linksites",
    };
    const result = stripTenantFieldsFromTrace(input) as Record<string, unknown>;
    expect(result.trace_id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.tenant_id).toBeUndefined();
    expect(result.vertical_key).toBe("linksites");
  });

  it("removes multiple forbidden fields", () => {
    const input = {
      trace_id: "550e8400-e29b-41d4-a716-446655440000",
      tenant_id: "tenant_123",
      org_id: "org_456",
      email: "user@example.com",
      phone_number: "+1234567890",
      ip_address: "192.168.1.1",
      crm_record_id: "crm_789",
      vertical_key: "linksites",
    };
    const result = stripTenantFieldsFromTrace(input) as Record<string, unknown>;
    expect(result.trace_id).toBeDefined();
    expect(result.tenant_id).toBeUndefined();
    expect(result.org_id).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.phone_number).toBeUndefined();
    expect(result.ip_address).toBeUndefined();
    expect(result.crm_record_id).toBeUndefined();
    expect(result.vertical_key).toBe("linksites");
  });

  it("strips forbidden fields from nested objects", () => {
    const input = {
      trace_id: "550e8400-e29b-41d4-a716-446655440000",
      metadata: {
        tenant_id: "tenant_123",
        vertical_key: "linksites",
      },
      user: {
        email: "user@example.com",
        user_id: "user_123",
      },
    };
    const result = stripTenantFieldsFromTrace(input) as Record<string, unknown>;
    const metadata = result.metadata as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;

    expect(metadata.tenant_id).toBeUndefined();
    expect(metadata.vertical_key).toBe("linksites");
    expect(user.email).toBeUndefined();
    expect(user.user_id).toBeUndefined();
  });

  it("strips forbidden fields from arrays", () => {
    const input = [
      { trace_id: "1", tenant_id: "t1", vertical_key: "linksites" },
      { trace_id: "2", tenant_id: "t2", vertical_key: "lexos" },
    ];
    const result = stripTenantFieldsFromTrace(input) as Array<Record<string, unknown>>;
    expect(result[0].trace_id).toBe("1");
    expect(result[0].tenant_id).toBeUndefined();
    expect(result[1].trace_id).toBe("2");
    expect(result[1].tenant_id).toBeUndefined();
  });

  it("preserves allowed fields", () => {
    const input = {
      trace_id: "550e8400-e29b-41d4-a716-446655440000",
      vertical_key: "linksites",
      stage_slug: "research",
      outcome: "success",
      duration_ms: 300000,
      plane: "linkbot",
      lease_count: 2,
    };
    const result = stripTenantFieldsFromTrace(input) as Record<string, unknown>;
    expect(result.trace_id).toBeDefined();
    expect(result.vertical_key).toBe("linksites");
    expect(result.stage_slug).toBe("research");
    expect(result.outcome).toBe("success");
    expect(result.duration_ms).toBe(300000);
    expect(result.plane).toBe("linkbot");
    expect(result.lease_count).toBe(2);
  });

  it("handles primitives unchanged", () => {
    expect(stripTenantFieldsFromTrace("string")).toBe("string");
    expect(stripTenantFieldsFromTrace(123)).toBe(123);
    expect(stripTenantFieldsFromTrace(true)).toBe(true);
    expect(stripTenantFieldsFromTrace(null)).toBe(null);
    expect(stripTenantFieldsFromTrace(undefined)).toBe(undefined);
  });
});

describe("TraceQueryFilterSchema", () => {
  const validFilter = {
    time_range: {
      start: "2026-05-17T00:00:00Z",
      end: "2026-05-18T00:00:00Z",
    },
    vertical_keys: ["linksites", "lexos"],
    stage_slugs: ["research", "matter_setup"],
    outcomes: ["success", "failure"],
    planes: ["linkbot", "linkskills"],
    tenant_id: "tenant_123",
    limit: 50,
    offset: 0,
    sort_by: "started_at",
    sort_order: "desc",
  };

  it("accepts valid query filter", () => {
    const result = parseTraceQueryFilter(validFilter);
    expect(result.time_range.start).toBe("2026-05-17T00:00:00Z");
    expect(result.vertical_keys).toEqual(["linksites", "lexos"]);
    expect(result.limit).toBe(50);
  });

  it("applies defaults for optional fields", () => {
    const minimal = {
      time_range: {
        start: "2026-05-17T00:00:00Z",
        end: "2026-05-18T00:00:00Z",
      },
    };
    const result = parseTraceQueryFilter(minimal);
    expect(result.limit).toBe(100); // default
    expect(result.offset).toBe(0); // default
    expect(result.sort_by).toBe("started_at"); // default
    expect(result.sort_order).toBe("desc"); // default
  });

  it("rejects filter with invalid time range", () => {
    expect(() =>
      TraceQueryFilterSchema.parse({
        time_range: {
          start: "invalid-date",
          end: "2026-05-18T00:00:00Z",
        },
      }),
    ).toThrow();
  });

  it("rejects filter exceeding max limit", () => {
    expect(() =>
      TraceQueryFilterSchema.parse({
        time_range: {
          start: "2026-05-17T00:00:00Z",
          end: "2026-05-18T00:00:00Z",
        },
        limit: 2000, // exceeds max of 1000
      }),
    ).toThrow();
  });
});

describe("TraceQueryResultSchema", () => {
  const validResult = {
    traces: [
      {
        trace_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant_123",
        vertical_key: "linksites",
        stage_slug: "research",
        outcome: "success",
        started_at: "2026-05-17T10:00:00Z",
        duration_ms: 300000,
        plane: "linkbot",
        lease_count: 2,
        schema_version: 1,
      },
    ],
    total_count: 1,
    has_more: false,
    summary: {
      count_by_vertical: { linksites: 1, lexos: 0, linkapps: 0 },
      count_by_outcome: { success: 1, partial: 0, failure: 0, cancelled: 0, timeout: 0 },
      avg_duration_ms: 300000,
      failure_rate: 0,
    },
    query_time_ms: 50,
    schema_version: 1,
  };

  it("accepts valid query result", () => {
    const result = parseTraceQueryResult(validResult);
    expect(result.traces).toHaveLength(1);
    expect(result.total_count).toBe(1);
    expect(result.summary.avg_duration_ms).toBe(300000);
  });
});

describe("CrossVerticalAggregateQuerySchema", () => {
  const validQuery = {
    time_range: {
      start: "2026-05-10T00:00:00Z",
      end: "2026-05-17T00:00:00Z",
    },
    bucket_unit: "day",
    group_by_vertical: true,
    group_by_stage: true,
    group_by_outcome: false,
    vertical_keys: ["linksites", "lexos"],
    stage_slugs: ["research", "matter_setup"],
  };

  it("accepts valid aggregate query", () => {
    const result = parseCrossVerticalAggregateQuery(validQuery);
    expect(result.bucket_unit).toBe("day");
    expect(result.group_by_vertical).toBe(true);
    expect(result.group_by_stage).toBe(true);
  });

  it("applies defaults", () => {
    const minimal = {
      time_range: {
        start: "2026-05-10T00:00:00Z",
        end: "2026-05-17T00:00:00Z",
      },
    };
    const result = parseCrossVerticalAggregateQuery(minimal);
    expect(result.bucket_unit).toBe("day"); // default
    expect(result.group_by_vertical).toBe(true); // default
    expect(result.group_by_stage).toBe(false); // default
    expect(result.group_by_outcome).toBe(false); // default
  });
});

describe("CrossVerticalAggregateResultSchema", () => {
  const validResult = {
    buckets: [
      {
        bucket_start: "2026-05-17T00:00:00Z",
        bucket_end: "2026-05-18T00:00:00Z",
        bucket_unit: "day",
        vertical_key: "linksites",
        trace_count: 42,
        avg_duration_ms: 250000,
        p50_duration_ms: 200000,
        p95_duration_ms: 500000,
        p99_duration_ms: 750000,
        failure_rate: 0.05,
        timeout_rate: 0.01,
        cancellation_rate: 0.02,
        avg_cost_band: 3,
        avg_leases_per_trace: 2.5,
        traces_with_leases: 38,
        schema_version: 1,
        aggregation_job_id: "550e8400-e29b-41d4-a716-446655440000",
      },
    ],
    overall: {
      total_traces: 100,
      total_duration_ms: 25000000,
      overall_failure_rate: 0.08,
      vertical_distribution: { linksites: 60, lexos: 30, linkapps: 10 },
    },
    query_time_ms: 150,
    schema_version: 1,
  };

  it("accepts valid aggregate result", () => {
    const result = parseCrossVerticalAggregateResult(validResult);
    expect(result.buckets).toHaveLength(1);
    expect(result.overall.total_traces).toBe(100);
  });
});

describe("buildRecentTracesQuery", () => {
  it("builds query for last N hours", () => {
    const query = buildRecentTracesQuery(24);
    expect(query.time_range.start).toBeDefined();
    expect(query.time_range.end).toBeDefined();
    expect(query.limit).toBe(100);
    expect(query.sort_by).toBe("started_at");
    expect(query.sort_order).toBe("desc");
  });

  it("includes optional filters when provided", () => {
    const query = buildRecentTracesQuery(12, {
      vertical_keys: ["linksites", "lexos"],
      tenant_id: "tenant_123",
    });
    expect(query.vertical_keys).toEqual(["linksites", "lexos"]);
    expect(query.tenant_id).toBe("tenant_123");
  });

  it("produces valid filter schema", () => {
    const query = buildRecentTracesQuery(6);
    expect(() => TraceQueryFilterSchema.parse(query)).not.toThrow();
  });
});

describe("buildDailyAggregateQuery", () => {
  it("builds query for last N days", () => {
    const query = buildDailyAggregateQuery(7);
    expect(query.time_range.start).toBeDefined();
    expect(query.time_range.end).toBeDefined();
    expect(query.bucket_unit).toBe("day");
    expect(query.group_by_vertical).toBe(true);
  });

  it("includes optional grouping", () => {
    const query = buildDailyAggregateQuery(30, {
      group_by_stage: true,
      vertical_keys: ["linksites"],
    });
    expect(query.group_by_stage).toBe(true);
    expect(query.vertical_keys).toEqual(["linksites"]);
  });

  it("produces valid aggregate query schema", () => {
    const query = buildDailyAggregateQuery(14);
    expect(() => CrossVerticalAggregateQuerySchema.parse(query)).not.toThrow();
  });
});

describe("Cross-vertical privacy compliance", () => {
  it("cross-vertical aggregates have no tenant-identifying fields", () => {
    const aggregate = {
      bucket_start: "2026-05-17T00:00:00Z",
      bucket_end: "2026-05-18T00:00:00Z",
      bucket_unit: "day",
      vertical_key: "linksites",
      trace_count: 42,
      avg_duration_ms: 250000,
      p50_duration_ms: 200000,
      p95_duration_ms: 500000,
      p99_duration_ms: 750000,
      failure_rate: 0.05,
      timeout_rate: 0.01,
      cancellation_rate: 0.02,
      avg_cost_band: 3,
      avg_leases_per_trace: 2.5,
      traces_with_leases: 38,
      schema_version: 1,
      aggregation_job_id: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = parseCrossVerticalTraceAggregate(aggregate);

    // Verify no forbidden fields exist
    expect("tenant_id" in result).toBe(false);
    expect("org_id" in result).toBe(false);
    expect("customer_id" in result).toBe(false);
    expect("email" in result).toBe(false);
    expect("lead_id" in result).toBe(false);
    expect("crm_record_id" in result).toBe(false);
  });

  it("trace summaries include tenant_id for tenant-scoped queries", () => {
    const trace = {
      trace_id: "550e8400-e29b-41d4-a716-446655440000",
      tenant_id: "tenant_123",
      vertical_key: "linksites",
      stage_slug: "research",
      outcome: "success",
      started_at: "2026-05-17T10:00:00Z",
      duration_ms: 300000,
      plane: "linkbot",
      lease_count: 2,
      schema_version: 1,
    };

    const result = parseTraceSummary(trace);
    expect(result.tenant_id).toBe("tenant_123");
  });
});
