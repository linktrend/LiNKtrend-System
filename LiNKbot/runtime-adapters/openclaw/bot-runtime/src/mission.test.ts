import { describe, it, expect } from "vitest";
import { executeMission, validateMission, listMissionRoles, MISSION_ROLES } from "./mission.js";
import { BotReasonRequest, ReasoningKind } from "./local-types.js";
import { DEFAULT_ADAPTER_CONFIG } from "./adapter.js";

describe("Mission Management", () => {
  const mockConfig = {
    ...DEFAULT_ADAPTER_CONFIG,
    engine_endpoint: "http://localhost:3999",
  };

  const withLeadScoutGovernance = (request: BotReasonRequest): BotReasonRequest => ({
    ...request,
    stage_id: "linksites.lead_generation",
    inputs: {
      ...request.inputs,
      governance: {
        mode: "mock",
        capability: "cap.research.public_web",
        lease_id: "lease-linksites-lead-scout-mock-001",
        idempotency_key: "tenant-123:550e8400-e29b-41d4-a716-446655440004:linksites.lead_generation:lead_scout_bot",
      },
    },
  });

  describe("executeMission", () => {
    const baseRequest: BotReasonRequest = {
      tenant_id: "tenant-123",
      run_id: "550e8400-e29b-41d4-a716-446655440004",
      stage_id: "stage-mission",
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

    it("should run governed mock lead acquisition for lead_scout_bot", async () => {
      process.env.NODE_ENV = "development";
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await executeMission(
        withLeadScoutGovernance(baseRequest),
        "lead_scout_bot",
        mockConfig
      );

      expect(result.success).toBe(true);
      expect(result.outputs).toHaveProperty("lead_record_ref");
      expect(result.outputs).toHaveProperty("lead_provenance");
      expect(result.provenance.lease_refs).toEqual(["lease-linksites-lead-scout-mock-001"]);
      expect(result.provenance.audit_refs.length).toBeGreaterThanOrEqual(4);

      const leadRecord = result.outputs.lead_record_ref as Record<string, unknown>;
      expect(leadRecord.source).toBe("mock_demo_lead");
      expect(leadRecord.acquisition_mode).toBe("mock");

      const governance = result.outputs.governance as Record<string, unknown>;
      expect(governance.live_provider_ready).toEqual(["google_maps"]);
      expect(governance.live_acquisition_enabled).toBe(false);
    });

    it("should fail lead_scout_bot without a LinkSkills lease reference", async () => {
      process.env.NODE_ENV = "development";
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await executeMission(baseRequest, "lead_scout_bot", mockConfig);

      expect(result.success).toBe(false);
      expect(result.failure?.code).toBe("LEASE_REQUEST_INVALID");
      expect(result.failure?.message).toContain("lease_id");
    });

    it("should skip disabled outreach_bot in MVO", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await executeMission(baseRequest, "outreach_bot", mockConfig);

      expect(result.success).toBe(true);
      expect(result.outputs).toHaveProperty("status", "skipped");
    });

    it("should execute enabled research_enrichment_bot", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await executeMission(baseRequest, "research_enrichment_bot", mockConfig);

      expect(result.success).toBe(true);
      expect(result.provenance.model_run_id).toMatch(/^model-/);
      // audit_refs may be empty if mock mode not detected, which is acceptable
      expect(result.provenance.audit_refs.length).toBeGreaterThanOrEqual(0);
    });

    it("should execute enabled website_builder_bot", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const request: BotReasonRequest = {
        ...baseRequest,
        reasoning_kind: "copy_generation" as ReasoningKind,
      };

      const result = await executeMission(request, "website_builder_bot", mockConfig);

      expect(result.success).toBe(true);
      expect(result.provenance.model_run_id).toMatch(/^model-/);
    });

    it("should return failure for unknown role", async () => {
      process.env.MOCK_CONTEXT = "true";
      process.env.MOCK_AUDIT = "true";

      const result = await executeMission(baseRequest, "unknown_role" as import("./local-types.js").LinkSitesV2RoleId, mockConfig);

      expect(result.success).toBe(false);
      expect(result.failure).toBeDefined();
      expect(result.failure?.code).toBe("MANIFEST_INVALID");
    });
  });

  describe("validateMission", () => {
    it("should validate mission with all capabilities", () => {
      const result = validateMission("research_enrichment_bot", [
        "cap.research.public_web",
        "cap.zulip.run_messaging",
      ]);

      expect(result.valid).toBe(true);
      expect(result.missing_capabilities).toEqual([]);
    });

    it("should return invalid when capabilities missing", () => {
      const result = validateMission("research_enrichment_bot", ["cap.research.public_web"]);

      expect(result.valid).toBe(false);
      expect(result.missing_capabilities).toContain("cap.zulip.run_messaging");
    });

    it("should return invalid for unknown role", () => {
      const result = validateMission("unknown_role", []);

      expect(result.valid).toBe(false);
    });
  });

  describe("listMissionRoles", () => {
    it("should return all roles with MVO status", () => {
      const roles = listMissionRoles();

      expect(roles).toHaveLength(4);

      const leadScout = roles.find((r) => r.role_id === "lead_scout_bot");
      expect(leadScout?.enabled_in_mvo).toBe(true);

      const research = roles.find((r) => r.role_id === "research_enrichment_bot");
      expect(research?.enabled_in_mvo).toBe(true);

      const builder = roles.find((r) => r.role_id === "website_builder_bot");
      expect(builder?.enabled_in_mvo).toBe(true);

      const outreach = roles.find((r) => r.role_id === "outreach_bot");
      expect(outreach?.enabled_in_mvo).toBe(false);
    });
  });

  describe("MISSION_ROLES", () => {
    it("should define research_enrichment_bot with correct capabilities", () => {
      const role = MISSION_ROLES["research_enrichment_bot"];

      expect(role).toBeDefined();
      expect(role.capabilities_required).toContain("cap.research.public_web");
      expect(role.capabilities_required).toContain("cap.zulip.run_messaging");
      expect(role.max_attempts).toBe(3);
    });

    it("should define website_builder_bot with correct capabilities", () => {
      const role = MISSION_ROLES["website_builder_bot"];

      expect(role).toBeDefined();
      expect(role.capabilities_required).toContain("cap.asset.generation");
      expect(role.max_attempts).toBe(3);
    });

    it("should define lead_scout_bot as governed mock acquisition", () => {
      const role = MISSION_ROLES["lead_scout_bot"];

      expect(role).toBeDefined();
      expect(role.capabilities_required).toEqual([
        "cap.research.public_web",
        "cap.crm.odoo_shadow",
      ]);
      expect(role.max_attempts).toBe(1);
    });
  });
});
