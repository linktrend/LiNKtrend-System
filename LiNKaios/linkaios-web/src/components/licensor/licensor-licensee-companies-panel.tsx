"use client";

import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { useAppSurface } from "@/components/app-surface-provider";
import { companiesBrandsIndexForLicensee } from "@/lib/licensor-licensee-profile";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { LICENSOR_LICENSEE_TABS } from "@/lib/company-page-copy";
import { appendLicenseeContext } from "@/lib/licensee-context";
import { BUTTON } from "@/lib/ui-standards";

const COMPANIES_TAB_LABEL =
  LICENSOR_LICENSEE_TABS.find((tab) => tab.id === "companies")?.label ?? "Companies & Brands";

export function LicensorLicenseeCompaniesPanel(props: { licenseeId: string }) {
  const { href } = useAppSurface();
  const rows = companiesBrandsIndexForLicensee(props.licenseeId, COMPANY_FIXTURES);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{COMPANIES_TAB_LABEL}</h2>
        <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Operational index only — route LiNKbots, LinkSkills, and LinkBrain by company and brand without opening
          corporate governance records.
        </p>
      </div>

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[42%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>Company</th>
              <th className={DT.thTextInset}>Brand</th>
              <th className={DT.thTextInset}>Status</th>
              <th className={DT.thTextInset}>LiNKbots</th>
              <th className={DT.thTextInset}>Operations</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {rows.map((r) => (
              <DataTableRow key={`${r.companyId}-${r.brandId}`}>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} font-medium`}>{r.companyName}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">{r.companyId}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{r.brandName}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">{r.brandId}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{r.status}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{r.linkbotCount}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={href(appendLicenseeContext("/workers", { companyId: r.companyId, brandId: r.brandId }))}
                      className={BUTTON.secondaryCompact}
                    >
                      Fleet
                    </Link>
                    <Link
                      href={href(appendLicenseeContext("/skills/skills", { companyId: r.companyId, brandId: r.brandId }))}
                      className={BUTTON.secondaryCompact}
                    >
                      LinkSkills
                    </Link>
                    <Link
                      href={href(
                        (() => {
                          const base = appendLicenseeContext("/memory", {
                            companyId: r.companyId,
                            brandId: r.brandId,
                          });
                          return base.includes("?") ? `${base}&tab=company` : `${base}?tab=company`;
                        })(),
                      )}
                      className={BUTTON.secondaryCompact}
                    >
                      LinkBrain
                    </Link>
                  </div>
                </td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}
