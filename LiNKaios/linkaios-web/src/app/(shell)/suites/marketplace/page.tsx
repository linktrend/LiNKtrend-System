import { ModulesMarketplacePanel } from "@/components/suites/modules-marketplace-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export const dynamic = "force-dynamic";

export default function ModulesMarketplacePage() {
  return (
    <>
      <ShellPageHeaderClient
        title="Marketplace"
        subtitle="Suites published by Linktrend — preview free for 30 days or subscribe to activate."
      />
      <ModulesMarketplacePanel />
    </>
  );
}
