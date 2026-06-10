"use client";

import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";

import { AdminProjectsIndexTable } from "@/components/admin/admin-projects-index-table";
import { PlaneOpenModal } from "@/components/plane-open-modal";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { UiButton } from "@/components/ui/button-bridge";
import type { AdminProjectIndexRow } from "@/lib/admin-projects-data";
import { ADMIN_PROJECTS_PAGE } from "@/lib/admin-projects-copy";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";

export function AdminProjectsPage(props: {
  rows: AdminProjectIndexRow[];
  planeWorkspaceHref: string | null;
  loadError?: string | null;
}) {
  const [planeModalOpen, setPlaneModalOpen] = useState(false);

  return (
    <main className="space-y-10">
      <ShellPageHeaderClient
        title={ADMIN_PROJECTS_PAGE.title}
        subtitle={ADMIN_PROJECTS_PAGE.subtitle}
        hideLicensorScope
        actions={
          <Link href={`${ADMIN_BASE_PATH}/projects/new`}>
            <UiButton buttonKey="approveRow">
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              {ADMIN_PROJECTS_PAGE.launchButton}
            </UiButton>
          </Link>
        }
      />

      {props.loadError ? (
        <p className="text-sm text-red-700 dark:text-red-400">{props.loadError}</p>
      ) : null}

      <section aria-label="Vendor projects">
        {props.rows.length === 0 && !props.loadError ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ADMIN_PROJECTS_PAGE.emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              {ADMIN_PROJECTS_PAGE.emptyBody}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 dark:text-zinc-500">
              {ADMIN_PROJECTS_PAGE.planeHint}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href={`${ADMIN_BASE_PATH}/projects/new`}>
                <UiButton buttonKey="approveRow">
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                  {ADMIN_PROJECTS_PAGE.launchButton}
                </UiButton>
              </Link>
              <UiButton
                buttonKey="secondaryRow"
                type="button"
                onClick={() => setPlaneModalOpen(true)}
                title={props.planeWorkspaceHref ? "Open Plane workspace" : "Plane is not connected"}
              >
                <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden />
                Open Plane Workspace
              </UiButton>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">All projects</h2>
            <AdminProjectsIndexTable
              rows={props.rows}
              planeWorkspaceHref={props.planeWorkspaceHref}
              emptyMessage={ADMIN_PROJECTS_PAGE.emptyTitle}
            />
          </>
        )}
      </section>

      <PlaneOpenModal
        open={planeModalOpen}
        onClose={() => setPlaneModalOpen(false)}
        planeHref={props.planeWorkspaceHref}
        projectTitle="Vendor projects workspace"
      />
    </main>
  );
}

/** @deprecated Use {@link AdminProjectsPage}. */
export const AdminProgramsPage = AdminProjectsPage;
