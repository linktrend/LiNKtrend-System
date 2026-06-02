import { createSupabaseServiceClient } from "@linktrend/db";
import { loadEnv } from "@linktrend/shared-config";
import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { DomainStatusPill, StatusPill } from "@/components/ui/status-pill";
import { loadLeaseStatus } from "@/lib/cockpit";
import { resolveCalusaTenantId } from "@/lib/admin-linkskills-tenant";
import { listKillSwitches } from "@linktrend/linkskills-logic-engine";

function leaseStatusForPill(raw: string): string {
  if (raw === "granted" || raw === "executed") return "active";
  if (raw === "denied") return "revoked";
  if (raw === "requires_approval") return "pending";
  return raw;
}

export async function AdminLinkskillsGovernancePanel() {
  const env = loadEnv();
  const tenantId = await resolveCalusaTenantId();
  const supabase = createSupabaseServiceClient(env);

  const [leases, killSwitchResult] = await Promise.all([
    loadLeaseStatus(supabase, tenantId, { time_range: "24h" }),
    listKillSwitches(supabase, tenantId),
  ]);

  const killSwitches = killSwitchResult.data;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Capability kill switches</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Calusa tenant ({tenantId.slice(0, 8)}…) — tripped switches deny new leases without deleting history.
          </p>
        </div>
        <DataTableShell scrollableBody>
          <DataTable>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Capability</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>State</div>
                </th>
                <th className={DT.thTextInset}>Scope</th>
                <th className={DT.thTextInset}>Reason</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {killSwitches.length === 0 ? (
                <DataTableEmptyRow colSpan={4}>No kill switch rows — all capabilities open.</DataTableEmptyRow>
              ) : (
                killSwitches.map((row) => (
                  <DataTableRow key={`${row.capability_id}-${row.tenant_id ?? "global"}`}>
                    <td className={`${DT.tdClipInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{row.capability_id}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <StatusPill
                          label={row.state === "tripped" ? "Tripped" : "Open"}
                          tone={row.state === "tripped" ? "danger" : "success"}
                          equalWidth
                        />
                      </div>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.tenant_id ? "Tenant" : "Global"}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} text-xs text-zinc-600 dark:text-zinc-400`}>
                        {row.reason || "—"}
                      </span>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Lease ledger (24h)</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Recent capability leases for Calusa — request, grant, execute, and denial events.
          </p>
        </div>
        <DataTableShell scrollableBody>
          <DataTable>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Capability</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Status</div>
                </th>
                <th className={DT.thTextInset}>Lease ID</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Kill switch</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {leases.length === 0 ? (
                <DataTableEmptyRow colSpan={4}>No leases in the last 24 hours for this tenant.</DataTableEmptyRow>
              ) : (
                leases.map((l) => (
                  <DataTableRow key={l.lease_id}>
                    <td className={`${DT.tdClipInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{l.capability}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <DomainStatusPill domain="lease" status={leaseStatusForPill(l.status)} equalWidth />
                      </div>
                    </td>
                    <td className={`${DT.tdClipInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{l.lease_id.slice(0, 12)}…</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <StatusPill
                          label={l.kill_switch_state === "tripped" ? "Tripped" : "Open"}
                          tone={l.kill_switch_state === "tripped" ? "danger" : "success"}
                          equalWidth
                        />
                      </div>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
