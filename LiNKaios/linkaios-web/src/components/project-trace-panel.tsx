import { fetchMetricsSnapshot } from "@/app/(shell)/metrics/actions";
import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { ProjectTraceApprovalGates } from "@/components/project-trace-approval-gates";
import { StatusPill } from "@/components/ui/status-pill";
import { resolveProjectIdFromProps } from "@/lib/api/project-mission-id";
import { loadRunOverview } from "@/lib/cockpit";
import {
  buildDemoProjectTraceSurface,
  projectTraceSurfaceFromRun,
  type ClientProjectTraceSurface,
  type ClientTraceStep,
} from "@/lib/client-trace-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";

function traceStatusTone(status: string): "success" | "warning" | "danger" | "active" | "neutral" {
  if (status === "succeeded" || status === "completed") return "success";
  if (status === "running" || status === "in_progress") return "active";
  if (status === "failed" || status === "error") return "danger";
  if (status === "pending" || status === "requires_approval") return "warning";
  return "neutral";
}

function shortRef(ref: string): string {
  if (ref.length <= 28) return ref;
  return `${ref.slice(0, 24)}...`;
}

function TraceRefList(props: { refs: string[] }) {
  if (props.refs.length === 0) {
    return <span className="text-xs text-zinc-500 dark:text-zinc-400">—</span>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {props.refs.map((ref) => (
        <li key={ref} className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300" title={ref}>
          {shortRef(ref)}
        </li>
      ))}
    </ul>
  );
}

async function loadProjectTraceSurface(projectId: string): Promise<ClientProjectTraceSurface> {
  if (isUiMocksEnabled()) {
    return buildDemoProjectTraceSurface(projectId);
  }

  const supabase = await createSupabaseServerClient();
  const tenantId = "default";
  const [runOverviews, metrics] = await Promise.all([
    loadRunOverview(supabase, tenantId, { time_range: "30d" }),
    fetchMetricsSnapshot({ days: 30, missionId: projectId, agentId: null }),
  ]);
  const projectRunIds = new Set(
    (metrics.ok ? metrics.data.runs : [])
      .map((run) => run.id)
      .filter((id): id is string => Boolean(id)),
  );
  const run =
    runOverviews.find((candidate) => projectRunIds.has(candidate.run_id)) ??
    null;
  return projectTraceSurfaceFromRun(projectId, run);
}

function TraceRefsTable(props: { surface: ClientProjectTraceSurface }) {
  const { steps } = props.surface;

  return (
    <section aria-labelledby="project-trace-refs-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="project-trace-refs-heading" className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
          Trace References
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {steps.length} step(s){props.surface.runId ? ` · ${props.surface.runId}` : ""}
        </p>
      </div>
      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>Step</th>
              <th className={DT.thTextInset}>Plane</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Status</div>
              </th>
              <th className={DT.thTextInset}>LinkSkills Lease</th>
              <th className={DT.thTextInset}>LiNKautowork Workflow</th>
              <th className={DT.thTextInset}>LiNKbrain Audit</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {steps.length === 0 ? (
              <DataTableEmptyRow colSpan={6}>No trace references are available for this project yet.</DataTableEmptyRow>
            ) : (
              steps.map((step: ClientTraceStep) => (
                <DataTableRow key={step.id} multiline>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} font-semibold text-zinc-900 dark:text-zinc-100`}>
                      {step.label}
                    </span>
                  </td>
                  <td className={`${DT.tdClipInset} text-xs text-zinc-600 dark:text-zinc-400`}>
                    <span className={DT.tdTextSpan}>{step.responsiblePlane}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <StatusPill label={step.status} tone={traceStatusTone(step.status)} equalWidth />
                    </div>
                  </td>
                  <td className={DT.tdInset}>
                    <TraceRefList refs={step.leaseIds} />
                  </td>
                  <td className={DT.tdInset}>
                    <TraceRefList refs={step.workflowRunIds} />
                  </td>
                  <td className={DT.tdInset}>
                    <TraceRefList refs={step.auditEventIds} />
                  </td>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}

export async function ProjectTracePanel(props: {
  projectId?: string;
  /** @deprecated Use projectId */
  missionId?: string;
}) {
  const projectId = resolveProjectIdFromProps(props);
  const surface = await loadProjectTraceSurface(projectId);

  return (
    <div className="space-y-8">
      <TraceRefsTable surface={surface} />
      <ProjectTraceApprovalGates gates={surface.approvalGates} />
    </div>
  );
}
