/**
 * LiNKbrain Trace Data Helpers — Operator-facing trace views in LiNKaios
 *
 * Provides:
 * - Server-side data loading for run/lead trace views
 * - Status aggregation for operator dashboards
 * - Cross-plane trace presentation helpers
 *
 * Per WP-202: LiNKbrain Operator Intelligence
 * Note: This file lives in LiNKaios for UI data loading but LiNKbrain owns the
 * canonical trace intelligence logic in packages/linklogic-sdk/src/brain-trace-intelligence.ts
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getLeadTrace,
  getOperatorBrainStatus,
  getRecentActivitySummary,
  getRunTrace,
  type LeadTraceResult,
  type OperatorBrainStatus,
  type RunTraceResult,
  type TraceEvent,
} from "@linktrend/linklogic-sdk";

import type { LinkbrainTab } from "./linkbrain-data";

/* -------------------------------------------------------------------------- */
/* Trace View Data Types                                                       */
/* -------------------------------------------------------------------------- */

export type TraceViewTab = "run" | "lead" | "system" | "recent";

export type TraceEventRow = {
  event_id: string;
  ts: string;
  plane: string;
  action: string;
  actor_kind: string;
  actor_id: string;
  subject_summary: string;
  payload_summary?: Record<string, unknown>;
};

export type MemoryObjectRow = {
  memory_id: string;
  type: string;
  state: string;
  created_at: string;
  confidence: number;
  summary: string;
};

export type StageTraceRow = {
  stage_id: string;
  stage_name: string;
  responsible_plane: string;
  status: string;
  duration_ms?: number;
  audit_event_count: number;
  lease_count: number;
  workflow_count: number;
  memory_count: number;
  failure_code?: string;
  failure_message?: string;
};

export type RunTraceRow = {
  run_id: string;
  plugin_id: string;
  work_request_type: string;
  status: string;
  started_at: string;
  ended_at?: string;
  duration_ms?: number;
  total_stages: number;
  completed_stages: number;
  failed_stages: number;
  total_audit_events: number;
  total_leases: number;
  total_workflows: number;
  total_memories: number;
  lead_id?: string;
  is_mvo_complete: boolean;
  stages: StageTraceRow[];
};

export type BrainStatusRow = {
  component: string;
  health: "healthy" | "degraded" | "unavailable";
  recent_count: number;
};

export type LinkbrainTracePageData = {
  error: string | null;
  tab: TraceViewTab;
  // Run trace view
  runTrace: RunTraceRow | null;
  runAuditEvents: TraceEventRow[];
  runMemoryObjects: MemoryObjectRow[];
  // Lead trace view
  leadId: string | null;
  leadRuns: RunTraceRow[];
  leadMemoryObjects: MemoryObjectRow[];
  leadTotalAuditEvents: number;
  // System status view
  brainStatus: BrainStatusRow[];
  recentErrors: Array<{ ts: string; plane: string; code: string; message: string }>;
  // Recent activity view
  recentEvents: TraceEventRow[];
  // Metadata
  checkedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Page Data Loaders                                                           */
/* -------------------------------------------------------------------------- */

export interface LoadTracePageDataOptions {
  tab: TraceViewTab;
  runId?: string;
  leadId?: string;
  tenantId?: string;
  lookbackHours?: number;
}

export async function loadLinkbrainTracePageData(
  supabase: SupabaseClient,
  options: LoadTracePageDataOptions,
): Promise<LinkbrainTracePageData> {
  const empty = (): LinkbrainTracePageData => ({
    error: null,
    tab: options.tab,
    runTrace: null,
    runAuditEvents: [],
    runMemoryObjects: [],
    leadId: options.leadId ?? null,
    leadRuns: [],
    leadMemoryObjects: [],
    leadTotalAuditEvents: 0,
    brainStatus: [],
    recentErrors: [],
    recentEvents: [],
    checkedAt: new Date().toISOString(),
  });

  // Run trace view
  if (options.tab === "run" && options.runId) {
    // Note: We need env access for the SDK functions. For now, we'll use
    // a mock/stub approach since the UI runs in a different context.
    // In production, these would be server actions or API routes.
    return {
      ...empty(),
      error: "Run trace view requires server action context with env access",
    };
  }

  // Lead trace view
  if (options.tab === "lead" && options.leadId && options.tenantId) {
    return {
      ...empty(),
      error: "Lead trace view requires server action context with env access",
    };
  }

  // System status view
  if (options.tab === "system") {
    return {
      ...empty(),
      error: "System status view requires server action context with env access",
    };
  }

  // Recent activity view
  if (options.tab === "recent") {
    return {
      ...empty(),
      error: "Recent activity view requires server action context with env access",
    };
  }

  return empty();
}

/* -------------------------------------------------------------------------- */
/* Server Action Wrappers (for use with env access)                           */
/* -------------------------------------------------------------------------- */

import type { Env } from "@linktrend/shared-config";

export async function loadRunTraceForOperator(
  env: Env,
  runId: string,
  tenantId?: string,
): Promise<{
  trace: RunTraceRow | null;
  auditEvents: TraceEventRow[];
  memoryObjects: MemoryObjectRow[];
  error: string | null;
}> {
  const result = await getRunTrace(env, runId, tenantId);

  if (result.failure) {
    return {
      trace: null,
      auditEvents: [],
      memoryObjects: [],
      error: result.failure.message,
    };
  }

  if (!result.trace) {
    return {
      trace: null,
      auditEvents: [],
      memoryObjects: [],
      error: "Run trace not found",
    };
  }

  const trace = result.trace;

  return {
    trace: {
      run_id: trace.run_id,
      plugin_id: trace.plugin_id,
      work_request_type: trace.work_request_type,
      status: trace.status,
      started_at: trace.started_at,
      ended_at: trace.ended_at,
      duration_ms: trace.duration_ms,
      total_stages: trace.total_stages,
      completed_stages: trace.completed_stages,
      failed_stages: trace.failed_stages,
      total_audit_events: trace.total_audit_events,
      total_leases: trace.total_leases,
      total_workflows: trace.total_workflow_runs,
      total_memories: trace.total_memory_objects,
      lead_id: trace.lead_id,
      is_mvo_complete: isMvoCompleteTrace(trace),
      stages: trace.stages.map((s) => ({
        stage_id: s.stage_id,
        stage_name: s.stage_name,
        responsible_plane: s.responsible_plane,
        status: s.status,
        duration_ms: s.duration_ms,
        audit_event_count: s.audit_event_ids.length,
        lease_count: s.lease_ids.length,
        workflow_count: s.workflow_run_ids.length,
        memory_count: s.memory_object_ids.length,
        failure_code: s.failure_code,
        failure_message: s.failure_message,
      })),
    },
    auditEvents: result.audit_events.map((e) => ({
      event_id: e.event_id,
      ts: e.ts,
      plane: e.plane,
      action: e.action,
      actor_kind: e.actor_kind,
      actor_id: e.actor_id,
      subject_summary: formatSubjectSummary(e.subject),
      payload_summary: e.payload_summary,
    })),
    memoryObjects: result.memory_objects.map((m) => ({
      memory_id: m.memory_id,
      type: m.type,
      state: m.state,
      created_at: m.created_at,
      confidence: m.confidence,
      summary: formatMemorySummary(m.payload_summary, m.type),
    })),
    error: null,
  };
}

export async function loadLeadTraceForOperator(
  env: Env,
  tenantId: string,
  leadId: string,
): Promise<{
  runs: RunTraceRow[];
  memoryObjects: MemoryObjectRow[];
  totalAuditEvents: number;
  error: string | null;
}> {
  const result = await getLeadTrace(env, tenantId, leadId);

  if (result.failure) {
    return {
      runs: [],
      memoryObjects: [],
      totalAuditEvents: 0,
      error: result.failure.message,
    };
  }

  return {
    runs: result.runs.map((trace) => ({
      run_id: trace.run_id,
      plugin_id: trace.plugin_id,
      work_request_type: trace.work_request_type,
      status: trace.status,
      started_at: trace.started_at,
      ended_at: trace.ended_at,
      duration_ms: trace.duration_ms,
      total_stages: trace.total_stages,
      completed_stages: trace.completed_stages,
      failed_stages: trace.failed_stages,
      total_audit_events: trace.total_audit_events,
      total_leases: trace.total_leases,
      total_workflows: trace.total_workflow_runs,
      total_memories: trace.total_memory_objects,
      lead_id: trace.lead_id,
      is_mvo_complete: isMvoCompleteTrace(trace),
      stages: [], // Simplified for list view
    })),
    memoryObjects: result.memory_objects.map((m) => ({
      memory_id: m.memory_id,
      type: m.type,
      state: m.state,
      created_at: m.created_at,
      confidence: m.confidence,
      summary: formatMemorySummary(m.payload_summary, m.type),
    })),
    totalAuditEvents: result.total_audit_events,
    error: null,
  };
}

export async function loadBrainStatusForOperator(
  env: Env,
  tenantId?: string,
): Promise<{
  status: BrainStatusRow[];
  recentErrors: Array<{ ts: string; plane: string; code: string; message: string }>;
  checkedAt: string;
  error: string | null;
}> {
  const result = await getOperatorBrainStatus(env, tenantId);

  if (result.failure || !result.status) {
    return {
      status: [],
      recentErrors: [],
      checkedAt: new Date().toISOString(),
      error: result.failure?.message ?? "Status unavailable",
    };
  }

  const s = result.status;

  return {
    status: [
      { component: "Audit Ledger", health: s.audit_ledger_health, recent_count: s.recent_audit_events_count },
      { component: "Memory Store", health: s.memory_store_health, recent_count: s.recent_memory_writes_count },
      { component: "Context Assembly", health: s.context_assembly_health, recent_count: s.recent_context_assemblies_count },
    ],
    recentErrors: s.recent_errors ?? [],
    checkedAt: s.checked_at,
    error: null,
  };
}

export async function loadRecentActivityForOperator(
  env: Env,
  options: {
    tenantId?: string;
    lookbackHours?: number;
    limit?: number;
  } = {},
): Promise<{
  events: TraceEventRow[];
  error: string | null;
}> {
  const result = await getRecentActivitySummary(env, {
    tenant_id: options.tenantId,
    lookback_hours: options.lookbackHours,
    limit: options.limit,
  });

  if (result.failure) {
    return {
      events: [],
      error: result.failure.message,
    };
  }

  return {
    events: result.events.map((e) => ({
      event_id: e.event_id,
      ts: e.ts,
      plane: e.plane,
      action: e.action,
      actor_kind: e.actor_kind,
      actor_id: e.actor_id,
      subject_summary: formatSubjectSummary(e.subject),
      payload_summary: e.payload_summary,
    })),
    error: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Helper Functions                                                            */
/* -------------------------------------------------------------------------- */

import type { RunTraceSummary } from "@linktrend/linklogic-sdk";

function isMvoCompleteTrace(trace: RunTraceSummary): boolean {
  const hasMinimumAudit = trace.total_audit_events >= 4;
  const hasMemory = trace.total_memory_objects >= 1;
  const hasLeases = trace.total_leases >= 1;
  const stagesCompleted = trace.completed_stages >= trace.total_stages;
  const noFailedStages = trace.failed_stages === 0;

  return hasMinimumAudit && hasMemory && hasLeases && (stagesCompleted || noFailedStages);
}

function formatSubjectSummary(subject: Record<string, unknown>): string {
  const parts: string[] = [];
  if (subject.run_id) parts.push(`run:${String(subject.run_id).slice(0, 8)}`);
  if (subject.stage_id) parts.push(`stage:${subject.stage_id}`);
  if (subject.lease_id) parts.push(`lease:${String(subject.lease_id).slice(0, 8)}`);
  if (subject.lead_id) parts.push(`lead:${String(subject.lead_id).slice(0, 8)}`);
  if (subject.plugin_id) parts.push(`plugin:${subject.plugin_id}`);
  return parts.join(" | ") || "system";
}

function formatMemorySummary(payload: Record<string, unknown>, type: string): string {
  switch (type) {
    case "lead_memory": {
      const facts = payload.facts as Record<string, unknown> | undefined;
      const business = facts?.business_name ?? "Unknown business";
      const engagement = payload.engagement as Record<string, unknown> | undefined;
      const status = engagement?.current_status ?? "unknown";
      return `${business} (${status})`;
    }
    case "research_bundle": {
      const query = payload.research_query as string ?? "Research";
      const scope = payload.research_scope as string ?? "general";
      return `${query} (${scope})`;
    }
    case "episode_summary": {
      const workType = payload.work_request_type as string ?? "Run";
      const outcome = payload.outcome as string ?? "unknown";
      return `${workType} — ${outcome}`;
    }
    default:
      return `${type} memory object`;
  }
}
