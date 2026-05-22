"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CompanyStripeModal, type StripeModalMode } from "@/components/company-stripe-modal";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import {
  modulesForCompany,
  resolveCompanyFixture,
  STRIPE_PLAN_OPTIONS,
  type ModuleSubscriptionFixture,
} from "@/lib/company-fixtures";
import {
  BILLING_DEMO_LINKAIOS_PLAN,
  formatBillingDate,
  formatBillingUsd,
} from "@/lib/ui-mocks/billing-demo";
import { BUTTON } from "@/lib/ui-standards";

type ModalState = {
  open: boolean;
  mode: StripeModalMode;
  rowId: string;
  moduleName: string;
};

function SubscriptionActions(props: {
  onChangePlan: () => void;
  onCancel: () => void;
  changeDisabled?: boolean;
  cancelDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button type="button" className={BUTTON.secondaryCompact} disabled={props.changeDisabled} onClick={props.onChangePlan}>
        Change Plan
      </button>
      <button type="button" className={BUTTON.rejectCompact} disabled={props.cancelDisabled} onClick={props.onCancel}>
        Cancel
      </button>
    </div>
  );
}

export function BillingSubscriptionsPanel() {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const seedModules = useMemo(() => modulesForCompany(company.id), [company.id]);
  const [rows, setRows] = useState<ModuleSubscriptionFixture[]>(seedModules);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "subscribe",
    rowId: "",
    moduleName: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string>(STRIPE_PLAN_OPTIONS[1]!);

  useEffect(() => {
    setRows(modulesForCompany(company.id));
  }, [company.id]);

  const subscribedModules = useMemo(
    () => rows.filter((row) => row.status === "active" || row.status === "trialing"),
    [rows],
  );

  const linkaios = BILLING_DEMO_LINKAIOS_PLAN;

  function openChangePlan(row: ModuleSubscriptionFixture) {
    setSelectedPlan(row.plan ?? STRIPE_PLAN_OPTIONS[1]!);
    setModal({ open: true, mode: "subscribe", rowId: row.id, moduleName: row.module });
  }

  function openCancel(row: ModuleSubscriptionFixture) {
    setModal({ open: true, mode: "cancel", rowId: row.id, moduleName: row.module });
  }

  function handleConfirm() {
    const { rowId, mode } = modal;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (mode === "subscribe") {
          return { ...r, status: "active" as const, plan: selectedPlan };
        }
        return { ...r, status: "canceled" as const, plan: null };
      }),
    );
    setModal((m) => ({ ...m, open: false }));
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">LiNKaios</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Workspace control plane subscription.</p>
        </div>
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[38%]" />
              <col className="w-[16%]" />
              <col className="w-[30%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Product</th>
                <th className={DT.thTextInset}>Description</th>
                <th className={DT.thTextInset}>Plan</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>Actions</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              <DataTableRow multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>LiNKaios</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>
                    {linkaios.name} — {formatBillingUsd(linkaios.priceUsd)}/{linkaios.interval}, renews{" "}
                    {formatBillingDate(linkaios.renewsAt)}, {linkaios.seatsUsed} of {linkaios.seatsIncluded} seats used
                  </span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{linkaios.name}</span>
                </td>
                <td className={DT.tdControl}>
                  <SubscriptionActions onChangePlan={() => {}} onCancel={() => {}} />
                </td>
              </DataTableRow>
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Suites</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Licensed business packages billed separately from LiNKaios.</p>
        </div>
        {subscribedModules.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No active suite subscriptions.</p>
        ) : (
          <DataTableShell>
            <DataTable>
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[38%]" />
                <col className="w-[16%]" />
                <col className="w-[30%]" />
              </colgroup>
              <DataTableHead>
                <tr>
                  <th className={DT.thTextInset}>Suite</th>
                  <th className={DT.thTextInset}>Description</th>
                  <th className={DT.thTextInset}>Plan</th>
                  <th className={DT.thControl}>
                    <div className={DT.controlInner}>Actions</div>
                  </th>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {subscribedModules.map((row) => (
                  <DataTableRow key={row.id} multiline>
                    <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                      <span className={DT.tdTextSpan}>{row.module}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdWrapSpan}>{row.description}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan}>{row.plan ?? "—"}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <SubscriptionActions
                        onChangePlan={() => openChangePlan(row)}
                        onCancel={() => openCancel(row)}
                      />
                    </td>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </DataTableShell>
        )}
      </section>

      <CompanyStripeModal
        open={modal.open}
        mode={modal.mode}
        moduleName={modal.moduleName}
        plan={selectedPlan}
        onPlanChange={setSelectedPlan}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
