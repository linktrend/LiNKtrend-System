/**
 * Tests for LinkBot reasoning dispatch.
 *
 * Covers:
 * - PII stripping (§3.4, §6.1)
 * - All four reasoning kinds (§2, §6.1)
 * - Model failure handling (§5.4 MODEL_* codes)
 * - Stub mode (when OPENROUTER_API_KEY not set)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  stripContactPii,
  redactForLogging,
  handleReasoningDispatch,
} from "./reasoning-dispatch.js";
import type { BotReasonRequest, LeadInput, Env } from "@linktrend/linklogic-sdk";

// Mock dependencies
vi.mock("@linktrend/linklogic-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@linktrend/linklogic-sdk")>();
  return {
    ...actual,
    writeBrainAuditEvent: vi.fn().mockResolvedValue({
      event_id: "test-audit-event-id",
      persisted_at: new Date().toISOString(),
    }),
  };
});

vi.mock("@linktrend/observability", () => ({
  log: vi.fn(),
}));

// Stub environment without OpenRouter key (triggers stub mode)
const stubEnv: Env = {
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "test-key",
  // OPENROUTER_API_KEY intentionally omitted for stub testing
} as Env;

// Real environment with OpenRouter key (would call actual API in production)
const realEnv: Env = {
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "test-key",
  OPENROUTER_API_KEY: "test-openrouter-key",
  LINKTREND_PUBLIC_BASE_URL: "https://test.linktrend.local",
} as Env;

const baseLeadInput: LeadInput = {
  tenant_id: "tenant-123",
  source: "manual",
  business_name: "Test Business LLC",
  industry: "Professional Services",
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
  },
  location: {
    city: "New York",
    region: "NY",
    country: "US",
  },
  notes: "Looking for a professional website",
};

const createBaseRequest = (reasoning_kind: BotReasonRequest["reasoning_kind"]): BotReasonRequest => ({
  tenant_id: "tenant-123",
  run_id: "run-456",
  stage_id: `${reasoning_kind}_stage`,
  reasoning_kind,
  inputs: { lead_input: baseLeadInput },
  model_routing_profile: "default",
  pii_policy: "strip_contact",
});

describe("stripContactPii", () => {
  it("removes contact object from inputs (§3.4)", () => {
    const inputs = {
      lead_input: baseLeadInput,
      other_field: "value",
    };

    const stripped = stripContactPii(inputs);

    expect(stripped.lead_input).toBeDefined();
    expect((stripped.lead_input as LeadInput).contact).toBeUndefined();
    expect(stripped.other_field).toBe("value");
  });

  it("removes contact_email and contact_phone fields", () => {
    const inputs = {
      lead_input: {
        ...baseLeadInput,
        contact_email: "test@example.com",
        contact_phone: "+1234567890",
      },
    };

    const stripped = stripContactPii(inputs);

    expect(stripped.lead_input).toBeDefined();
    expect((stripped.lead_input as Record<string, unknown>).contact_email).toBeUndefined();
    expect((stripped.lead_input as Record<string, unknown>).contact_phone).toBeUndefined();
  });

  it("keeps non-PII fields (business_name, industry, location, notes)", () => {
    const inputs = { lead_input: baseLeadInput };

    const stripped = stripContactPii(inputs);
    const lead = stripped.lead_input as LeadInput;

    expect(lead.business_name).toBe("Test Business LLC");
    expect(lead.industry).toBe("Professional Services");
    expect(lead.location).toEqual({ city: "New York", region: "NY", country: "US" });
    expect(lead.notes).toBe("Looking for a professional website");
  });

  it("handles nested lead_input recursively", () => {
    const inputs = {
      lead_input: {
        nested: baseLeadInput,
      },
    };

    const stripped = stripContactPii(inputs);

    expect((stripped.lead_input as Record<string, unknown>).nested).toBeDefined();
    expect(((stripped.lead_input as Record<string, unknown>).nested as LeadInput).contact).toBeUndefined();
  });

  it("handles empty inputs gracefully", () => {
    const stripped = stripContactPii({});
    expect(stripped).toEqual({});
  });
});

describe("redactForLogging", () => {
  it("replaces email addresses with [redacted:email] (§3.4)", () => {
    const text = "Contact us at support@example.com or admin@test.org";
    const redacted = redactForLogging(text);
    expect(redacted).toBe("Contact us at [redacted:email] or [redacted:email]");
  });

  it("replaces phone numbers with [redacted:phone] (§3.4)", () => {
    const text = "Call us at +1234567890 or +441234567890";
    const redacted = redactForLogging(text);
    expect(redacted).toBe("Call us at [redacted:phone] or [redacted:phone]");
  });

  it("handles text without PII", () => {
    const text = "This is a normal log message";
    expect(redactForLogging(text)).toBe(text);
  });
});

describe("handleReasoningDispatch — lead_evaluation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns lead_evaluation output with score, segment, rationale", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();
    expect(result.model_run_id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    expect(result.tokens_in).toBeGreaterThan(0);
    expect(result.tokens_out).toBeGreaterThan(0);

    const evaluation = result.outputs.lead_evaluation as {
      score: number;
      segment: string;
      rationale: string;
    };

    expect(evaluation).toBeDefined();
    expect(typeof evaluation.score).toBe("number");
    expect(evaluation.score).toBeGreaterThanOrEqual(0);
    expect(evaluation.score).toBeLessThanOrEqual(100);
    expect(typeof evaluation.segment).toBe("string");
    expect(typeof evaluation.rationale).toBe("string");

    // Verify audit events were emitted
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(6);
    const calls = (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mock.calls;

    // First call: stage.started
    expect(calls[0][1].action).toBe("stage.started");
    expect(calls[0][1].subject.run_id).toBe("run-456");
    expect(calls[0][1].subject.stage_id).toBe("lead_evaluation_stage");
    expect(calls[0][1].plane).toBe("linkbot");

    // Third call: stage.completed
    expect(calls[2][1].action).toBe("stage.completed");
    expect(calls[2][1].payload.reasoning_kind).toBe("lead_evaluation");
    expect(calls[2][1].payload.output_keys).toContain("lead_evaluation");
    expect(calls[3][1].action).toBe("research.performed");
    expect(calls[4][1].action).toBe("provenance.recorded");
    expect(calls[5][1].action).toBe("role.completed");
  });

  it("rejects unsupported pii_policy", async () => {
    const request = {
      ...createBaseRequest("lead_evaluation"),
      pii_policy: "keep_all" as const,
    };

    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("MODEL_PROVIDER_ERROR");
    expect(result.failure?.retryable).toBe(false);
  });
});

describe("handleReasoningDispatch — template_selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns template_id output", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const request = createBaseRequest("template_selection");
    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();
    expect(typeof result.outputs.template_id).toBe("string");
    expect(result.outputs.template_id).toMatch(/^[a-z0-9_]+$/);

    // Verify audit events
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(6);
  });

  it("uses lead_evaluation from previous stage if provided", async () => {
    const request = {
      ...createBaseRequest("template_selection"),
      inputs: {
        lead_input: baseLeadInput,
        lead_evaluation: {
          score: 85,
          segment: "professional_service",
          rationale: "High value lead",
        },
      },
    };

    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();
    expect(result.outputs.template_id).toBeDefined();
  });
});

describe("handleReasoningDispatch — copy_generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns copy_bundle with blocks array", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const request = createBaseRequest("copy_generation");
    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();

    const copyBundle = result.outputs.copy_bundle as {
      blocks: Array<{ block_id: string; text: Record<string, string> }>;
      locale: string;
    };

    expect(copyBundle).toBeDefined();
    expect(Array.isArray(copyBundle.blocks)).toBe(true);
    expect(copyBundle.blocks.length).toBeGreaterThan(0);

    for (const block of copyBundle.blocks) {
      expect(typeof block.block_id).toBe("string");
      expect(typeof block.text).toBe("object");
    }

    expect(typeof copyBundle.locale).toBe("string");

    // Verify audit events
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(6);
  });

  it("includes template_id in user prompt when available", async () => {
    const request = {
      ...createBaseRequest("copy_generation"),
      inputs: {
        lead_input: baseLeadInput,
        template_id: "professional_v1",
      },
    };

    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();
    expect(result.outputs.copy_bundle).toBeDefined();
  });
});

describe("handleReasoningDispatch — media_placement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns media_plan with placements array", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const request = createBaseRequest("media_placement");
    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();

    const mediaPlan = result.outputs.media_plan as {
      placements: Array<{ block_id: string; asset_ref: string; kind: string }>;
    };

    expect(mediaPlan).toBeDefined();
    expect(Array.isArray(mediaPlan.placements)).toBe(true);
    expect(mediaPlan.placements.length).toBeGreaterThan(0);

    for (const placement of mediaPlan.placements) {
      expect(typeof placement.block_id).toBe("string");
      expect(typeof placement.asset_ref).toBe("string");
      expect(["stock", "placeholder"]).toContain(placement.kind);
    }

    // Verify audit events
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(6);
  });

  it("includes copy_bundle in context when available", async () => {
    const request = {
      ...createBaseRequest("media_placement"),
      inputs: {
        lead_input: baseLeadInput,
        copy_bundle: {
          blocks: [{ block_id: "hero_headline", text: { en: "Welcome" } }],
          locale: "en",
        },
      },
    };

    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();
    expect(result.outputs.media_plan).toBeDefined();
  });
});

describe("handleReasoningDispatch — error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns MODEL_OUTPUT_INVALID for unparseable JSON", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    // Create a mock that returns invalid JSON
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: "not valid json" } }],
        usage: { prompt_tokens: 100, completion_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(realEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("MODEL_OUTPUT_INVALID");
    expect(result.failure?.retryable).toBe(false);

    // Verify stage.failed audit event was emitted
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(4);
    const calls = (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[2][1].action).toBe("stage.failed");
    expect(calls[3][1].action).toBe("role.failed");
  });

  it("returns MODEL_OUTPUT_INVALID for missing required fields", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: "{\"invalid\": \"response\"}" } }],
        usage: { prompt_tokens: 100, completion_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(realEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("MODEL_OUTPUT_INVALID");
    expect(result.failure?.message).toContain("missing required fields");
  });

  it("returns MODEL_PROVIDER_ERROR for HTTP errors", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });
    global.fetch = mockFetch;

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(realEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("MODEL_PROVIDER_ERROR");
    expect(result.failure?.retryable).toBe(true);

    // Verify stage.failed audit event
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(4);
  });

  it("returns MODEL_QUOTA_EXCEEDED for 429 errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("Rate limit exceeded"),
    });
    global.fetch = mockFetch;

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(realEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("MODEL_QUOTA_EXCEEDED");
    expect(result.failure?.retryable).toBe(true);
  });

  it("returns MODEL_TIMEOUT for timeout errors", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const mockFetch = vi.fn().mockRejectedValue(new Error("AbortError"));
    global.fetch = mockFetch;

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(realEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("MODEL_TIMEOUT");
    expect(result.failure?.retryable).toBe(true);

    // Verify stage.failed audit event
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(4);
  });
});

describe("handleReasoningDispatch — stub mode", () => {
  it("operates in stub mode when OPENROUTER_API_KEY is not set", async () => {
    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeUndefined();
    expect(result.model_run_id).toBeDefined();
    expect(result.tokens_in).toBeGreaterThan(0);
    expect(result.tokens_out).toBeGreaterThan(0);

    // Stub should return valid structured output
    expect(result.outputs.lead_evaluation).toBeDefined();
  });

  it("returns deterministic stub responses for all reasoning kinds", async () => {
    const kinds: BotReasonRequest["reasoning_kind"][] = [
      "lead_evaluation",
      "template_selection",
      "copy_generation",
      "media_placement",
    ];

    for (const kind of kinds) {
      const request = createBaseRequest(kind);
      const result = await handleReasoningDispatch(stubEnv, request);

      expect(result.failure, `Expected ${kind} to succeed`).toBeUndefined();
      expect(result.model_run_id).toMatch(/^[0-9a-f-]{36}$/);
    }
  });
});

describe("PII protection in audit events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not include PII in audit payload (§3.4)", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const request = createBaseRequest("lead_evaluation");
    await handleReasoningDispatch(stubEnv, request);

    const calls = (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mock.calls;

    // Check all audit events don't have PII in payload
    for (const call of calls) {
      const payload = call[1].payload;
      expect(payload).not.toHaveProperty("email");
      expect(payload).not.toHaveProperty("phone");
      expect(payload).not.toHaveProperty("contact");
      expect(payload).not.toHaveProperty("contact_email");
      expect(payload).not.toHaveProperty("contact_phone");

      // Business name is NOT PII per our definition, but we keep minimal data
      // Only keys should be metadata, not content
      const keys = Object.keys(payload);
      expect(keys).not.toContain("lead_input");
    }
  });

  it("includes subject with run_id and stage_id in audit events", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    const request = createBaseRequest("lead_evaluation");
    await handleReasoningDispatch(stubEnv, request);

    const calls = (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mock.calls;

    for (const call of calls) {
      const subject = call[1].subject;
      expect(subject.run_id).toBe("run-456");
      expect(subject.stage_id).toBe("lead_evaluation_stage");
    }
  });
});

describe("Audit write semantics (§4.5)", () => {
  it("returns KERNEL_PERSISTENCE_FAILED when stage.started audit fails", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    // Mock audit write to fail
    (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      event_id: "test-id",
      persisted_at: new Date().toISOString(),
      failure: {
        code: "AUDIT_WRITE_FAILED",
        plane: "linkbrain",
        message: "Database connection failed",
        retryable: true,
        occurred_at: new Date().toISOString(),
      },
    });

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(stubEnv, request);

    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("KERNEL_PERSISTENCE_FAILED");
    expect(result.failure?.retryable).toBe(true);
    // No outputs since we couldn't even record the stage.started
    expect(Object.keys(result.outputs)).toHaveLength(0);
  });

  it("returns KERNEL_PERSISTENCE_FAILED when stage.completed audit fails", async () => {
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");

    // stage.started and role.started succeed, then stage.completed fails
    let callCount = 0;
    (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.resolve({
          event_id: `ok-${callCount}`,
          persisted_at: new Date().toISOString(),
        });
      }
      return Promise.resolve({
        event_id: "failed-id",
        persisted_at: new Date().toISOString(),
        failure: {
          code: "AUDIT_WRITE_FAILED",
          plane: "linkbrain",
          message: "Database connection failed",
          retryable: true,
          occurred_at: new Date().toISOString(),
        },
      });
    });

    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(stubEnv, request);

    // Per §4.5: stage is NOT complete if audit cannot be confirmed
    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe("KERNEL_PERSISTENCE_FAILED");
    // But we DO have outputs since the model call succeeded
    expect(result.outputs.lead_evaluation).toBeDefined();
  });
});

describe("ModelCallAdapter boundary (§12.3)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the mock to default success behavior for these tests
    const { writeBrainAuditEvent } = await import("@linktrend/linklogic-sdk");
    (writeBrainAuditEvent as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      event_id: "test-audit-event-id",
      persisted_at: new Date().toISOString(),
    });
  });

  it("uses adapter-provided apiKey instead of env", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '{"template_id": "adapter_test"}' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const adapter = {
      apiKey: "adapter-provided-key",
      httpReferer: "https://test.example.com",
    };

    const request = createBaseRequest("template_selection");
    const result = await handleReasoningDispatch(stubEnv, request, adapter);

    expect(result.failure).toBeUndefined();
    expect(result.outputs.template_id).toBe("adapter_test");

    // Verify the fetch was called with the adapter's apiKey
    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].headers.authorization).toBe("Bearer adapter-provided-key");
    expect(fetchCall[1].headers["http-referer"]).toBe("https://test.example.com");
  });

  it("uses stub mode when neither adapter nor env provides apiKey", async () => {
    const request = createBaseRequest("lead_evaluation");
    const result = await handleReasoningDispatch(stubEnv, request);

    // No adapter provided, no env.OPENROUTER_API_KEY — should use stub
    expect(result.failure).toBeUndefined();
    expect(result.outputs.lead_evaluation).toBeDefined();
  });
});
