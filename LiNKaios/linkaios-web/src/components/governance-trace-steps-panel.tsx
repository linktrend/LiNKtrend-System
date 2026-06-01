import Link from "next/link";

import type { GovernanceTraceStep } from "@/lib/client-governance-traces";

type GovernanceTraceStepsPanelProps = {
  steps: GovernanceTraceStep[];
  projectId?: string;
};

const PLANE_LABEL: Record<string, string> = {
  linkskills: "LinkSkills lease",
  linkautowork: "LiNKautowork workflow",
  linkbrain: "LiNKbrain audit",
};

export function GovernanceTraceStepsPanel(props: GovernanceTraceStepsPanelProps) {
  if (props.steps.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No governed trace steps for this project yet. Steps appear after a Run records lease, workflow, and audit refs.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {props.steps.map((step) => (
        <section
          key={step.stage_id}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{step.stage_id}</h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{step.status}</span>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            {step.refs.map((ref) => (
              <li key={`${ref.plane}-${ref.ref_id}`}>
                <span className="font-medium">{PLANE_LABEL[ref.plane] ?? ref.plane}</span>
                {": "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">{ref.ref_id}</code>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {props.projectId ? (
        <Link
          href={`/projects/${encodeURIComponent(props.projectId)}?tab=tools#pending-approvals`}
          className="text-sm font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
        >
          Review pending side-effect approvals
        </Link>
      ) : null}
    </div>
  );
}
