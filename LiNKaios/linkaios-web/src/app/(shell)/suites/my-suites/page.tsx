import { ModulesMyModulesPanel } from "@/components/modules/modules-my-modules-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function MySuitesPage() {
  return (
    <>
      <ShellPageHeaderClient
        title="My Suites"
        subtitle="Subscribed and preview suites for the active company — open a suite to browse modules, projects, and outputs."
      />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading suites…</p>}>
        <ModulesMyModulesPanel />
      </Suspense>
    </>
  );
}
