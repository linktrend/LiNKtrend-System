"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { PlaneOpenModal } from "@/components/plane-open-modal";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { UiButton } from "@/components/ui/button-bridge";
import { ADMIN_PROGRAMS_PAGE } from "@/lib/admin-programs-copy";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";

export function AdminProgramsPage(props: { blocked?: "create" | "detail" | null }) {
  const planeCfg = getPlaneBridgeConfig();
  const planeHref = planeWorkspaceProjectsHref(planeCfg);
  const [planeModalOpen, setPlaneModalOpen] = useState(false);
  const blockedCopy =
    props.blocked === "create"
      ? { title: ADMIN_PROGRAMS_PAGE.blockedCreateTitle, body: ADMIN_PROGRAMS_PAGE.blockedCreateBody }
      : props.blocked === "detail"
        ? { title: ADMIN_PROGRAMS_PAGE.blockedDetailTitle, body: ADMIN_PROGRAMS_PAGE.blockedDetailBody }
        : null;

  return (
    <main className="space-y-10">
      <ShellPageHeaderClient title={ADMIN_PROGRAMS_PAGE.title} subtitle={ADMIN_PROGRAMS_PAGE.subtitle} />

      {blockedCopy ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <p className="font-medium">{blockedCopy.title}</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">{blockedCopy.body}</p>
        </div>
      ) : null}

      <section aria-label="Projects">
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ADMIN_PROGRAMS_PAGE.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            {ADMIN_PROGRAMS_PAGE.emptyBody}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 dark:text-zinc-500">
            {ADMIN_PROGRAMS_PAGE.planeHint}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <UiButton
              buttonKey="secondaryRow"
              type="button"
              onClick={() => setPlaneModalOpen(true)}
              title={planeHref ? "Open Plane workspace" : "Plane is not connected"}
            >
              <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden />
              Open Plane Workspace
            </UiButton>
          </div>
        </div>
      </section>

      <PlaneOpenModal
        open={planeModalOpen}
        onClose={() => setPlaneModalOpen(false)}
        planeHref={planeHref}
        projectTitle="Projects workspace"
      />
    </main>
  );
}
