import { Suspense } from "react";

import { AdminNewProjectWizard } from "@/components/admin/admin-new-project-wizard";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { ADMIN_PROJECTS_PAGE } from "@/lib/admin-projects-copy";

export const dynamic = "force-dynamic";

export default function AdminNewProjectPage() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title={ADMIN_PROJECTS_PAGE.wizardPageTitle}
        subtitle={ADMIN_PROJECTS_PAGE.wizardPageSubtitle}
        hideLicensorScope
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading wizard…</p>}>
        <AdminNewProjectWizard />
      </Suspense>
    </main>
  );
}
