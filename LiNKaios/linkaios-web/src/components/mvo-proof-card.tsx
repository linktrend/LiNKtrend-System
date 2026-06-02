"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, FolderKanban } from "lucide-react";

import { useAppSurface } from "@/components/app-surface-provider";
import { StatusPill } from "@/components/ui/status-pill";
import type { MvoProofSnapshot } from "@/lib/mvo-proof-snapshot";
import { BUTTON } from "@/lib/ui-standards";

const DEMO_SCRIPT = "./scripts/run-mvo-linksites-demo.sh";

/** Overview affordance — jump to traceable MVO run or learn how to produce proof. */
export function MvoProofCard(props: { snapshot: MvoProofSnapshot }) {
  const { href: appHref, isAdmin } = useAppSurface();
  const devtoolsHref = appHref(isAdmin ? "/devtools/mvo-proof" : "/devtools/mvo-proof");

  if (props.snapshot.kind === "active") {
    const { projectTitle, runStatus, projectHref, traceHref, runId } = props.snapshot;
    return (
      <section
        className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20"
        aria-label="MVO proof"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-100">
              <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
              MVO proof — active run
            </p>
            <p className="mt-2 text-sm font-medium text-emerald-950 dark:text-emerald-50">{projectTitle}</p>
            <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/80">
              {runId ? (
                <>
                  Run <span className="font-mono">{runId.slice(0, 8)}…</span>
                </>
              ) : (
                "Project in progress"
              )}
            </p>
          </div>
          <StatusPill label={runStatus.replace(/_/g, " ")} tone="success" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={appHref(projectHref)} className={BUTTON.primaryRow}>
            Open project
          </Link>
          <Link href={appHref(traceHref)} className={BUTTON.secondaryRow}>
            View traces
          </Link>
          <Link href={devtoolsHref} className={BUTTON.secondaryRow}>
            Proof surfaces
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="MVO proof"
    >
      <p className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
        MVO proof
      </p>
      <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
        No active LinkSites run is visible yet. Run the end-to-end demo to produce a traceable lead-to-outreach loop,
        or execute the kernel E2E harness when validating backend wiring.
      </p>
      <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        <li className="flex items-start gap-2">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          <span>
            Demo script: <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-900">{DEMO_SCRIPT}</code>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          <span>Optional: <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-900">pnpm test:mvo:e2e</code> for kernel proof</span>
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={appHref("/projects")} className={`${BUTTON.secondaryRow} inline-flex items-center gap-2`}>
          <FolderKanban className="h-4 w-4 shrink-0" aria-hidden />
          View projects
        </Link>
        <Link href={devtoolsHref} className={BUTTON.secondaryRow}>
          Open proof surfaces
        </Link>
      </div>
    </section>
  );
}
