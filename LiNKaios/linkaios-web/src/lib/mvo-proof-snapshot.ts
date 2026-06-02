import type { SupabaseClient } from "@supabase/supabase-js";

import { governanceTraceHref } from "@/lib/client-governance-traces";

export type MvoProofSnapshot =
  | {
      kind: "active";
      projectId: string;
      projectTitle: string;
      runId: string | null;
      runStatus: string;
      traceHref: string;
      projectHref: string;
    }
  | { kind: "empty" };

/**
 * Latest traceable LinkSites / websitefactory run for MVO proof affordance on Overview surfaces.
 */
export async function loadMvoProofSnapshot(supabase: SupabaseClient): Promise<MvoProofSnapshot> {
  const [runsRes, projectsRes] = await Promise.all([
    supabase
      .schema("linkaios")
      .from("runs")
      .select("run_id, status, plugin_id, started_at")
      .eq("plugin_id", "websitefactory")
      .order("started_at", { ascending: false })
      .limit(1),
    supabase
      .schema("linkaios")
      .from("projects")
      .select("id, title, status, updated_at")
      .in("status", ["running", "assigned", "draft"])
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  const run = runsRes.data?.[0] as { run_id: string; status: string } | undefined;
  const project = projectsRes.data?.[0] as { id: string; title: string; status: string } | undefined;

  if (run || project) {
    const projectId = project ? String(project.id) : "";
    const projectTitle = project ? String(project.title) : "LinkSites project";
    const runId = run ? String(run.run_id) : null;
    const runStatus = run ? String(run.status) : project ? String(project.status) : "unknown";
    const traceHref = governanceTraceHref(projectId || "unknown", runId ?? undefined);
    const projectHref = projectId ? `/projects/${encodeURIComponent(projectId)}` : "/projects";

    return {
      kind: "active",
      projectId: projectId || "unknown",
      projectTitle,
      runId,
      runStatus,
      traceHref,
      projectHref,
    };
  }

  return { kind: "empty" };
}
