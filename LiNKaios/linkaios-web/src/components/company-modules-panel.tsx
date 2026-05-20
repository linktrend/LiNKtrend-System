"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CompanyStripeModal, type StripeModalMode } from "@/components/company-stripe-modal";
import { ModulesCatalogLink, ModulesStartProjectLink } from "@/components/modules-start-project-link";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import {
  modulesForCompany,
  resolveCompanyFixture,
  STRIPE_PLAN_OPTIONS,
  type ModuleSubscriptionFixture,
} from "@/lib/company-fixtures";
import { BUTTON, TABLE } from "@/lib/ui-standards";

type ModalState = {
  open: boolean;
  mode: StripeModalMode;
  rowId: string;
  moduleName: string;
};

export function CompanyModulesPanel() {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const seedModules = useMemo(() => modulesForCompany(company.id), [company.id]);
  const [rows, setRows] = useState<ModuleSubscriptionFixture[]>(seedModules);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "subscribe",
    rowId: "",
    moduleName: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string>(STRIPE_PLAN_OPTIONS[1]!);

  useEffect(() => {
    setRows(modulesForCompany(company.id));
    setAuditMessage(null);
  }, [company.id]);

  function openSubscribe(row: ModuleSubscriptionFixture) {
    setSelectedPlan(row.plan ?? STRIPE_PLAN_OPTIONS[1]!);
    setModal({ open: true, mode: "subscribe", rowId: row.id, moduleName: row.module });
  }

  function openCancel(row: ModuleSubscriptionFixture) {
    setModal({ open: true, mode: "cancel", rowId: row.id, moduleName: row.module });
  }

  function handleConfirm() {
    const { rowId, mode, moduleName } = modal;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (mode === "subscribe") {
          return { ...r, status: "active" as const, plan: selectedPlan };
        }
        return { ...r, status: "canceled" as const, plan: null };
      }),
    );
    setAuditMessage(
      `${COMPANY_SECTION_COPY.modules.auditRecorded} (${moduleName} — ${mode === "subscribe" ? `plan ${selectedPlan}` : "canceled"})`,
    );
    setModal((m) => ({ ...m, open: false }));
    window.setTimeout(() => setAuditMessage(null), 6000);
  }

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="company-modules-heading"
    >
      <h2
        id="company-modules-heading"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        {COMPANY_SECTION_COPY.modules.title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.modules.body}</p>

      {auditMessage ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
        >
          {auditMessage}
        </p>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className={`px-3 py-2 ${TABLE.thText}`}>Module</th>
              <th className={`px-3 py-2 ${TABLE.thControl}`}>Status</th>
              <th className={`px-3 py-2 ${TABLE.thText}`}>Plan</th>
              <th className={`px-3 py-2 ${TABLE.thControl}`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => {
              const subscribed = row.status === "active" || row.status === "trialing";
              return (
                <tr key={row.id}>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                    <ModulesCatalogLink moduleId={row.moduleId} label={row.module} />
                  </td>
                  <td className={`px-3 py-2 ${TABLE.thControl}`}>
                    <DomainStatusPill domain="subscription" status={row.status} equalWidth />
                  </td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.plan ?? "—"}</td>
                  <td className={`px-3 py-2 ${TABLE.thControl}`}>
                    <div className="flex flex-wrap justify-center gap-2">
                      {subscribed ? (
                        <>
                          <ModulesStartProjectLink moduleId={row.moduleId} />
                          <button type="button" className={BUTTON.secondaryCompact} onClick={() => openSubscribe(row)}>
                            {COMPANY_SECTION_COPY.modules.changePlan}
                          </button>
                          <button type="button" className={BUTTON.rejectCompact} onClick={() => openCancel(row)}>
                            {COMPANY_SECTION_COPY.modules.cancel}
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className={BUTTON.primaryCompact} onClick={() => openSubscribe(row)}>
                            {COMPANY_SECTION_COPY.modules.subscribe}
                          </button>
                          <ModulesCatalogLink moduleId={row.moduleId} label="Preview" className={BUTTON.secondaryCompact} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CompanyStripeModal
        open={modal.open}
        mode={modal.mode}
        moduleName={modal.moduleName}
        plan={selectedPlan}
        onPlanChange={setSelectedPlan}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onConfirm={handleConfirm}
      />
    </section>
  );
}
