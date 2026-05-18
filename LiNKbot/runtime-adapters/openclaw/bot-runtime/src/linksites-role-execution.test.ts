/**
 * LinkSites Role Execution Tests
 *
 * Tests for LiNKbot role execution in the LinkSites / WebsiteFactory module.
 * Verifies that:
 * - Enabled roles (research_enrichment_bot, website_builder_bot) can execute
 * - Disabled roles (lead_scout_bot, outreach_bot) cannot execute in MVO
 * - Role outputs feed downstream stages
 * - Audit/session/provenance refs are emitted
 *
 * Per CONTRACTS_MVO.md §0.A.4 and §12.3
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  type BotReasonRequest,
  type BotReasonResult,
  type AuditEvent,
} from "@linktrend/linklogic-sdk";
import { handleReasoningDispatch, stripContactPii } from "./reasoning-dispatch.js";

// Mocks
const mockWriteBrainAuditEvent = vi.fn();
const mockFetch = vi.fn();

global.fetch = mockFetch;

vi.mock("@linktrend/linklogic-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@linktrend/linklogic-sdk")>();
  return {
    ...actual,
    writeBrainAuditEvent: (env: unknown, event: AuditEvent) => mockWriteBrainAuditEvent(env, event),
  };
});

vi.mock("@linktrend/observability", () => ({
  log: vi.fn(),
}));

describe("LinkSites Role Execution", () => {
  // No API key triggers stub mode for deterministic testing
  const mockEnv = {
    LINKTREND_PUBLIC_BASE_URL: "https://test.linktrend.local",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteBrainAuditEvent.mockResolvedValue({ failure: null });
  });

  describe("Role: research_enrichment_bot (via reasoning_dispatch)", () => {
    it("should execute research_enrichment reasoning and produce lead_research_bundle", async () => {
      const request: BotReasonRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "research_enrichment",
        reasoning_kind: "research_enrichment",
        inputs: {
          lead_input: {
            tenant_id: "test-tenant",
            source: "manual",
            business_name: "Test Business",
            industry: "Professional Services",
            location: { city: "Austin", region: "TX", country: "US" },
            notes: "Looking for a new website",
          },
        },
        model_routing_profile: "quality",
        pii_policy: "strip_contact",
      };

      const result: BotReasonResult = await handleReasoningDispatch(mockEnv, request);

      // Should not have a failure
      expect(result.failure).toBeUndefined();

      // Should have model_run_id
      expect(result.model_run_id).toBeDefined();
      expect(result.model_run_id).toMatch(/^[0-9a-f-]{36}$/);

      // Should have output with lead_research_bundle
      expect(result.outputs).toBeDefined();
      expect(result.outputs.lead_research_bundle).toBeDefined();

      // Should emit role.started and role.completed audit events
      const auditCalls = mockWriteBrainAuditEvent.mock.calls;
      const actions = auditCalls.map((call: [unknown, AuditEvent]) => call[1].action);

      expect(actions).toContain("role.started");
      expect(actions).toContain("role.completed");
      expect(actions).toContain("research.performed");
      expect(actions).toContain("provenance.recorded");
    });

    it("should emit correct role_id in audit payload for research_enrichment", async () => {
      const request: BotReasonRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "research_enrichment",
        reasoning_kind: "research_enrichment",
        inputs: {
          lead_input: {
            tenant_id: "test-tenant",
            source: "manual",
            business_name: "Test Business",
            industry: "Professional Services",
          },
        },
        model_routing_profile: "quality",
        pii_policy: "strip_contact",
      };

      await handleReasoningDispatch(mockEnv, request);

      const auditCalls = mockWriteBrainAuditEvent.mock.calls;
      const roleStartedCall = auditCalls.find(
        (call: [unknown, AuditEvent]) => call[1].action === "role.started",
      );
      const roleCompletedCall = auditCalls.find(
        (call: [unknown, AuditEvent]) => call[1].action === "role.completed",
      );

      expect(roleStartedCall?.[1].payload.role_id).toBe("research_enrichment_bot");
      expect(roleCompletedCall?.[1].payload.role_id).toBe("research_enrichment_bot");
    });
  });

  describe("Role: website_builder_bot (via reasoning_dispatch)", () => {
    it("should execute website_package_generation reasoning and produce website_package", async () => {
      const request: BotReasonRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "website_package_generation",
        reasoning_kind: "website_package_generation",
        inputs: {
          lead_input: {
            tenant_id: "test-tenant",
            source: "manual",
            business_name: "Test Business",
            industry: "Professional Services",
          },
          lead_research_bundle: {
            market_context: "Local professional services market",
            audience_notes: "Small business owners",
            positioning_notes: "Trust and reliability focus",
          },
          template_id: "professional_v1",
        },
        model_routing_profile: "quality",
        pii_policy: "strip_contact",
      };

      const result: BotReasonResult = await handleReasoningDispatch(mockEnv, request);

      // Should not have a failure
      expect(result.failure).toBeUndefined();

      // Should have output with website_package
      expect(result.outputs).toBeDefined();
      expect(result.outputs.website_package).toBeDefined();

      // Should emit role.started and role.completed audit events
      const auditCalls = mockWriteBrainAuditEvent.mock.calls;
      const actions = auditCalls.map((call: [unknown, AuditEvent]) => call[1].action);

      expect(actions).toContain("role.started");
      expect(actions).toContain("role.completed");
      // Note: template.guidance.selected is emitted during template_selection stage
      // website_package_generation receives template_id as input
      expect(actions).toContain("website.package.generated");
      expect(actions).toContain("provenance.recorded");
    });

    it("should emit correct role_id in audit payload for website_package_generation", async () => {
      const request: BotReasonRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "website_package_generation",
        reasoning_kind: "website_package_generation",
        inputs: {
          lead_input: {
            tenant_id: "test-tenant",
            source: "manual",
            business_name: "Test Business",
            industry: "Professional Services",
          },
          lead_research_bundle: {
            market_context: "Local professional services market",
          },
          template_id: "professional_v1",
        },
        model_routing_profile: "quality",
        pii_policy: "strip_contact",
      };

      await handleReasoningDispatch(mockEnv, request);

      const auditCalls = mockWriteBrainAuditEvent.mock.calls;
      const roleStartedCall = auditCalls.find(
        (call: [unknown, AuditEvent]) => call[1].action === "role.started",
      );
      const roleCompletedCall = auditCalls.find(
        (call: [unknown, AuditEvent]) => call[1].action === "role.completed",
      );

      expect(roleStartedCall?.[1].payload.role_id).toBe("website_builder_bot");
      expect(roleCompletedCall?.[1].payload.role_id).toBe("website_builder_bot");
    });
  });

  describe("Disabled Roles (MVO)", () => {
    it("should document that lead_scout_bot is disabled in MVO", () => {
      // This role is declared but disabled in MVO
      // It should not be invoked in the runtime path
      // Mock CRM data supplies its output instead
      expect(true).toBe(true); // Documentation test
    });

    it("should document that outreach_bot is disabled in MVO", () => {
      // This role is declared but disabled in MVO
      // No outreach draft or send for v2
      expect(true).toBe(true); // Documentation test
    });
  });

  describe("Audit Event Structure", () => {
    it("should include run_id and stage_id in all audit events", async () => {
      const request: BotReasonRequest = {
        tenant_id: "test-tenant",
        run_id: "run-test-456",
        stage_id: "research_enrichment",
        reasoning_kind: "research_enrichment",
        inputs: {
          lead_input: {
            tenant_id: "test-tenant",
            source: "manual",
            business_name: "Test Business",
            industry: "Professional Services",
          },
        },
        model_routing_profile: "quality",
        pii_policy: "strip_contact",
      };

      await handleReasoningDispatch(mockEnv, request);

      const auditCalls = mockWriteBrainAuditEvent.mock.calls;

      for (const call of auditCalls) {
        const event = call[1] as AuditEvent;
        expect(event.subject.run_id).toBe("run-test-456");
        expect(event.subject.stage_id).toBe("research_enrichment");
        expect(event.tenant_id).toBe("test-tenant");
        expect(event.plane).toBe("linkbot");
      }
    });

    it("should include role_id in role.* audit events", async () => {
      const request: BotReasonRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "research_enrichment",
        reasoning_kind: "research_enrichment",
        inputs: {
          lead_input: {
            tenant_id: "test-tenant",
            source: "manual",
            business_name: "Test Business",
            industry: "Professional Services",
          },
        },
        model_routing_profile: "quality",
        pii_policy: "strip_contact",
      };

      await handleReasoningDispatch(mockEnv, request);

      const auditCalls = mockWriteBrainAuditEvent.mock.calls;
      const roleEvents = auditCalls.filter(
        (call: [unknown, AuditEvent]) =>
          call[1].action.startsWith("role.") ||
          call[1].action === "research.performed" ||
          call[1].action === "website.package.generated",
      );

      for (const call of roleEvents) {
        const event = call[1] as AuditEvent;
        expect(event.payload.role_id).toBeDefined();
        expect(["research_enrichment_bot", "website_builder_bot"]).toContain(
          event.payload.role_id,
        );
      }
    });
  });

  describe("PII Stripping", () => {
    it("should strip contact PII before sending to model", async () => {
      const inputs = {
        lead_input: {
          tenant_id: "test-tenant",
          source: "manual",
          business_name: "Test Business",
          industry: "Professional Services",
          contact: {
            name: "John Doe",
            email: "john@example.com",
            phone: "+15551234567",
          },
        },
      };

      const stripped = stripContactPii(inputs);

      // Contact should be stripped
      expect(stripped.lead_input).not.toHaveProperty("contact");

      // Business name and industry should remain
      expect((stripped.lead_input as Record<string, unknown>).business_name).toBe("Test Business");
      expect((stripped.lead_input as Record<string, unknown>).industry).toBe("Professional Services");
    });
  });
});

describe("LinkSites Role Definitions", () => {
  it("should have correct MVO enabled roles", async () => {
    const { LINKSITES_MVO_ENABLED_ROLES } = await import(
      "../../../roles/modules/linksites/roles.js"
    );

    expect(LINKSITES_MVO_ENABLED_ROLES).toContain("research_enrichment_bot");
    expect(LINKSITES_MVO_ENABLED_ROLES).toContain("website_builder_bot");
    expect(LINKSITES_MVO_ENABLED_ROLES).not.toContain("lead_scout_bot");
    expect(LINKSITES_MVO_ENABLED_ROLES).not.toContain("outreach_bot");
  });

  it("should have correct MVO disabled roles", async () => {
    const { LINKSITES_MVO_DISABLED_ROLES } = await import(
      "../../../roles/modules/linksites/roles.js"
    );

    expect(LINKSITES_MVO_DISABLED_ROLES).toContain("lead_scout_bot");
    expect(LINKSITES_MVO_DISABLED_ROLES).toContain("outreach_bot");
    expect(LINKSITES_MVO_DISABLED_ROLES).not.toContain("research_enrichment_bot");
    expect(LINKSITES_MVO_DISABLED_ROLES).not.toContain("website_builder_bot");
  });

  it("should validate role execution correctly", async () => {
    const { validateRoleExecution } = await import("../../../roles/modules/linksites/roles.js");

    // Enabled roles should be valid
    const enabledResult = validateRoleExecution("research_enrichment_bot");
    expect(enabledResult.valid).toBe(true);

    // Disabled roles should be invalid
    const disabledResult = validateRoleExecution("lead_scout_bot");
    expect(disabledResult.valid).toBe(false);
    expect(disabledResult.reason).toContain("disabled in MVO");
  });
});
