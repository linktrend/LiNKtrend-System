import { describe, expect, it, beforeEach } from "vitest";

import {
  assembleBuilderBotContext,
  assembleContextForBot,
  assembleResearchBotContext,
  createContextAssembler,
  verifyContextAccess,
} from "./context-assembler.js";

// Mock Supabase client for testing
const createMockSupabase = () => ({
  schema: () => ({
    rpc: async () => ({ data: [], error: null }),
    from: () => ({
      select: () => ({
        eq: () => ({ data: [], error: null }),
      }),
    }),
  }),
});

describe("Context Assembler Service", () => {
  describe("verifyContextAccess", () => {
    it("allows same-tenant access", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1" },
      );
      expect(result.authorized).toBe(true);
    });

    it("fails closed on cross-tenant access", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-2" },
      );
      expect(result.authorized).toBe(false);
      expect(result.reason).toContain("Cross-tenant access denied");
    });

    it("allows access when scopes match", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
      );
      expect(result.authorized).toBe(true);
    });

    it("denies access when plugin scopes mismatch", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1", plugin_id: "other-plugin", role_id: "research_bot" },
      );
      expect(result.authorized).toBe(false);
      expect(result.reason).toContain("Scope lattice mismatch");
    });

    it("allows access when bot scope is broader than target", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1", plugin_id: "websitefactory" },
      );
      expect(result.authorized).toBe(true);
    });

    it("denies access when role scopes mismatch", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "builder_bot" },
      );
      expect(result.authorized).toBe(false);
    });
  });

  describe("assembleContextForBot", () => {
    const mockSupabase = createMockSupabase() as any;

    it("returns successful context assembly for valid request", async () => {
      const result = await assembleContextForBot(
        {
          tenant_id: "tenant-1",
          plugin_id: "websitefactory",
          role_id: "research_bot",
          bot_instance_id: "bot-1",
          session_id: "session-1",
          task_type: "lead_research",
          task_description: "Research healthcare industry lead",
        },
        { supabase: mockSupabase, useInMemoryStore: true },
      );

      expect(result.success).toBe(true);
      expect(result.bundle).toBeDefined();
      expect(result.bundle!.bundle_id).toBeDefined();
      expect(result.bundle!.assembled_at).toBeDefined();
      expect(result.bundle!.scope_applied.tenant_id).toBe("tenant-1");
    });

    it("includes assembly metadata", async () => {
      const result = await assembleContextForBot(
        {
          tenant_id: "tenant-1",
          plugin_id: "websitefactory",
          role_id: "research_bot",
          bot_instance_id: "bot-1",
          session_id: "session-1",
          task_type: "lead_research",
          task_description: "Research healthcare industry lead",
        },
        { supabase: mockSupabase, useInMemoryStore: true },
      );

      expect(result.success).toBe(true);
      expect(result.bundle!.assembly_metadata.assembler_version).toBe("linkaios-kernel-1.0.0");
      expect(result.bundle!.assembly_metadata.retrieval_modes_used).toContain("metadata");
      expect(result.bundle!.assembly_metadata.retrieval_modes_used).toContain("keyword");
    });

    it("respects max_facts limit", async () => {
      const result = await assembleContextForBot(
        {
          tenant_id: "tenant-1",
          plugin_id: "websitefactory",
          role_id: "research_bot",
          bot_instance_id: "bot-1",
          session_id: "session-1",
          task_type: "lead_research",
          task_description: "Research healthcare industry lead",
          max_facts: 3,
        },
        { supabase: mockSupabase, useInMemoryStore: true },
      );

      expect(result.success).toBe(true);
      expect(result.bundle!.facts.length).toBeLessThanOrEqual(3);
    });

    it("respects max_episodes limit", async () => {
      const result = await assembleContextForBot(
        {
          tenant_id: "tenant-1",
          plugin_id: "websitefactory",
          role_id: "research_bot",
          bot_instance_id: "bot-1",
          session_id: "session-1",
          task_type: "lead_research",
          task_description: "Research healthcare industry lead",
          max_episodes: 2,
        },
        { supabase: mockSupabase, useInMemoryStore: true },
      );

      expect(result.success).toBe(true);
      expect(result.bundle!.recent_episodes.length).toBeLessThanOrEqual(2);
    });
  });

  describe("createContextAssembler factory", () => {
    const mockSupabase = createMockSupabase() as any;

    it("creates assembler with in-memory store by default", () => {
      const assembler = createContextAssembler(mockSupabase);
      expect(assembler._inMemoryStore).not.toBeNull();
    });

    it("creates assembler with in-memory store when forced", () => {
      const assembler = createContextAssembler(mockSupabase, { forceInMemory: true });
      expect(assembler._inMemoryStore).not.toBeNull();
    });

    it("provides assembleForBot method", async () => {
      const assembler = createContextAssembler(mockSupabase, { forceInMemory: true });
      const result = await assembler.assembleForBot({
        tenant_id: "tenant-1",
        plugin_id: "websitefactory",
        role_id: "research_bot",
        bot_instance_id: "bot-1",
        session_id: "session-1",
        task_type: "lead_research",
        task_description: "Research healthcare industry lead",
      });

      expect(result.success).toBe(true);
    });

    it("provides verifyAccess method", () => {
      const assembler = createContextAssembler(mockSupabase);
      const result = assembler.verifyAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1" },
      );
      expect(result.authorized).toBe(true);
    });
  });

  describe("WebsiteFactory Bot Helpers", () => {
    const mockSupabase = createMockSupabase() as any;

    describe("assembleResearchBotContext", () => {
      it("assembles context for research bot", async () => {
        const result = await assembleResearchBotContext(
          {
            tenant_id: "tenant-1",
            bot_instance_id: "bot-1",
            session_id: "session-1",
            lead_description: "Healthcare SMB in Austin, TX",
          },
          { supabase: mockSupabase, useInMemoryStore: true },
        );

        expect(result.success).toBe(true);
        expect(result.bundle).toBeDefined();
        expect(result.bundle!.scope_applied.plugin_id).toBe("websitefactory");
        expect(result.bundle!.scope_applied.role_id).toBe("research_enrichment_bot");
      });

      it("passes through work request tracking IDs", async () => {
        const workRequestId = crypto.randomUUID();
        const runId = crypto.randomUUID();

        const result = await assembleResearchBotContext(
          {
            tenant_id: "tenant-1",
            bot_instance_id: "bot-1",
            session_id: "session-1",
            lead_description: "Healthcare SMB in Austin, TX",
            work_request_id: workRequestId,
            run_id: runId,
            stage_id: "research-stage",
          },
          { supabase: mockSupabase, useInMemoryStore: true },
        );

        expect(result.success).toBe(true);
        expect(result.bundle!.assembly_metadata.request_id).toBeDefined();
      });
    });

    describe("assembleBuilderBotContext", () => {
      it("assembles context for builder bot", async () => {
        const result = await assembleBuilderBotContext(
          {
            tenant_id: "tenant-1",
            bot_instance_id: "bot-1",
            session_id: "session-1",
            template_context: "Marketing website for healthcare SMB",
          },
          { supabase: mockSupabase, useInMemoryStore: true },
        );

        expect(result.success).toBe(true);
        expect(result.bundle).toBeDefined();
        expect(result.bundle!.scope_applied.plugin_id).toBe("websitefactory");
        expect(result.bundle!.scope_applied.role_id).toBe("website_builder_bot");
      });
    });
  });

  describe("Cross-Tenant Security Tests", () => {
    const mockSupabase = createMockSupabase() as any;

    it("prevents tenant-1 bot from accessing tenant-2 scope", async () => {
      // First, verify the access check fails
      const accessCheck = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-2", plugin_id: "websitefactory", role_id: "research_bot" },
      );
      expect(accessCheck.authorized).toBe(false);

      // The assembler should also respect this
      const result = await assembleContextForBot(
        {
          tenant_id: "tenant-1",
          plugin_id: "websitefactory",
          role_id: "research_bot",
          bot_instance_id: "bot-1",
          session_id: "session-1",
          task_type: "lead_research",
          task_description: "Research healthcare industry lead",
        },
        { supabase: mockSupabase, useInMemoryStore: true },
      );

      // The request itself succeeds but returns empty context
      // because no tenant-2 data is accessible
      expect(result.success).toBe(true);
      expect(result.bundle!.scope_applied.tenant_id).toBe("tenant-1");
    });
  });
});

describe("Scope Lattice Stress Tests", () => {
  describe("verifyContextAccess edge cases", () => {
    it("handles missing plugin_id in target", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1" }, // No plugin specified
      );
      expect(result.authorized).toBe(true);
    });

    it("handles missing role_id in target", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1", plugin_id: "websitefactory" }, // No role specified
      );
      expect(result.authorized).toBe(true);
    });

    it("denies when target has different role than bot", () => {
      const result = verifyContextAccess(
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "research_bot" },
        { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "other_role" },
      );
      expect(result.authorized).toBe(false);
    });
  });
});
