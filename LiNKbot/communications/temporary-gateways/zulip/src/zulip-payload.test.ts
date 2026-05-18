import { describe, it, expect } from "vitest";
import {
  buildRunNotificationPayload,
  buildStatusUpdatePayload,
  buildOperatorAlertPayload,
  buildDebugPayload,
  validateZulipPayload,
  hasRequiredLease,
  redactPayloadForLogging,
} from "./zulip-payload.js";
import { ZulipMissionContext } from "./types.js";

describe("Zulip Payload Builders", () => {
  const mockMissionContext: ZulipMissionContext = {
    tenant_id: "tenant-123",
    run_id: "run-456",
    stage_id: "stage-evaluation",
    role_id: "research_enrichment_bot",
    message_purpose: "run_notification",
  };

  describe("buildRunNotificationPayload", () => {
    it("should build run notification payload", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-evaluation",
          role_id: "research_enrichment_bot",
          notification_type: "started",
          message: "Lead evaluation started",
          details: { lead_id: "lead-789" },
        },
        "linkbot-notifications"
      );

      expect(payload.content).toContain("Run STARTED");
      expect(payload.content).toContain("run-456");
      expect(payload.content).toContain("research_enrichment_bot");
      expect(payload.stream).toBe("linkbot-notifications");
      expect(payload.topic).toContain("run-");
      expect(payload.mission_context.role_id).toBe("research_enrichment_bot");
    });

    it("should include lease_id when provided in non-mock mode", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-evaluation",
          role_id: "research_enrichment_bot",
          notification_type: "completed",
          message: "Completed successfully",
        },
        "linkbot-notifications",
        "shadow",
        "lease-789"
      );

      expect(payload.lease_id).toBe("lease-789");
      expect(payload.mode).toBe("shadow");
    });

    it("should not include lease_id in mock mode", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-evaluation",
          role_id: "research_enrichment_bot",
          notification_type: "failed",
          message: "Processing failed",
        },
        "linkbot-notifications",
        "mock",
        "lease-789"
      );

      expect(payload.lease_id).toBeUndefined();
      expect(payload.mode).toBe("mock");
    });
  });

  describe("buildStatusUpdatePayload", () => {
    it("should build status update payload", () => {
      const payload = buildStatusUpdatePayload(
        mockMissionContext,
        "in_progress",
        "Processing 50% complete",
        "linkbot-notifications"
      );

      expect(payload.content).toContain("Status Update: in_progress");
      expect(payload.content).toContain("Processing 50% complete");
      expect(payload.mission_context.message_purpose).toBe("status_update");
    });
  });

  describe("buildOperatorAlertPayload", () => {
    it("should build operator alert payload", () => {
      const payload = buildOperatorAlertPayload(
        mockMissionContext,
        "High Memory Usage",
        "Bot memory usage exceeds 80%",
        "linkbot-alerts"
      );

      expect(payload.content).toContain("🚨 **High Memory Usage**");
      expect(payload.content).toContain("Bot memory usage exceeds 80%");
      expect(payload.mission_context.message_purpose).toBe("operator_alert");
    });
  });

  describe("buildDebugPayload", () => {
    it("should build debug payload", () => {
      const payload = buildDebugPayload(
        mockMissionContext,
        { debug_key: "debug_value", nested: { data: true } },
        "linkbot-debug"
      );

      expect(payload.content).toContain("Debug Information");
      expect(payload.content).toContain('"debug_key": "debug_value"');
      expect(payload.mission_context.message_purpose).toBe("debug");
    });
  });

  describe("validateZulipPayload", () => {
    it("should validate correct payload", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-test",
          role_id: "bot",
          notification_type: "started",
          message: "Test",
        },
        "stream"
      );

      const result = validateZulipPayload(payload);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.payload).toBeDefined();
    });

    it("should reject invalid payload", () => {
      const result = validateZulipPayload({
        content: "Test",
        // Missing required fields
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("hasRequiredLease", () => {
    it("should return true for mock mode without lease", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-test",
          role_id: "bot",
          notification_type: "started",
          message: "Test",
        },
        "stream",
        "mock"
      );

      expect(hasRequiredLease(payload)).toBe(true);
    });

    it("should return false for shadow mode without lease", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-test",
          role_id: "bot",
          notification_type: "started",
          message: "Test",
        },
        "stream",
        "shadow"
      );

      expect(hasRequiredLease(payload)).toBe(false);
    });

    it("should return true for shadow mode with lease", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-test",
          role_id: "bot",
          notification_type: "started",
          message: "Test",
        },
        "stream",
        "shadow",
        "lease-123"
      );

      expect(hasRequiredLease(payload)).toBe(true);
    });
  });

  describe("redactPayloadForLogging", () => {
    it("should redact content for logging", () => {
      const payload = buildRunNotificationPayload(
        {
          tenant_id: "tenant-123",
          run_id: "run-456",
          stage_id: "stage-test",
          role_id: "bot",
          notification_type: "started",
          message: "This is a very long message with sensitive information",
        },
        "stream"
      );

      const redacted = redactPayloadForLogging(payload);

      expect(redacted.stream).toBe("stream");
      expect(redacted.topic).toBeDefined();
      expect(redacted.mission_context).toBeDefined();
      const preview = redacted.content_preview as string;
      expect(preview).toContain("...");
      expect(preview.length).toBeLessThan(payload.content.length);
    });
  });
});
