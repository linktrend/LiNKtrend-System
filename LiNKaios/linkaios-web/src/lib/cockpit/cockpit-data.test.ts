/**
 * Tests for operational cockpit data helpers.
 *
 * These tests verify that cockpit data mapping functions handle:
 * - Empty data gracefully
 * - Error states
 * - Data transformation correctness
 */

import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadModuleStatus,
  loadLeaseStatus,
  loadRunOverview,
  loadWorkflowRunStatus,
  loadAuditEvents,
  loadWorkerSessionStatus,
} from "./cockpit-data";

type MockQueryResult<T> = {
  data: T[] | null;
  error: Error | null;
};

function resolveThenable<T>(result: T) {
  return <TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> => Promise.resolve(onfulfilled ? onfulfilled(result) : (result as unknown as TResult1));
}

function createMockSupabase(result: MockQueryResult<Record<string, unknown>>): SupabaseClient {
  const mockQueryBuilder = {
    schema: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn(resolveThenable(result)),
  };

  return {
    schema: () => mockQueryBuilder,
  } as unknown as SupabaseClient;
}

function createMockSupabaseWithChain(results: Record<string, MockQueryResult<Record<string, unknown>>[]>) {
  let callIndex = 0;
  const allResults = Object.values(results).flat();

  const mockQueryBuilder = {
    schema: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((onfulfilled, onrejected) => {
      const result = allResults[callIndex] ?? { data: [], error: null };
      callIndex++;
      return resolveThenable(result)(onfulfilled, onrejected);
    }),
  };

  return {
    schema: () => mockQueryBuilder,
  } as unknown as SupabaseClient;
}

describe("loadModuleStatus", () => {
  it("returns empty array when tenant_modules query fails", async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error("DB error") });
    const result = await loadModuleStatus(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });

  it("returns empty array when no modules enabled", async () => {
    const mockSupabase = createMockSupabase({ data: [], error: null });
    const result = await loadModuleStatus(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });

  it("maps module status correctly", async () => {
    const mockSupabase = createMockSupabaseWithChain({
      tenant_modules: [
        {
          data: [
            {
              module_id: "mod-1",
              enabled_at: "2026-05-01T00:00:00Z",
              health_status: "healthy",
              last_check_at: "2026-05-18T10:00:00Z",
            },
          ],
          error: null,
        },
      ],
      modules: [
        {
          data: [
            {
              module_id: "mod-1",
              module_name: "Test Module",
              plugin_kind: "vertical",
              required_capabilities: ["cap.test"],
            },
          ],
          error: null,
        },
      ],
      capability_plugins: [
        {
          data: [{ capability_id: "cap.test", is_available: true }],
          error: null,
        },
      ],
    });

    const result = await loadModuleStatus(mockSupabase, "tenant-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      module_id: "mod-1",
      module_name: "Test Module",
      plugin_kind: "vertical",
      is_enabled: true,
      health: "healthy",
      configured_capabilities: ["cap.test"],
      missing_capabilities: [],
    });
  });
});

describe("loadLeaseStatus", () => {
  it("returns empty array on error", async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error("DB error") });
    const result = await loadLeaseStatus(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });

  it("maps lease status correctly", async () => {
    const mockSupabase = createMockSupabase({
      data: [
        {
          lease_id: "lease-1",
          capability: "cap.test",
          status: "granted",
          tenant_id: "tenant-1",
          run_id: "run-1",
          stage_id: "stage-1",
          requested_at: "2026-05-18T10:00:00Z",
          granted_at: "2026-05-18T10:00:01Z",
          executed_at: null,
          expires_at: "2026-05-18T10:05:00Z",
          kill_switch_state: "open",
          ledger_entry_id: "ledger-1",
          audit_event_id: "audit-1",
        },
      ],
      error: null,
    });

    const result = await loadLeaseStatus(mockSupabase, "tenant-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      lease_id: "lease-1",
      capability: "cap.test",
      status: "granted",
      kill_switch_state: "open",
    });
  });
});

describe("loadRunOverview", () => {
  it("returns empty array on error", async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error("DB error") });
    const result = await loadRunOverview(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });

  it("calculates stage counts correctly", async () => {
    const mockSupabase = createMockSupabaseWithChain({
      runs: [
        {
          data: [
            {
              run_id: "run-1",
              tenant_id: "tenant-1",
              plugin_id: "test-plugin",
              work_request_type: "test.request",
              status: "running",
              started_at: "2026-05-18T10:00:00Z",
              ended_at: null,
              failure_summary: null,
            },
          ],
          error: null,
        },
      ],
      stages: [
        {
          data: [
            {
              stage_id: "stage-1",
              run_id: "run-1",
              display_name: "Stage 1",
              responsible_plane: "linkbot",
              status: "succeeded",
              attempt: 1,
              started_at: "2026-05-18T10:00:00Z",
              ended_at: "2026-05-18T10:00:05Z",
              refs: { lease_ids: ["lease-1"], workflow_run_ids: [], audit_event_ids: [] },
              failure_message: null,
            },
            {
              stage_id: "stage-2",
              run_id: "run-1",
              display_name: "Stage 2",
              responsible_plane: "linkskills",
              status: "running",
              attempt: 1,
              started_at: "2026-05-18T10:00:05Z",
              ended_at: null,
              refs: { lease_ids: [], workflow_run_ids: ["wf-1"], audit_event_ids: [] },
              failure_message: null,
            },
          ],
          error: null,
        },
      ],
    });

    const result = await loadRunOverview(mockSupabase, "tenant-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      run_id: "run-1",
      total_stages: 2,
      completed_stages: 1,
      failed_stages: 0,
      lease_count: 1,
      workflow_run_count: 1,
    });
  });
});

describe("loadWorkflowRunStatus", () => {
  it("returns empty array on error", async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error("DB error") });
    const result = await loadWorkflowRunStatus(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });
});

describe("loadAuditEvents", () => {
  it("returns empty array on error", async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error("DB error") });
    const result = await loadAuditEvents(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });

  it("extracts subject fields correctly", async () => {
    const mockSupabase = createMockSupabase({
      data: [
        {
          event_id: "evt-1",
          ts: "2026-05-18T10:00:00Z",
          plane: "linkskills",
          action: "lease.granted",
          subject: {
            run_id: "run-1",
            stage_id: "stage-1",
            lease_id: "lease-1",
            capability: "cap.test",
          },
          payload_summary: "Lease granted for cap.test",
        },
      ],
      error: null,
    });

    const result = await loadAuditEvents(mockSupabase, "tenant-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      event_id: "evt-1",
      plane: "linkskills",
      action: "lease.granted",
      run_id: "run-1",
      lease_id: "lease-1",
      capability: "cap.test",
    });
  });
});

describe("loadWorkerSessionStatus", () => {
  it("returns empty array when agents query fails", async () => {
    const mockSupabase = createMockSupabase({ data: null, error: new Error("DB error") });
    const result = await loadWorkerSessionStatus(mockSupabase, "tenant-1");
    expect(result).toEqual([]);
  });

  it("maps agent and session data correctly", async () => {
    const mockSupabase = createMockSupabaseWithChain({
      agents: [
        {
          data: [
            {
              agent_id: "agent-1",
              agent_name: "Test Bot",
              capabilities: ["cap.test", "cap.research"],
            },
          ],
          error: null,
        },
      ],
      sessions: [
        {
          data: [
            {
              agent_id: "agent-1",
              status: "busy",
              current_mission_id: "mission-1",
              current_stage_id: "stage-1",
              last_heartbeat_at: "2026-05-18T10:00:00Z",
              session_started_at: "2026-05-18T09:00:00Z",
            },
          ],
          error: null,
        },
      ],
    });

    const result = await loadWorkerSessionStatus(mockSupabase, "tenant-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      agent_id: "agent-1",
      agent_name: "Test Bot",
      status: "busy",
      current_mission_id: "mission-1",
      capabilities_available: ["cap.test", "cap.research"],
    });
  });
});
