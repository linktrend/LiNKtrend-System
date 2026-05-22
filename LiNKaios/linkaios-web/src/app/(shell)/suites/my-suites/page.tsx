import { ModulesMyModulesPanel } from "@/components/modules/modules-my-modules-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export const dynamic = "force-dynamic";

export default function MySuitesPage() {
  return (
    <>
      <ShellPageHeaderClient
        title="My Suites"
        subtitle="Subscribed and preview suites you operate — open a suite to browse modules, projects, and outputs."
      />
      <ModulesMyModulesPanel />
    </>
  );
}
