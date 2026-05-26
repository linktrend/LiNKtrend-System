"use client";

import { useMemo } from "react";

import { resolveMemorySharingPolicy } from "@/lib/memory-sharing-policy";
import { resolveCompanyFixture } from "@/lib/company-fixtures";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import { useTenantTopology } from "@/hooks/use-tenant-topology";
import { memorySharingTierLabel } from "@/lib/memory-sharing-policy";
import { TOPOLOGY_MODE_LABELS, TENANT_TOPOLOGY_MODES, type TenantTopologyMode } from "@/lib/tenant-topology";
import { FIELD, FORM } from "@/lib/ui-standards";

export function TenantTopologySettingsCard() {
  const { mode, setMode } = useTenantTopology();
  const ctx = useLicenseeContext();
  const company = resolveCompanyFixture(ctx.companyId);

  const sharing = useMemo(
    () =>
      resolveMemorySharingPolicy({
        topology: mode,
        industryLabel: company.industry,
      }),
    [mode, company.industry],
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Organisation topology</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Demo control for signup shape — drives Company hub switchers, active context, and LiNKbrain sharing defaults.
        Persisted locally until tenant provisioning is wired.
      </p>

      <fieldset className={`mt-4 space-y-3 ${FORM.fieldStack}`}>
        <legend className={`${FIELD.label} mb-2`}>Licensee structure</legend>
        {TENANT_TOPOLOGY_MODES.map((id: TenantTopologyMode) => {
          const copy = TOPOLOGY_MODE_LABELS[id];
          return (
            <label
              key={id}
              className="flex cursor-pointer gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:border-zinc-700 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-900"
            >
              <input
                type="radio"
                name="tenant-topology"
                className="mt-1"
                checked={mode === id}
                onChange={() => setMode(id)}
              />
              <span>
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{copy.title}</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{copy.description}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-2.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        <p className="font-medium text-zinc-800 dark:text-zinc-200">LiNKbrain sharing preview ({company.displayName})</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {sharing.readTiers.map((tier) => (
            <li key={tier}>{memorySharingTierLabel(tier)}</li>
          ))}
          <li>
            Cross-licensee anonymized:{" "}
            <span className="font-medium">{sharing.crossLicenseeAnonymized ? "on by default" : "off (sensitive industry)"}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
