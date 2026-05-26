"use client";

import { Check, Focus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableIconAction,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { useLicensorScope } from "@/components/role-preview-provider";
import { StatusPill } from "@/components/ui/status-pill";
import { companyIdsForLicensee } from "@/lib/licensor-licensee-profile";
import { companyTabHrefForSurface } from "@/lib/company-page-copy";
import { LICENSEE_REGISTRY, type LicenseeRegistryRow } from "@/lib/licensee-registry";
import { formatUiLabel } from "@/lib/ui-standards";

function statusTone(status: LicenseeRegistryRow["status"]) {
  if (status === "suspended") return "danger" as const;
  if (status === "trialing") return "warning" as const;
  return "success" as const;
}

export function LicenseeRegistryPanel() {
  const { scope, setScope } = useLicensorScope();
  const router = useRouter();

  function selectLicensee(row: LicenseeRegistryRow) {
    if (scope === row.id) return;
    setScope(row.id);
    const companyId = companyIdsForLicensee(row.id)[0] ?? row.id;
    router.push(companyTabHrefForSurface("overview", "admin", companyId));
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Registry</h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Demo tenant catalogue for licensor scope selection. Choose a licensee to operate within that workspace, or stay
          on All licensees for a read-only platform view.
        </p>
      </div>

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[14%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>Licensee</th>
              <th className={DT.thTextInset}>Plan</th>
              <th className={DT.thTextInset}>Status</th>
              <th className={DT.thTextInset}>Entities</th>
              <th className={DT.thTextInset}>Brands</th>
              <th className={DT.thTextInset}>Suites</th>
              <th className={DT.thTextInset}>Issues</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{formatUiLabel("Action")}</div>
              </th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {LICENSEE_REGISTRY.length === 0 ? (
              <DataTableEmptyRow colSpan={8}>No licensees in the demo registry.</DataTableEmptyRow>
            ) : (
              LICENSEE_REGISTRY.map((row) => {
                const selected = scope === row.id;
                return (
                  <DataTableRow key={row.id}>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`}>{row.name}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.plan.replace(/^LiNKaios\s+/i, "")}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <StatusPill label={formatUiLabel(row.status)} tone={statusTone(row.status)} />
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.entityCount}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.brandCount}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.suiteCount}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.openIssues}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <DataTableIconAction
                          icon={selected ? Check : Focus}
                          label={selected ? `${row.name} selected` : `Select ${row.name}`}
                          onClick={() => selectLicensee(row)}
                          disabled={selected}
                        />
                      </div>
                    </td>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}
