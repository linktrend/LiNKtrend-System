import { LinkappsAppFactoryDashboard } from "@/components/linkapps/linkapps-app-factory-dashboard";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { LINKAPPS_FACTORY_DEMO_FIXTURE } from "@/lib/suite-integrations/linkapps/fixtures";

export default function LinkappsFactoryPage() {
  return (
    <div className="space-y-6">
      <ShellPageHeaderClient
        title="LiNKapps App Factory"
        subtitle="Blueprint intake, squad monitor, capability leases, LiNKautowork automation visibility, and handoff outputs (fixture-only MVO scaffold)."
      />
      <LinkappsAppFactoryDashboard data={LINKAPPS_FACTORY_DEMO_FIXTURE} />
    </div>
  );
}
