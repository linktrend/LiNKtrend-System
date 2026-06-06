import { notFound } from "next/navigation";

import { IssueActionsPanel } from "@/components/linkdeveloper/issue-actions-panel";
import { ProductRunLifecycleActions } from "@/components/linkdeveloper/product-run-actions";
import { ProductRunStatusPill } from "@/components/linkdeveloper/product-run-status-pill";
import { ProjectWorkspaceTabs } from "@/components/linkdeveloper/project-workspace-tabs";
import { ReleaseReadinessPanel } from "@/components/linkdeveloper/release-readiness-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import {
  LINKDEVELOPER_PROJECT_TABS,
  type LinkdeveloperProjectTab,
} from "@/lib/client/linkdeveloper/routes";
import { LinkdeveloperNotFoundError } from "@/lib/admin/linkdeveloper/errors";
import {
  loadLinkdeveloperArtifacts,
  loadLinkdeveloperProductRun,
  loadLinkdeveloperReleaseReadiness,
  loadLinkdeveloperWorkGraph,
} from "@/lib/admin/linkdeveloper/server-data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string; tab: string }> };

function isValidTab(tab: string): tab is LinkdeveloperProjectTab {
  return (LINKDEVELOPER_PROJECT_TABS as readonly string[]).includes(tab);
}

export default async function LinkdeveloperClientProjectWorkspacePage(props: PageProps) {
  const { id, tab } = await props.params;
  if (!isValidTab(tab)) {
    notFound();
  }

  let run;
  try {
    run = await loadLinkdeveloperProductRun(id);
  } catch (err) {
    if (err instanceof LinkdeveloperNotFoundError) notFound();
    throw err;
  }

  const [graph, artifacts, readiness] = await Promise.all([
    loadLinkdeveloperWorkGraph(id),
    loadLinkdeveloperArtifacts(id),
    loadLinkdeveloperReleaseReadiness(id),
  ]);

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title={run.name}
        subtitle="Project workspace — Zulip-first steward stream with inbox parity."
        actions={<ProductRunLifecycleActions productRunId={id} status={run.status} />}
      />

      <ProjectWorkspaceTabs productRunId={id} activeTab={tab} />

      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <ProductRunStatusPill status={run.status} />
        <span>Product Steward · Orchestrator · dual-channel approvals</span>
        {run.target_repo_url ? (
          <a
            href={run.target_repo_url}
            className="text-sky-700 hover:underline dark:text-sky-300"
            target="_blank"
            rel="noreferrer"
          >
            External repo
          </a>
        ) : null}
      </div>

      {tab === "overview" ? (
        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">Stage summary</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Current status: {run.status}. Council gates G1–G5 and human approvals govern progression.
          </p>
        </section>
      ) : null}

      {tab === "plan" || tab === "build" ? (
        <section aria-label="Work graph">
          <IssueActionsPanel productRunId={id} issues={graph.nodes} />
        </section>
      ) : null}

      {tab === "validation" ? (
        <section aria-label="Artifacts">
          {artifacts.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No validation artifacts yet.</p>
          ) : (
            <ul className="space-y-2">
              {artifacts.map((a) => (
                <li key={a.id} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                  {a.title} — {a.artifact_type}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "launch" ? <ReleaseReadinessPanel readiness={readiness} /> : null}

      {tab === "activity" ? (
        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Activity feed mirrors Zulip project stream topics (steward, orchestrator, issues).
          </p>
        </section>
      ) : null}
    </main>
  );
}
