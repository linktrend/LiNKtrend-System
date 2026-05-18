/**
 * LiNKapps App Factory Module Dashboard
 *
 * Primary operator view for linkapps.app_factory vertical plugin.
 * Per WP-110 (UI Panel Design) and LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md §7.
 */

import Link from "next/link";

export const metadata = {
  title: "LiNKapps App Factory",
  description: "Venture software creation through autonomous squad execution",
};

// Placeholder data - would be fetched from LiNKaios API
const mockVentures = [
  {
    id: "venture-001",
    name: "Acme Startup Portal",
    phase: "5.4",
    status: "running",
    blueprintRef: "blueprint:acme-001",
    squadConfig: ["technical_lead", "frontend_specialist", "backend_specialist"],
    lastUpdated: "2026-05-18T09:30:00Z",
  },
  {
    id: "venture-002",
    name: "Beta Marketing Suite",
    phase: "5.2",
    status: "succeeded",
    blueprintRef: "blueprint:beta-001",
    squadConfig: ["technical_lead", "product_owner"],
    lastUpdated: "2026-05-17T16:45:00Z",
  },
];

const mockSquads = [
  {
    id: "squad-001",
    ventureId: "venture-001",
    activeRoles: ["technical_lead", "frontend_specialist"],
    currentStage: "linkapps.phase5.ai_implementation",
    iterationCount: 3,
    health: "healthy",
  },
];

export default function LinkappsDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">LiNKapps App Factory</h1>
          <p className="text-muted-foreground mt-1">
            Transform venture blueprints into working software through autonomous squad execution
          </p>
        </div>
        <Link
          href="/modules/linkapps/blueprints/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Blueprint
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Active Ventures" value={mockVentures.filter(v => v.status === "running").length.toString()} />
        <StatCard title="Active Squads" value={mockSquads.length.toString()} />
        <StatCard title="Completed This Week" value="2" />
        <StatCard title="Awaiting Handoff" value="1" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ventures List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Active Ventures</h2>
            <Link href="/modules/linkapps/ventures" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">Venture</th>
                    <th className="pb-3 text-left font-medium">Phase</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Squad</th>
                    <th className="pb-3 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockVentures.map((venture) => (
                    <tr key={venture.id}>
                      <td className="py-3">
                        <Link href={`/modules/linkapps/ventures/${venture.id}`} className="font-medium hover:underline">
                          {venture.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{venture.blueprintRef}</div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Phase {venture.phase}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={venture.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {venture.squadConfig.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs"
                              title={role}
                            >
                              {role.split("_").map(w => w[0]).join("")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(venture.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-4">
          {/* Squad Monitor */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-3">Squad Monitor</h3>
            {mockSquads.map((squad) => (
              <div key={squad.id} className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Squad ID</span>
                  <span className="font-mono">{squad.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Venture</span>
                  <Link href={`/modules/linkapps/ventures/${squad.ventureId}`} className="hover:underline">
                    {squad.ventureId}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stage</span>
                  <span className="text-xs">{squad.currentStage.split(".").pop()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Iteration</span>
                  <span>#{squad.iterationCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Health</span>
                  <HealthIndicator health={squad.health} />
                </div>
              </div>
            ))}
            <Link
              href="/modules/linkapps/squads"
              className="mt-4 block w-full rounded-md border px-3 py-2 text-center text-sm hover:bg-muted"
            >
              View All Squads
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/modules/linkapps/blueprints/intake"
                className="block rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80"
              >
                Submit Blueprint
              </Link>
              <Link
                href="/modules/linkapps/builds"
                className="block rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80"
              >
                View Build Logs
              </Link>
              <Link
                href="/modules/linkapps/validations"
                className="block rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80"
              >
                Validation Results
              </Link>
              <Link
                href="/modules/linkapps/spinoffs"
                className="block rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80"
              >
                Spinoff Queue
              </Link>
            </div>
          </div>

          {/* Templates Catalog Link */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Starter Templates</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Available templates for app generation
            </p>
            <Link
              href="/modules/linkapps/templates"
              className="text-sm text-primary hover:underline"
            >
              Browse catalog →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    running: "bg-amber-50 text-amber-700",
    succeeded: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
    pending: "bg-gray-50 text-gray-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[status] || variants.pending}`}>
      {status}
    </span>
  );
}

function HealthIndicator({ health }: { health: string }) {
  const variants: Record<string, string> = {
    healthy: "text-green-600",
    degraded: "text-amber-600",
    failed: "text-red-600",
  };

  return (
    <span className={`text-xs font-medium ${variants[health] || variants.healthy}`}>
      ● {health}
    </span>
  );
}
