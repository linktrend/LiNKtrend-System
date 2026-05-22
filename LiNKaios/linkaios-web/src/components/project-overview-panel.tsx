import { ProjectOverviewSnapshotGrid } from "@/components/project-overview-snapshot-grid";
import { ProjectPlaneOverviewSection } from "@/components/project-plane-overview-section";
import { TitledCardHeader } from "@/components/titled-card-header";
import { loadProjectOverview } from "@/lib/project-overview-data";
import { FileText } from "lucide-react";

export async function ProjectOverviewPanel(props: { missionId: string; title: string }) {
  const { brief, snapshot } = await loadProjectOverview(props.missionId, props.title);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader icon={FileText} title="Project Brief" />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{brief.description}</p>
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Expected outputs
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {brief.expectedOutputs.map((output) => (
              <li
                key={output}
                className="flex gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" aria-hidden />
                <span>{output}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Project snapshot</h2>
        <ProjectOverviewSnapshotGrid missionId={props.missionId} snapshot={snapshot} />
      </section>

      <ProjectPlaneOverviewSection missionId={props.missionId} />
    </div>
  );
}
