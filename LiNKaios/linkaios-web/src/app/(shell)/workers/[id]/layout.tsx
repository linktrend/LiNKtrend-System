import { notFound } from "next/navigation";

import type { AgentRecord } from "@linktrend/shared-types";

import { WorkerBreadcrumbRegister } from "@/components/worker-breadcrumb-register";
import { WorkerDetailHeader } from "@/components/worker-detail-header";
import { WorkerSubnav } from "@/components/worker-subnav";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { demoWorkerHeaderModel, liveWorkerHeaderModel } from "@/lib/worker-header-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (!isUiMocksEnabled() && isDemoAgentId(id)) {
    notFound();
  }

  if (isUiMocksEnabled() && isDemoAgentId(id)) {
    const isLisa = id === "demo-lisa";
    const model = demoWorkerHeaderModel(
      id,
      isLisa ? "Lisa" : "Eric",
      isLisa ? "Chief Executive Officer" : "Chief Technology Officer",
      isLisa
        ? "Demo executive LiNKbot — strategy, portfolio prioritisation, and cross-project alignment. Replace with a live worker bound to your gateway."
        : "Demo technical LiNKbot — architecture reviews, release risk, and engineering coordination. Replace with a live worker bound to your gateway.",
      {
        operational: isLisa ? "Online · busy" : "Online · idle",
        activity: isLisa ? "Reviewing portfolio threads (fixture)." : "Standing by for infra reviews (fixture).",
      },
    );
    return (
      <main className="space-y-6">
        <WorkerBreadcrumbRegister agentId={id} displayName={isLisa ? "Lisa" : "Eric"} />
        <WorkerDetailHeader model={model} />
        <WorkerSubnav agentId={id} />
        {props.children}
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
      <WorkerSubnav agentId={id} />
      {props.children}
    </main>
  );
}
