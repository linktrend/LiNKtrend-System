"use client";

import Link from "next/link";
import { Layers3, Plus, Wrench } from "lucide-react";

import { useAppSurface } from "@/components/app-surface-provider";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableIconAction,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { StatusPill } from "@/components/ui/status-pill";
import { useLicensorSuiteProducts } from "@/hooks/use-licensor-suite-publish";
import { LICENSOR_SUITE_PUBLISH_PILL_LABELS } from "@/lib/status-colors";
import {
  licensorSuitePublishLabel,
  licensorSuitePublishTone,
  suiteBuilderCompleteness,
} from "@/lib/ui-mocks/licensor-suite-catalog";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

export function LicensorSuitesIndex() {
  const { href: appHref } = useAppSurface();
  const { products } = useLicensorSuiteProducts();

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Suites"
        subtitle="Compose suite products from modules, phases, and issues — then publish to the licensee marketplace."
        actions={
          <Link href={appHref("/suites/new")} className={BUTTON.addRow}>
            <Plus className="h-4 w-4" aria-hidden />
            Add suite
          </Link>
        }
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        Each suite moves through <strong className="text-zinc-800 dark:text-zinc-200">Draft</strong> while you assemble
        modules and automations, <strong className="text-zinc-800 dark:text-zinc-200">Ready</strong> when complete but
        not yet live, and <strong className="text-zinc-800 dark:text-zinc-200">Published</strong> when licensees can
        subscribe in Marketplace. List prices map to Stripe products.
      </div>

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[16%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>Suite</th>
              <th className={DT.thTextInset}>Status</th>
              <th className={DT.thTextInset}>Complete</th>
              <th className={DT.thTextInset}>Modules</th>
              <th className={DT.thTextInset}>Phases</th>
              <th className={DT.thTextInset}>Issues</th>
              <th className={DT.thTextInset}>LiNKbots</th>
              <th className={DT.thTextInset}>Automations</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{formatUiLabel("Action")}</div>
              </th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {products.map((suite) => {
              const completeness = suiteBuilderCompleteness(suite);
              return (
                <DataTableRow key={suite.id}>
                  <td className={DT.tdClipInset}>
                    <div className="flex min-w-0 items-center gap-2">
                      <Layers3 className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                      <div className="min-w-0">
                        <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`}>{suite.name}</span>
                        <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{suite.summary}</p>
                      </div>
                    </div>
                  </td>
                  <td className={DT.tdClipInset}>
                    <StatusPill
                      label={licensorSuitePublishLabel(suite.publishState)}
                      tone={licensorSuitePublishTone(suite.publishState)}
                      equalWidthLabels={LICENSOR_SUITE_PUBLISH_PILL_LABELS}
                    />
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{completeness}%</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{suite.moduleCount}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{suite.phaseCount}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{suite.issueCount}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{suite.linkbotCount}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{suite.automationCount}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <DataTableIconAction
                        icon={Wrench}
                        label={suite.publishState === "draft" ? `Continue building ${suite.name}` : `Open ${suite.name} builder`}
                        href={appHref(`/suites/${suite.id}/builder`)}
                      />
                    </div>
                  </td>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </main>
  );
}
