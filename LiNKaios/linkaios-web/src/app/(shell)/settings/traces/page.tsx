import { TracesView } from "@/components/traces-view";
import { GovernanceTraceStepsPanel } from "@/components/governance-trace-steps-panel";
import { mapKernelStageToGovernanceTrace } from "@/lib/client-governance-traces";
import { requireLicensorOperator } from "@/lib/licensor-access";

export const dynamic = "force-dynamic";

const DEMO_GOVERNANCE_STEPS = [
  mapKernelStageToGovernanceTrace({
    stage_id: "lead_qualify",
    status: "completed",
    responsible_plane: "linkbot",
    refs: {
      lease_ids: ["lease-demo-1"],
      workflow_run_ids: ["wf-demo-1"],
      audit_event_ids: ["audit-demo-1"],
    },
  }),
];

export default async function SettingsTracesPage(props: {
  searchParams: Promise<{ project?: string; mission?: string; event?: string }>;
}) {
  await requireLicensorOperator();
  const sp = await props.searchParams;
  const projectId = (sp.project ?? sp.mission)?.trim();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Governance trace steps</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Per-step LinkSkills lease, LiNKautowork workflow, and LiNKbrain audit references (LTS-003).
        </p>
        <div className="mt-4">
          <GovernanceTraceStepsPanel steps={DEMO_GOVERNANCE_STEPS} projectId={projectId || undefined} />
        </div>
      </section>
      <TracesView searchParams={props.searchParams} basePath="/settings/traces" />
    </div>
  );
}
