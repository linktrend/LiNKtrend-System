import { CheckCircle2, Shield, XCircle, AlertTriangle } from "lucide-react";

import { DomainStatusPill, StatusPill } from "@/components/ui/status-pill";
import { loadLeaseStatus } from "@/lib/cockpit";
import { TABLE } from "@/lib/ui-standards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function leaseStatusForPill(raw: string): string {
  if (raw === "granted" || raw === "executed") return "active";
  if (raw === "denied") return "revoked";
  if (raw === "requires_approval") return "pending";
  return raw;
}

export async function LinkskillsLeasesPanel() {
  const supabase = await createSupabaseServerClient();
  const tenantId = "default";

  const leases = await loadLeaseStatus(supabase, tenantId, { time_range: "24h" });

  const grantedCount = leases.filter((l) => l.status === "granted" || l.status === "executed").length;
  const deniedCount = leases.filter((l) => l.status === "denied").length;
  const trippedCount = leases.filter((l) => l.kill_switch_state === "tripped").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
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
            Kill switches
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">{trippedCount}</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Recent leases (24h)</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{leases.length} row(s)</p>
        <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                {["Capability", "Status", "Run", "Kill switch", "Requested", "Expires"].map((h) => (
                  <th key={h} className={`px-2 py-2 font-medium ${TABLE.thText}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leases.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-zinc-500" colSpan={6}>
                    No rows yet.
                  </td>
                </tr>
              ) : (
                leases.map((l) => (
                  <tr key={l.lease_id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-2 py-2 text-zinc-800 dark:text-zinc-200">{l.capability}</td>
                    <td className="px-2 py-2">
                      <DomainStatusPill domain="lease" status={leaseStatusForPill(l.status)} equalWidth />
                    </td>
                    <td className="px-2 py-2 font-mono text-zinc-800 dark:text-zinc-200">{l.run_id?.slice(0, 8) ?? "—"}</td>
                    <td className="px-2 py-2">
                      <StatusPill
                        label={l.kill_switch_state === "tripped" ? "Tripped" : "Open"}
                        tone={l.kill_switch_state === "tripped" ? "danger" : "success"}
                        equalWidth
                      />
                    </td>
                    <td className="px-2 py-2 text-zinc-800 dark:text-zinc-200">
                      {new Date(l.requested_at).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-zinc-800 dark:text-zinc-200">
                      {l.expires_at ? new Date(l.expires_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
