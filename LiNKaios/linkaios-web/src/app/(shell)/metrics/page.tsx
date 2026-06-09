import { listProjects } from "@linktrend/linklogic-sdk";
import { BarChart3 } from "lucide-react";

import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import { WorkEmptyState } from "@/app/(shell)/work/work-empty-state";
import { MetricsDashboard, type MetricsFilterOption } from "@/components/metrics-dashboard";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { readAppSurfaceFromHeaders } from "@/lib/app-surface";
import { buildMetricsSnapshotFromRows, type MetricsSnapshot } from "@/lib/metrics-snapshot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_SIDEBAR_AGENTS, DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoMetricsSnapshot } from "@/lib/ui-mocks/metrics-demo-snapshot";

export const dynamic = "force-dynamic";

function emptyMetricsSnapshot(days: number): MetricsSnapshot {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - Math.min(90, Math.max(1, days)));
  return buildMetricsSnapshotFromRows({
    rows: [],
    missionMeta: new Map(),
    agentNames: new Map(),
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    eventTypeContains: null,
  });
}

export default async function MetricsPage() {
  const uiMocksEnabled = isUiMocksEnabled();
  const surface = await readAppSurfaceFromHeaders();
  const isAdmin = surface === "admin";

  const supabase = await createSupabaseServerClient();

  const [{ data: missionRows }, agentsRes] = await Promise.all([
    listProjects(supabase, { limit: 60 }),
    supabase.schema("linkaios").from("agents").select("id, display_name").order("updated_at", { ascending: false }).limit(60),
  ]);

  const demoAgents: MetricsFilterOption[] = DEMO_SIDEBAR_AGENTS.map((a) => ({ id: a.id, label: a.display_name }));
  const apiAgents: MetricsFilterOption[] = (agentsRes.data ?? []).map((a: { id: string; display_name: string }) => ({
    id: String(a.id),
    label: a.display_name,
  }));
  const agentOpts = uiMocksEnabled
    ? [{ id: "all", label: "All LiNKbots" }, ...demoAgents, ...apiAgents.filter((a) => !demoAgents.some((d) => d.id === a.id))]
    : [{ id: "all", label: "All LiNKbots" }, ...apiAgents];

  const demoMissions: MetricsFilterOption[] = DEMO_SIDEBAR_MISSIONS.map((m) => ({ id: m.id, label: m.title }));
  const apiMissions: MetricsFilterOption[] = (missionRows ?? []).map((m) => ({ id: String(m.id), label: m.title }));
  const missionOpts = uiMocksEnabled
    ? [
        { id: "all", label: "All projects" },
        ...demoMissions,
        ...apiMissions.filter((m) => !demoMissions.some((d) => d.id === m.id)),
      ]
    : [{ id: "all", label: "All projects" }, ...apiMissions];

  const snap = await fetchMetricsSnapshot({
    days: 30,
    missionId: null,
    agentId: null,
  });

  let initialSnapshot: MetricsSnapshot;
  let loadError: string | null = null;
  let demoMode = false;

  if (uiMocksEnabled) {
    initialSnapshot = demoMetricsSnapshot();
    demoMode = true;
    loadError = snap.ok ? null : snap.error;
  } else if (!snap.ok) {
    initialSnapshot = emptyMetricsSnapshot(30);
    loadError = snap.error;
    demoMode = false;
  } else {
    initialSnapshot = snap.data;
    demoMode = false;
  }

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Metrics"
        subtitle="Performance observability — cost, tokens, run time, success and failure, and usage by project, LiNKbot, model, tool, and skill."
      />
      {!demoMode && !loadError && initialSnapshot.totalTraces === 0 ? (
        <WorkEmptyState
          icon={BarChart3}
          title="No run activity yet"
          description="Launch a project or start a LiNKbot session to populate cost, token, and reliability charts."
          actions={
            isAdmin
              ? [
                  { kind: "link", label: "Launch admin program", href: "/projects/new" },
                  { kind: "link", label: "Open LiNKbots", href: "/workers", variant: "secondary" },
                ]
              : [
                  { kind: "link", label: "Add project", href: "/projects/new" },
                  { kind: "link", label: "Open LiNKbots", href: "/workers", variant: "secondary" },
                ]
          }
        />
      ) : null}
      <MetricsDashboard
        initialSnapshot={initialSnapshot}
        loadError={loadError}
        agents={agentOpts}
        missions={missionOpts}
        demoMode={demoMode}
      />
    </main>
  );
}
