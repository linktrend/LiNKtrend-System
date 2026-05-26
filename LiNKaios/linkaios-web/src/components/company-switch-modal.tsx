"use client";

import { useEffect, useRef } from "react";

import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { companiesVisibleInTopology } from "@/lib/tenant-topology";
import { useTenantTopology } from "@/hooks/use-tenant-topology";
import { BUTTON } from "@/lib/ui-standards";

export function CompanySwitchModal(props: {
  open: boolean;
  activeCompanyId: string;
  onClose: () => void;
  onSelect: (companyId: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { mode: topologyMode } = useTenantTopology();

  useEffect(() => {
    if (props.open) closeRef.current?.focus();
  }, [props.open]);

  if (!props.open) return null;

  const visibleIds = companiesVisibleInTopology(
    topologyMode,
    COMPANY_FIXTURES.map((c) => c.id),
  );
  const options = COMPANY_FIXTURES.filter((c) => visibleIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60" aria-label="Close" onClick={props.onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-switch-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="company-switch-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Switch company
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choose which legal entity you are working in. Profile details live under Company.
        </p>
        <ul className="mt-4 space-y-2">
          {options.map((c) => {
            const active = c.id === props.activeCompanyId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => props.onSelect(c.id)}
                  className={
                    "flex w-full flex-col rounded-xl border px-4 py-3 text-left transition " +
                    (active
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900")
                  }
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.displayName}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-end">
          <button ref={closeRef} type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
