import type { LogLineFixture, WorkflowSubstageFixture } from "@/lib/suite-integrations/linkapps/types";

function wfStateChip(state: WorkflowSubstageFixture["state"]): string {
  const base = "rounded-full px-2 py-0.5 text-[11px] font-medium ";
  if (state === "running") return base + "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100";
  if (state === "succeeded") return base + "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";
  if (state === "failed") return base + "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-100";
  return base + "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}

function LogList(props: { title: string; lines: LogLineFixture[] }) {
  if (props.lines.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No {props.title} lines (fixture empty).
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {props.lines.map((line, i) => (
        <li key={`${line.ref}-${i}`} className="rounded-md border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{line.message}</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{line.ref}</p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-500">{line.at}</p>
        </li>
      ))}
    </ul>
  );
}

export function LinkappsWorkflowStatusPanel(props: {
  workflows: WorkflowSubstageFixture[];
  buildLogs: LogLineFixture[];
  validationLines: LogLineFixture[];
  deploymentLines: LogLineFixture[];
}) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="linkapps-workflow-heading"
    >
      <h2 id="linkapps-workflow-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Automation status (LiNKautowork)
      </h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Maps manifest stages to deterministic runs. Build / validation / deployment are fixture sub-panels (
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">linkapps.build_logs</code>,{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">validation_results</code>,{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">deployment_history</code>).
      </p>

      <ul className="mt-4 space-y-2">
        {props.workflows.map((wf) => (
          <li
            key={wf.workflowRunId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-800"
          >
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">{wf.displayLabel}</p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{wf.manifestStageId}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{wf.workflowRunId}</span>
              <span className={wfStateChip(wf.state)}>{wf.state}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Build logs</h3>
          <div className="mt-2">
            <LogList title="build" lines={props.buildLogs} />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Validation</h3>
          <div className="mt-2">
            <LogList title="validation" lines={props.validationLines} />
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Deployment history</h3>
          <div className="mt-2">
            <LogList title="deployment" lines={props.deploymentLines} />
          </div>
        </div>
      </div>
    </section>
  );
}
