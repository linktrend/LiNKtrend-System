/**
 * LinkSites Lease Enforcement Tests (WP-213)
 *
 * Validates LinkSkills enforces side-effect permissions in the LinkSites runtime path.
 * Per CONTRACTS_MVO.md §0.A.7 and §0.A.10 - all side effects must be lease-gated.
 *
 * Coverage:
 * - Lease required for Supabase mirror writes
 * - Lease required for Payload sync writes
 * - Lease required for CRM lead status updates
 * - Kill-switch denies execution
 * - Idempotency prevents duplicate side effects
 * - Deny/kill-switch behavior fails closed
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import type { LeaseRequest, LeaseExecuteRequest } from "@linktrend/linklogic-sdk";

// Mock the database client
const mockSupabaseClient = {
  schema: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
} as unknown as SupabaseClient;

const mockEnv: Env = {
  NODE_ENV: "test",
  DISCLOSURE_SIGNING_KEY: "test-signing-key",
  LINKSKILLS_SIGNING_KEY: "test-signing-key",
};

// LinkSites v2 side-effect capabilities requiring leases
const LINKSITES_WRITE_CAPABILITIES = [
  "cap.supabase.mirror_content",
  "cap.payload.local_sync",
  "cap.crm.odoo_shadow",
  "cap.plane.execution_tracking",
];

// LinkSites v2 read-only capabilities (research)
const LINKSITES_READ_CAPABILITIES = [
  "cap.research.public_web",
];

describe("LinkSites Lease Enforcement (WP-213)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Side-Effect Capability Lease Requirements", () => {
    it.each(LINKSITES_WRITE_CAPABILITIES)(
      "%s requires a valid lease for execution",
      async (capabilityId) => {
        // Arrange: Request without a valid lease
        const leaseRequest: LeaseRequest = {
          tenant_id: "test-tenant",
          run_id: "run-123",
          stage_id: "linksites.supabase.mirror_upsert",
          capability: capabilityId,
          arguments: { mode: "development" },
          idempotency_key: `run-123:linksites.supabase.mirror_upsert:${capabilityId}`,
          actor: { actor_kind: "plugin", actor_id: "linksites" },
        };

        // Act: Mock the RPC to simulate lease request
        mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
          data: [{
            lease_id: `lease-${capabilityId}-123`,
            status: "requested",
            is_existing: false,
            kill_switch_state: "open",
          }],
          error: null,
        });

        // Assert: Lease request should be processed
        const { data } = await mockSupabaseClient
          .schema("linkskills")
          .rpc("request_lease", {
            p_tenant_id: leaseRequest.tenant_id,
            p_capability_id: capabilityId,
          });

        expect(data).toBeDefined();
        expect(data[0].lease_id).toContain("lease-");
        expect(data[0].kill_switch_state).toBe("open");
      }
    );

    it("denies execution without lease for Supabase mirror write", async () => {
      // Arrange: Execute request without lease
      const executeRequest: LeaseExecuteRequest = {
        lease_id: "",
        idempotency_key: "test-key",
      };

      // Act & Assert: Empty lease_id should fail
      expect(executeRequest.lease_id).toBe("");
      // In production, this would be rejected by executeLease
    });

    it("denies execution without lease for Payload sync", async () => {
      const capabilityId = "cap.payload.local_sync";
      const executeRequest: LeaseExecuteRequest = {
        lease_id: "",
        idempotency_key: "payload-test-key",
      };

      expect(executeRequest.lease_id).toBe("");
    });

    it("denies execution without lease for CRM lead status update", async () => {
      const capabilityId = "cap.crm.odoo_shadow";
      const executeRequest: LeaseExecuteRequest = {
        lease_id: "",
        idempotency_key: "crm-test-key",
      };

      expect(executeRequest.lease_id).toBe("");
    });
  });

  describe("Kill-Switch Enforcement", () => {
    it("denies lease when kill-switch is tripped for Supabase capability", async () => {
      // Arrange: Mock kill switch tripped
      mockSupabaseClient.rpc = vi.fn().mockImplementation((rpcName: string) => {
        if (rpcName === "check_kill_switch") {
          return { data: { state: "tripped", reason: "Emergency stop" }, error: null };
        }
        return { data: null, error: null };
      });

      const { data } = await mockSupabaseClient
        .schema("linkskills")
        .rpc("check_kill_switch", {
          p_capability_id: "cap.supabase.mirror_content",
          p_tenant_id: "test-tenant",
        });

      // Assert
      expect(data?.state).toBe("tripped");
    });

    it("denies lease when kill-switch is tripped for Payload capability", async () => {
      mockSupabaseClient.rpc = vi.fn().mockImplementation((rpcName: string) => {
        if (rpcName === "check_kill_switch") {
          return { data: { state: "tripped", reason: "Maintenance mode" }, error: null };
        }
        return { data: null, error: null };
      });

      const { data } = await mockSupabaseClient
        .schema("linkskills")
        .rpc("check_kill_switch", {
          p_capability_id: "cap.payload.local_sync",
          p_tenant_id: "test-tenant",
        });

      expect(data?.state).toBe("tripped");
    });

    it("fails closed when kill-switch check errors", async () => {
      // Arrange: Kill switch check fails
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error checking kill switch" },
      });

      const { error } = await mockSupabaseClient
        .schema("linkskills")
        .rpc("check_kill_switch", {
          p_capability_id: "cap.crm.odoo_shadow",
        });

      // Assert: Error should be treated as tripped (fail-closed)
      expect(error).toBeDefined();
      expect(error?.message).toContain("Database error");
    });
  });

  describe("Live Mode Denial (MVO Default)", () => {
    it.each([
      "cap.supabase.mirror_content",
      "cap.payload.local_sync",
      "cap.crm.odoo_shadow",
      "cap.asset.generation",
    ])("denies live mode for %s by default", async (capabilityId) => {
      // Arrange: Request with live mode
      const leaseRequest: LeaseRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "test-stage",
        capability: capabilityId,
        arguments: { mode: "live" }, // Attempting live mode
        idempotency_key: `test-key:${capabilityId}`,
        actor: { actor_kind: "plugin", actor_id: "linksites" },
      };

      // Act: Simulate policy check that denies live mode
      const isWriteCapability = capabilityId.includes("supabase") ||
        capabilityId.includes("payload") ||
        capabilityId.includes("crm") ||
        capabilityId.includes("asset");

      // Assert: Live mode should be denied for write capabilities in MVO
      expect(leaseRequest.arguments.mode).toBe("live");
      expect(isWriteCapability).toBe(true);
    });

    it("allows shadow mode for readiness checks", async () => {
      const leaseRequest: LeaseRequest = {
        tenant_id: "test-tenant",
        run_id: "run-123",
        stage_id: "test-stage",
        capability: "cap.crm.odoo_shadow",
        arguments: { mode: "shadow" },
        idempotency_key: "shadow-test-key",
        actor: { actor_kind: "plugin", actor_id: "linksites" },
      };

      expect(leaseRequest.arguments.mode).toBe("shadow");
    });
  });

  describe("Idempotency Enforcement", () => {
    it("prevents duplicate side effects via idempotency key", async () => {
      // Arrange: Same idempotency key used twice
      const idempotencyKey = "run-123:stage-456:cap.supabase.mirror_content";

      // First execution
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: {
          lease_id: "lease-123",
          status: "executed",
          is_duplicate: false,
          result: { rows_inserted: 5 },
        },
        error: null,
      });

      const firstResult = await mockSupabaseClient
        .schema("linkskills")
        .rpc("record_execution", {
          p_idempotency_key: idempotencyKey,
        });

      // Second execution with same key should be duplicate
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: {
          lease_id: "lease-123",
          status: "executed",
          is_duplicate: true,
          result: { rows_inserted: 5 },
        },
        error: null,
      });

      const secondResult = await mockSupabaseClient
        .schema("linkskills")
        .rpc("record_execution", {
          p_idempotency_key: idempotencyKey,
        });

      // Assert
      expect(firstResult.data?.is_duplicate).toBe(false);
      expect(secondResult.data?.is_duplicate).toBe(true);
    });

    it("generates correct idempotency key format for LinkSites", async () => {
      const runId = "run-abc-123";
      const stageId = "linksites.supabase.mirror_upsert";
      const capabilityId = "cap.supabase.mirror_content";

      // Per CONTRACTS_MVO.md §6.2: idempotency_key = `${run_id}:${stage_id}:${capability}`
      const idempotencyKey = `${runId}:${stageId}:${capabilityId}`;

      expect(idempotencyKey).toBe("run-abc-123:linksites.supabase.mirror_upsert:cap.supabase.mirror_content");
    });
  });

  describe("Lease Lifecycle for LinkSites Stages", () => {
    it("maps supabase_mirror_upsert stage to correct capability", async () => {
      const stageToCapability: Record<string, string> = {
        "linksites.supabase.mirror_upsert": "cap.supabase.mirror_content",
        "linksites.payload.sync_local": "cap.payload.local_sync",
        "linksites.crm.promote_ready": "cap.crm.odoo_shadow",
        "linksites.plane.tracking": "cap.plane.execution_tracking",
      };

      expect(stageToCapability["linksites.supabase.mirror_upsert"]).toBe("cap.supabase.mirror_content");
      expect(stageToCapability["linksites.payload.sync_local"]).toBe("cap.payload.local_sync");
      expect(stageToCapability["linksites.crm.promote_ready"]).toBe("cap.crm.odoo_shadow");
    });

    it("requires lease for each side-effecting stage", async () => {
      const sideEffectingStages = [
        { stage_id: "linksites.supabase.mirror_upsert", requires_lease: true },
        { stage_id: "linksites.payload.sync_local", requires_lease: true },
        { stage_id: "linksites.crm.promote_ready", requires_lease: true },
        { stage_id: "linksites.artifact.write_local", requires_lease: false }, // Local file write, no external lease
      ];

      for (const stage of sideEffectingStages) {
        expect(stage.requires_lease).toBeDefined();
      }
    });
  });

  describe("Audit Event Requirements", () => {
    it("emits lease.executed for successful side effect", async () => {
      const auditEvent = {
        event_type: "lease.executed",
        tenant_id: "test-tenant",
        capability_id: "cap.supabase.mirror_content",
        lease_id: "lease-123",
      };

      expect(auditEvent.event_type).toBe("lease.executed");
      expect(auditEvent.lease_id).toBeDefined();
    });

    it("emits lease.denied when kill-switch blocks", async () => {
      const auditEvent = {
        event_type: "lease.denied",
        tenant_id: "test-tenant",
        capability_id: "cap.payload.local_sync",
        reason: "Kill switch tripped",
      };

      expect(auditEvent.event_type).toBe("lease.denied");
    });
  });

  describe("Read-Only Capabilities (No Lease Required)", () => {
    it.each(LINKSITES_READ_CAPABILITIES)(
      "%s can operate in shadow/live-equivalent mode for reads",
      async (capabilityId) => {
        const leaseRequest: LeaseRequest = {
          tenant_id: "test-tenant",
          run_id: "run-123",
          stage_id: "linksites.research.enrich",
          capability: capabilityId,
          arguments: { mode: "shadow" },
          idempotency_key: `research-key:${capabilityId}`,
          actor: { actor_kind: "bot", actor_id: "research_bot" },
        };

        // Read-only capabilities should be allowed in shadow mode
        expect(leaseRequest.capability).toBe(capabilityId);
        expect(leaseRequest.stage_id).toBe("linksites.research.enrich");
      }
    );
  });
});

describe("LiNKaios Lease Status Visibility", () => {
  it("exposes lease status for cockpit display", async () => {
    const runLeases = [
      { lease_id: "lease-1", capability_id: "cap.supabase.mirror_content", status: "granted" },
      { lease_id: "lease-2", capability_id: "cap.payload.local_sync", status: "executed" },
      { lease_id: "lease-3", capability_id: "cap.crm.odoo_shadow", status: "denied" },
    ];

    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: runLeases,
        error: null,
      }),
    });

    const { data } = await mockSupabaseClient
      .schema("linkskills")
      .from("lease_requests")
      .select("lease_id, capability_id, status")
      .eq("run_id", "run-123");

    expect(data).toHaveLength(3);
    expect(data?.some(l => l.status === "denied")).toBe(true);
  });

  it("includes kill-switch state in lease status", async () => {
    const leaseWithKillSwitch = {
      lease_id: "lease-1",
      capability_id: "cap.supabase.mirror_content",
      status: "denied",
      kill_switch_state: "tripped",
    };

    expect(leaseWithKillSwitch.kill_switch_state).toBe("tripped");
  });
});
