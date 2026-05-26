import { Suspense } from "react";

import { NewProjectWizard } from "@/components/projects/new-project-wizard";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Add Project"
        subtitle="Select a suite, choose modules from its catalogue, set cadence, and launch — Plane provisioning is studio-managed."
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading wizard…</p>}>
        <NewProjectWizard />
      </Suspense>
    </main>
  );
}
