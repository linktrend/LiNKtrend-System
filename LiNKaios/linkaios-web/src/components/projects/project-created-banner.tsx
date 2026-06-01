"use client";

import Link from "next/link";

import { projectRunProgressHref } from "@/lib/client-mvo-flow";
import { projectTabHref } from "@/lib/project-tabs";
import { BUTTON } from "@/lib/ui-standards";

/** Shown after successful POST /api/projects — links operator to Run progress tab. */
export function ProjectCreatedBanner(props: { projectId: string }) {
  const runsHref = projectRunProgressHref(props.projectId);
  const overviewHref = projectTabHref(props.projectId, "overview");

  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
      role="status"
    >
      <p className="font-medium">Project launched</p>
      <p className="mt-1 text-emerald-900/90 dark:text-emerald-100/90">
        LiNKaios orchestration is starting. Track Run progress on the Runs tab or review the overview while Plane
        bootstrap completes.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={runsHref} className={BUTTON.approveCompact}>
          View Run progress
        </Link>
        <Link href={overviewHref} className={BUTTON.secondaryCompact}>
          Project overview
        </Link>
      </div>
    </div>
  );
}
