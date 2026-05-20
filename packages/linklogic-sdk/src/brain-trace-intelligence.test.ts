/**
 * Tests for LiNKbrain Trace Intelligence (WP-202)
 *
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";

import {
  buildTraceSummaryText,
  getPlaneBreakdown,
  isMvoCompleteTrace,
  type CrossPlaneStageSummary,
  type RunTraceSummary,
  type TraceEvent,
} from "./brain-trace-intelligence.js";

describe("brain-trace-intelligence", () => {
  describe("buildTraceSummaryText", () => {
    it("formats a complete trace summary", () => {
      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "succeeded",
        started_at: "2026-05-18T10:00:00Z",
        ended_at: "2026-05-18T10:05:30Z",
        duration_ms: 330000,
        total_stages: 10,
        completed_stages: 10,
        failed_stages: 0,
        total_audit_events: 15,
        total_leases: 4,
        total_workflow_runs: 2,
        total_memory_objects: 3,
        lead_id: "lead-456",
        stages: [],
      };

      const summary = buildTraceSummaryText(trace);

      expect(summary).toContain("websitefactory.lead_to_preview");
      expect(summary).toContain("Status: succeeded");
      expect(summary).toContain("Duration: 5.5m");
      expect(summary).toContain("Stages: 10/10 completed");
      expect(summary).toContain("15 audit");
      expect(summary).toContain("4 leases");
    });

    it("includes failed stage count when present", () => {
      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "failed",
        started_at: "2026-05-18T10:00:00Z",
        duration_ms: 5000,
        total_stages: 10,
        completed_stages: 3,
        failed_stages: 1,
        total_audit_events: 5,
        total_leases: 1,
        total_workflow_runs: 0,
        total_memory_objects: 0,
        stages: [],
      };

      const summary = buildTraceSummaryText(trace);

      expect(summary).toContain("Failed stages: 1");
    });
  });

  describe("isMvoCompleteTrace", () => {
    it("returns true for a complete MVO trace", () => {
      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "succeeded",
        started_at: "2026-05-18T10:00:00Z",
        duration_ms: 330000,
        total_stages: 10,
        completed_stages: 10,
        failed_stages: 0,
        total_audit_events: 15,
        total_leases: 4,
        total_workflow_runs: 2,
        total_memory_objects: 3,
        stages: [],
      };

      expect(isMvoCompleteTrace(trace)).toBe(true);
    });

    it("returns false when audit events are insufficient", () => {
      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "succeeded",
        started_at: "2026-05-18T10:00:00Z",
        duration_ms: 330000,
        total_stages: 10,
        completed_stages: 10,
        failed_stages: 0,
        total_audit_events: 2, // Too few
        total_leases: 4,
        total_workflow_runs: 2,
        total_memory_objects: 3,
        stages: [],
      };

      expect(isMvoCompleteTrace(trace)).toBe(false);
    });

    it("returns false when no memory objects", () => {
      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "succeeded",
        started_at: "2026-05-18T10:00:00Z",
        duration_ms: 330000,
        total_stages: 10,
        completed_stages: 10,
        failed_stages: 0,
        total_audit_events: 15,
        total_leases: 4,
        total_workflow_runs: 2,
        total_memory_objects: 0, // No memory
        stages: [],
      };

      expect(isMvoCompleteTrace(trace)).toBe(false);
    });

    it("returns false when stages failed", () => {
      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "failed",
        started_at: "2026-05-18T10:00:00Z",
        duration_ms: 330000,
        total_stages: 10,
        completed_stages: 9,
        failed_stages: 1,
        total_audit_events: 15,
        total_leases: 4,
        total_workflow_runs: 2,
        total_memory_objects: 3,
        stages: [],
      };

      expect(isMvoCompleteTrace(trace)).toBe(false);
    });
  });

  describe("getPlaneBreakdown", () => {
    it("correctly counts stages by plane", () => {
      const stages: CrossPlaneStageSummary[] = [
        { stage_id: "s1", stage_name: "Intake", responsible_plane: "linkaios", status: "succeeded", audit_event_ids: [], lease_ids: [], workflow_run_ids: [], memory_object_ids: [] },
        { stage_id: "s2", stage_name: "Eval", responsible_plane: "linkbot", status: "succeeded", audit_event_ids: [], lease_ids: [], workflow_run_ids: [], memory_object_ids: [] },
        { stage_id: "s3", stage_name: "Copy", responsible_plane: "linkbot", status: "succeeded", audit_event_ids: [], lease_ids: [], workflow_run_ids: [], memory_object_ids: [] },
        { stage_id: "s4", stage_name: "CRM", responsible_plane: "linkskills", status: "succeeded", audit_event_ids: [], lease_ids: [], workflow_run_ids: [], memory_object_ids: [] },
        { stage_id: "s5", stage_name: "Preview", responsible_plane: "linkautowork", status: "succeeded", audit_event_ids: [], lease_ids: [], workflow_run_ids: [], memory_object_ids: [] },
      ];

      const trace: RunTraceSummary = {
        run_id: "550e8400-e29b-41d4-a716-446655440000",
        tenant_id: "tenant-123",
        plugin_id: "websitefactory",
        work_request_type: "websitefactory.lead_to_preview",
        status: "succeeded",
        started_at: "2026-05-18T10:00:00Z",
        duration_ms: 330000,
        total_stages: 5,
        completed_stages: 5,
        failed_stages: 0,
        total_audit_events: 15,
        total_leases: 4,
        total_workflow_runs: 1,
        total_memory_objects: 3,
        stages,
      };

      const breakdown = getPlaneBreakdown(trace);

      expect(breakdown).toEqual({
        linkaios: 1,
        linkbot: 2,
        linkskills: 1,
        linkautowork: 1,
      });
    });
  });

  describe("type schemas", () => {
    it("TraceEvent schema validates valid events", () => {
      const validEvent: TraceEvent = {
        event_id: "550e8400-e29b-41d4-a716-446655440000",
        ts: "2026-05-18T10:00:00Z",
        plane: "linkbrain",
        action: "run.started",
        actor_kind: "kernel",
        actor_id: "linkaios-kernel",
        subject: { run_id: "550e8400-e29b-41d4-a716-446655440001" },
      };

      expect(validEvent.event_id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(validEvent.plane).toBe("linkbrain");
    });
  });
});
