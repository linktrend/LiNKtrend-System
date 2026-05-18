import { describe, it, expect } from "vitest";
import {
  requestLease,
  executeLease,
  isLeaseValid,
  buildLeaseIdempotencyKey,
  LeaseAdapterError,
  DEFAULT_LEASE_CONFIG,
} from "./lease-adapter.js";
import { BotLeaseRequest } from "./types.js";

describe("Lease Adapter", () => {
  const mockConfig = {
    ...DEFAULT_LEASE_CONFIG,
    linkskills_endpoint: "http://localhost:3999", // Non-existent for tests
  };

  describe("requestLease", () => {
    it("should handle lease request failure gracefully", async () => {
      const botRequest: BotLeaseRequest = {
        session_id: "session-123",
        tenant_id: "tenant-456",
        run_id: "run-789",
        stage_id: "stage-test",
        capability: "cap.research.public_web",
        arguments: { query: "test" },
        idempotency_key: "test-key",
        requested_by_role: "research_enrichment_bot",
      };

      const decision = await requestLease(botRequest, mockConfig);

      // Should return denied status on error
      expect(decision.status).toBe("denied");
      expect(decision.lease_id).toMatch(/^failed-/);
    });

    it("should grant mock lease in development mode", async () => {
      process.env.NODE_ENV = "development";
      process.env.MOCK_LEASES = "true";

      const botRequest: BotLeaseRequest = {
        session_id: "session-123",
        tenant_id: "tenant-456",
        run_id: "run-789",
        stage_id: "stage-test",
        capability: "cap.research.public_web",
        arguments: { query: "test" },
        idempotency_key: "test-key",
        requested_by_role: "research_enrichment_bot",
      };

      const decision = await requestLease(botRequest, mockConfig);

      expect(decision.status).toBe("granted");
      expect(decision.lease_id).toMatch(/^lease-/);
      expect(decision.expires_at).toBeDefined();
      expect(decision.kill_switch_state).toBe("open");
    });
  });

  describe("executeLease", () => {
    it("should return mock execution in development mode", async () => {
      process.env.NODE_ENV = "development";
      process.env.MOCK_LEASES = "true";

      const result = await executeLease("lease-123", "key-456", mockConfig);

      expect(result.lease_id).toBe("lease-123");
      expect(result.result).toHaveProperty("status", "mock_executed");
      expect(result.ledger_entry_id).toMatch(/^ledger-/);
      expect(result.audit_event_id).toMatch(/^audit-/);
    });

    it("should handle execution failure", async () => {
      process.env.NODE_ENV = "production";
      process.env.MOCK_LEASES = "false";

      const result = await executeLease("lease-123", "key-456", mockConfig);

      expect(result.failure).toBeDefined();
      expect(result.lease_id).toBe("lease-123");
    });
  });

  describe("isLeaseValid", () => {
    it("should return true for granted, open, unexpired lease", () => {
      const decision = {
        lease_id: "lease-123",
        status: "granted" as const,
        kill_switch_state: "open" as const,
        expires_at: new Date(Date.now() + 60000).toISOString(),
      };

      expect(isLeaseValid(decision)).toBe(true);
    });

    it("should return false for denied lease", () => {
      const decision = {
        lease_id: "lease-123",
        status: "denied" as const,
        kill_switch_state: "open" as const,
      };

      expect(isLeaseValid(decision)).toBe(false);
    });

    it("should return false for tripped kill switch", () => {
      const decision = {
        lease_id: "lease-123",
        status: "granted" as const,
        kill_switch_state: "tripped" as const,
        expires_at: new Date(Date.now() + 60000).toISOString(),
      };

      expect(isLeaseValid(decision)).toBe(false);
    });

    it("should return false for expired lease", () => {
      const decision = {
        lease_id: "lease-123",
        status: "granted" as const,
        kill_switch_state: "open" as const,
        expires_at: new Date(Date.now() - 60000).toISOString(),
      };

      expect(isLeaseValid(decision)).toBe(false);
    });
  });

  describe("buildLeaseIdempotencyKey", () => {
    it("should build consistent idempotency key", () => {
      const key1 = buildLeaseIdempotencyKey("run-123", "stage-456", "cap.test");
      const key2 = buildLeaseIdempotencyKey("run-123", "stage-456", "cap.test");

      expect(key1).toBe(key2);
      expect(key1).toBe("run-123:stage-456:cap.test");
    });

    it("should build different keys for different inputs", () => {
      const key1 = buildLeaseIdempotencyKey("run-123", "stage-456", "cap.test1");
      const key2 = buildLeaseIdempotencyKey("run-123", "stage-456", "cap.test2");

      expect(key1).not.toBe(key2);
    });
  });

  describe("LeaseAdapterError", () => {
    it("should create error with code and request", () => {
      const request: BotLeaseRequest = {
        session_id: "session-123",
        tenant_id: "tenant-456",
        run_id: "run-789",
        stage_id: "stage-test",
        capability: "cap.test",
        arguments: {},
        idempotency_key: "key",
        requested_by_role: "test_bot",
      };

      const error = new LeaseAdapterError("Test error", "INTEGRATION_UNAVAILABLE", request);

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("INTEGRATION_UNAVAILABLE");
      expect(error.lease_request).toBe(request);
      expect(error.name).toBe("LeaseAdapterError");
    });
  });
});
