import { describe, it, expect, beforeEach } from "vitest";
import {
  handleReasoningDispatch,
  checkAdapterHealth,
  getAdapterVersion,
  DEFAULT_ADAPTER_CONFIG,
} from "./adapter.js";
import {
  createBotSession,
  getBotSession,
  cleanupBotSession,
  listActiveSessions,
  addSessionSkillDisclosureRef,
  scrubSessionSkillDisclosureRefs,
} from "./session.js";
import { BotReasonRequest, ReasoningKind } from "./local-types.js";

describe("OpenClaw Adapter", () => {
  const mockConfig = {
    ...DEFAULT_ADAPTER_CONFIG,
    engine_endpoint: "http://localhost:3999", // Non-existent for tests
  };

  describe("handleReasoningDispatch", () => {
    const baseRequest: BotReasonRequest = {
      tenant_id: "tenant-123",
      run_id: "550e8400-e29b-41d4-a716-446655440000",
      stage_id: "stage-evaluation",
      reasoning_kind: "lead_evaluation" as ReasoningKind,
      inputs: {
        lead_record_ref: {
          lead_id: "lead-789",
          tenant_id: "tenant-123",
          idempotency_key: "abc123",
        },
        lead_input: {
          business_name: "Test Business",
          industry: "Technology",
        },
      },
      model_routing_profile: "test-profile",
      pii_policy: "strip_contact",
    };

    it("should handle lead_evaluation reasoning", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await handleReasoningDispatch(baseRequest, "research_enrichment_bot", mockConfig);

      expect(result).toBeDefined();
      expect(result.outputs).toHaveProperty("lead_evaluation");
      expect(result.model_run_id).toBeDefined();
      expect(result.tokens_in).toBeGreaterThanOrEqual(0);
      expect(result.tokens_out).toBeGreaterThanOrEqual(0);
    });

    it("should handle template_selection reasoning", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const request: BotReasonRequest = {
        ...baseRequest,
        reasoning_kind: "template_selection" as ReasoningKind,
      };

      const result = await handleReasoningDispatch(request, "research_enrichment_bot", mockConfig);

      expect(result).toBeDefined();
      expect(result.outputs).toHaveProperty("template_id");
    });

    it("should handle copy_generation reasoning", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const request: BotReasonRequest = {
        ...baseRequest,
        reasoning_kind: "copy_generation" as ReasoningKind,
      };

      const result = await handleReasoningDispatch(request, "website_builder_bot", mockConfig);

      expect(result).toBeDefined();
      expect(result.outputs).toHaveProperty("copy_bundle");
    });

    it("should handle media_placement reasoning", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const request: BotReasonRequest = {
        ...baseRequest,
        reasoning_kind: "media_placement" as ReasoningKind,
      };

      const result = await handleReasoningDispatch(request, "website_builder_bot", mockConfig);

      expect(result).toBeDefined();
      expect(result.outputs).toHaveProperty("media_plan");
    });

    it("should return failure for unknown role", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await handleReasoningDispatch(baseRequest, "unknown_role", mockConfig);

      expect(result.failure).toBeDefined();
      expect(result.failure?.code).toBe("MODEL_PROVIDER_ERROR");
    });

    it("should include model_run_id in result", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await handleReasoningDispatch(baseRequest, "research_enrichment_bot", mockConfig);

      expect(result.model_run_id).toMatch(/^model-/);
    });
  });

  describe("checkAdapterHealth", () => {
    it("should return health status object", async () => {
      const health = await checkAdapterHealth(mockConfig);

      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("engine_connected");
      expect(health).toHaveProperty("linkskills_reachable");
      expect(health).toHaveProperty("linkbrain_reachable");
      expect(health).toHaveProperty("linkautowork_reachable");
      expect(health).toHaveProperty("last_check_at");

      // With non-existent endpoints, all should be false
      expect(health.engine_connected).toBe(false);
      expect(health.linkskills_reachable).toBe(false);
      expect(health.linkbrain_reachable).toBe(false);
      expect(health.linkautowork_reachable).toBe(false);
      expect(health.status).toBe("unhealthy");
    });
  });

  describe("getAdapterVersion", () => {
    it("should return version info", () => {
      const version = getAdapterVersion();

      expect(version).toHaveProperty("version");
      expect(version).toHaveProperty("engine");
      expect(version).toHaveProperty("supported_roles");
      expect(version.engine).toBe("openclaw");
      expect(version.supported_roles).toContain("research_enrichment_bot");
      expect(version.supported_roles).toContain("website_builder_bot");
    });
  });

  describe("Session lifecycle", () => {
    it("should create and retrieve sessions", () => {
      const session = createBotSession(
        "tenant-123",
        "550e8400-e29b-41d4-a716-446655440001",
        "stage-test",
        "research_enrichment_bot",
        "lead_evaluation",
        { test: "data" },
        "test-profile"
      );

      expect(session).toBeDefined();
      expect(session.tenant_id).toBe("tenant-123");
      expect(session.role_id).toBe("research_enrichment_bot");
      expect(session.state).toBe("initializing");

      const retrieved = getBotSession(session.session_id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.session_id).toBe(session.session_id);

      cleanupBotSession(session.session_id);
    });

    it("should list active sessions", () => {
      const session1 = createBotSession(
        "tenant-123",
        "550e8400-e29b-41d4-a716-446655440002",
        "stage-1",
        "research_enrichment_bot",
        "lead_evaluation",
        {},
        "profile"
      );

      const session2 = createBotSession(
        "tenant-123",
        "550e8400-e29b-41d4-a716-446655440003",
        "stage-1",
        "website_builder_bot",
        "copy_generation",
        {},
        "profile"
      );

      const allSessions = listActiveSessions();
      expect(allSessions.length).toBeGreaterThanOrEqual(2);

      const tenantSessions = listActiveSessions("tenant-123");
      expect(tenantSessions.length).toBeGreaterThanOrEqual(2);

      cleanupBotSession(session1.session_id);
      cleanupBotSession(session2.session_id);
    });

    it("stores only temporary disclosure refs and scrubs them during cleanup", () => {
      const session = createBotSession(
        "tenant-123",
        "550e8400-e29b-41d4-a716-446655440004",
        "stage-disclosure",
        "website_builder_bot",
        "copy_generation",
        {},
        "profile"
      );

      const updated = addSessionSkillDisclosureRef(session.session_id, {
        token_id: "token-1",
        manifest_id: "manifest-1",
        lease_id: "lease-1",
        skill_ids: ["skill.website_builder.v1"],
        fragment_refs: [
          {
            fragment_id: "fragment-1",
            skill_id: "skill.website_builder.v1",
            fragment_type: "decision_tree",
            content_hash: "sha256:abc123",
          },
        ],
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        retention_policy: "session_only_no_persist",
      });

      expect(updated.refs.skill_disclosure_refs).toHaveLength(1);
      expect(JSON.stringify(updated.refs.skill_disclosure_refs)).not.toContain("content_preview");
      expect(JSON.stringify(updated.refs.skill_disclosure_refs)).not.toContain("full_source");

      const scrubbed = scrubSessionSkillDisclosureRefs(session.session_id);
      expect(scrubbed.refs.skill_disclosure_refs).toEqual([]);

      cleanupBotSession(session.session_id);
      expect(getBotSession(session.session_id)).toBeUndefined();
    });
  });
});
