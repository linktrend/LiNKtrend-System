import { CheckCircle2, Clock, Shield, XCircle, AlertTriangle } from "lucide-react";

import { loadLeaseStatus } from "@/lib/cockpit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EntityTable } from "@/components/entity-table";

export const dynamic = "force-dynamic";

export default async function LeasesPage() {
  const supabase = await createSupabaseServerClient();
  const tenantId = "default";

  const leases = await loadLeaseStatus(supabase, tenantId, { time_range: "24h" });

  const rows = leases.map((l) => ({
    capability: l.capability,
    status: l.status,
    run: l.run_id?.slice(0, 8) ?? "—",
    kill_switch: l.kill_switch_state === "tripped" ? "TRIPPED" : "open",
    requested: new Date(l.requested_at).toLocaleString(),
    expires: l.expires_at ? new Date(l.expires_at).toLocaleString() : "—",
  }));

  const grantedCount = leases.filter((l) => l.status === "granted" || l.status === "executed").length;
  const deniedCount = leases.filter((l) => l.status === "denied").length;
  const trippedCount = leases.filter((l) => l.kill_switch_state === "tripped").length;

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">LinkSkills Lease Status</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Capability lease lifecycle: requested, granted, executed, expired, revoked
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Shield className="h-4 w-4" />
            Total (24h)
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{leases.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="h-4 w-4" />
            Granted/Executed
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{grantedCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <XCircle className="h-4 w-4" />
            Denied
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">{deniedCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <AlertTriangle className="h-4 w-4" />
            Kill Switches
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">{trippedCount}</p>
        </div>
      </div>

      <EntityTable
        title="Recent Leases (24h)"
        rows={rows as Record<string, unknown>[]}
        columns={["capability", "status", "run", "kill_switch", "requested", "expires"]}
        columnHeaders={["Capability", "Status", "Run", "Kill Switch", "Requested", "Expires"]}
      />
    </main>
  );
}
