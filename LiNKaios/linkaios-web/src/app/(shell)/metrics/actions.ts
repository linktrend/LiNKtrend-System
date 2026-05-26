"use server";

import { buildMetricsSnapshotFromRows, type MetricsSnapshot } from "@/lib/metrics-snapshot";
import { matchesActivityCategory, type MetricsActivityCategory } from "@/lib/metrics-filters";
import { scopePayloadMatches, type MetricsScopeState } from "@/lib/metrics-scope-filters";
import { modelFromPayload } from "@/lib/trace-metrics";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type { MetricsSnapshot, MetricsRunRow } from "@/lib/metrics-snapshot";

function startEnd(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days);
  return { from, to };
}

export async function fetchMetricsSnapshot(input: {
  days: number;
  missionId: string | null;
  agentId: string | null;
  modelContains?: string | null;
  missionTitleContains?: string | null;
  activityCategory?: MetricsActivityCategory;
  scope?: Partial<MetricsScopeState>;
}): Promise<{ ok: true; data: MetricsSnapshot } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { from, to } = startEnd(Math.min(90, Math.max(1, input.days)));
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  let missionIdsForAgent: string[] | null = null;
  if (input.agentId && input.agentId !== "all") {
    const { data: ms, error: mErr } = await supabase
      .schema("linkaios")
      .from("missions")
      .select("id")
      .eq("primary_agent_id", input.agentId);
    if (mErr) return { ok: false, error: mErr.message };
    missionIdsForAgent = (ms ?? []).map((m: { id: string }) => String(m.id));
    if (input.missionId && input.missionId !== "all" && !missionIdsForAgent.includes(input.missionId)) {
      return {
        ok: true,
        data: buildMetricsSnapshotFromRows({
          rows: [],
          missionMeta: new Map(),
          agentNames: new Map(),
          fromIso,
          toIso,
        }),
      };
    }
    if (missionIdsForAgent.length === 0) {
      return {
        ok: true,
        data: buildMetricsSnapshotFromRows({
          rows: [],
          missionMeta: new Map(),
          agentNames: new Map(),
          fromIso,
          toIso,
        }),
      };
    }
  }

  let q = supabase
    .schema("linkaios")
    .from("traces")
    .select("id, event_type, mission_id, payload, created_at")
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at", { ascending: false })
    .limit(8000);

  if (input.missionId && input.missionId !== "all") {
    q = q.eq("mission_id", input.missionId);
  } else if (missionIdsForAgent) {
    q = q.in("mission_id", missionIdsForAgent);
  }

  const { data: rows, error } = await q;
  if (error) return { ok: false, error: error.message };

  const list = (rows ?? []) as Array<{
    id: string;
    event_type: string;
    mission_id: string | null;
    payload: Record<string, unknown> | null;
    created_at: string;
  }>;

  const missionIds = [...new Set(list.map((r) => r.mission_id).filter(Boolean))] as string[];
  const missionMeta = new Map<string, { title: string; agent_id: string | null }>();
  if (missionIds.length > 0) {
    const { data: missions } = await supabase
      .schema("linkaios")
      .from("missions")
      .select("id, title, primary_agent_id")
      .in("id", missionIds);
    for (const m of missions ?? []) {
      const row = m as { id: string; title: string; primary_agent_id: string | null };
      missionMeta.set(String(row.id), { title: row.title, agent_id: row.primary_agent_id });
    }
  }
  const agentIds = [...new Set([...missionMeta.values()].map((m) => m.agent_id).filter(Boolean))] as string[];
  const agentNames = new Map<string, string>();
  if (agentIds.length > 0) {
    const { data: agents } = await supabase.schema("linkaios").from("agents").select("id, display_name").in("id", agentIds);
    for (const a of agents ?? []) {
      const row = a as { id: string; display_name: string };
      agentNames.set(String(row.id), row.display_name);
    }
  }

  let filtered = list;
  const activity = input.activityCategory ?? "all";
  if (activity !== "all") {
    filtered = filtered.filter((r) => matchesActivityCategory(r.event_type, activity));
  }
  const mc = input.modelContains?.trim().toLowerCase();
  if (mc) {
    filtered = filtered.filter((r) => (modelFromPayload(r.payload ?? {}) ?? "").toLowerCase().includes(mc));
  }
  const mt = input.missionTitleContains?.trim().toLowerCase();
  if (mt) {
    filtered = filtered.filter((r) => {
      const mid = r.mission_id ? String(r.mission_id) : null;
      const title = mid ? missionMeta.get(mid)?.title ?? "" : "";
      return title.toLowerCase().includes(mt);
    });
  }

  const scope = input.scope;
  if (scope) {
    const fullScope: MetricsScopeState = {
      module: scope.module ?? "all",
      projectType: scope.projectType ?? "all",
      workflow: scope.workflow ?? "all",
      issue: scope.issue ?? "all",
    };
    const hasScope =
      fullScope.module !== "all" ||
      fullScope.projectType !== "all" ||
      fullScope.workflow !== "all" ||
      fullScope.issue !== "all";
    if (hasScope) {
      filtered = filtered.filter((r) => scopePayloadMatches(r.payload ?? {}, fullScope));
    }
  }

  const data = buildMetricsSnapshotFromRows({
    rows: filtered,
    missionMeta,
    agentNames,
    fromIso,
    toIso,
  });

  return { ok: true, data };
}
