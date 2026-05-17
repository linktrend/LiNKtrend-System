import { LinkappsAppFactoryDashboard } from "@/components/linkapps/linkapps-app-factory-dashboard";
import { PageIntro } from "@/components/page-intro";
import { LINKAPPS_FACTORY_DEMO_FIXTURE } from "@/lib/plugins/linkapps/fixtures";

export default function LinkappsFactoryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LiNKapps App Factory</h1>
        <PageIntro>
          Static UI scaffold for the <code>linkapps.app_factory</code> vertical: blueprint intake, squad monitor, capability leases,
          LiNKautowork workflow visibility, and handoff outputs. Data is fixture-only (WP-110); no provisioning or workflow execution.
        </PageIntro>
      </header>
      <LinkappsAppFactoryDashboard data={LINKAPPS_FACTORY_DEMO_FIXTURE} />
    </div>
  );
}
