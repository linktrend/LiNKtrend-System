import { notFound } from "next/navigation";

import type { AgentRecord } from "@linktrend/shared-types";

import { WorkerBreadcrumbRegister } from "@/components/worker-breadcrumb-register";
import { WorkerDetailHeader } from "@/components/worker-detail-header";
import { WorkerSubnav, WorkerTabContent } from "@/components/worker-subnav";
import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import { isAdminBot } from "@/lib/agent-fleet-classification";
import { readAppSurfaceFromHeaders, withAppBasePath } from "@/lib/app-surface";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoWorkerHeaderModel, liveWorkerHeaderModel } from "@/lib/worker-header-model";
import { workerDetailTabsForSurface, type WorkerDetailTabId } from "@/lib/worker-detail-tabs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function visibleTabIdsForAgent(
  agent: Pick<AgentRecord, "id" | "runtime_settings">,
  surface: "admin" | "licensee",
  licensorTenantId: string | null,
): ReadonlySet<WorkerDetailTabId> {
  const showProjectsOnAdmin = isAdminBot(agent, {
    licensorTenantId,
    uiMocksDemoAgent: isUiMocksEnabled(),
  });
  const tabs = workerDetailTabsForSurface({
    isAdminSurface: surface === "admin",
    showProjectsOnAdmin,
  });
  return new Set(tabs.map((tab) => tab.id));
}

export default async function WorkerLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const surface = await readAppSurfaceFromHeaders();
  const licensorTenantId = surface === "admin" ? await resolveLicensorTenantId() : null;

  if (!isUiMocksEnabled() && isDemoAgentId(id)) {
    notFound();
  }

  if (isUiMocksEnabled() && isDemoAgentId(id)) {
    const isLisa = id === "demo-lisa";
    const model = demoWorkerHeaderModel(
      id,
      isLisa ? "Lisa (CEO)" : "Eric (CTO)",
      isLisa ? "Chief Executive Officer" : "Chief Technology Officer",
      isLisa
        ? "Demo executive LiNKbot — strategy, portfolio prioritisation, and cross-project alignment. Replace with a live worker bound to your gateway."
        : "Demo technical LiNKbot — architecture reviews, release risk, and engineering coordination. Replace with a live worker bound to your gateway.",
    );
    const visibleTabIds = visibleTabIdsForAgent({ id, runtime_settings: null }, surface, licensorTenantId);
    return (
      <main className="space-y-6">
        <WorkerBreadcrumbRegister agentId={id} displayName={model.displayName} />
        <WorkerDetailHeader model={model} />
        <WorkerSubnav agentId={id} visibleTabIds={visibleTabIds} />
        <WorkerTabContent>{props.children}</WorkerTabContent>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !agent) {
    notFound();
  }

  const a = agent as AgentRecord;
  const visibleTabIds = visibleTabIdsForAgent(a, surface, licensorTenantId);

  const sessionsRes = await supabase
    .schema("bot_runtime")
    .from("worker_sessions")
    .select("id, agent_id, status, started_at, last_heartbeat, ended_at")
    .eq("agent_id", id)
    .order("started_at", { ascending: false })
    .limit(20);

  const sessions = sessionsRes.data ?? [];
  const model = liveWorkerHeaderModel(a, sessions);

  return (
    <main className="space-y-6">
      <WorkerBreadcrumbRegister agentId={id} displayName={a.display_name} />
      <WorkerDetailHeader model={model} />
      <WorkerSubnav agentId={id} visibleTabIds={visibleTabIds} />
      <WorkerTabContent>{props.children}</WorkerTabContent>
    </main>
  );
}
