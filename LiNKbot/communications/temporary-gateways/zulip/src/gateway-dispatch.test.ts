import { describe, it, expect, beforeEach } from "vitest";
import {
  dispatchGatewayOperation,
  validateDispatchRequest,
  getGatewayCapabilities,
  checkGatewayHealth,
  DEFAULT_GATEWAY_CONFIG,
} from "./gateway-dispatch.js";
import { GatewayDispatchRequest } from "./types.js";
import { resetSendStats } from "./zulip-send.js";

describe("Gateway Dispatch", () => {
  const mockConfig = {
    ...DEFAULT_GATEWAY_CONFIG,
    base_url: "http://localhost:3999", // Non-existent for tests
    mode: "mock" as const,
  };

  beforeEach(() => {
    resetSendStats();
  });

  describe("dispatchGatewayOperation", () => {
    it("should handle connectivity.probe operation", async () => {
      const request: GatewayDispatchRequest = {
        operation: "connectivity.probe",
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {},
        idempotency_key: "test-key",
      };

      const result = await dispatchGatewayOperation(request, mockConfig);

      expect(result.success).toBe(false); // Non-existent server
      expect(result.operation).toBe("connectivity.probe");
      expect(result.result).toHaveProperty("reachable");
    });

    it("should handle run.notify operation in mock mode", async () => {
      const request: GatewayDispatchRequest = {
        operation: "run.notify",
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {
          notification_type: "started",
          message: "Test notification",
          role_id: "research_enrichment_bot",
          details: { test: "data" },
        },
        idempotency_key: "run-456:stage-1:notify",
      };

      const result = await dispatchGatewayOperation(request, mockConfig);

      expect(result.success).toBe(true);
      expect(result.operation).toBe("run.notify");
      expect(result.result).toHaveProperty("mock_sent", true);
    });

    it("should handle channel.message.mock_send operation", async () => {
      const request: GatewayDispatchRequest = {
        operation: "channel.message.mock_send",
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {
          content: "Test message",
          stream: "test-stream",
          topic: "test-topic",
          mission_context: {
            tenant_id: "tenant-123",
            run_id: "run-456",
            stage_id: "stage-1",
            role_id: "research_enrichment_bot",
          },
        },
        idempotency_key: "test-key-2",
      };

      const result = await dispatchGatewayOperation(request, mockConfig);

      expect(result.success).toBe(true);
      expect(result.operation).toBe("channel.message.mock_send");
    });

    it("should reject unknown operation", async () => {
      const request = {
        operation: "unknown.operation" as GatewayDispatchRequest["operation"],
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {},
        idempotency_key: "test-key",
      } as unknown as GatewayDispatchRequest;

      const result = await dispatchGatewayOperation(request, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNKNOWN_OPERATION");
    });
  });

  describe("validateDispatchRequest", () => {
    it("should validate correct request", () => {
      const request = {
        operation: "run.notify",
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {},
        idempotency_key: "test-key",
      };

      const result = validateDispatchRequest(request);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject request with missing operation", () => {
      const request = {
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {},
        idempotency_key: "test-key",
      };

      const result = validateDispatchRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("operation is required and must be a string");
    });

    it("should reject request with wrong capability", () => {
      const request = {
        operation: "run.notify",
        tenant_id: "tenant-123",
        capability: "wrong.capability",
        arguments: {},
        idempotency_key: "test-key",
      };

      const result = validateDispatchRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("capability must be 'cap.zulip.run_messaging'");
    });

    it("should reject request with disallowed operation", () => {
      const request = {
        operation: "channel.direct_message",
        tenant_id: "tenant-123",
        capability: "cap.zulip.run_messaging",
        arguments: {},
        idempotency_key: "test-key",
      };

      const result = validateDispatchRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("operation must be one of"))).toBe(true);
    });
  });

  describe("getGatewayCapabilities", () => {
    it("should return allowed operations and modes", () => {
      const capabilities = getGatewayCapabilities();

      expect(capabilities.operations).toContain("run.notify");
      expect(capabilities.operations).toContain("channel.message.mock_send");
      expect(capabilities.operations).toContain("connectivity.probe");
      expect(capabilities.modes).toContain("mock");
      expect(capabilities.modes).toContain("shadow");
      expect(capabilities.modes).toContain("live");
      expect(capabilities.requires_lease).toBe(true);
    });
  });

  describe("checkGatewayHealth", () => {
    it("should return mock mode as healthy", async () => {
      const health = await checkGatewayHealth(mockConfig);

      expect(health.status).toBe("healthy");
      expect(health.mode).toBe("mock");
      expect(health.connectivity).toBeDefined();
    });
  });
});
